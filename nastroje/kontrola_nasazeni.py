"""Pojistky kolem nasazení z GitHubu.

  pred  – před nasazením: nepřepíšeme web, který někdo mezitím nasadil přímo na Cloudflare
          a ještě není v repu; a nenasadíme podezřele prázdný web.
  po    – po nasazení: doména opravdu servíruje tenhle commit.
"""
import hashlib, os, sys, time, urllib.request
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
import cf  # noqa: E402

SHA = os.environ.get("GITHUB_SHA", "")
PRED = os.environ.get("PRED_PUSHEM", "")  # github.event.before
VYNUTIT = os.environ.get("VYNUTIT") == "1"


def pred():
    lokalni = cf.manifest_slozky()
    if "/index.html" not in lokalni:
        cf.chyba("web/index.html chybí – nenasazuji")
    print(f"souborů k nasazení: {len(lokalni)}")
    spec = cf.specialni_soubory()
    if spec:
        print(f"pozor: ve web/ jsou speciální soubory {spec} – sync z Cloudflare je zpátky stáhnout neumí")

    nas = cf.zive()
    if not nas:
        print("na Cloudflare není živé nasazení – pokračuji")
        return
    detail, zivy = cf.manifest_nasazeni(nas["id"])
    commit = cf.commit_nasazeni(nas)

    if not VYNUTIT and len(lokalni) < max(20, len(zivy) // 2):
        cf.chyba(
            f"nasazení by zmenšilo web z {len(zivy)} na {len(lokalni)} souborů – nenasazuji. "
            "Pokud je to záměr, spusť workflow ručně se zaškrtnutým „vynutit“."
        )

    if lokalni == zivy:
        print("obsah je stejný jako živý web – nasazení jen zapíše nový commit")
        return

    zname = (
        cf.je_predek(commit)
        or nas["id"] == cf.znacka()[0]
        or (PRED and set(PRED) != {"0"} and cf.manifest_commitu(PRED) == zivy)
    )
    if zname or VYNUTIT:
        print(f"živé nasazení {nas['id'][:8]} je v repu – nasazuji")
        return
    cf.chyba(
        f"Na Cloudflare je nasazení zvenku ({nas['id'][:8]}, {nas['created_on'][:16]}, "
        f"„{((nas.get('deployment_trigger') or {}).get('metadata') or {}).get('commit_message', '')[:80]}“), "
        "které ještě není v repu. Nenasazuji, jinak by se přepsalo. Počkej na Sync z Cloudflare "
        "(do 10 min, nebo ho spusť ručně), pak `git pull` a pushni znovu."
    )


def po():
    if not SHA:
        cf.chyba("chybí GITHUB_SHA")
    for _ in range(18):
        nas = cf.zive()
        if nas and cf.commit_nasazeni(nas) == SHA:
            break
        time.sleep(10)
    else:
        cf.chyba(f"Cloudflare po 3 minutách pořád neservíruje commit {SHA[:8]} jako produkci")
    print(f"produkce = {nas['id'][:8]} (commit {SHA[:8]})")

    with open("web/index.html", "rb") as f:
        ocekavany = hashlib.sha256(f.read()).hexdigest()
    for _ in range(12):
        try:
            req = urllib.request.Request(
                f"https://modernikomunikace.com/?overeni={SHA[:8]}{int(time.time())}",
                headers={"User-Agent": "mk-web-github", "Cache-Control": "no-cache"},
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                kod, telo = r.status, r.read()
            if kod == 200 and hashlib.sha256(telo).hexdigest() == ocekavany:
                print("modernikomunikace.com → 200 a servíruje přesně web/index.html z tohoto commitu")
                break
        except Exception as e:  # noqa: BLE001
            print(f"zatím ne: {e}")
        time.sleep(10)
    else:
        cf.chyba("modernikomunikace.com nevrací 200 s obsahem z tohoto commitu")

    # Někdo mohl nasadit přímo na Cloudflare během našeho nasazení – to bychom právě přepsali.
    od = os.environ.get("ZACATEK", "")
    if od:
        cizi = [
            d for d in cf.api("/deployments?env=production&per_page=10")
            if d["created_on"] >= od and d.get("latest_stage", {}).get("status") == "success"
            and cf.commit_nasazeni(d) != SHA and not cf.je_predek(cf.commit_nasazeni(d))
        ]
        if cizi:
            cf.chyba(
                "Během nasazení přišlo na Cloudflare nasazení zvenku a bylo přepsáno: "
                + ", ".join(f"{d['id'][:8]} „{(d.get('deployment_trigger') or {}).get('metadata', {}).get('commit_message', '')[:60]}“" for d in cizi)
                + ". Je potřeba ho znovu nasadit (nebo jeho obsah dát do repa)."
            )


if __name__ == "__main__":
    {"pred": pred, "po": po}[sys.argv[1]]()
    if sys.argv[1] == "pred":
        cf.vystup(zacatek=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"))
