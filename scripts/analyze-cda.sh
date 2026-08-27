#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

echo "=== HEATMAP PAGE ==="
cat /tmp/cda-source/src/app/heatmap/page.tsx 2>/dev/null || echo "File not found"
echo ""
echo "=== CORRELATION PAGE ==="
cat /tmp/cda-source/src/app/correlation/page.tsx 2>/dev/null || echo "File not found"
echo ""
echo "=== SCREENER PAGE ==="
cat /tmp/cda-source/src/app/screener/page.tsx 2>/dev/null || echo "File not found"
echo ""
echo "=== GAS PAGE ==="
cat /tmp/cda-source/src/app/gas/page.tsx 2>/dev/null || echo "File not found"
echo ""
echo "=== LIQUIDATIONS PAGE ==="
cat /tmp/cda-source/src/app/liquidations/page.tsx 2>/dev/null || echo "File not found"
echo ""
echo "=== CALCULATOR PAGE ==="
cat /tmp/cda-source/src/app/calculator/page.tsx 2>/dev/null || echo "File not found"
echo ""
echo "=== MARKET LIB ==="
cat /tmp/cda-source/src/lib/market.ts 2>/dev/null || echo "File not found"

