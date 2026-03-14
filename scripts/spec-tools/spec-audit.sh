#!/usr/bin/env bash
# spec-tools/spec-audit.sh — Master orchestrator: runs all spec analysis tools
# Produces a unified report with all findings
# Usage: bash scripts/spec-tools/spec-audit.sh [--json] [--summary-only]

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPEC_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

JSON_MODE=false
SUMMARY_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --json) JSON_MODE=true ;;
    --summary-only) SUMMARY_ONLY=true ;;
  esac
done

REPORT_DIR="/tmp/spec-audit-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$REPORT_DIR"

echo -e "${BOLD}${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           OnPar Spec Audit — Full Analysis               ║"
echo "║           $(date '+%Y-%m-%d %H:%M:%S')                            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─────────────────────────────────────────────────────────────
# Run each tool and capture results
# ─────────────────────────────────────────────────────────────

run_tool() {
  local name="$1"
  local script="$2"
  local output_file="$REPORT_DIR/${name}.txt"

  echo -e "${BOLD}Running: $name...${NC}"

  local status="PASS"
  bash "$script" > "$output_file.raw" 2>&1 || status="FAIL"
  # Strip ANSI codes for parsing
  sed 's/\x1b\[[0-9;]*m//g' "$output_file.raw" > "$output_file"

  # Extract summary line (from stripped file)
  local summary
  summary=$(tail -5 "$output_file" | grep -E 'FAILED|PASSED|ALL CLEAR|SIGNIFICANT|MINOR|COMPREHENSIVE' | head -1 || true)
  local errors warnings missing
  errors=$(grep -cF 'ERROR:' "$output_file" || true)
  warnings=$(grep -cF 'WARN:' "$output_file" || true)
  missing=$(grep -cF 'MISSING:' "$output_file" || true)
  errors=${errors:-0}
  warnings=${warnings:-0}
  missing=${missing:-0}

  local color
  case $status in
    PASS) color="${GREEN}" ;;
    FAIL) color="${RED}" ;;
    *)    color="${YELLOW}" ;;
  esac
  echo -e "  Status: ${color}${status}${NC}  Errors: ${errors}  Warnings: ${warnings}  Missing: ${missing}"

  # Store results for JSON
  echo "${name}|${status}|${errors}|${warnings}|${missing}|${summary}" >> "$REPORT_DIR/results.csv"
}

# Run all tools
run_tool "xref-audit" "$SCRIPT_DIR/xref-audit.sh"
run_tool "consistency-check" "$SCRIPT_DIR/consistency-check.sh"
run_tool "gap-finder" "$SCRIPT_DIR/gap-finder.sh"

echo ""

# ─────────────────────────────────────────────────────────────
# Print detailed findings (unless --summary-only)
# ─────────────────────────────────────────────────────────────

