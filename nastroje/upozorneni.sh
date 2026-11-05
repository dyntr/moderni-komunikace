#!/usr/bin/env bash
# Založí issue, když nasazení nebo sync selže (upozorní Patricka i Karla).
# Když už stejné issue visí otevřené, doplní komentář nejvýš jednou za 12 hodin, ať to nespamuje.
# S druhým argumentem „vzdy“ komentuje pokaždé (pro hlášení, která se nesmí ztratit).
set -uo pipefail
NAZEV="$1"
VZDY="${2:-}"
BEH="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
DUVOD="$(cat "${CHYBA_SOUBOR:-/dev/null}" 2>/dev/null || true)"
[ -n "$DUVOD" ] || DUVOD="Důvod je v logu běhu."

RADEK="$(gh issue list --repo "$GITHUB_REPOSITORY" --state open --limit 100 --json number,title,updatedAt \
  --jq "map(select(.title == \"$NAZEV\")) | .[0] | select(. != null) | \"\(.number) \(.updatedAt)\"")"
if [ -z "$RADEK" ]; then
  gh issue create --repo "$GITHUB_REPOSITORY" --title "$NAZEV" \
    --body "$(printf '%s\n\nBěh: %s\n\nAž to bude vyřešené, issue zavřete.\n\n@dyntr @KChyska' "$DUVOD" "$BEH")"
  exit $?  # neúspěch se musí projevit (záložní upozornění, červený krok)
fi
CISLO="${RADEK%% *}"; KDY="${RADEK#* }"
if [ "$VZDY" = "vzdy" ] || [ $(( $(date -u +%s) - $(date -u -d "$KDY" +%s) )) -gt 43200 ]; then
  gh issue comment "$CISLO" --repo "$GITHUB_REPOSITORY" --body "$(printf 'Pořád selhává: %s\n\nBěh: %s' "$DUVOD" "$BEH")"
else
  echo "issue #$CISLO už je otevřené a čerstvé, nekomentuji"
fi
