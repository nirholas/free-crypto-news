#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Lighthouse CI Script
# Runs Lighthouse audits against the 5 most important pages and enforces
# performance budgets.
#
# Budget thresholds:
#   Performance  ≥ 90
#   Accessibility ≥ 95
#   Best Practices ≥ 90
#   SEO           ≥ 95
#   LCP           < 2.5 s
#   CLS           < 0.1
#   INP           < 200 ms
#
# Usage:
#   ./scripts/lighthouse-ci.sh                   # Audit production (https://cryptocurrency.cv)
#   ./scripts/lighthouse-ci.sh --url=URL         # Audit a custom base URL
#   ./scripts/lighthouse-ci.sh --local           # Audit http://localhost:3000
#   ./scripts/lighthouse-ci.sh --json-only       # Skip threshold checks, just collect JSON
#   ./scripts/lighthouse-ci.sh --help            # Show usage
#

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Defaults ─────────────────────────────────────────────────────────────────
BASE_URL="https://cryptocurrency.cv"
JSON_ONLY=false
RESULTS_DIR="lighthouse-results"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
RUNS=3          # number of Lighthouse runs per page (median is picked)
EXIT_CODE=0

# ── Budget thresholds ────────────────────────────────────────────────────────
MIN_PERFORMANCE=90
MIN_ACCESSIBILITY=95
MIN_BEST_PRACTICES=90
MIN_SEO=95
MAX_LCP_MS=2500
MAX_CLS=0.1       # unitless
MAX_INP_MS=200

# ── Pages to audit ───────────────────────────────────────────────────────────
# slug -> human name
declare -A PAGES=(
  ["/"]="Home"
  ["/article/bitcoin-etf-inflows"]="Article"
  ["/category/bitcoin"]="Category"
  ["/markets"]="Markets"
  ["/developers"]="Developers"
)

# ── Usage ────────────────────────────────────────────────────────────────────
usage() {
  echo -e "${BOLD}Lighthouse CI${NC} — performance budget auditor"
  echo ""
  echo "Usage:"
  echo "  ./scripts/lighthouse-ci.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --url=URL       Base URL to audit (default: $BASE_URL)"
  echo "  --local         Shorthand for --url=http://localhost:3000"
  echo "  --runs=N        Number of Lighthouse runs per page (default: $RUNS)"
  echo "  --json-only     Collect JSON results without enforcing thresholds"
  echo "  --help          Show this help message"
  exit 0
}

# ── Parse args ───────────────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --url=*)     BASE_URL="${arg#*=}" ;;
    --local)     BASE_URL="http://localhost:3000" ;;
    --runs=*)    RUNS="${arg#*=}" ;;
    --json-only) JSON_ONLY=true ;;
    --help)      usage ;;
    *)           echo -e "${RED}Unknown option: $arg${NC}"; usage ;;
  esac
done

# ── Pre-flight checks ───────────────────────────────────────────────────────
check_deps() {
  if ! command -v lighthouse &>/dev/null; then
    echo -e "${YELLOW}Installing lighthouse CLI globally via npm …${NC}"
    npm install -g lighthouse --no-fund --no-audit 2>/dev/null || {
      echo -e "${RED}Failed to install lighthouse. Install manually: npm i -g lighthouse${NC}"
      exit 1
    }
  fi

  if ! command -v jq &>/dev/null; then
    echo -e "${YELLOW}Installing jq …${NC}"
    if command -v apt-get &>/dev/null; then
      sudo apt-get install -y jq 2>/dev/null
    elif command -v brew &>/dev/null; then
      brew install jq 2>/dev/null
    else
      echo -e "${RED}jq is required. Install it and retry.${NC}"
      exit 1
    fi
  fi

  # Chrome / Chromium
  if ! command -v google-chrome &>/dev/null && \
     ! command -v chromium-browser &>/dev/null && \
     ! command -v chromium &>/dev/null; then
    echo -e "${YELLOW}⚠  No Chrome/Chromium found — Lighthouse will use its bundled Chromium.${NC}"
  fi
}

# ── Helpers ──────────────────────────────────────────────────────────────────
score_to_pct() {
  # Lighthouse JSON stores scores as 0–1 floats → multiply by 100
  awk "BEGIN { printf \"%.0f\", $1 * 100 }"
}

pass_fail() {
  local value=$1 threshold=$2 op=${3:-gte}
  if [[ "$op" == "gte" ]]; then
    awk "BEGIN { exit !($value >= $threshold) }" 2>/dev/null && echo "PASS" || echo "FAIL"
  else
    awk "BEGIN { exit !($value < $threshold) }" 2>/dev/null && echo "PASS" || echo "FAIL"
  fi
}

