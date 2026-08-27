#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Release Script
# Automates version bump, changelog generation, tagging, and push
#
# Usage:
#   ./scripts/release.sh patch     # 1.0.0 -> 1.0.1
#   ./scripts/release.sh minor     # 1.0.0 -> 1.1.0
#   ./scripts/release.sh major     # 1.0.0 -> 2.0.0
#   ./scripts/release.sh 1.2.3     # Specific version
#   ./scripts/release.sh --dry-run # Preview changes
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
BUMP_TYPE=""
VERSION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [patch|minor|major|VERSION] [--dry-run]"
            exit 0
            ;;
        patch|minor|major)
            BUMP_TYPE=$1
            shift
            ;;
        *)
            if [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                VERSION=$1
            fi
            shift
            ;;
    esac
done

if [ -z "$BUMP_TYPE" ] && [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Please specify version type (patch/minor/major) or version number${NC}"
    echo "Usage: $0 [patch|minor|major|VERSION] [--dry-run]"
    exit 1
fi

cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Release Script${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}   (DRY RUN - no changes will be made)${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check for clean working directory
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Working directory is not clean. Please commit or stash changes.${NC}"
    git status --short
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${YELLOW}v$CURRENT_VERSION${NC}"

# Calculate new version
if [ -n "$VERSION" ]; then
    NEW_VERSION=$VERSION
else
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    case $BUMP_TYPE in
        major)
            NEW_VERSION="$((MAJOR + 1)).0.0"
            ;;
        minor)
            NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
            ;;
        patch)
            NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
            ;;
    esac
fi

echo -e "New version:     ${GREEN}v$NEW_VERSION${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Dry run - would perform the following:${NC}"
    echo "  1. Update package.json version to $NEW_VERSION"
    echo "  2. Generate changelog for v$NEW_VERSION"
    echo "  3. Commit changes"
    echo "  4. Create git tag v$NEW_VERSION"
    echo "  5. Push to origin"
    exit 0
fi

# Confirm
echo -e "${YELLOW}Proceed with release? (y/N)${NC}"
read -r CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# Update package.json
echo -e "${YELLOW}📦 Updating package.json...${NC}"
npm version "$NEW_VERSION" --no-git-tag-version

# Generate changelog
echo -e "${YELLOW}📝 Generating changelog...${NC}"
if [ -f "$SCRIPT_DIR/generate-changelog.sh" ]; then
    bash "$SCRIPT_DIR/generate-changelog.sh" --version="$NEW_VERSION" >> CHANGELOG.md.new 2>/dev/null || true
    if [ -f "CHANGELOG.md.new" ] && [ -s "CHANGELOG.md.new" ]; then
        # Prepend new changelog entries
        if [ -f "CHANGELOG.md" ]; then
            cat CHANGELOG.md.new CHANGELOG.md > CHANGELOG.md.tmp
            mv CHANGELOG.md.tmp CHANGELOG.md
        else
            mv CHANGELOG.md.new CHANGELOG.md
        fi
        rm -f CHANGELOG.md.new
    fi
fi

# Commit changes
echo -e "${YELLOW}📝 Committing changes...${NC}"
git add package.json package-lock.json CHANGELOG.md 2>/dev/null || git add package.json CHANGELOG.md
git commit -m "chore: release v$NEW_VERSION"

# Create tag
echo -e "${YELLOW}🏷️  Creating tag...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push
echo -e "${YELLOW}🚀 Pushing to origin...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Released v$NEW_VERSION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Next steps:"
echo -e "  • Create GitHub release: ${BLUE}gh release create v$NEW_VERSION${NC}"
echo -e "  • Deploy to production"
echo ""
