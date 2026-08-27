#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

# Simulate upstream API failure — blocks CoinGecko to test circuit breaker
set -e
echo "[chaos] Blocking api.coingecko.com for 5 minutes..."
iptables -A OUTPUT -d api.coingecko.com -j DROP 2>/dev/null || \
  echo "[chaos] iptables failed — try running with sudo"
echo "[chaos] CoinGecko blocked. Circuit breaker should activate within 10s."
echo "[chaos] Waiting 300s..."
sleep 300
echo "[chaos] Restoring CoinGecko..."
iptables -D OUTPUT -d api.coingecko.com -j DROP 2>/dev/null || true
echo "[chaos] Done. Check provider health: curl localhost:3000/api/providers/health"
