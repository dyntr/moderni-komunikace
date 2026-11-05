# modernikomunikace.com

Celý web Moderní komunikace, přesně tak, jak běží živě. Složka `web/` je to, co Cloudflare servíruje
(Pages projekt `modernikomunikace`, domény `modernikomunikace.com` a `www.modernikomunikace.com`).

## Jak to funguje

| Kdo něco změní | Co se stane |
|---|---|
| **Push do `main`** (změna ve `web/`) | Workflow **Nasazení na Cloudflare** web do ~1 minuty nasadí naostro a ověří, že doména servíruje přesně tenhle commit. |
| **Nasazení přímo na Cloudflare** (wrangler, blog-auto) nebo **rollback v dashboardu** | Workflow **Sync z Cloudflare** (každých 10 min) porovná živý web s `web/`, živou verzi stáhne, každý soubor ověří otiskem a commitne. |

GitHub tedy vždy odpovídá tomu, co je živě, a odsud se nasazuje.

### Pojistky

- **Nasazení nepřepíše cizí nasazení.** Když je na Cloudflare něco, co přišlo zvenku a ještě není v repu,
  nasazení z GitHubu se zastaví. Počkej na sync (do 10 min, nebo ho spusť ručně), `git pull`, pushni znovu.
  Za „cizí“ se bere všechno, co neodpovídá obsahu některého commitu v `main`, tedy i nasazení z klonu
  s necommitnutými změnami.
- **Rollback v dashboardu platí.** Když na Cloudflare někdo vrátí starší nasazení, push ho nepřepíše,
  sync ho zapíše do repa. Kdo rollback ruší, spustí nasazení ručně s „vynutit“.
- **Sync nepřepíše čerstvý push.** Když je `main` napřed a nasazení teprve běží, sync čeká. Když nasazení
  doběhlo před víc než 20 minutami a živě je pořád starší verze, ohlásí to.
- **Přepsané změny se hlásí.** Když přímé nasazení na Cloudflare přepíše soubory, které mezitím někdo
  změnil přes GitHub (typicky blog-auto ze staršího zdrojáku), sync je zapíše, ale založí issue se seznamem souborů.
- **Žádné zmenšení webu omylem.** Nasazení, které by web zmenšilo na méně než polovinu souborů, se nespustí
  (ruční spuštění se zaškrtnutým „vynutit“ to přebije).
- Každé selhání založí issue a označí @dyntr a @KChyska.

## Pravidla

- Měň soubory ve `web/` a pushni do `main`. Nic dalšího není potřeba.
- Nasazuješ-li dál přímo wranglerem (např. blog-auto), nejdřív si stáhni `main` (`git pull`) a nasazuj z něj.
  Jinak tvoje nasazení přepíše změny, které mezitím přišly přes GitHub. Nejlepší je, když automatika místo
  `wrangler pages deploy` udělá `git push` do tohohle repa.
- Ruční nasazení: Actions → *Nasazení na Cloudflare* → *Run workflow*.
- Okamžitý sync z Cloudflare: Actions → *Sync z Cloudflare* → *Run workflow*.
- Návrat na starší verzi: `git revert` a push, nebo rollback v dashboardu Cloudflare (sync ho pak zapíše sem).
- `_headers`, `_redirects`, `_routes.json` a `functions/` se z Cloudflare zpátky stáhnout nedají.
  Když je potřebuješ, dej je do `web/` tady v repu.

## Zdroják

`web/` je sestavený výstup (Vite/React build + předrenderované stránky a blog). React zdroják, ze kterého
build vzniká, zatím leží jen lokálně u Karla. Patří sem do větve `zdroj`, pak se dá build napojit přímo.
Větev `zdroj-unor-2026` je starý zdroják z února 2026, jen archiv.

## Přístup ke Cloudflare

Workflow chodí na Cloudflare přes bránu `mk-web-brana` (Worker na stejném účtu). Klíč `MK_BRANA_KLIC`
v GitHub Environment `production` (jen větev `main`) umí jen číst a nasadit projekt `modernikomunikace`,
nic jiného na účtu. Skutečný Cloudflare token je jen v bráně. `CLOUDFLARE_ACCOUNT_ID` je tamtéž.
Verze nástrojů jsou připnuté (`nastroje/package-lock.json`, `nastroje/requirements.txt` s hashem, akce na commit).
