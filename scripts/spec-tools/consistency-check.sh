#!/usr/bin/env bash
# spec-tools/consistency-check.sh — Detect inconsistencies within and across specs
# Checks: duplicate definitions, naming conflicts, formula mismatches, type contradictions
# Usage: bash scripts/spec-tools/consistency-check.sh

set -uo pipefail
source "$(dirname "$0")/lib-common.sh"

# ─────────────────────────────────────────────────────────────
# 1. DUPLICATE FUNCTION DEFINITIONS
# ─────────────────────────────────────────────────────────────
section "1. Duplicate Function/Export Definitions"

tmpfile=$(mktemp)
for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  grep -oP 'export (?:async )?function (\w+)' "$spec" 2>/dev/null | grep -oP 'function \w+' | awk '{print $2}' | while read -r fn; do
    echo "${tier}:${fn}"
  done
done | sort -t: -k2 > "$tmpfile"

awk -F: '{print $2}' "$tmpfile" | sort | uniq -c | sort -rn | while read -r count fn; do
  if [[ "$count" -gt 1 ]]; then
    owners=$(grep ":${fn}$" "$tmpfile" | awk -F: '{print $1}' | tr '\n' ', ' | sed 's/,$//')
    warn "Function '$fn' defined in multiple tiers: [$owners]"
  fi
done || true
rm -f "$tmpfile"
ok "Function definition scan complete"

# ─────────────────────────────────────────────────────────────
# 2. TYPE/INTERFACE DUPLICATE DEFINITIONS
# ─────────────────────────────────────────────────────────────
section "2. Duplicate Type/Interface Definitions"

tmpfile=$(mktemp)
for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  grep -oP '(?:export )?(?:type|interface) (\w+)' "$spec" 2>/dev/null | awk '{print $NF}' | while read -r typename; do
    case "$typename" in
      NextConfig|ReactNode|Metadata|string|number|boolean|null|void|Promise|Record|Partial|Props|FC) continue ;;
      # SQL keywords that look like types
      NextRequest|NextResponse|ON|IN|NOT|IF|OR|AND|text|integer|uuid|timestamp|bigint|jsonb|boolean) continue ;;
      # Common short names
      id|name|type|value|data|error|result|key|config|options) continue ;;
    esac
    echo "${tier}:${typename}"
  done
done | sort -t: -k2 > "$tmpfile"

awk -F: '{print $2}' "$tmpfile" | sort | uniq -c | sort -rn | while read -r count typename; do
  if [[ "$count" -gt 1 ]]; then
    owners=$(grep ":${typename}$" "$tmpfile" | awk -F: '{print $1}' | tr '\n' ', ' | sed 's/,$//')
    warn "Type '$typename' defined in multiple tiers: [$owners]"
  fi
done
rm -f "$tmpfile"
ok "Type definition scan complete"

# ─────────────────────────────────────────────────────────────
# 3. FORMULA CONSISTENCY
# ─────────────────────────────────────────────────────────────
section "3. Formula Consistency Check"

echo -e "  ${BOLD}cost_per_serving mentions:${NC}"
for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  count=$(grep -c 'cost_per_serving\|costPerServing' "$spec" 2>/dev/null || echo "0")
  [[ "$count" -gt 0 ]] && echo "    $tier: $count references"
done

echo -e "  ${BOLD}profit_margin mentions:${NC}"
for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  count=$(grep -c 'profit_margin\|profitMargin' "$spec" 2>/dev/null || echo "0")
  [[ "$count" -gt 0 ]] && echo "    $tier: $count references"
done

echo -e "  ${BOLD}waste_rate mentions:${NC}"
for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  count=$(grep -c 'waste_rate\|wasteRate' "$spec" 2>/dev/null || echo "0")
  [[ "$count" -gt 0 ]] && echo "    $tier: $count references"
done
ok "Formula references extracted (review manually for conflicts)"

# ─────────────────────────────────────────────────────────────
# 4. STEP NUMBERING GAPS
# ─────────────────────────────────────────────────────────────
section "4. Step Numbering Continuity"

for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  steps=$(grep -oP '^## Step (\d+)' "$spec" 2>/dev/null | grep -oP '\d+' | sort -n)

  if [[ -z "$steps" ]]; then
    warn "$tier has no numbered steps"
    continue
  fi

  prev=0
  has_gap=false
  while read -r step; do
    if [[ "$step" -gt $((prev + 1)) ]] && [[ "$prev" -gt 0 ]]; then
      warn "$tier: gap in step numbering — Step $prev → Step $step"
      has_gap=true
    fi
    prev=$step
  done <<< "$steps"

  if ! $has_gap; then
    ok "$tier: steps 1-$prev (continuous)"
  fi
done

# ─────────────────────────────────────────────────────────────
# 5. PREREQUISITE CHAIN VALIDATION
# ─────────────────────────────────────────────────────────────
section "5. Prerequisite Chain Validation"

for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" | grep -oP 'TIER\d+')
  tier_num=$(echo "$tier" | grep -oP '\d+')

  prereq_line=$(grep -i 'prerequisite\|tiers.*must be complete\|tiers.*required' "$spec" 2>/dev/null | head -1 || true)

  if [[ -z "$prereq_line" ]] && [[ "$tier_num" -gt 1 ]]; then
    warn "$tier has no prerequisite declaration"
  else
    ok "$tier: $(echo "$prereq_line" | sed 's/^[#[:space:]]*//' | head -c 80)"
  fi
done

# ─────────────────────────────────────────────────────────────
# 6. SHADCN COMPONENT AUDIT
# ─────────────────────────────────────────────────────────────
section "6. shadcn/ui Component Usage Audit"

if [[ -f "$TIER1" ]]; then
  SHADCN_INSTALLED=$(grep -oP 'npx shadcn@latest add (.+)' "$TIER1" 2>/dev/null | sed 's/npx shadcn@latest add //' | tr ' ' '\n' | sort -u)

  if [[ -n "$SHADCN_INSTALLED" ]]; then
    for spec in "${SPECS[@]}"; do
      tier=$(basename "$spec" | grep -oP 'TIER\d+')
      grep -oP '@/components/ui/(\w[\w-]*)' "$spec" 2>/dev/null | sed 's|@/components/ui/||' | sort -u | while read -r comp; do
        if ! echo "$SHADCN_INSTALLED" | grep -qx "$comp"; then
          warn "$tier uses shadcn component '$comp' but not in TIER1 install list"
        fi
      done
    done
  fi
fi
ok "shadcn component audit complete"

# ─────────────────────────────────────────────────────────────
# 7. RLS POLICY COVERAGE
# ─────────────────────────────────────────────────────────────
section "7. RLS Policy Coverage"

if [[ -f "$TIER1" ]]; then
  RLS_TABLES=$(grep -oP 'ALTER TABLE (\w+) ENABLE ROW LEVEL SECURITY' "$TIER1" 2>/dev/null | awk '{print $3}' | sort -u)
  ALL_TABLES=$(grep -oP 'CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)' "$TIER1" | grep -oP '\w+$' | sort -u)

  for table in $ALL_TABLES; do
    [[ "$table" == "products" ]] && continue
    if ! echo "$RLS_TABLES" | grep -qx "$table"; then
      err "Table '$table' has NO RLS — security risk!"
    else
      policy_count=$(grep -cP "CREATE POLICY.*ON.*${table}" "$TIER1" 2>/dev/null || echo "0")
      if [[ "$policy_count" -eq 0 ]]; then
        err "Table '$table' has RLS but NO policies"
      else
        ok "Table '$table': RLS + $policy_count policies"
      fi
    fi
  done
fi

print_summary
