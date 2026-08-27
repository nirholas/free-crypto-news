#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Development Environment Setup
# One-command setup for new developers
#
# Usage: ./scripts/dev-setup.sh
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

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 FREE CRYPTO NEWS - Development Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"

# Check Node.js version
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Install MCP server dependencies
if [ -d "mcp" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing MCP server dependencies...${NC}"
    cd mcp && npm install && cd ..
fi

# Install CLI dependencies
if [ -d "cli" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing CLI dependencies...${NC}"
    cd cli && npm install && cd ..
fi

# Setup environment file
echo ""
echo -e "${YELLOW}🔧 Setting up environment...${NC}"
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please update .env.local with your API keys${NC}"
    else
        cat > .env.local << 'EOF'
# Free Crypto News - Local Environment
# Add your API keys here

# Optional: AI Features
GROQ_API_KEY=
OPENAI_API_KEY=

# Optional: Redis (for caching/rate limiting)
REDIS_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Optional: Premium Features
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EOF
        echo -e "${GREEN}✅ Created .env.local template${NC}"
    fi
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Setup git hooks
echo ""
echo -e "${YELLOW}🪝 Setting up git hooks...${NC}"
if [ -d ".husky" ]; then
    npm run prepare 2>/dev/null || true
    echo -e "${GREEN}✅ Git hooks configured${NC}"
fi

# Verify installation
echo ""
echo -e "${YELLOW}🔍 Verifying installation...${NC}"
npm run lint --silent 2>/dev/null && echo -e "${GREEN}✅ Lint check passed${NC}" || echo -e "${YELLOW}⚠️  Lint has warnings (run 'npm run lint' for details)${NC}"

# Print summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Available commands:"
echo -e "  ${GREEN}npm run dev${NC}        - Start development server"
echo -e "  ${GREEN}npm run build${NC}      - Build for production"
echo -e "  ${GREEN}npm run test${NC}       - Run unit tests"
echo -e "  ${GREEN}npm run test:e2e${NC}   - Run E2E tests"
echo -e "  ${GREEN}npm run lint${NC}       - Lint code"
echo -e "  ${GREEN}npm run storybook${NC}  - Start Storybook"
echo ""
echo -e "Documentation:"
echo -e "  ${GREEN}npm run docs:dev${NC}   - Start docs server"
echo ""
