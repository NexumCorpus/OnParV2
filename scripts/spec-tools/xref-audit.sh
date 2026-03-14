#!/usr/bin/env bash
# spec-tools/xref-audit.sh — Cross-reference audit across all tier specs
# Checks: dependencies, env vars, file paths, test locations, schema references
# Usage: bash scripts/spec-tools/xref-audit.sh

set -uo pipefail
source "$(dirname "$0")/lib-common.sh"

# ─────────────────────────────────────────────────────────────
# 1. DEPENDENCY AUDIT — packages in code blocks vs TIER1 install
# ─────────────────────────────────────────────────────────────
section "1. Dependency Cross-Reference"

if [[ -f "$TIER1" ]]; then
  INSTALLED=$(grep -oP '(?<=npm install[ -])[^\n]+' "$TIER1" | tr ' ' '\n' | grep -v '^-' | sort -u)

  for spec in "${SPECS[@]}"; do
    tier=$(basename "$spec" | grep -oP 'TIER\d+')
    grep -oP "(?:from |import |require\()[\"\'](@?[a-z][a-z0-9._/-]+)" "$spec" 2>/dev/null | \
      grep -oP "[\"\'](.+)" | tr -d "\"'" | \
      grep -v '^@/' | grep -v '^\.' | \
      sort -u | while read -r pkg; do
        base_pkg=$(echo "$pkg" | sed -E 's|^(@[^/]+/[^/]+).*|\1|; t; s|^([^/]+).*|\1|')
        # Skip Node.js built-ins
        case "$base_pkg" in
          path|fs|os|url|http|https|crypto|stream|util|events|child_process|buffer|net|dns|tls|zlib|assert|querystring) continue ;;
        esac
        if ! echo "$INSTALLED" | grep -qF "$base_pkg"; then
          warn "$tier imports '$base_pkg' but it's not in TIER1 npm install"
        fi
      done
  done
  ok "Dependency scan complete"
fi

# ─────────────────────────────────────────────────────────────
# 2. ENVIRONMENT VARIABLE AUDIT
# ─────────────────────────────────────────────────────────────
section "2. Environment Variable Cross-Reference"

ALL_ENVS=$(grep -ohP '\b(NEXT_PUBLIC_\w+|SUPABASE_\w+|STRIPE_\w+|SENTRY_\w+|DATABASE_\w+)\b' "${SPECS[@]}" 2>/dev/null | sort -u)

TIER1_ENVS=""
if [[ -f "$TIER1" ]]; then
  TIER1_ENVS=$(grep -ohP '\b(NEXT_PUBLIC_\w+|SUPABASE_\w+|STRIPE_\w+|SENTRY_\w+|DATABASE_\w+)\b' "$TIER1" 2>/dev/null | sort -u)
fi

echo "$ALL_ENVS" | while read -r env; do
  [[ -z "$env" ]] && continue
  if [[ -n "$TIER1_ENVS" ]] && ! echo "$TIER1_ENVS" | grep -qF "$env"; then
    sources=$(grep -l "\b${env}\b" "${SPECS[@]}" 2>/dev/null | xargs -I{} basename {} | tr '\n' ', ' | sed 's/,$//')
    warn "Env var $env used in [$sources] but NOT in TIER1"
  fi
done
ok "Environment variable scan complete"

# ─────────────────────────────────────────────────────────────
# 3. FILE PATH OWNERSHIP — files defined in multiple tiers
# ─────────────────────────────────────────────────────────────
section "3. File Path Ownership Audit"

tmpfile=$(mktemp)
for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  grep -oP '(?:^|\s|`)((?:app|lib|components|hooks|types|tests|supabase|\.github)/[a-zA-Z0-9_./-]+\.(?:ts|tsx|sql|yml|yaml|css|json))' "$spec" 2>/dev/null | \
    tr -d '`' | sed 's/^ //' | sort -u | while read -r fpath; do
      [[ -z "$fpath" ]] && continue
      echo "${tier} ${fpath}"
    done
done > "$tmpfile"

