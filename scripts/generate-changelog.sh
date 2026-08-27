#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

#
# Generate Changelog from Git History
#
# This script parses git commits and generates a Keep a Changelog formatted output.
# It groups commits by type (feat, fix, chore, docs, etc.) and can generate
# output for different date ranges.
#
# Usage:
#   ./scripts/generate-changelog.sh                    # All commits
#   ./scripts/generate-changelog.sh --since=2024-01-01 # Since date
#   ./scripts/generate-changelog.sh --since=v2.0.0     # Since tag
#   ./scripts/generate-changelog.sh --unreleased       # Only unreleased
#   ./scripts/generate-changelog.sh --version=3.0.0    # Generate for version
#
# Author: Free Crypto News Team
# License: MIT

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
SINCE=""
UNTIL=""
VERSION=""
UNRELEASED=false
OUTPUT_FILE=""
FORMAT="markdown"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --since=*)
            SINCE="${1#*=}"
            shift
            ;;
        --until=*)
            UNTIL="${1#*=}"
            shift
            ;;
        --version=*)
            VERSION="${1#*=}"
            shift
            ;;
        --unreleased)
            UNRELEASED=true
            shift
            ;;
        --output=*)
            OUTPUT_FILE="${1#*=}"
            shift
            ;;
        --format=*)
            FORMAT="${1#*=}"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --since=DATE|TAG   Start from date (YYYY-MM-DD) or tag"
            echo "  --until=DATE|TAG   End at date or tag"
            echo "  --version=X.Y.Z    Version number for header"
            echo "  --unreleased       Only show unreleased commits"
            echo "  --output=FILE      Write to file instead of stdout"
            echo "  --format=FORMAT    Output format: markdown, json, html"
            echo "  -h, --help         Show this help"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

cd "$PROJECT_ROOT"

# Build git log command
GIT_LOG_CMD="git log --no-merges --pretty=format:'%H|%s|%an|%ai|%b§'"

if [[ -n "$SINCE" ]]; then
    # Check if it's a tag or date
    if git rev-parse "$SINCE" >/dev/null 2>&1; then
        GIT_LOG_CMD="$GIT_LOG_CMD $SINCE..HEAD"
    else
        GIT_LOG_CMD="$GIT_LOG_CMD --since=$SINCE"
    fi
fi

if [[ -n "$UNTIL" ]]; then
    if git rev-parse "$UNTIL" >/dev/null 2>&1; then
        GIT_LOG_CMD="$GIT_LOG_CMD HEAD..$UNTIL"
    else
        GIT_LOG_CMD="$GIT_LOG_CMD --until=$UNTIL"
    fi
fi

# Get latest tag for unreleased
if [[ "$UNRELEASED" == true ]]; then
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    if [[ -n "$LATEST_TAG" ]]; then
        GIT_LOG_CMD="git log --no-merges --pretty=format:'%H|%s|%an|%ai|%b§' $LATEST_TAG..HEAD"
    fi
fi

# Arrays to hold categorized commits
declare -a FEATURES=()
declare -a FIXES=()
declare -a BREAKING=()
declare -a DOCS=()
declare -a STYLES=()
declare -a REFACTORS=()
declare -a PERFS=()
declare -a TESTS=()
declare -a CHORES=()
declare -a OTHER=()

# Parse commits
echo -e "${BLUE}Parsing git history...${NC}" >&2

