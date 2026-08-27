#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Backup Script
# Backup data, archives, and configuration
#
# Usage:
#   ./scripts/backup.sh                    # Full backup
#   ./scripts/backup.sh --data             # Data only
#   ./scripts/backup.sh --config           # Config only
#   ./scripts/backup.sh --output=/path     # Custom output path
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

BACKUP_TYPE="full"
OUTPUT_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_$TIMESTAMP"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --data)
            BACKUP_TYPE="data"
            shift
            ;;
        --config)
            BACKUP_TYPE="config"
            shift
            ;;
        --output=*)
            OUTPUT_DIR="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--data|--config] [--output=/path]"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}💾 Backup Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Create backup directory
mkdir -p "$OUTPUT_DIR"
BACKUP_PATH="$OUTPUT_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

backup_file() {
    local src=$1
    local dest=$2
    
    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$BACKUP_PATH/$dest")"
        cp "$src" "$BACKUP_PATH/$dest"
        echo -e "${GREEN}✅${NC} $src"
    elif [ -d "$src" ]; then
        mkdir -p "$BACKUP_PATH/$dest"
        cp -r "$src"/* "$BACKUP_PATH/$dest/" 2>/dev/null || true
        echo -e "${GREEN}✅${NC} $src/"
    else
        echo -e "${YELLOW}⚠️${NC}  $src (not found)"
    fi
}

# Backup data
if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "data" ]; then
    echo -e "${YELLOW}📦 Backing up data...${NC}"
    
    # Archive data
    backup_file "archive" "data/archive"
    
    # Data files
    backup_file "data/alerts.json" "data/alerts.json"
    
    # Content
    backup_file "content/blog" "data/content/blog"
    
    # Messages/i18n
    backup_file "messages" "data/messages"
    
    echo ""
fi

# Backup config
if [ "$BACKUP_TYPE" = "full" ] || [ "$BACKUP_TYPE" = "config" ]; then
    echo -e "${YELLOW}⚙️  Backing up configuration...${NC}"
    
    # Core config
    backup_file "package.json" "config/package.json"
    backup_file "tsconfig.json" "config/tsconfig.json"
    backup_file "next.config.js" "config/next.config.js"
    backup_file "tailwind.config.js" "config/tailwind.config.js"
    backup_file "postcss.config.js" "config/postcss.config.js"
    backup_file "eslint.config.mjs" "config/eslint.config.mjs"
    
    # Deployment config
    backup_file "vercel.json" "config/vercel.json"
    backup_file "railway.json" "config/railway.json"
    
    # MkDocs
    backup_file "mkdocs.yml" "config/mkdocs.yml"
    
    # Playwright
    backup_file "playwright.config.ts" "config/playwright.config.ts"
    
    # Vitest
    backup_file "vitest.config.ts" "config/vitest.config.ts"
    
    echo ""
fi

# Backup environment template (not actual secrets!)
echo -e "${YELLOW}🔐 Creating environment template...${NC}"
if [ -f ".env.local" ]; then
    # Create template with variable names only
    grep -E "^[A-Z_]+=" .env.local 2>/dev/null | sed 's/=.*/=/' > "$BACKUP_PATH/config/.env.template" || true
    echo -e "${GREEN}✅${NC} Environment template created"
fi
echo ""

# Create manifest
echo -e "${YELLOW}📝 Creating backup manifest...${NC}"
cat > "$BACKUP_PATH/manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "type": "$BACKUP_TYPE",
  "version": "$(node -p "require('./package.json').version" 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
echo -e "${GREEN}✅${NC} Manifest created"
echo ""

# Create archive
echo -e "${YELLOW}📦 Creating archive...${NC}"
cd "$OUTPUT_DIR"
ARCHIVE_NAME="$BACKUP_NAME.tar.gz"
tar -czf "$ARCHIVE_NAME" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Backup complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Archive: ${GREEN}$OUTPUT_DIR/$ARCHIVE_NAME${NC}"
echo -e "Size:    ${GREEN}$ARCHIVE_SIZE${NC}"
echo ""

# Cleanup old backups (keep last 10)
echo -e "${YELLOW}🧹 Cleaning old backups...${NC}"
ls -t "$OUTPUT_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
BACKUP_COUNT=$(ls -1 "$OUTPUT_DIR"/backup_*.tar.gz 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Keeping $BACKUP_COUNT most recent backups${NC}"
