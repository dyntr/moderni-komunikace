"""Když se živý web liší od web/ v main a vzniklo to mimo GitHub, stáhne živou verzi do web/.

Rozhoduje obsah, ne původ:
  * živý web = web/ v HEAD                     → nic
  * živé je starší nasazení z tohoto repa a nic
    novějšího úspěšně nenaběhlo                → repo je napřed, čeká se na nasazení (ne sync)
  * cokoli jiného (nasazení zvenku, rollback)  → stáhnout, ověřit otisky, nahradit web/

Každý stažený soubor se ověří proti otisku z manifestu Cloudflare (blake3 jako wrangler).
Když sync přepíše soubory, které někdo od poslední synchronizace změnil přes GitHub,
commit proběhne (repo musí odpovídat živému webu), ale úloha skončí chybou a založí upozornění.
"""
import os, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request
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
    vystup = git("log", *rozsah, "--format=@@%an", "--name-only", "--", "web/")
    soubory, autor = set(), ""
    for radek in vystup.splitlines():
        if radek.startswith("@@"):
            autor = radek[2:]
        elif radek.strip() and autor != cf.SYNC_AUTOR:
            soubory.add("/" + radek.strip()[len("web/"):])
    return soubory


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

    if not VYNUTIT and (cf.je_predek(commit) or nid == cf.znacka()[0]):
        novejsi = [
            d for d in cf.api("/deployments?env=production&per_page=10")
            if d["created_on"] > nas["created_on"] and d.get("latest_stage", {}).get("status") == "success"
        ]
        if not novejsi:
            stari = time.time() - int(git("log", "-1", "--format=%ct").strip())
            if stari > LIMIT_CEKANI:
                cf.chyba(
                    f"main je {int(stari // 60)} min napřed před živým webem (živě je {commit[:8]}), "
                    "nasazení asi selhalo – zkontroluj workflow Nasazení na Cloudflare"
                )
            print(f"main je napřed před živým webem ({commit[:8]}), čeká se na nasazení – nesynchronizuji")
            cf.vystup(zmena=0); return
        print(f"živé je starší nasazení {nid[:8]}, i když existuje novější → rollback v dashboardu, synchronizuji")

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
    prepsano = sorted(rozdil & zmeneno_pres_github())

    shutil.rmtree("web")
    shutil.move(tmp, "web")
    with open(cf.ZNACKA, "w") as f:
        f.write(f"{nid} {nas['created_on']} {commit}\n")
    meta = (nas.get("deployment_trigger") or {}).get("metadata") or {}
    zprava = f"sync z Cloudflare: {nid[:8]} – {(meta.get('commit_message') or 'přímé nasazení').splitlines()[0][:150]}"
    print(zprava, f"({len(zivy)} souborů ověřeno, {len(rozdil)} změněno)")
    cf.vystup(zmena=1, zprava=zprava, prepsano=" ".join(prepsano[:40]))


if __name__ == "__main__":
    main()
