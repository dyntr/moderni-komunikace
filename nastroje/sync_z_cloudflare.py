"""Když se živý web liší od web/ v main a vzniklo to mimo GitHub, stáhne živou verzi do web/.

Rozhoduje obsah, ne původ (cf.stav_ziveho, stejné pravidlo používá kontrola před nasazením):
  * živý web = web/ v HEAD                          → nic
  * živě je přesně obsah čistého commitu z main
    a nic novějšího úspěšně nenaběhlo               → repo je napřed, čeká se na nasazení (ne sync)
  * cokoli jiného (nasazení zvenku, z klonu
    s necommitnutými změnami, rollback)             → stáhnout, ověřit otisky, nahradit web/

Každý stažený soubor se ověří proti otisku z manifestu Cloudflare (blake3 jako wrangler).
Když sync přepíše soubory, které někdo od poslední synchronizace změnil přes GitHub,
commit proběhne (repo musí odpovídat živému webu), ale úloha skončí chybou a založí upozornění.
"""
import json, os, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(__file__))
import cf  # noqa: E402

VYNUTIT = os.environ.get("VYNUTIT") == "1"
LIMIT_CEKANI = 20 * 60  # jak dlouho smí být repo napřed před živým webem, než to hlásíme


def stahni(base, cesta):
    url = base + urllib.parse.quote(cesta)
    for pokus in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "mk-sync"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:  # 404.html se servíruje se stavem 404
                return e.read()
        except Exception:  # noqa: BLE001
            pass
        time.sleep(2 * (pokus + 1))
    raise RuntimeError(f"nejde stáhnout {cesta}")


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def zmeneno_pres_github():
    """Soubory ve web/, které od poslední synchronizace změnil někdo jiný než sync."""
    base = git("log", f"--author={cf.SYNC_AUTOR}", "-1", "--format=%H").strip()
    rozsah = [f"{base}..HEAD"] if base else ["HEAD"]
    vystup = git("-c", "core.quotepath=off", "log", *rozsah, "--format=@@%an", "--name-only", "--", "web/")
    soubory, autor = set(), ""
    for radek in vystup.splitlines():
        if radek.startswith("@@"):
            autor = radek[2:]
        elif radek.strip() and autor != cf.SYNC_AUTOR:
            soubory.add("/" + radek.strip()[len("web/"):])
    return soubory


def github(cesta):
    repo, token = os.environ.get("GITHUB_REPOSITORY"), os.environ.get("GH_TOKEN")
    if not (repo and token):
        return None
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/{cesta}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json", "User-Agent": "mk-sync"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def posledni_nasazeni_z_githubu():
    """Poslední běh workflow Nasazení na Cloudflare na main (nebo None, když to nejde zjistit)."""
    try:
        d = github("actions/workflows/nasazeni.yml/runs?branch=main&per_page=1")
    except Exception as e:  # noqa: BLE001
        print(f"::warning::stav nasazení z GitHubu teď nejde zjistit ({e}), zkusím při dalším běhu")
        return None
    behy = (d or {}).get("workflow_runs") or []
    return behy[0] if behy else None


