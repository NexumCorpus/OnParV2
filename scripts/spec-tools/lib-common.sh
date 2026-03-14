#!/usr/bin/env bash
# Shared functions for spec-tools
# Source this from other scripts: source "$(dirname "$0")/lib-common.sh"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Use a temp file to track issues (avoids subshell counter loss)
_ISSUE_LOG=$(mktemp)
trap "rm -f '$_ISSUE_LOG'" EXIT

err()  { echo -e "${RED}ERROR${NC}: $1"; echo "ERROR" >> "$_ISSUE_LOG"; }
warn() { echo -e "${YELLOW}WARN${NC}: $1"; echo "WARN" >> "$_ISSUE_LOG"; }
gap()  { echo -e "  ${RED}MISSING${NC}: $1"; echo "MISSING" >> "$_ISSUE_LOG"; }
has()  { echo -e "  ${GREEN}FOUND${NC}: $1"; }
ok()   { echo -e "${GREEN}OK${NC}: $1"; }
section() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}"; }
subsec()  { echo -e "\n  ${BOLD}${MAGENTA}── $1 ──${NC}"; }

count_errors()   { grep -c '^ERROR$' "$_ISSUE_LOG" 2>/dev/null || echo "0"; }
count_warnings() { grep -c '^WARN$' "$_ISSUE_LOG" 2>/dev/null || echo "0"; }
count_missing()  { grep -c '^MISSING$' "$_ISSUE_LOG" 2>/dev/null || echo "0"; }

print_summary() {
  local errors warnings missing
  errors=$(count_errors)
  warnings=$(count_warnings)
  missing=$(count_missing)

  section "SUMMARY"
  echo -e "Errors:   ${RED}${errors}${NC}"
  echo -e "Warnings: ${YELLOW}${warnings}${NC}"
  [[ "$missing" -gt 0 ]] && echo -e "Missing:  ${RED}${missing}${NC}"

  if [[ "$errors" -gt 0 ]]; then
    echo -e "\n${RED}${BOLD}FAILED${NC} — $errors errors found."
    exit 1
  elif [[ $((warnings + missing)) -gt 0 ]]; then
    echo -e "\n${YELLOW}${BOLD}PASSED with issues${NC} — $((warnings + missing)) items to review."
    exit 0
  else
    echo -e "\n${GREEN}${BOLD}ALL CLEAR${NC}"
    exit 0
  fi
}

# Load spec files
SPEC_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SPECS=()
for _i in $(seq 1 9); do
  _f="$SPEC_DIR/TIER${_i}_SPEC.md"
  [[ -f "$_f" ]] && SPECS+=("$_f")
done
TIER1="$SPEC_DIR/TIER1_SPEC.md"