while IFS='§' read -r commit; do
    [[ -z "$commit" ]] && continue
    
    # Extract fields
    HASH=$(echo "$commit" | cut -d'|' -f1 | head -c 8)
    SUBJECT=$(echo "$commit" | cut -d'|' -f2)
    AUTHOR=$(echo "$commit" | cut -d'|' -f3)
    DATE=$(echo "$commit" | cut -d'|' -f4 | cut -d' ' -f1)
    BODY=$(echo "$commit" | cut -d'|' -f5-)
    
    # Clean up subject
    SUBJECT=$(echo "$SUBJECT" | sed 's/^ *//;s/ *$//')
    
    # Check for conventional commit format
    if [[ "$SUBJECT" =~ ^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?!?:\ (.+)$ ]]; then
        TYPE="${BASH_REMATCH[1]}"
        SCOPE="${BASH_REMATCH[2]}"
        MESSAGE="${BASH_REMATCH[3]}"
        BREAKING_CHANGE=false
        
        # Check for breaking change
        if [[ "$SUBJECT" == *"!"* ]] || [[ "$BODY" == *"BREAKING CHANGE"* ]]; then
            BREAKING_CHANGE=true
        fi
        
        # Format the entry
        ENTRY="- ${MESSAGE}"
        if [[ -n "$SCOPE" ]]; then
            SCOPE=$(echo "$SCOPE" | tr -d '()')
            ENTRY="- **${SCOPE}**: ${MESSAGE}"
        fi
        
        # Categorize
        if [[ "$BREAKING_CHANGE" == true ]]; then
            BREAKING+=("$ENTRY")
        fi
        
        case "$TYPE" in
            feat)
                FEATURES+=("$ENTRY")
                ;;
            fix)
                FIXES+=("$ENTRY")
                ;;
            docs)
                DOCS+=("$ENTRY")
                ;;
            style)
                STYLES+=("$ENTRY")
                ;;
            refactor)
                REFACTORS+=("$ENTRY")
                ;;
            perf)
                PERFS+=("$ENTRY")
                ;;
            test)
                TESTS+=("$ENTRY")
                ;;
            chore|build|ci)
                CHORES+=("$ENTRY")
                ;;
            *)
                OTHER+=("$ENTRY")
                ;;
        esac
    else
        # Non-conventional commit - try to guess category
        SUBJECT_LOWER=$(echo "$SUBJECT" | tr '[:upper:]' '[:lower:]')
        ENTRY="- ${SUBJECT}"
        
        if [[ "$SUBJECT_LOWER" == *"add"* ]] || [[ "$SUBJECT_LOWER" == *"implement"* ]] || [[ "$SUBJECT_LOWER" == *"create"* ]]; then
            FEATURES+=("$ENTRY")
        elif [[ "$SUBJECT_LOWER" == *"fix"* ]] || [[ "$SUBJECT_LOWER" == *"bug"* ]] || [[ "$SUBJECT_LOWER" == *"issue"* ]]; then
            FIXES+=("$ENTRY")
        elif [[ "$SUBJECT_LOWER" == *"doc"* ]] || [[ "$SUBJECT_LOWER" == *"readme"* ]]; then
            DOCS+=("$ENTRY")
        elif [[ "$SUBJECT_LOWER" == *"refactor"* ]] || [[ "$SUBJECT_LOWER" == *"cleanup"* ]]; then
            REFACTORS+=("$ENTRY")
        elif [[ "$SUBJECT_LOWER" == *"test"* ]]; then
            TESTS+=("$ENTRY")
        elif [[ "$SUBJECT_LOWER" == *"update"* ]] || [[ "$SUBJECT_LOWER" == *"upgrade"* ]] || [[ "$SUBJECT_LOWER" == *"bump"* ]]; then
            CHORES+=("$ENTRY")
        else
            OTHER+=("$ENTRY")
        fi
    fi
    
done < <(eval "$GIT_LOG_CMD" 2>/dev/null)

