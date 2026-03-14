#!/usr/bin/env bash
# spec-tools/spec-diff.sh — Analyze what each tier adds/modifies and flag conflicts
# Shows: new files per tier, modified files, schema changes, API surface additions
# Usage: bash scripts/spec-tools/spec-diff.sh [TIER_NUM]

set -euo pipefail

SPEC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

section() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}"; }
subsec() { echo -e "\n  ${BOLD}${MAGENTA}── $1 ──${NC}"; }

FILTER_TIER="${1:-}"

analyze_tier() {
  local tier_num=$1
  local spec="$SPEC_DIR/TIER${tier_num}_SPEC.md"
  [[ -f "$spec" ]] || return

  section "TIER $tier_num: $(head -1 "$spec" | sed 's/^# //')"

  # ── New files created ──
  subsec "Files Created"
  grep -oP '(?:^|\s|`)((?:app|lib|components|hooks|types|tests|supabase|\.github)/[a-zA-Z0-9_./-]+\.(?:ts|tsx|sql|yml|yaml|css|json))' "$spec" 2>/dev/null | \
    tr -d '`' | sed 's/^ //' | sort -u | while read -r fpath; do
      # Check if any earlier tier also defines it
      earlier_owner=""
      for i in $(seq 1 $((tier_num - 1))); do
        earlier="$SPEC_DIR/TIER${i}_SPEC.md"
        [[ -f "$earlier" ]] || continue
        if grep -qF "$fpath" "$earlier" 2>/dev/null; then
          earlier_owner="TIER$i"
          break
        fi
      done

      if [[ -n "$earlier_owner" ]]; then
        echo -e "    ${YELLOW}MODIFY${NC} $fpath ${DIM}(first in $earlier_owner)${NC}"
      else
        echo -e "    ${GREEN}CREATE${NC} $fpath"
      fi
    done

  # ── Exported functions ──
  subsec "API Surface (exported functions)"
  grep -oP 'export (?:async )?function (\w+)' "$spec" 2>/dev/null | \
    grep -oP 'function \w+' | awk '{print $2}' | sort -u | while read -r fn; do
      echo -e "    ${GREEN}+${NC} $fn()"
    done

  # ── Types/interfaces ──
  subsec "Types & Interfaces"
  grep -oP '(?:export )?(?:type|interface) (\w+)' "$spec" 2>/dev/null | \
    awk '{print $NF}' | sort -u | grep -v '^NextConfig$\|^Metadata$\|^ReactNode$' | head -20 | while read -r t; do
      # Check if redefined from earlier tier
      prev_def=""
      for i in $(seq 1 $((tier_num - 1))); do
        earlier="$SPEC_DIR/TIER${i}_SPEC.md"
        [[ -f "$earlier" ]] || continue
        if grep -qP "(?:type|interface) ${t}\b" "$earlier" 2>/dev/null; then
          prev_def="TIER$i"
          break
        fi
      done

      if [[ -n "$prev_def" ]]; then
        echo -e "    ${YELLOW}~${NC} $t ${DIM}(also in $prev_def — check compatibility)${NC}"
      else
        echo -e "    ${GREEN}+${NC} $t"
      fi
    done

  # ── Database operations ──
  subsec "Database Operations"
  # CREATE TABLE
  grep -oP 'CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)' "$spec" 2>/dev/null | \
    grep -oP '\w+$' | sort -u | while read -r table; do
      echo -e "    ${GREEN}CREATE TABLE${NC} $table"
    done
  # ALTER TABLE
  grep -oP 'ALTER TABLE (\w+)' "$spec" 2>/dev/null | \
    awk '{print $3}' | sort -u | while read -r table; do
      echo -e "    ${YELLOW}ALTER TABLE${NC} $table"
    done
  # Queries
  grep -oP "\.from\(['\"](\w+)['\"]\)" "$spec" 2>/dev/null | \
    grep -oP "'\w+'" | tr -d "'" | sort -u | while read -r table; do
      echo -e "    ${DIM}QUERY${NC} $table"
    done

  # ── Dependencies added ──
  subsec "Dependencies"
  grep -oP 'npm install[^`\n]*' "$spec" 2>/dev/null | head -5 | while read -r cmd; do
    echo -e "    $cmd"
  done

  # ── Env vars introduced ──
  subsec "Environment Variables"
  grep -ohP '\b(NEXT_PUBLIC_\w+|SUPABASE_\w+|STRIPE_\w+|SENTRY_\w+)\b' "$spec" 2>/dev/null | \
    sort -u | while read -r env; do
      # Check if new or inherited
      prev=""
      for i in $(seq 1 $((tier_num - 1))); do
        earlier="$SPEC_DIR/TIER${i}_SPEC.md"
        [[ -f "$earlier" ]] || continue
        if grep -qF "$env" "$earlier" 2>/dev/null; then
          prev="TIER$i"
          break
        fi
      done

      if [[ -n "$prev" ]]; then
        echo -e "    ${DIM}$env (from $prev)${NC}"
      else
        echo -e "    ${GREEN}+ $env${NC}"
      fi
    done

  # ── Conflict detection: functions that shadow earlier tiers ──
  subsec "Potential Conflicts with Earlier Tiers"
  conflicts=0
  grep -oP 'export (?:async )?function (\w+)' "$spec" 2>/dev/null | \
    grep -oP 'function \w+' | awk '{print $2}' | sort -u | while read -r fn; do
      for i in $(seq 1 $((tier_num - 1))); do
        earlier="$SPEC_DIR/TIER${i}_SPEC.md"
        [[ -f "$earlier" ]] || continue
        if grep -qP "export (?:async )?function ${fn}\b" "$earlier" 2>/dev/null; then
          echo -e "    ${RED}CONFLICT${NC}: $fn() also exported in TIER$i"
          ((conflicts++)) || true
        fi
      done
    done

  if [[ "$conflicts" -eq 0 ]]; then
    echo -e "    ${GREEN}None${NC}"
  fi
}

# ── Main ──
if [[ -n "$FILTER_TIER" ]]; then
  analyze_tier "$FILTER_TIER"
else
  for i in $(seq 1 9); do
    analyze_tier "$i"
  done

  # ── Cross-tier dependency graph ──
  section "TIER DEPENDENCY GRAPH"
  echo ""
  echo "  TIER1 ──→ TIER2 ──→ TIER3 ──→ TIER4 ──→ TIER5"
  echo "                                              │"
  echo "  TIER9 ←── TIER8 ←── TIER7 ←── TIER6 ←──────┘"
  echo ""
  echo "  Each tier depends on ALL previous tiers being complete."
  echo ""

  # ── Summary stats ──
  section "STATS"
  for i in $(seq 1 9); do
    spec="$SPEC_DIR/TIER${i}_SPEC.md"
    [[ -f "$spec" ]] || continue
    lines=$(wc -l < "$spec")
    steps=$(grep -cP '^## Step' "$spec" 2>/dev/null || echo "0")
    funcs=$(grep -cP 'export (?:async )?function' "$spec" 2>/dev/null || echo "0")
    files=$(grep -oP '(?:app|lib|components|hooks|types|tests)/[^\s`]+\.(?:ts|tsx)' "$spec" 2>/dev/null | sort -u | wc -l)
    printf "  TIER%-2d  %5d lines  %2d steps  %3d functions  %3d files\n" "$i" "$lines" "$steps" "$funcs" "$files"
  done
fi
