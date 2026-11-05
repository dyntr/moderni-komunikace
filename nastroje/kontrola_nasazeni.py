"""Pojistky kolem nasazení z GitHubu.

  pred  – před nasazením: nepřepíšeme web, který někdo mezitím nasadil přímo na Cloudflare
          a ještě není v repu; a nenasadíme podezřele prázdný web.
  po    – po nasazení: doména opravdu servíruje tenhle commit.
"""
import hashlib, os, re, sys, time, urllib.request
from datetime import datetime, timedelta, timezone

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

    seznam = cf.api("/deployments?env=production&per_page=10")
    # Od kdy hlídat cizí nasazení v kontrole „po“: všechno úspěšné, co je novější než to nejnovější, co vidíme teď.
    # (Při „vynutit“ se přepisuje vědomě – hlídá se jen to, co přijde od teď.)
    hranice = max([d["created_on"] for d in seznam if (d.get("latest_stage") or {}).get("status") == "success"] or [""])
    if VYNUTIT:
        hranice = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    cf.vystup(zacatek=hranice)
    probiha = [
        d for d in seznam
        if (d.get("latest_stage") or {}).get("status") in ("idle", "active")
        and d["created_on"] >= (datetime.now(timezone.utc) - timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%S")
    ]
    if probiha and not VYNUTIT:
        cf.chyba(
            f"Na Cloudflare právě probíhá jiné nasazení ({probiha[0]['id'][:8]}). Nenasazuji, jinak by se přepsalo. "
            "Sync z Cloudflare (do 10–30 min) živou verzi spojí s tvým pushem a sloučenou verzi nasadí sám, nic dalšího dělat nemusíš. Kdyby se tvoje změny střetly se změnami na Cloudflare, založí issue se seznamem souborů."
        )

    nas = cf.zive()
    if not nas:
        print("na Cloudflare není živé nasazení – pokračuji")
        return
    cf.vystup(zive_pred=nas["id"])
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
            "jinak bych vrátil verzi, kterou někdo vědomě stáhl. Sync rollback zapíše do repa, tvůj push zachová "
            "a sloučenou verzi nasadí. Když má rollback platit úplně (i proti tvému pushi), vrať svůj commit."
        )
    cf.chyba(
        f"Na Cloudflare je nasazení zvenku ({nas['id'][:8]}, {nas['created_on'][:16]}, „{zprava}“), "
        "které ještě není v repu. Nenasazuji, jinak by se přepsalo. Sync z Cloudflare (do 10–30 min) živou verzi spojí s tvým pushem a sloučenou verzi nasadí sám, nic dalšího dělat nemusíš. Kdyby se tvoje změny střetly se změnami na Cloudflare, založí issue se seznamem souborů."
    )


EMAIL_ODKAZ = re.compile(rb'href="/cdn-cgi/l/email-protection#([0-9a-f]+)"')
# e-mail v textu: <span class="__cf_email__" …> uvnitř odkazu, <a href="/cdn-cgi/l/email-protection" class="__cf_email__" …> mimo něj
EMAIL_TEXT = re.compile(rb'<(span|a)(?: href="/cdn-cgi/l/email-protection")? class="__cf_email__" data-cfemail="([0-9a-f]+)">\[email&#160;protected\]</\1>')
EMAIL_SKRIPT = re.compile(rb'<script data-cfasync="false" src="/cdn-cgi/scripts/[^"]+/cloudflare-static/email-decode\.min\.js"></script>')


def _dekoduj(hexa):
    b = bytes.fromhex(hexa.decode())
    return bytes(x ^ b[0] for x in b[1:])


def bez_ochrany_emailu(html: bytes) -> bytes:
    """Na doméně je zapnutá Email Address Obfuscation: Cloudflare přepíše mailto: a e-maily v textu
    a přidá dekódovací skript. Tohle to vrátí zpátky, aby šlo porovnat bajt po bajtu s web/index.html."""
    html = EMAIL_ODKAZ.sub(lambda m: b'href="mailto:' + _dekoduj(m.group(1)) + b'"', html)
    html = EMAIL_TEXT.sub(lambda m: _dekoduj(m.group(2)), html)
    return EMAIL_SKRIPT.sub(b"", html)


def po():
    if not SHA:
        cf.chyba("chybí GITHUB_SHA")
    pred_id = os.environ.get("ZIVE_PRED", "")
    for _ in range(18):
        nas = cf.zive()
        if nas and cf.commit_nasazeni(nas) == SHA and nas["id"] != pred_id:
            break
        time.sleep(10)
    else:
        cf.chyba(f"Cloudflare po 3 minutách pořád neservíruje commit {SHA[:8]} jako produkci")
    print(f"produkce = {nas['id'][:8]} (commit {SHA[:8]})")

    with open("web/index.html", "rb") as f:
        ocekavany = hashlib.sha256(f.read()).hexdigest()
    shoda_domeny = False
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
                shoda_domeny = True
                break
        except Exception as e:  # noqa: BLE001
            print(f"zatím ne: {e}")
        time.sleep(10)
    if not shoda_domeny:
        # Doména může HTML upravovat i jinak, než umíme vrátit (další funkce Cloudflare). Rozhodne, zda
        # samotné nasazení servíruje přesně náš soubor a doména odpovídá 200.
        try:
            with urllib.request.urlopen(urllib.request.Request(nas["url"] + "/", headers={"User-Agent": "mk-web-github"}), timeout=30) as r:
                nasazeni_ok = hashlib.sha256(r.read()).hexdigest() == ocekavany
            with urllib.request.urlopen(urllib.request.Request("https://modernikomunikace.com/", headers={"User-Agent": "mk-web-github"}), timeout=30) as r:
                domena_200 = r.status == 200
        except Exception:  # noqa: BLE001
            nasazeni_ok = domena_200 = False
        if not (nasazeni_ok and domena_200):
            cf.chyba("modernikomunikace.com nevrací 200 s obsahem z tohoto commitu")
        print("::warning::nasazení servíruje přesně web/index.html a doména vrací 200, ale doména HTML upravuje "
              "jinak, než kontrola umí vrátit (nová funkce Cloudflare na zóně?) – zkontroluj kontrola_nasazeni.py")

    # Někdo mohl nasadit přímo na Cloudflare během našeho nasazení – to bychom právě přepsali.
    # Hlídá se všechno úspěšné novější než nejnovější úspěšné nasazení, které viděla kontrola „pred“
    # (i to, které tehdy teprve běželo). Souběh dvou nasazení z GitHubu hlídá concurrency.
    od = os.environ.get("ZACATEK")
    if od is not None:
        cizi = [
            d for d in cf.api("/deployments?env=production&per_page=10")
            if d["created_on"] > od and (d.get("latest_stage") or {}).get("status") == "success"
            and d["id"] != nas["id"]
        ]
        if cizi:
            cf.chyba(
                "Během nasazení přišlo na Cloudflare nasazení zvenku a bylo přepsáno: "
                + ", ".join(f"{d['id'][:8]} „{((d.get('deployment_trigger') or {}).get('metadata') or {}).get('commit_message', '')[:60]}“" for d in cizi)
                + ". Je potřeba ho znovu nasadit (nebo jeho obsah dát do repa)."
            )


if __name__ == "__main__":
    {"pred": pred, "po": po}[sys.argv[1]]()