# Generate output
generate_markdown() {
    local output=""
    local date=$(date +%Y-%m-%d)
    
    # Header
    if [[ "$UNRELEASED" == true ]]; then
        output+="## [Unreleased]\n\n"
    elif [[ -n "$VERSION" ]]; then
        output+="## [$VERSION] - $date\n\n"
    else
        output+="## Changelog\n\n"
    fi
    
    # Breaking Changes
    if [[ ${#BREAKING[@]} -gt 0 ]]; then
        output+="### ⚠️ BREAKING CHANGES\n\n"
        for entry in "${BREAKING[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Added
    if [[ ${#FEATURES[@]} -gt 0 ]]; then
        output+="### Added\n\n"
        for entry in "${FEATURES[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Changed
    if [[ ${#REFACTORS[@]} -gt 0 ]] || [[ ${#PERFS[@]} -gt 0 ]]; then
        output+="### Changed\n\n"
        for entry in "${REFACTORS[@]}"; do
            output+="$entry\n"
        done
        for entry in "${PERFS[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Fixed
    if [[ ${#FIXES[@]} -gt 0 ]]; then
        output+="### Fixed\n\n"
        for entry in "${FIXES[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Documentation
    if [[ ${#DOCS[@]} -gt 0 ]]; then
        output+="### Documentation\n\n"
        for entry in "${DOCS[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Testing
    if [[ ${#TESTS[@]} -gt 0 ]]; then
        output+="### Testing\n\n"
        for entry in "${TESTS[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Maintenance
    if [[ ${#CHORES[@]} -gt 0 ]] || [[ ${#STYLES[@]} -gt 0 ]]; then
        output+="### Maintenance\n\n"
        for entry in "${CHORES[@]}"; do
            output+="$entry\n"
        done
        for entry in "${STYLES[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    # Other
    if [[ ${#OTHER[@]} -gt 0 ]]; then
        output+="### Other\n\n"
        for entry in "${OTHER[@]}"; do
            output+="$entry\n"
        done
        output+="\n"
    fi
    
    echo -e "$output"
}

generate_json() {
    echo "{"
    echo "  \"version\": \"${VERSION:-unreleased}\","
    echo "  \"date\": \"$(date +%Y-%m-%d)\","
    echo "  \"breaking\": $(printf '%s\n' "${BREAKING[@]:-}" | jq -R . | jq -s .),"
    echo "  \"added\": $(printf '%s\n' "${FEATURES[@]:-}" | jq -R . | jq -s .),"
    echo "  \"changed\": $(printf '%s\n' "${REFACTORS[@]:-}" "${PERFS[@]:-}" | jq -R . | jq -s .),"
    echo "  \"fixed\": $(printf '%s\n' "${FIXES[@]:-}" | jq -R . | jq -s .),"
    echo "  \"documentation\": $(printf '%s\n' "${DOCS[@]:-}" | jq -R . | jq -s .),"
    echo "  \"testing\": $(printf '%s\n' "${TESTS[@]:-}" | jq -R . | jq -s .),"
    echo "  \"maintenance\": $(printf '%s\n' "${CHORES[@]:-}" "${STYLES[@]:-}" | jq -R . | jq -s .),"
    echo "  \"other\": $(printf '%s\n' "${OTHER[@]:-}" | jq -R . | jq -s .)"
    echo "}"
}

# Output
case "$FORMAT" in
    markdown|md)
        OUTPUT=$(generate_markdown)
        ;;
    json)
        OUTPUT=$(generate_json)
        ;;
    *)
        OUTPUT=$(generate_markdown)
        ;;
esac

if [[ -n "$OUTPUT_FILE" ]]; then
    echo -e "$OUTPUT" > "$OUTPUT_FILE"
    echo -e "${GREEN}✓ Changelog written to $OUTPUT_FILE${NC}" >&2
else
    echo -e "$OUTPUT"
fi

# Summary
TOTAL=$((${#FEATURES[@]} + ${#FIXES[@]} + ${#DOCS[@]} + ${#CHORES[@]} + ${#OTHER[@]}))
echo -e "${GREEN}✓ Processed $TOTAL commits${NC}" >&2
echo -e "  ${BLUE}Features:${NC} ${#FEATURES[@]}" >&2
echo -e "  ${BLUE}Fixes:${NC} ${#FIXES[@]}" >&2
echo -e "  ${BLUE}Docs:${NC} ${#DOCS[@]}" >&2
echo -e "  ${BLUE}Chores:${NC} ${#CHORES[@]}" >&2
echo -e "  ${BLUE}Other:${NC} ${#OTHER[@]}" >&2
