#!/usr/bin/env bash
# scripts/lint-no-direct-fetch.sh
# CI guard: blocks direct fetch() calls inside src/lib/journey/ outside the
# SSRF-protected helper (og-fetch.ts). Annotate legitimate fetch calls with
# trailing "// fetch-allow: <reason>" to opt out.
#
# Run: bash scripts/lint-no-direct-fetch.sh
# Exit 0 if clean, 1 if violations found.
set -e

hits=$(grep -rn "fetch(" src/lib/journey/ \
  --include='*.ts' --include='*.tsx' \
  | grep -v "src/lib/journey/og-fetch.ts" \
  | grep -v "// fetch-allow" \
  || true)

if [ -n "$hits" ]; then
  echo "Direct fetch() in journey module — use og-fetch.ts or annotate with"
  echo "  // fetch-allow: <reason>"
  echo ""
  echo "$hits"
  exit 1
fi

echo "✓ No direct fetch() calls in journey module outside og-fetch.ts"
