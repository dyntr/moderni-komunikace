"""Společné funkce pro nasazení a sync s Cloudflare Pages (projekt modernikomunikace).

Do Cloudflare se chodí přes bránu mk-web-brana (Worker na účtu CloudSphere). Klíč brány
(MK_BRANA_KLIC) umí jen číst tenhle projekt a nasadit ho, nic jiného na účtu.
"""
import base64, io, json, os, subprocess, sys, tarfile, time, urllib.error, urllib.parse, urllib.request
from blake3 import blake3

PROJEKT = "modernikomunikace"
BRANA = os.environ.get("CLOUDFLARE_API_BASE_URL", "https://mk-web-brana.msantiova.workers.dev/client/v4")
ZNACKA = ".cloudflare-posledni-sync"
SYNC_AUTOR = "mk-sync"

# Stejná pravidla jako `wrangler pages deploy`: tyhle soubory nejsou assety a v manifestu nasazení nejsou.
SPECIALNI = {"_worker.js", "_redirects", "_headers", "_routes.json"}
IGNOROVANE = {".DS_Store", "node_modules", ".git"}


def _projekt_url():
    return f"{BRANA}/accounts/{os.environ['CLOUDFLARE_ACCOUNT_ID']}/pages/projects/{PROJEKT}"


def api(cesta=""):
    req = urllib.request.Request(
        _projekt_url() + cesta,
        headers={"Authorization": f"Bearer {os.environ['CLOUDFLARE_API_TOKEN']}", "User-Agent": "mk-web-github"},
    )
    for pokus in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                d = json.load(r)
            break
        except urllib.error.HTTPError as e:
            if e.code < 500 or pokus == 3:
                sys.exit(f"Cloudflare API {e.code}: {e.read()[:300]!r}")
        except urllib.error.URLError:
            if pokus == 3:
                raise
        time.sleep(3 * (pokus + 1))
    if not d.get("success"):
        sys.exit(f"Cloudflare API chyba: {d.get('errors')}")
    return d["result"]


def zive():
    """Nasazení, které je teď živě na doméně (canonical_deployment, zohlední i rollback)."""
    nas = api("").get("canonical_deployment")
    if not nas or nas.get("latest_stage", {}).get("status") != "success":
        return None
    return nas


def commit_nasazeni(nas):
    return ((nas.get("deployment_trigger") or {}).get("metadata") or {}).get("commit_hash") or ""


def novejsi_uspesna(nas, od=""):
    """Úspěšná produkční nasazení vytvořená po `nas` (a po čase `od`, je-li zadán)."""
    hranice = max(nas["created_on"], od)
    return [
        d for d in api("/deployments?env=production&per_page=10")
        if d["id"] != nas["id"] and d["created_on"] > hranice and (d.get("latest_stage") or {}).get("status") == "success"
    ]


def manifest_nasazeni(nas_id):
    detail = api(f"/deployments/{nas_id}")
    return detail, detail.get("files") or {}


def otisk(data: bytes, cesta: str) -> str:
    """Otisk souboru stejně jako wrangler: blake3(base64(obsah) + přípona)[:32]."""
    pripona = os.path.splitext(cesta)[1][1:]
    return blake3(base64.b64encode(data) + pripona.encode()).hexdigest()[:32]


def _vynechat(rel):
    casti = rel.split("/")
    if any(c in IGNOROVANE for c in casti):
        return True
    if len(casti) == 1 and casti[0] in SPECIALNI:
        return True
    return casti[0] == "functions"


def manifest_slozky(koren="web"):
    """Manifest {"/cesta": otisk} pro složku na disku."""
    vysledek = {}
    for d, podslozky, soubory in os.walk(koren):
        podslozky[:] = [p for p in podslozky if p not in IGNOROVANE]
        for s in soubory:
            plna = os.path.join(d, s)
            rel = os.path.relpath(plna, koren).replace(os.sep, "/")
            if _vynechat(rel):
                continue
            with open(plna, "rb") as f:
                vysledek["/" + rel] = otisk(f.read(), rel)
    return vysledek


def specialni_soubory(koren="web"):
    nalez = [s for s in SPECIALNI if os.path.exists(os.path.join(koren, s))]
    if os.path.isdir(os.path.join(koren, "functions")):
        nalez.append("functions/")
    return nalez


