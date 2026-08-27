#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Logs Script
# View and search production/development logs
#
# Usage:
#   ./scripts/logs.sh                    # Tail Vercel logs
#   ./scripts/logs.sh --search="error"   # Search logs
#   ./scripts/logs.sh --railway          # Railway logs
#   ./scripts/logs.sh --local            # Local dev logs
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

PLATFORM="vercel"
SEARCH=""
FOLLOW=true
LINES=100

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --vercel)
            PLATFORM="vercel"
            shift
            ;;
        --railway)
            PLATFORM="railway"
            shift
            ;;
        --local)
            PLATFORM="local"
            shift
            ;;
        --search=*)
            SEARCH="${1#*=}"
            shift
            ;;
        --no-follow|-n)
            FOLLOW=false
            shift
            ;;
        --lines=*)
            LINES="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--vercel|--railway|--local] [--search=TERM] [--no-follow] [--lines=N]"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 Logs Viewer - ${PLATFORM^}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

case $PLATFORM in
    vercel)
        if ! command -v vercel &> /dev/null; then
            echo -e "${RED}❌ Vercel CLI not installed${NC}"
            echo -e "${YELLOW}Install with: npm i -g vercel${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Fetching Vercel logs...${NC}"
        echo ""
        
        if [ -n "$SEARCH" ]; then
            if [ "$FOLLOW" = true ]; then
                vercel logs --follow 2>&1 | grep -i --color=always "$SEARCH"
            else
                vercel logs 2>&1 | grep -i --color=always "$SEARCH" | tail -n $LINES
            fi
        else
            if [ "$FOLLOW" = true ]; then
                vercel logs --follow
            else
                vercel logs | tail -n $LINES
            fi
        fi
        ;;
        
    railway)
        if ! command -v railway &> /dev/null; then
            echo -e "${RED}❌ Railway CLI not installed${NC}"
            echo -e "${YELLOW}Install from: https://docs.railway.app/develop/cli${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Fetching Railway logs...${NC}"
        echo ""
        
        if [ -n "$SEARCH" ]; then
            railway logs 2>&1 | grep -i --color=always "$SEARCH" | tail -n $LINES
        else
            railway logs | tail -n $LINES
        fi
        ;;
        
    local)
        echo -e "${YELLOW}Searching local logs...${NC}"
        echo ""
        
        # Common log locations
        LOG_FILES=(
            ".next/trace"
            "npm-debug.log"
            "yarn-error.log"
            ".vercel/output/functions/*.func/output.log"
        )
        
        # Look for log files
        found_logs=false
        
        for pattern in "${LOG_FILES[@]}"; do
            for file in $pattern; do
                if [ -f "$file" ]; then
                    found_logs=true
                    echo -e "${GREEN}📄 $file${NC}"
                    if [ -n "$SEARCH" ]; then
                        grep -i --color=always "$SEARCH" "$file" 2>/dev/null | tail -n $LINES || true
                    else
                        tail -n $LINES "$file"
                    fi
                    echo ""
                fi
            done
        done
        
        # Also check pm2 logs if available
        if command -v pm2 &> /dev/null; then
            echo -e "${YELLOW}PM2 Logs:${NC}"
            pm2 logs --lines $LINES --nostream 2>/dev/null || true
        fi
        
        if [ "$found_logs" = false ]; then
            echo -e "${YELLOW}No log files found.${NC}"
            echo ""
            echo "Tips for viewing logs:"
            echo "  • Development: Output appears in terminal running 'npm run dev'"
            echo "  • Production Vercel: Use './scripts/logs.sh --vercel'"
            echo "  • Production Railway: Use './scripts/logs.sh --railway'"
        fi
        ;;
esac

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