if ! $SUMMARY_ONLY; then
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}                    DETAILED FINDINGS                        ${NC}"
  echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"

  for report in "$REPORT_DIR"/*.txt; do
    [[ -f "$report" ]] || continue
    name=$(basename "$report" .txt)
    echo -e "\n${BOLD}━━━ $name ━━━${NC}"

    # Show only errors and warnings (skip OK lines for brevity)
    grep -E 'ERROR:|WARN:|MISSING:|CONFLICT:' "$report" 2>/dev/null | head -50 || echo "  (no issues)"
  done
fi

# ─────────────────────────────────────────────────────────────
# Aggregate summary
# ─────────────────────────────────────────────────────────────

echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}                    AGGREGATE SUMMARY                        ${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"

total_errors=0
total_warnings=0
total_missing=0
tools_failed=0

while IFS='|' read -r name status errors warnings missing summary; do
  total_errors=$((total_errors + errors))
  total_warnings=$((total_warnings + warnings))
  total_missing=$((total_missing + missing))
  [[ "$status" == "FAIL" ]] && ((tools_failed++)) || true
done < "$REPORT_DIR/results.csv"

echo -e ""
echo -e "  Tools run:        3"
echo -e "  Tools failed:     ${tools_failed}"
echo -e "  Total errors:     ${RED}${total_errors}${NC}"
echo -e "  Total warnings:   ${YELLOW}${total_warnings}${NC}"
echo -e "  Total gaps:       ${RED}${total_missing}${NC}"
echo -e ""
echo -e "  Reports saved to: $REPORT_DIR/"
echo ""

# ─────────────────────────────────────────────────────────────
# Quick-fix suggestions
# ─────────────────────────────────────────────────────────────

if [[ $((total_errors + total_missing)) -gt 0 ]]; then
  echo -e "${BOLD}${YELLOW}SUGGESTED ACTIONS:${NC}"

  # Parse specific errors to generate fix suggestions
  if grep -q "not in TIER1 npm install" "$REPORT_DIR/xref-audit.txt" 2>/dev/null; then
    echo -e "  1. Add missing npm packages to TIER1_SPEC.md Step 3"
    grep "not in TIER1 npm install" "$REPORT_DIR/xref-audit.txt" 2>/dev/null | \
      sed 's/\x1b\[[0-9;]*m//g' | grep -oP "'[^']+'" | sort -u | \
      tr '\n' ' ' | sed 's/^/     Packages: /'
    echo ""
  fi

  if grep -q "NOT in TIER1 .env.example" "$REPORT_DIR/xref-audit.txt" 2>/dev/null; then
    echo -e "  2. Add missing env vars to TIER1 .env.example section"
    grep "NOT in TIER1 .env.example" "$REPORT_DIR/xref-audit.txt" 2>/dev/null | \
      sed 's/\x1b\[[0-9;]*m//g' | grep -oP 'Env var \S+' | awk '{print $3}' | sort -u | \
      tr '\n' ' ' | sed 's/^/     Vars: /'
    echo ""
  fi

  if grep -q "NO RLS" "$REPORT_DIR/consistency-check.txt" 2>/dev/null; then
    echo -e "  3. Add RLS policies for unprotected tables in TIER1 schema"
  fi

  if grep -q "MISSING.*not mentioned" "$REPORT_DIR/gap-finder.txt" 2>/dev/null; then
    missing_count=$(grep -c "MISSING.*not mentioned" "$REPORT_DIR/gap-finder.txt" 2>/dev/null || echo "0")
    echo -e "  4. Address $missing_count structural gaps (run gap-finder.sh for details)"
  fi

  echo ""
fi

# ─────────────────────────────────────────────────────────────
# JSON output
# ─────────────────────────────────────────────────────────────

if $JSON_MODE; then
  JSON_FILE="$REPORT_DIR/report.json"
  echo "{" > "$JSON_FILE"
  echo "  \"timestamp\": \"$(date -Iseconds)\"," >> "$JSON_FILE"
  echo "  \"total_errors\": $total_errors," >> "$JSON_FILE"
  echo "  \"total_warnings\": $total_warnings," >> "$JSON_FILE"
  echo "  \"total_gaps\": $total_missing," >> "$JSON_FILE"
  echo "  \"tools\": [" >> "$JSON_FILE"

  first=true
  while IFS='|' read -r name status errors warnings missing summary; do
    $first || echo "," >> "$JSON_FILE"
    first=false
    cat >> "$JSON_FILE" <<ENTRY
    {
      "name": "$name",
      "status": "$status",
      "errors": $errors,
      "warnings": $warnings,
      "missing": $missing,
      "summary": "$(echo "$summary" | sed 's/"/\\"/g')"
    }
ENTRY
  done < "$REPORT_DIR/results.csv"

  echo "" >> "$JSON_FILE"
  echo "  ]" >> "$JSON_FILE"
  echo "}" >> "$JSON_FILE"

  echo -e "JSON report: $JSON_FILE"
fi

# Exit code reflects severity
if [[ $total_errors -gt 0 ]]; then
  exit 1
elif [[ $((total_warnings + total_missing)) -gt 0 ]]; then
  exit 0
else
  exit 0
fi
