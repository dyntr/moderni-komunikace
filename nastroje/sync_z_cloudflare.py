"""Stáhne poslední produkční nasazení z Cloudflare Pages do web/, pokud nevzniklo z tohoto repa.

Každý soubor ověří proti otisku z manifestu Cloudflare (blake3 jako wrangler),
takže do repa nikdy nejde poškozený nebo neúplný web.
"""
import base64, json, os, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from blake3 import blake3

PROJEKT = "modernikomunikace"
ACC = os.environ["CLOUDFLARE_ACCOUNT_ID"]
TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]
API = f"https://api.cloudflare.com/client/v4/accounts/{ACC}/pages/projects/{PROJEKT}"
ZNACKA = ".cloudflare-posledni-sync"


def api(cesta):
    req = urllib.request.Request(API + cesta, headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.load(r)
    if not d.get("success"):
        sys.exit(f"Cloudflare API chyba: {d.get('errors')}")
    return d["result"]


def vystup(**kv):
    with open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a") as f:
        for k, v in kv.items():
            f.write(f"{k}={v}\n")


def otisk(data: bytes, cesta: str) -> str:
    pripona = os.path.splitext(cesta)[1][1:]
    return blake3(base64.b64encode(data) + pripona.encode()).hexdigest()[:32]


def stahni(base, cesta):
    url = base + urllib.parse.quote(cesta)
    for pokus in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "mk-sync"}), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:  # 404.html se servíruje se stavem 404
                return e.read()
        except Exception:
            pass
        time.sleep(2 * (pokus + 1))
    raise RuntimeError(f"nejde stáhnout {cesta}")


def main():
    # canonical_deployment = to, co je teď živě (zohlední i rollback v dashboardu)
    posledni = api("").get("canonical_deployment")
    if not posledni or posledni["latest_stage"]["status"] != "success":
        print("žádné živé produkční nasazení"); vystup(zmena=0); return
    nid = posledni["id"]
    meta = (posledni.get("deployment_trigger") or {}).get("metadata") or {}
    commit = meta.get("commit_hash") or ""

    vynutit = os.environ.get("VYNUTIT") == "1"
    if vynutit:
        print("vynucená synchronizace")
    elif commit and subprocess.run(["git", "cat-file", "-e", f"{commit}^{{commit}}"], capture_output=True).returncode == 0:
        print(f"{nid[:8]} je nasazeno z tohoto repa ({commit[:8]}) – není co synchronizovat"); vystup(zmena=0); return
    elif os.path.exists(ZNACKA) and open(ZNACKA).read().split()[0] == nid:
        print(f"{nid[:8]} už je synchronizováno"); vystup(zmena=0); return

    detail = api(f"/deployments/{nid}")
    soubory = detail["files"]
    if "/index.html" not in soubory or len(soubory) < 20:
        sys.exit(f"podezřelé nasazení {nid}: {len(soubory)} souborů – nesynchronizuji")

    base = detail["url"]
    tmp = tempfile.mkdtemp()
    def jeden(polozka):
        cesta, ocekavany = polozka
        data = stahni(base, cesta)
        if otisk(data, cesta) != ocekavany:
            raise RuntimeError(f"otisk nesedí: {cesta}")
        cil = tmp + cesta
        os.makedirs(os.path.dirname(cil), exist_ok=True)
        open(cil, "wb").write(data)
    with ThreadPoolExecutor(12) as ex:
        list(ex.map(jeden, soubory.items()))

    shutil.rmtree("web", ignore_errors=True)
    shutil.move(tmp, "web")
    open(ZNACKA, "w").write(f"{nid} {posledni['created_on']} {commit}\n")
    zprava = f"sync z Cloudflare: {nid[:8]} – {(meta.get('commit_message') or 'přímé nasazení').splitlines()[0][:150]}"
    print(zprava, f"({len(soubory)} souborů ověřeno)")
    vystup(zmena=1, zprava=zprava.replace("\n", " "))


if __name__ == "__main__":
    main()
