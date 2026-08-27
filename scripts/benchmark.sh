#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Benchmark Script
# Performance and load testing
#
# Usage:
#   ./scripts/benchmark.sh              # Run all benchmarks
#   ./scripts/benchmark.sh --api        # API benchmarks only
#   ./scripts/benchmark.sh --load       # Load test
#   ./scripts/benchmark.sh --url=URL    # Custom URL
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

BASE_URL="http://localhost:3000"
BENCHMARK_TYPE="all"
REQUESTS=100
CONCURRENCY=10

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url=*)
            BASE_URL="${1#*=}"
            shift
            ;;
        --api)
            BENCHMARK_TYPE="api"
            shift
            ;;
        --load)
            BENCHMARK_TYPE="load"
            shift
            ;;
        --requests=*)
            REQUESTS="${1#*=}"
            shift
            ;;
        --concurrency=*)
            CONCURRENCY="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--api|--load] [--url=URL] [--requests=N] [--concurrency=N]"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}⚡ Performance Benchmark${NC}"
echo -e "${BLUE}   Target: $BASE_URL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not reachable at $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Start the server with 'npm run dev' or 'npm start'${NC}"
    exit 1
fi

benchmark_endpoint() {
    local endpoint=$1
    local name=${2:-$endpoint}
    
    echo -e "${CYAN}Testing:${NC} $name"
    
    # Warm up
    curl -s "$BASE_URL$endpoint" > /dev/null 2>&1
    
    # Run benchmark
    local times=()
    local total=0
    local count=10
    
    for i in $(seq 1 $count); do
        local start=$(date +%s%N)
        curl -s "$BASE_URL$endpoint" > /dev/null 2>&1
        local end=$(date +%s%N)
        local duration=$(( (end - start) / 1000000 ))
        times+=($duration)
        total=$((total + duration))
    done
    
    local avg=$((total / count))
    local min=${times[0]}
    local max=${times[0]}
    
    for t in "${times[@]}"; do
        [ $t -lt $min ] && min=$t
        [ $t -gt $max ] && max=$t
    done
    
    # Color based on performance
    local color=$GREEN
    [ $avg -gt 200 ] && color=$YELLOW
    [ $avg -gt 500 ] && color=$RED
    
    printf "  ${color}avg: %4dms${NC}  min: %4dms  max: %4dms\n" $avg $min $max
}

# API Benchmarks
if [ "$BENCHMARK_TYPE" = "all" ] || [ "$BENCHMARK_TYPE" = "api" ]; then
    echo -e "${YELLOW}📊 API Response Times${NC}"
    echo ""
    
    benchmark_endpoint "/api/health" "Health Check"
    benchmark_endpoint "/api/news?limit=10" "News (10 items)"
    benchmark_endpoint "/api/news?limit=50" "News (50 items)"
    benchmark_endpoint "/api/news/categories" "Categories"
    benchmark_endpoint "/api/sources" "Sources"
    benchmark_endpoint "/api/stats" "Stats"
    benchmark_endpoint "/api/search?q=bitcoin" "Search"
    benchmark_endpoint "/api/trending" "Trending"
    benchmark_endpoint "/api/fear-greed" "Fear & Greed"
    benchmark_endpoint "/api/prices" "Prices"
    benchmark_endpoint "/api/sentiment" "Sentiment"
    
    echo ""
fi

# Load Test
if [ "$BENCHMARK_TYPE" = "all" ] || [ "$BENCHMARK_TYPE" = "load" ]; then
    echo -e "${YELLOW}🔥 Load Test${NC}"
    echo -e "   Requests: $REQUESTS, Concurrency: $CONCURRENCY"
    echo ""
    
    # Check if ab (Apache Bench) is available
    if command -v ab &> /dev/null; then
        echo -e "${CYAN}Using Apache Bench...${NC}"
        ab -n $REQUESTS -c $CONCURRENCY -q "$BASE_URL/api/news?limit=10" 2>&1 | grep -E "Requests per second|Time per request|Failed requests|Total transferred"
    elif command -v wrk &> /dev/null; then
        echo -e "${CYAN}Using wrk...${NC}"
        wrk -t4 -c$CONCURRENCY -d10s "$BASE_URL/api/news?limit=10"
    else
        echo -e "${CYAN}Using curl-based load test...${NC}"
        
        local start=$(date +%s)
        local success=0
        local failed=0
        
        for i in $(seq 1 $REQUESTS); do
            if curl -s -o /dev/null -w "" "$BASE_URL/api/news?limit=10" 2>/dev/null; then
                ((success++))
            else
                ((failed++))
            fi
            
            # Progress
            if [ $((i % 20)) -eq 0 ]; then
                echo -ne "\r  Progress: $i/$REQUESTS"
            fi
        done
        
        local end=$(date +%s)
        local duration=$((end - start))
        local rps=$((REQUESTS / (duration > 0 ? duration : 1)))
        
        echo -e "\r                              "
        echo -e "  Completed:         $success"
        echo -e "  Failed:            $failed"
        echo -e "  Duration:          ${duration}s"
        echo -e "  Requests/sec:      $rps"
    fi
    
    echo ""
fi

# Bundle size analysis
echo -e "${YELLOW}📦 Bundle Analysis${NC}"
if [ -d ".next" ]; then
    echo -e "  Next.js build size:"
    du -sh .next 2>/dev/null | awk '{print "    Total: " $1}'
    du -sh .next/static 2>/dev/null | awk '{print "    Static: " $1}'
    
    # Largest chunks
    echo -e "  Largest JS chunks:"
    find .next -name "*.js" -type f 2>/dev/null | xargs du -h 2>/dev/null | sort -rh | head -5 | awk '{print "    " $1 " " $2}'
else
    echo -e "  ${YELLOW}Run 'npm run build' first${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Benchmark complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