def manifest_commitu(sha, koren="web"):
    """Manifest složky web/ v daném commitu (bez checkoutu)."""
    tar = subprocess.run(["git", "archive", "--format=tar", sha, koren], capture_output=True)
    if tar.returncode != 0:
        return None
    vysledek = {}
    with tarfile.open(fileobj=io.BytesIO(tar.stdout)) as t:
        for clen in t.getmembers():
            if not clen.isfile():
                continue
            rel = clen.name[len(koren) + 1:]
            if _vynechat(rel):
                continue
            vysledek["/" + rel] = otisk(t.extractfile(clen).read(), rel)
    return vysledek


def je_predek(commit, cil="HEAD"):
    """True, když commit je v historii cíle (nebo je to on sám)."""
    if not commit:
        return False
    return subprocess.run(["git", "merge-base", "--is-ancestor", commit, cil], capture_output=True).returncode == 0


def stav_ziveho(nas, zivy, lokalni):
    """Jedno rozhodnutí pro sync i kontrolu před nasazením – podle obsahu, ne podle původu.

      stejne   – živý web = web/ v HEAD
      nase     – živý web je přesně obsah čistého commitu z historie main (nebo nasazení, které už sync
                 zapsal do repa) a nic novějšího úspěšně nenaběhlo → repo je napřed, nasadit smíme
      rollback – totéž, ale existuje novější úspěšné nasazení → někdo v dashboardu vrátil starší verzi
      zvenku   – cokoli jiného (nasazení z jiného zdroje, z klonu s necommitnutými změnami…)
    """
    if zivy == lokalni:
        return "stejne"
    zaznam = zaznamy_syncu().get(nas["id"])
    if zaznam:
        # sync už toto nasazení zapsal do repa (i když značku v HEAD mezitím přepsal revert); když po
        # synchronizaci naběhlo něco novějšího a živé je zase tohle, je to rollback na něj
        return "rollback" if novejsi_uspesna(nas, zaznam[1]) else "nase"
    commit = commit_nasazeni(nas)
    if not (je_predek(commit) and manifest_commitu(commit) == zivy):
        return "zvenku"
    return "rollback" if novejsi_uspesna(nas) else "nase"


def zaznamy_syncu(hloubka=200):
    """{id nasazení: (commit, čas synchronizace)} ze všech verzí značky v historii HEAD.

    Commit = ten, který řádek značky zapsal POPRVÉ. Revert sync commitu značku vrátí na starší řádek,
    ten ale ukazuje na svůj původní commit – revert tak nepředstírá, že živě bylo starší nasazení.
    """
    vysledek = {}
    commity = subprocess.run(["git", "log", f"-{hloubka}", "--format=%H", "--", ZNACKA], capture_output=True, text=True).stdout.split()
    for c in commity:  # od nejnovějšího → poslední zápis je nejstarší výskyt
        r = subprocess.run(["git", "show", f"{c}:{ZNACKA}"], capture_output=True, text=True)
        casti = (r.stdout.split() + ["", "", "", ""])[:4] if r.returncode == 0 else []
        if casti and casti[0]:
            vysledek[casti[0]] = (c, casti[3])
    return vysledek


def znacka():
    """(id nasazení, created_on, commit, čas synchronizace) z poslední synchronizace, nebo prázdné hodnoty."""
    casti = open(ZNACKA).read().split() if os.path.exists(ZNACKA) else []
    return tuple((casti + ["", "", "", ""])[:4])


def vystup(**kv):
    with open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a") as f:
        for k, v in kv.items():
            v = str(v).replace("\n", " ")
            f.write(f"{k}={v}\n")


def chyba(zprava):
    """Ukončí úlohu chybou. Text jde i do souhrnu běhu, odkud ho převezme issue s upozorněním."""
    print(f"::error::{zprava}")
    with open(os.environ.get("GITHUB_STEP_SUMMARY", os.devnull), "a") as f:
        f.write(f"### ⚠️ {zprava}\n")
    with open(os.environ.get("MK_CHYBA_SOUBOR", os.devnull), "a") as f:
        f.write(zprava + "\n")
    sys.exit(1)
