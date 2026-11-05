# modernikomunikace.com

Celý web Moderní komunikace, přesně tak, jak běží živě. Složka `web/` je to, co Cloudflare servíruje
(Pages projekt `modernikomunikace`, domény `modernikomunikace.com` a `www.modernikomunikace.com`).

## Jak to funguje

| Kdo něco změní | Co se stane |
|---|---|
| **Push do `main`** (změna ve `web/`) | Workflow **Nasazení na Cloudflare** web do ~1 minuty nasadí naostro a ověří, že doména vrací 200. |
| **Nasazení přímo na Cloudflare** (wrangler, blog-auto, dashboard) | Workflow **Sync z Cloudflare** (každých 10 min) živou verzi stáhne, každý soubor ověří otiskem a commitne do `web/`. |

Takže GitHub = vždy to, co je živě, a GitHub = místo, odkud se nasazuje.

## Pravidla

- Měň soubory ve `web/` a pushni do `main`. Nic dalšího není potřeba.
- Nasazuješ-li dál přímo wranglerem (např. blog-auto), nejdřív si stáhni `main` (`git pull`).
  Jinak tvoje nasazení přepíše změny, které mezitím přišly přes GitHub.
  Nejlepší je, když automatika místo `wrangler pages deploy` udělá `git push` do tohohle repa.
- Ruční nasazení: Actions → *Nasazení na Cloudflare* → *Run workflow*.
- Okamžitý sync z Cloudflare: Actions → *Sync z Cloudflare* → *Run workflow*.
- Návrat na starší verzi: `git revert` a push, nebo rollback v dashboardu Cloudflare (sync ho pak zapíše sem).

## Zdroják

`web/` je sestavený výstup (Vite/React build + předrenderované stránky a blog). React zdroják, ze kterého
build vzniká, zatím leží jen lokálně u Karla. Patří sem do větve `zdroj`, pak se dá build napojit přímo.
Větev `zdroj-unor-2026` je starý zdroják z února 2026, jen archiv.

## Tajemství

`CLOUDFLARE_API_TOKEN` (token jen na Cloudflare Pages) a `CLOUDFLARE_ACCOUNT_ID` jsou v GitHub Environment
`production` a smí je použít jen větev `main`.