awk '{print $2}' "$tmpfile" | sort | uniq -c | sort -rn | while read -r count fpath; do
  if [[ "$count" -gt 1 ]] && echo "$fpath" | grep -q '^tests/'; then
    owners=$(grep " ${fpath}$" "$tmpfile" | awk '{print $1}' | tr '\n' ', ' | sed 's/,$//')
    warn "Test file '$fpath' defined in multiple tiers: [$owners]"
  fi
done
rm -f "$tmpfile"
ok "File path ownership scan complete"

# ─────────────────────────────────────────────────────────────
# 4. TEST LOCATION AUDIT
# ─────────────────────────────────────────────────────────────
section "4. Test Location Audit"

for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  tier_num=$(echo "$tier" | grep -oP '\d+')

  grep -oP 'tests/(?:unit|e2e|integration)/[a-zA-Z0-9_./-]+\.(?:test|spec)\.ts' "$spec" 2>/dev/null | sort -u | while read -r test_file; do
    expected_tier=""
    if echo "$test_file" | grep -q 'engines/'; then expected_tier=5
    elif echo "$test_file" | grep -q 'services/inventory'; then expected_tier=3
    elif echo "$test_file" | grep -q 'services/recipes'; then expected_tier=4
    elif echo "$test_file" | grep -q 'utils/csv'; then expected_tier=3
    elif echo "$test_file" | grep -q 'e2e/'; then expected_tier=8
    else continue
    fi

    if [[ -n "$expected_tier" ]] && [[ "$tier_num" -ne "$expected_tier" ]]; then
      warn "$test_file is in $tier but tests TIER${expected_tier} logic"
    fi
  done
done
ok "Test location scan complete"

# ─────────────────────────────────────────────────────────────
# 5. SCHEMA REFERENCE AUDIT
# ─────────────────────────────────────────────────────────────
section "5. Database Schema Reference Audit"

if [[ -f "$TIER1" ]]; then
  TABLES=$(grep -oP 'CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)' "$TIER1" | grep -oP '\w+$' | sort -u)

  for spec in "${SPECS[@]}"; do
    tier=$(basename "$spec" | grep -oP 'TIER\d+')
    [[ "$tier" == "TIER1" ]] && continue

    grep -oP "\.from\(['\"](\w+)['\"]\)" "$spec" 2>/dev/null | grep -oP "'\w+'" | tr -d "'" | sort -u | while read -r table; do
      if ! echo "$TABLES" | grep -qx "$table"; then
        err "$tier queries table '$table' but it's not in TIER1 schema"
      fi
    done
  done
  ok "Schema reference scan complete"
fi

# ─────────────────────────────────────────────────────────────
# 6. CROSS-TIER IMPORT CONSISTENCY
# ─────────────────────────────────────────────────────────────
section "6. Cross-Tier Import Consistency"

for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  tier_num=$(echo "$tier" | grep -oP '\d+')

  grep -oP "from ['\"]@/([^'\"]+)['\"]" "$spec" 2>/dev/null | grep -oP "@/[^'\"]+" | sort -u | while read -r import_path; do
    file_path=$(echo "$import_path" | sed 's|^@/||')
    found=false
    for i in $(seq 1 "$tier_num"); do
      earlier="${SPEC_DIR}/TIER${i}_SPEC.md"
      [[ -f "$earlier" ]] || continue
      if grep -qF "$file_path" "$earlier" 2>/dev/null; then
        found=true
        break
      fi
    done
    if ! $found; then
      warn "$tier imports '@/$file_path' but no earlier tier defines it"
    fi
  done
done
ok "Import consistency scan complete"

# ─────────────────────────────────────────────────────────────
# 7. VERIFICATION CHECKLIST COMPLETENESS
# ─────────────────────────────────────────────────────────────
section "7. Verification Checklist Audit"

for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  has_checklist=$(grep -ciP '## Verification' "$spec" 2>/dev/null || echo "0")
  step_count=$(grep -cP '^## Step \d+' "$spec" 2>/dev/null || echo "0")

  if [[ "$has_checklist" -eq 0 ]]; then
    err "$tier has NO verification checklist"
  else
    ok "$tier: $step_count steps with verification checklist"
  fi
done

print_summary
