#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Docker Build Script
# Build and run Docker containers
#
# Usage:
#   ./scripts/docker-build.sh           # Build and run
#   ./scripts/docker-build.sh --build   # Build only
#   ./scripts/docker-build.sh --run     # Run existing image
#   ./scripts/docker-build.sh --push    # Build and push to registry
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

IMAGE_NAME="free-crypto-news"
TAG="latest"
PORT=3000
ACTION="build-run"
REGISTRY=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build|-b)
            ACTION="build"
            shift
            ;;
        --run|-r)
            ACTION="run"
            shift
            ;;
        --push|-p)
            ACTION="push"
            shift
            ;;
        --stop|-s)
            ACTION="stop"
            shift
            ;;
        --tag=*)
            TAG="${1#*=}"
            shift
            ;;
        --registry=*)
            REGISTRY="${1#*=}/"
            shift
            ;;
        --port=*)
            PORT="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--build|--run|--push|--stop] [--tag=TAG] [--port=PORT] [--registry=URL]"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

FULL_IMAGE="${REGISTRY}${IMAGE_NAME}:${TAG}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🐳 Docker Build Script${NC}"
echo -e "${BLUE}   Image: $FULL_IMAGE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    echo -e "${YELLOW}📝 Creating Dockerfile...${NC}"
    cat > Dockerfile << 'EOF'
# Multi-stage build for Next.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF
    echo -e "${GREEN}✅ Dockerfile created${NC}"
fi

# Create .dockerignore if it doesn't exist
if [ ! -f ".dockerignore" ]; then
    echo -e "${YELLOW}📝 Creating .dockerignore...${NC}"
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules
npm-debug.log

# Build outputs
.next
out
build
dist

# Git
.git
.gitignore

# IDE
.vscode
.idea

# Testing
coverage
playwright-report
test-results

# Misc
*.md
*.log
.env*.local
.DS_Store
Thumbs.db

# Docker
Dockerfile
docker-compose.yml
.dockerignore
EOF
    echo -e "${GREEN}✅ .dockerignore created${NC}"
fi

case $ACTION in
    build|build-run)
        echo -e "${YELLOW}🔨 Building Docker image...${NC}"
        docker build -t "$FULL_IMAGE" .
        echo -e "${GREEN}✅ Build complete${NC}"
        echo ""
        
        if [ "$ACTION" = "build" ]; then
            exit 0
        fi
        ;&  # Fall through to run
        
    run)
        # Stop existing container
        if docker ps -q -f name="$IMAGE_NAME" | grep -q .; then
            echo -e "${YELLOW}Stopping existing container...${NC}"
            docker stop "$IMAGE_NAME" 2>/dev/null || true
            docker rm "$IMAGE_NAME" 2>/dev/null || true
        fi
        
        echo -e "${YELLOW}🚀 Starting container...${NC}"
        docker run -d \
            --name "$IMAGE_NAME" \
            -p "$PORT:3000" \
            --env-file .env.local 2>/dev/null || \
        docker run -d \
            --name "$IMAGE_NAME" \
            -p "$PORT:3000" \
            "$FULL_IMAGE"
        
        echo -e "${GREEN}✅ Container running${NC}"
        echo -e "   URL: http://localhost:$PORT"
        echo ""
        
        # Show logs
        echo -e "${YELLOW}📋 Container logs:${NC}"
        sleep 2
        docker logs "$IMAGE_NAME" --tail 20
        ;;
        
    push)
        echo -e "${YELLOW}🔨 Building Docker image...${NC}"
        docker build -t "$FULL_IMAGE" .
        echo -e "${GREEN}✅ Build complete${NC}"
        echo ""
        
        echo -e "${YELLOW}📤 Pushing to registry...${NC}"
        docker push "$FULL_IMAGE"
        echo -e "${GREEN}✅ Push complete${NC}"
        ;;
        
    stop)
        echo -e "${YELLOW}🛑 Stopping container...${NC}"
        docker stop "$IMAGE_NAME" 2>/dev/null || true
        docker rm "$IMAGE_NAME" 2>/dev/null || true
        echo -e "${GREEN}✅ Container stopped${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 Docker Status${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Images:${NC}"
docker images | grep "$IMAGE_NAME" || echo "  No images found"
echo ""
echo -e "${YELLOW}Containers:${NC}"
docker ps -a | grep "$IMAGE_NAME" || echo "  No containers found"
