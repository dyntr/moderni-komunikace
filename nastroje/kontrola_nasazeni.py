"""Pojistky kolem nasazení z GitHubu.

  pred  – před nasazením: nepřepíšeme web, který někdo mezitím nasadil přímo na Cloudflare
          a ještě není v repu; a nenasadíme podezřele prázdný web.
  po    – po nasazení: doména opravdu servíruje tenhle commit.
"""
import hashlib, os, re, sys, time, urllib.request
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

    stav = cf.stav_ziveho(nas, zivy, lokalni)
    if stav == "stejne":
        print("obsah je stejný jako živý web – nasazení jen zapíše nový commit")
        return
    if stav == "nase":
        print(f"živé nasazení {nas['id'][:8]} je v historii main – nasazuji")
        return
    if PRED and set(PRED) != {"0"} and cf.manifest_commitu(PRED) == zivy:
        print("živý web = main před tímto pushem – nasazuji")
        return
    if VYNUTIT:
        print(f"vynuceno: přepisuji živé nasazení {nas['id'][:8]} ({stav})")
        return
    zprava = ((nas.get("deployment_trigger") or {}).get("metadata") or {}).get("commit_message", "")[:80]
    if stav == "rollback":
        cf.chyba(
            f"Na Cloudflare je rollback na starší nasazení ({nas['id'][:8]}, „{zprava}“). Nenasazuji, "
            "jinak bych vrátil verzi, kterou někdo vědomě stáhl. Sync z Cloudflare ho do 10 min zapíše do repa; "
            "pak `git pull`, oprav, co je potřeba, a pushni znovu. Když rollback už neplatí, spusť nasazení ručně s „vynutit“."
        )
    cf.chyba(
        f"Na Cloudflare je nasazení zvenku ({nas['id'][:8]}, {nas['created_on'][:16]}, „{zprava}“), "
        "které ještě není v repu. Nenasazuji, jinak by se přepsalo. Počkej na Sync z Cloudflare "
        "(do 10 min, nebo ho spusť ručně), pak `git pull` a pushni znovu."
    )


EMAIL_ODKAZ = re.compile(rb'href="/cdn-cgi/l/email-protection#([0-9a-f]+)"')
EMAIL_TEXT = re.compile(rb'<span class="__cf_email__" data-cfemail="([0-9a-f]+)">\[email&#160;protected\]</span>')
EMAIL_SKRIPT = re.compile(rb'<script data-cfasync="false" src="/cdn-cgi/scripts/[^"]+/cloudflare-static/email-decode\.min\.js"></script>')


def _dekoduj(hexa):
    b = bytes.fromhex(hexa.decode())
    return bytes(x ^ b[0] for x in b[1:])


def bez_ochrany_emailu(html: bytes) -> bytes:
    """Na doméně je zapnutá Email Address Obfuscation: Cloudflare přepíše mailto: a e-maily v textu
    a přidá dekódovací skript. Tohle to vrátí zpátky, aby šlo porovnat bajt po bajtu s web/index.html."""
    html = EMAIL_ODKAZ.sub(lambda m: b'href="mailto:' + _dekoduj(m.group(1)) + b'"', html)
    html = EMAIL_TEXT.sub(lambda m: _dekoduj(m.group(1)), html)
    return EMAIL_SKRIPT.sub(b"", html)


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
            if kod == 200 and hashlib.sha256(bez_ochrany_emailu(telo)).hexdigest() == ocekavany:
                print("modernikomunikace.com → 200 a servíruje přesně web/index.html z tohoto commitu")
                break
        except Exception as e:  # noqa: BLE001
            print(f"zatím ne: {e}")
        time.sleep(10)
    else:
        cf.chyba("modernikomunikace.com nevrací 200 s obsahem z tohoto commitu")

    # Někdo mohl nasadit přímo na Cloudflare během našeho nasazení – to bychom právě přepsali.
    # Naše nasazení je jediné s tímto commitem (souběh dvou nasazení z GitHubu hlídá concurrency).
    od = os.environ.get("ZACATEK", "")
    if od:
        cizi = [
            d for d in cf.api("/deployments?env=production&per_page=10")
            if d["created_on"] >= od and (d.get("latest_stage") or {}).get("status") == "success"
            and d["id"] != nas["id"]
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
