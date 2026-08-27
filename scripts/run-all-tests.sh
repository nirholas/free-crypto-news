#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Run All Tests
# Execute unit tests, E2E tests, and linting in sequence
#
# Usage:
#   ./scripts/run-all-tests.sh           # Run all tests
#   ./scripts/run-all-tests.sh --quick   # Skip E2E tests
#   ./scripts/run-all-tests.sh --ci      # CI mode (no interactive)
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

QUICK=false
CI_MODE=false
COVERAGE=false
FAILED=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick|-q)
            QUICK=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --coverage|-c)
            COVERAGE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--quick] [--ci] [--coverage]"
            echo "  --quick     Skip E2E tests"
            echo "  --ci        CI mode (stricter)"
            echo "  --coverage  Generate coverage report"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 Running All Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

START_TIME=$(date +%s)

# Type checking
echo -e "${YELLOW}📋 Step 1: Type Checking${NC}"
if npx tsc --noEmit 2>&1; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript check failed${NC}"
    ((FAILED++))
fi
echo ""

# Linting
echo -e "${YELLOW}📋 Step 2: Linting${NC}"
if npm run lint 2>&1; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${RED}❌ Lint check failed${NC}"
    ((FAILED++))
fi
echo ""

# Unit tests
echo -e "${YELLOW}📋 Step 3: Unit Tests${NC}"
if [ "$COVERAGE" = true ]; then
    if npm run test:coverage 2>&1; then
        echo -e "${GREEN}✅ Unit tests passed${NC}"
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        ((FAILED++))
    fi
else
    if npm run test:run 2>&1; then
        echo -e "${GREEN}✅ Unit tests passed${NC}"
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        ((FAILED++))
    fi
fi
echo ""

# E2E tests
if [ "$QUICK" = false ]; then
    echo -e "${YELLOW}📋 Step 4: E2E Tests${NC}"
    
    # Check if server is running for E2E
    if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Starting dev server for E2E tests...${NC}"
        npm run build > /dev/null 2>&1 || true
        npm run start &
        SERVER_PID=$!
        sleep 5
        STARTED_SERVER=true
    else
        STARTED_SERVER=false
    fi
    
    if npm run test:e2e 2>&1; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        ((FAILED++))
    fi
    
    if [ "$STARTED_SERVER" = true ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
else
    echo -e "${YELLOW}⏭️  Skipping E2E tests (--quick mode)${NC}"
fi
echo ""

# Accessibility audit
echo -e "${YELLOW}📋 Step 5: Accessibility Lint${NC}"
if npm run lint:a11y 2>&1; then
    echo -e "${GREEN}✅ Accessibility lint passed${NC}"
else
    echo -e "${YELLOW}⚠️  Accessibility lint has warnings${NC}"
fi
echo ""

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "Duration: ${DURATION}s"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED test suite(s) failed${NC}"
    exit 1
fi
