#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

# Simulate Redis outage — tests cache layer degradation
set -e
echo "[chaos] Pausing Redis container..."
docker pause redis || { echo "Redis container not found"; exit 1; }
echo "[chaos] Redis paused. Running 5-minute load test..."
k6 run scripts/load-tests/baseline.js --duration 5m --env BASE_URL=${BASE_URL:-http://localhost:3000} 2>&1 || true
echo "[chaos] Resuming Redis..."
docker unpause redis
echo "[chaos] Redis resumed. System should recover within 30s."
