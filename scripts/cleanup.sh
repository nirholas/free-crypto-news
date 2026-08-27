#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Cleanup Script
# Remove build artifacts, caches, and temporary files
#
# Usage:
#   ./scripts/cleanup.sh           # Standard cleanup
#   ./scripts/cleanup.sh --all     # Deep cleanup (includes node_modules)
#   ./scripts/cleanup.sh --dry-run # Show what would be deleted
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

DRY_RUN=false
DEEP_CLEAN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all|--deep)
            DEEP_CLEAN=true
            shift
            ;;
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--all] [--dry-run]"
            echo "  --all      Deep clean including node_modules"
            echo "  --dry-run  Show what would be deleted"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧹 Cleanup Script${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}   (DRY RUN - no files will be deleted)${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_SIZE=0

cleanup_dir() {
    local dir=$1
    local desc=$2
    
    if [ -d "$dir" ]; then
        local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}Would delete:${NC} $dir ($size) - $desc"
        else
            echo -e "${GREEN}Deleting:${NC} $dir ($size) - $desc"
            rm -rf "$dir"
        fi
    fi
}

cleanup_file() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        local size=$(du -sh "$file" 2>/dev/null | cut -f1)
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}Would delete:${NC} $file ($size) - $desc"
        else
            echo -e "${GREEN}Deleting:${NC} $file ($size) - $desc"
            rm -f "$file"
        fi
    fi
}

cleanup_pattern() {
    local pattern=$1
    local desc=$2
    
    local files=$(find . -name "$pattern" -type f 2>/dev/null | head -20)
    local count=$(find . -name "$pattern" -type f 2>/dev/null | wc -l)
    
    if [ "$count" -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}Would delete:${NC} $count files matching '$pattern' - $desc"
        else
            echo -e "${GREEN}Deleting:${NC} $count files matching '$pattern' - $desc"
            find . -name "$pattern" -type f -delete 2>/dev/null || true
        fi
    fi
}

echo -e "${YELLOW}📁 Build Artifacts${NC}"
cleanup_dir ".next" "Next.js build output"
cleanup_dir "out" "Static export output"
cleanup_dir "dist" "Distribution files"
cleanup_dir "build" "Build output"
cleanup_dir ".turbo" "Turbo cache"
cleanup_dir "storybook-static" "Storybook build"
cleanup_dir "site" "MkDocs build"

echo ""
echo -e "${YELLOW}📁 Test Artifacts${NC}"
cleanup_dir "coverage" "Test coverage"
cleanup_dir "playwright-report" "Playwright report"
cleanup_dir "test-results" "Test results"
cleanup_dir ".nyc_output" "NYC output"

echo ""
echo -e "${YELLOW}📁 Cache Directories${NC}"
cleanup_dir ".cache" "General cache"
cleanup_dir ".eslintcache" "ESLint cache"
cleanup_dir ".stylelintcache" "Stylelint cache"
cleanup_dir ".parcel-cache" "Parcel cache"
cleanup_dir ".swc" "SWC cache"
cleanup_dir "docs/cache" "Docs cache"

echo ""
echo -e "${YELLOW}📄 Temporary Files${NC}"
cleanup_pattern "*.log" "Log files"
cleanup_pattern "*.tmp" "Temporary files"
cleanup_pattern ".DS_Store" "macOS metadata"
cleanup_pattern "Thumbs.db" "Windows thumbnails"
cleanup_file "npm-debug.log" "npm debug log"
cleanup_file "yarn-error.log" "yarn error log"
cleanup_file "pnpm-debug.log" "pnpm debug log"

# Deep clean
if [ "$DEEP_CLEAN" = true ]; then
    echo ""
    echo -e "${RED}🔥 Deep Clean${NC}"
    cleanup_dir "node_modules" "Node modules"
    cleanup_dir "mcp/node_modules" "MCP node modules"
    cleanup_dir "cli/node_modules" "CLI node modules"
    cleanup_dir "sdk/node_modules" "SDK node modules"
    cleanup_file "package-lock.json" "Package lock"
    cleanup_file "pnpm-lock.yaml" "PNPM lock"
    cleanup_file "yarn.lock" "Yarn lock"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Dry run complete - no files deleted${NC}"
else
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
    if [ "$DEEP_CLEAN" = true ]; then
        echo -e "${YELLOW}⚠️  Run 'npm install' to restore dependencies${NC}"
    fi
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