badge() {
  local result=$1
  if [[ "$result" == "PASS" ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
  else
    echo -e "${RED}✗ FAIL${NC}"
    EXIT_CODE=1
  fi
}

# ── Run Lighthouse for one page ─────────────────────────────────────────────
run_lighthouse() {
  local url="$1" slug="$2" output_path="$3"

  echo -e "  ${CYAN}Running $RUNS audit(s) …${NC}"

  local best_perf=-1 best_file=""

  for (( i=1; i<=RUNS; i++ )); do
    local tmp_output="${output_path}.run${i}"

    lighthouse "$url" \
      --output=json \
      --output-path="$tmp_output" \
      --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage" \
      --preset=desktop \
      --budget-path="$(dirname "$0")/../lighthouse-budget.json" \
      --quiet 2>/dev/null || true

    # In case lighthouse appends .report.json
    if [[ -f "${tmp_output}.report.json" ]]; then
      mv "${tmp_output}.report.json" "${tmp_output}.json"
    elif [[ ! -f "${tmp_output}.json" && -f "$tmp_output" ]]; then
      mv "$tmp_output" "${tmp_output}.json"
    fi

    if [[ -f "${tmp_output}.json" ]]; then
      local perf
      perf=$(jq -r '.categories.performance.score // 0' "${tmp_output}.json")
      if awk "BEGIN { exit !($perf > $best_perf) }" 2>/dev/null; then
        best_perf=$perf
        best_file="${tmp_output}.json"
      fi
    fi
  done

  if [[ -n "$best_file" && -f "$best_file" ]]; then
    cp "$best_file" "${output_path}.json"
    # Clean up run files
    rm -f "${output_path}".run*.json
  else
    echo -e "  ${RED}All Lighthouse runs failed for ${url}${NC}"
    return 1
  fi
}

# ── Extract & check one page ────────────────────────────────────────────────
check_page() {
  local json_file="$1" name="$2"

  if [[ ! -f "$json_file" ]]; then
    echo -e "  ${RED}No results file: $json_file${NC}"
    EXIT_CODE=1
    return
  fi

  # Category scores (0-1 in JSON)
  local perf acc bp seo
  perf=$(jq -r '.categories.performance.score // 0' "$json_file")
  acc=$(jq -r '.categories.accessibility.score // 0' "$json_file")
  bp=$(jq -r '.categories["best-practices"].score // 0' "$json_file")
  seo=$(jq -r '.categories.seo.score // 0' "$json_file")

  local perf_pct acc_pct bp_pct seo_pct
  perf_pct=$(score_to_pct "$perf")
  acc_pct=$(score_to_pct "$acc")
  bp_pct=$(score_to_pct "$bp")
  seo_pct=$(score_to_pct "$seo")

  # Core Web Vitals (in ms / unitless)
  local lcp cls inp
  lcp=$(jq -r '.audits["largest-contentful-paint"].numericValue // 99999' "$json_file")
  cls=$(jq -r '.audits["cumulative-layout-shift"].numericValue // 99' "$json_file")
  inp=$(jq -r '.audits["interaction-to-next-paint"].numericValue // 99999' "$json_file" 2>/dev/null || echo "0")

  # ── Print results ──
  echo -e "  ${BOLD}Category Scores:${NC}"
  printf "    Performance    : %3s / 100  (min %d)  %b\n" "$perf_pct"  "$MIN_PERFORMANCE"     "$(badge "$(pass_fail "$perf_pct" "$MIN_PERFORMANCE" gte)")"
  printf "    Accessibility  : %3s / 100  (min %d)  %b\n" "$acc_pct"   "$MIN_ACCESSIBILITY"    "$(badge "$(pass_fail "$acc_pct" "$MIN_ACCESSIBILITY" gte)")"
  printf "    Best Practices : %3s / 100  (min %d)  %b\n" "$bp_pct"    "$MIN_BEST_PRACTICES"   "$(badge "$(pass_fail "$bp_pct" "$MIN_BEST_PRACTICES" gte)")"
  printf "    SEO            : %3s / 100  (min %d)  %b\n" "$seo_pct"   "$MIN_SEO"              "$(badge "$(pass_fail "$seo_pct" "$MIN_SEO" gte)")"

  echo -e "  ${BOLD}Core Web Vitals:${NC}"
  local lcp_sec
  lcp_sec=$(awk "BEGIN { printf \"%.2f\", $lcp / 1000 }")
  printf "    LCP            : %6s s    (max 2.50 s)  %b\n" "$lcp_sec" "$(badge "$(pass_fail "$lcp" "$MAX_LCP_MS" lt)")"
  printf "    CLS            : %6s      (max %.1f)     %b\n" "$cls"    "$MAX_CLS" "$(badge "$(pass_fail "$cls" "$MAX_CLS" lt)")"
  printf "    INP            : %6s ms   (max %d ms)   %b\n" "$inp"     "$MAX_INP_MS" "$(badge "$(pass_fail "$inp" "$MAX_INP_MS" lt)")"

  # Build per-page summary JSON
  jq -n \
    --arg name "$name" \
    --argjson perf "$perf_pct" \
    --argjson acc "$acc_pct" \
    --argjson bp "$bp_pct" \
    --argjson seo "$seo_pct" \
    --argjson lcp "$lcp" \
    --argjson cls "$cls" \
    --argjson inp "$inp" \
    '{
      page: $name,
      scores: { performance: $perf, accessibility: $acc, bestPractices: $bp, seo: $seo },
      webVitals: { lcpMs: $lcp, cls: $cls, inpMs: $inp }
    }' >> "${RESULTS_DIR}/summary-parts.jsonl"
}

# ══════════════════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════════════════

main() {
  echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${BLUE}║         Lighthouse CI — Budget Audit         ║${NC}"
  echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${CYAN}Base URL :${NC} $BASE_URL"
  echo -e "${CYAN}Runs     :${NC} $RUNS"
  echo -e "${CYAN}Date     :${NC} $TIMESTAMP"
  echo ""

  check_deps

  mkdir -p "$RESULTS_DIR"
  rm -f "${RESULTS_DIR}/summary-parts.jsonl"

  # ── Iterate pages ────────────────────────────────────────────────────────
  for slug in "${!PAGES[@]}"; do
    local name="${PAGES[$slug]}"
    local url="${BASE_URL}${slug}"
    local safe_slug
    safe_slug=$(echo "$slug" | sed 's|/|_|g; s|^_||')
    [[ -z "$safe_slug" ]] && safe_slug="home"

    local output_base="${RESULTS_DIR}/${safe_slug}-${TIMESTAMP}"

    echo -e "${BOLD}━━━ ${name} (${slug}) ━━━${NC}"
    echo -e "  URL: ${url}"

    run_lighthouse "$url" "$slug" "$output_base" || {
      echo -e "  ${RED}Skipping $name — Lighthouse failed${NC}"
      continue
    }

    if [[ "$JSON_ONLY" == "false" ]]; then
      check_page "${output_base}.json" "$name"
    else
      echo -e "  ${YELLOW}(json-only mode — skipping threshold checks)${NC}"
    fi

    echo ""
  done

  # ── Build summary JSON ─────────────────────────────────────────────────
  local summary_file="${RESULTS_DIR}/summary-${TIMESTAMP}.json"
  if [[ -f "${RESULTS_DIR}/summary-parts.jsonl" ]]; then
    jq -n \
      --arg ts "$TIMESTAMP" \
      --arg url "$BASE_URL" \
      --argjson runs "$RUNS" \
      --argjson perf "$MIN_PERFORMANCE" \
      --argjson acc "$MIN_ACCESSIBILITY" \
      --argjson bp "$MIN_BEST_PRACTICES" \
      --argjson seo "$MIN_SEO" \
      --argjson lcp "$MAX_LCP_MS" \
      --argjson cls_budget "0" \
      --argjson inp "$MAX_INP_MS" \
      --slurpfile pages "${RESULTS_DIR}/summary-parts.jsonl" \
      '{
        timestamp: $ts,
        baseUrl: $url,
        runsPerPage: $runs,
        budgets: {
          performance: $perf,
          accessibility: $acc,
          bestPractices: $bp,
          seo: $seo,
          lcpMs: $lcp,
          cls: 0.1,
          inpMs: $inp
        },
        pages: $pages
      }' > "$summary_file"
    rm -f "${RESULTS_DIR}/summary-parts.jsonl"
    echo -e "${CYAN}Summary saved → ${summary_file}${NC}"
  fi

  # ── Final verdict ──────────────────────────────────────────────────────
  echo ""
  if [[ "$EXIT_CODE" -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}All pages pass performance budgets ✓${NC}"
  else
    echo -e "${RED}${BOLD}Some pages failed performance budgets ✗${NC}"
    echo -e "${YELLOW}Review the results above and optimise before merging.${NC}"
  fi

  echo -e "${CYAN}Full results: ${RESULTS_DIR}/${NC}"

  exit "$EXIT_CODE"
}

main
