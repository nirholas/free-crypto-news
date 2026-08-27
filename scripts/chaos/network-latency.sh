#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

# Inject 500ms network latency to simulate degraded upstream APIs
set -e
echo "[chaos] Adding 500ms ±100ms latency..."
tc qdisc add dev eth0 root netem delay 500ms 100ms 2>/dev/null || \
  echo "[chaos] tc failed — try running with sudo or check kernel modules"
echo "[chaos] Latency injected. Running 10-minute test..."
sleep 600
echo "[chaos] Removing latency..."
tc qdisc del dev eth0 root 2>/dev/null || true
echo "[chaos] Done."