def cas(t):
    return datetime.strptime(t[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)


def posledni_push_do_main():
    try:
        d = github("activity?ref=refs/heads/main&per_page=1")
        return cas(d[0]["timestamp"]) if d else None
    except Exception:  # noqa: BLE001
        return None


def cekej_na_nasazeni(commit):
    """Repo je napřed před živým webem. Normálně jen probíhá nasazení – ozvat se, když to tak není."""
    beh = posledni_nasazeni_z_githubu()
    if beh is None:
        print(f"main je napřed před živým webem ({commit[:8]}), čeká se na nasazení – nesynchronizuji")
        return
    if beh["status"] != "completed":
        print(f"nasazení právě běží ({beh['html_url']}) – nesynchronizuji")
        return
    # Měří se od pozdějšího z: konce posledního nasazení, posledního pushe do main (čas commitu může být
    # starý). Když běh pro HEAD ještě nezačal (sekundy po pushi), čeká se dál.
    od = max(t for t in (cas(beh["updated_at"]), posledni_push_do_main()) if t)
    minut = (datetime.now(timezone.utc) - od).total_seconds() / 60
    head = git("rev-parse", "HEAD").strip()
    if beh["head_sha"] != head and minut <= LIMIT_CEKANI / 60:
        print(f"nasazení pro {head[:8]} ještě nezačalo – čekám")
        return
    if minut > LIMIT_CEKANI / 60:
        if beh["conclusion"] != "success":
            duvod = f"poslední nasazení z GitHubu skončilo „{beh['conclusion']}“ ({beh['html_url']})"
        else:
            duvod = "poslední nasazení z GitHubu proběhlo, ale živě je pak zase starší verze (někdo nasadil ze starého klonu?)"
        cf.chyba(
            f"Živý web je {int(minut)} min za main: servíruje starší commit {commit[:8]}, main je {head[:8]}; {duvod}. "
            "Spusť workflow Nasazení na Cloudflare ručně, nasadí tam main."
        )
    print(f"main je napřed před živým webem ({commit[:8]}), nasazení skončilo před {int(minut)} min – čekám")


def main():
    nas = cf.zive()
    if not nas:
        print("žádné živé produkční nasazení"); cf.vystup(zmena=0); return
    nid, commit = nas["id"], cf.commit_nasazeni(nas)
    if nas.get("uses_functions"):
        cf.chyba(f"živé nasazení {nid[:8]} používá Pages Functions – ty sync stáhnout neumí, je potřeba je dát do repa ručně")

    detail, zivy = cf.manifest_nasazeni(nid)
    lokalni = cf.manifest_slozky()
    if zivy == lokalni:
        print(f"živý web ({nid[:8]}) = web/ v main, {len(zivy)} souborů"); cf.vystup(zmena=0); return

    stav = cf.stav_ziveho(nas, zivy, lokalni)
    if stav == "nase" and not VYNUTIT:
        cekej_na_nasazeni(commit)
        cf.vystup(zmena=0); return
    if stav == "rollback" and not VYNUTIT:
        # „Rollback“ vypadá stejně jako chvíle, kdy nasazení z GitHubu právě doběhlo mezi dvěma dotazy na API.
        # Stahujeme jen tehdy, když nasazení z GitHubu neběží a živé je pořád totéž nasazení.
        beh = posledni_nasazeni_z_githubu()
        if beh is None or beh["status"] != "completed" or (cf.zive() or {}).get("id") != nid:
            print("vypadá to na rollback, ale nasazení z GitHubu běží nebo se živý web právě změnil – zkusím při dalším běhu")
            cf.vystup(zmena=0); return
    if stav == "nase":
        print("vynuceno: stahuji živou verzi, i když je main napřed")
    elif stav == "rollback":
        print(f"živé je starší nasazení {nid[:8]}, i když existuje novější → rollback v dashboardu, synchronizuji")
    else:
        print(f"živé nasazení {nid[:8]} neodpovídá žádnému commitu v main → nasazení zvenku, synchronizuji")

    if "/index.html" not in zivy or len(zivy) < 20:
        cf.chyba(f"podezřelé živé nasazení {nid[:8]}: {len(zivy)} souborů – nesynchronizuji")
    if not VYNUTIT and lokalni and len(zivy) < len(lokalni) // 2:
        cf.chyba(f"živý web má {len(zivy)} souborů, repo {len(lokalni)} – to vypadá na chybu, nesynchronizuji (ruční sync s „vynutit“ to přebije)")

    base = detail["url"]
    tmp = tempfile.mkdtemp()

    def jeden(polozka):
        cesta, ocekavany = polozka
        data = stahni(base, cesta)
        if cf.otisk(data, cesta) != ocekavany:
            raise RuntimeError(f"otisk nesedí: {cesta}")
        cil = tmp + cesta
        os.makedirs(os.path.dirname(cil), exist_ok=True)
        with open(cil, "wb") as f:
            f.write(data)

    with ThreadPoolExecutor(12) as ex:
        list(ex.map(jeden, zivy.items()))

    # speciální soubory (_headers, _redirects…) nejsou v manifestu – zachovat ty z repa
    for s in cf.specialni_soubory():
        zdroj = os.path.join("web", s.rstrip("/"))
        cil = os.path.join(tmp, s.rstrip("/"))
        (shutil.copytree if os.path.isdir(zdroj) else shutil.copy2)(zdroj, cil)

    rozdil = {c for c in set(zivy) | set(lokalni) if zivy.get(c) != lokalni.get(c)}
    # Rollback je vědomý krok, tam se změny z GitHubu vrací záměrně. U nasazení zvenku hlásíme soubory,
    # které se od poslední synchronizace změnily přes GitHub a teď se liší – ke kontrole, ne k vracení.
    prepsano = [] if stav == "rollback" else sorted(rozdil & zmeneno_pres_github())

    shutil.rmtree("web")
    shutil.move(tmp, "web")
    with open(cf.ZNACKA, "w") as f:
        cas = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        f.write(f"{nid} {nas['created_on']} {commit or '-'} {cas}\n")
    meta = (nas.get("deployment_trigger") or {}).get("metadata") or {}
    zprava = f"sync z Cloudflare: {nid[:8]} – {(meta.get('commit_message') or 'přímé nasazení').splitlines()[0][:150]}"
    print(zprava, f"({len(zivy)} souborů ověřeno, {len(rozdil)} změněno)")
    cf.vystup(zmena=1, zprava=zprava, prepsano=" ".join(prepsano[:40]))


if __name__ == "__main__":
    main()
