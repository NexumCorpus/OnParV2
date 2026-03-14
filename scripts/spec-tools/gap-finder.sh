#!/usr/bin/env bash
# spec-tools/gap-finder.sh — Structural gap analysis across all tier specs
# Detects missing patterns: error handling, accessibility, tests, exports, security
# Usage: bash scripts/spec-tools/gap-finder.sh

set -uo pipefail
source "$(dirname "$0")/lib-common.sh"

check_pattern() {
  local label="$1"
  local pattern="$2"
  local scope="${3:-all}"

  if [[ "$scope" == "all" ]]; then
    if grep -qliP "$pattern" "${SPECS[@]}" 2>/dev/null; then
      files=$(grep -liP "$pattern" "${SPECS[@]}" 2>/dev/null | xargs -I{} basename {} | tr '\n' ', ' | sed 's/,$//')
      has "$label [$files]"
    else
      gap "$label — not mentioned in any spec"
    fi
  else
    if grep -qiP "$pattern" "$scope" 2>/dev/null; then
      has "$label [$(basename "$scope")]"
    else
      gap "$label — not in $(basename "$scope")"
    fi
  fi
}

# ─────────────────────────────────────────────────────────────
section "1. Error Handling & Resilience"
check_pattern "Error boundary (error.tsx)" "error\.tsx"
check_pattern "Loading states (loading.tsx)" "loading\.tsx"
check_pattern "try/catch in server actions" "try.*catch|ActionResult"
check_pattern "Sentry/error tracking" "sentry|error.tracking|error.monitoring"
check_pattern "Structured logging" "pino|winston|structured.log"
check_pattern "Network error handling" "network.error|connection.error|retry"
check_pattern "Optimistic UI rollback" "optimistic|rollback|revert"
check_pattern "Rate limiting" "rate.limit|throttl|429"

# ─────────────────────────────────────────────────────────────
section "2. Accessibility"
check_pattern "WCAG reference" "WCAG|wcag"
check_pattern "ARIA attributes" "aria-|role="
check_pattern "Keyboard navigation" "keyboard|tab.nav|focus.trap|focus-visible"
check_pattern "Skip-to-content" "skip.to.content|skip.nav"
check_pattern "Screen reader" "screen.reader|voiceover|nvda|a11y"
check_pattern "Chart accessibility" "figcaption|chart.*aria|chart.*label"

# ─────────────────────────────────────────────────────────────
section "3. Testing Coverage"
check_pattern "Unit test framework (Vitest)" "vitest|describe\(|it\(|test\("
check_pattern "E2E tests (Playwright)" "playwright|\.spec\.ts"
check_pattern "Coverage thresholds" "coverage|thresholds|branches.*70"
check_pattern "CI pipeline" "github.actions|ci\.yml|continuous.integration"
check_pattern "Mocking strategy" "vi\.mock|mock|stub"

# ─────────────────────────────────────────────────────────────
section "4. Security"
check_pattern "Row Level Security (RLS)" "row.level.security|RLS|ENABLE ROW LEVEL"
check_pattern "Auth middleware" "middleware\.ts|getSession|auth\.uid"
check_pattern "Environment variable protection" "\.env\.example|NEVER.*client"
check_pattern "ignoreDuringBuilds guard" "ignoreDuringBuilds"

# ─────────────────────────────────────────────────────────────
section "5. Performance"
check_pattern "Bundle size budget" "bundle.size|300KB|bundle.analyzer"
check_pattern "Dynamic imports" "dynamic.*import|next/dynamic|ssr.*false"
check_pattern "Image optimization" "next/image|remotePatterns"
check_pattern "Pagination" "pagination|paginate|LIMIT.*OFFSET"
check_pattern "Debounce/throttle" "debounce|throttle|useDebounce"
check_pattern "Lighthouse targets" "lighthouse|performance.*90"

# ─────────────────────────────────────────────────────────────
section "6. Data Management"
check_pattern "Seed data (production)" "seed\.sql|seed data"
check_pattern "Seed data (development)" "seed-dev|demo.data|development.*seed"
check_pattern "Data migration" "migrat|data.migration"
check_pattern "Soft deletes" "soft.delete|deleted_at"
check_pattern "Data export" "export.*csv|export.*data|data.portability"
check_pattern "Data validation (Zod)" "zod|z\.object|z\.string"

# ─────────────────────────────────────────────────────────────
section "7. Deployment & Operations"
check_pattern "Staging environment" "staging|preview.deploy"
check_pattern "Rollback plan" "rollback|revert.*deploy"
check_pattern "Database migrations versioned" "migrations/|ALTER TABLE"

# ─────────────────────────────────────────────────────────────
section "8. User Experience"
check_pattern "Mobile responsive" "mobile|responsive|375px"
check_pattern "Dark mode" "dark.mode|next-themes|theme-provider"
check_pattern "Toast notifications" "sonner|toast"
check_pattern "Empty states" "empty.state|no.data|no.items"
check_pattern "Onboarding flow" "onboarding|first.time"
check_pattern "Search functionality" "search|filter"
check_pattern "Skeleton loaders" "skeleton|shimmer"

# ─────────────────────────────────────────────────────────────
section "9. Business Logic"
check_pattern "Recipe cost calculation" "cost_per_serving|recipe.*cost"
check_pattern "Waste tracking" "waste_event|log.*waste"
check_pattern "AI insights engine" "ai.insight|generateInsight"
check_pattern "Stripe billing" "stripe|subscription|checkout"
check_pattern "Plan limits enforcement" "plan.limit|canAdd"
check_pattern "COGS calculation" "COGS|cost.of.goods|food.cost"
check_pattern "Notification triggers" "notification.*trigger|alert|low.stock"

# ─────────────────────────────────────────────────────────────
section "10. Per-Tier Structure"

for spec in "${SPECS[@]}"; do
  tier=$(basename "$spec" .md)
  tier_num=$(echo "$tier" | grep -oP '\d+')
  echo -e "\n  ${BOLD}$tier:${NC}"
  # TIER1 has no prerequisites (it's the foundation)
  [[ "$tier_num" -gt 1 ]] && check_pattern "  Has prerequisite" "prerequisit" "$spec"
  check_pattern "  Has verification checklist" "verification" "$spec"
  check_pattern "  Has file summary" "File Summary|files created|files modified" "$spec"
  check_pattern "  Has overview" "## overview" "$spec"
done

# ─────────────────────────────────────────────────────────────
section "COVERAGE"

total_checks=$(( $(count_missing) + $(grep -c 'FOUND:' "$_ISSUE_LOG" 2>/dev/null || echo "0") ))
present=$(grep -c 'FOUND' "$_ISSUE_LOG" 2>/dev/null || echo "0")
# We track FOUND via the has() function - but has() doesn't log. Fix:
# Actually let's just count from stdout
echo -e "Gaps found: ${RED}$(count_missing)${NC}"

print_summary
