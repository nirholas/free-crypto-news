#!/bin/bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

# Automated Repo Comparison & Sync Script
# Compares free-crypto-news with crypto-data-aggregator for differences

set -e

TEMP_DIR="/tmp/crypto-data-aggregator"
CURRENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OTHER_REPO="https://github.com/nirholas/crypto-data-aggregator"

echo "═══════════════════════════════════════════════════════════"
echo "🔄 REPO SYNC CHECKER"
echo "═══════════════════════════════════════════════════════════"
echo "📁 Current repo: $CURRENT_DIR"
echo "🌐 Comparing with: $OTHER_REPO"
echo ""

# Clone or update the other repo
if [ -d "$TEMP_DIR" ]; then
    echo "📥 Updating crypto-data-aggregator..."
    cd "$TEMP_DIR"
    git pull --quiet
else
    echo "📥 Cloning crypto-data-aggregator..."
    git clone --depth 1 "$OTHER_REPO" "$TEMP_DIR" 2>/dev/null
fi

cd "$CURRENT_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 ANALYSIS RESULTS"
echo "═══════════════════════════════════════════════════════════"

# Function to list unique files in a directory
list_unique_files() {
    local dir1="$1"
    local dir2="$2"
    local label="$3"
    
    if [ -d "$dir1" ] && [ -d "$dir2" ]; then
        local unique=$(comm -23 <(find "$dir1" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" 2>/dev/null | sed "s|$dir1/||" | sort) \
                              <(find "$dir2" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" 2>/dev/null | sed "s|$dir2/||" | sort) 2>/dev/null)
        if [ -n "$unique" ]; then
            echo ""
            echo "🆕 Files unique to $label:"
            echo "$unique" | head -20
            local count=$(echo "$unique" | wc -l)
            if [ "$count" -gt 20 ]; then
                echo "   ... and $((count - 20)) more"
            fi
        fi
    fi
}

# Check for new API endpoints
echo ""
echo "🔌 API ENDPOINTS COMPARISON"
echo "───────────────────────────────────────────────────────────"

THIS_APIS=$(find "$CURRENT_DIR/src/app/api" -type d -maxdepth 1 2>/dev/null | sed "s|$CURRENT_DIR/src/app/api/||" | sort)
OTHER_APIS=$(find "$TEMP_DIR/src/app/api" -type d -maxdepth 1 2>/dev/null | sed "s|$TEMP_DIR/src/app/api/||" | sort)

echo "APIs only in free-crypto-news:"
comm -23 <(echo "$THIS_APIS") <(echo "$OTHER_APIS") | grep -v '^$' | while read api; do
    [ -n "$api" ] && echo "  ✅ $api"
done

echo ""
echo "APIs only in crypto-data-aggregator (potential additions):"
comm -13 <(echo "$THIS_APIS") <(echo "$OTHER_APIS") | grep -v '^$' | while read api; do
    [ -n "$api" ] && echo "  ⚠️  $api"
done

# Check for new components
echo ""
echo "🧩 COMPONENTS COMPARISON"
echo "───────────────────────────────────────────────────────────"

if [ -d "$CURRENT_DIR/src/components" ] && [ -d "$TEMP_DIR/src/components" ]; then
    THIS_COMPS=$(find "$CURRENT_DIR/src/components" -type f -name "*.tsx" 2>/dev/null | sed "s|$CURRENT_DIR/src/components/||" | sort)
    OTHER_COMPS=$(find "$TEMP_DIR/src/components" -type f -name "*.tsx" 2>/dev/null | sed "s|$TEMP_DIR/src/components/||" | sort)
    
    echo "Components only in crypto-data-aggregator:"
    comm -13 <(echo "$THIS_COMPS") <(echo "$OTHER_COMPS") | grep -v '^$' | head -10 | while read comp; do
        [ -n "$comp" ] && echo "  ⚠️  $comp"
    done
fi

# Check for new lib utilities
echo ""
echo "📚 LIB UTILITIES COMPARISON"
echo "───────────────────────────────────────────────────────────"

if [ -d "$CURRENT_DIR/src/lib" ] && [ -d "$TEMP_DIR/src/lib" ]; then
    THIS_LIBS=$(find "$CURRENT_DIR/src/lib" -type f -name "*.ts" 2>/dev/null | sed "s|$CURRENT_DIR/src/lib/||" | sort)
    OTHER_LIBS=$(find "$TEMP_DIR/src/lib" -type f -name "*.ts" 2>/dev/null | sed "s|$TEMP_DIR/src/lib/||" | sort)
    
    echo "Libs only in crypto-data-aggregator:"
    comm -13 <(echo "$THIS_LIBS") <(echo "$OTHER_LIBS") | grep -v '^$' | head -10 | while read lib; do
        [ -n "$lib" ] && echo "  ⚠️  $lib"
    done
fi

# Check archive services
echo ""
echo "📦 ARCHIVE SERVICES COMPARISON"
echo "───────────────────────────────────────────────────────────"

if [ -d "$CURRENT_DIR/scripts/archive/services" ] && [ -d "$TEMP_DIR/scripts/archive/services" ]; then
    THIS_SVCS=$(ls "$CURRENT_DIR/scripts/archive/services" 2>/dev/null | sort)
    OTHER_SVCS=$(ls "$TEMP_DIR/scripts/archive/services" 2>/dev/null | sort)
    
    echo "Services only in crypto-data-aggregator:"
    comm -13 <(echo "$THIS_SVCS") <(echo "$OTHER_SVCS") | grep -v '^$' | while read svc; do
        [ -n "$svc" ] && echo "  ⚠️  $svc"
    done
fi

# Find files with significant differences
echo ""
echo "📝 FILES WITH MAJOR DIFFERENCES"
echo "───────────────────────────────────────────────────────────"

check_file_diff() {
    local file="$1"
    if [ -f "$CURRENT_DIR/$file" ] && [ -f "$TEMP_DIR/$file" ]; then
        local diff_lines=$(diff "$CURRENT_DIR/$file" "$TEMP_DIR/$file" 2>/dev/null | wc -l)
        if [ "$diff_lines" -gt 50 ]; then
            echo "  📄 $file ($diff_lines lines different)"
        fi
    fi
}

# Check key config files
for file in package.json next.config.js tsconfig.json; do
    check_file_diff "$file"
done

# Check key lib files
for file in src/lib/external-apis.ts src/lib/derivatives.ts src/lib/market-data.ts; do
    check_file_diff "$file"
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SYNC CHECK COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 To auto-sync a specific file:"
echo "   cp $TEMP_DIR/<path> $CURRENT_DIR/<path>"
echo ""
echo "💡 To see full diff of a file:"
echo "   diff $CURRENT_DIR/<path> $TEMP_DIR/<path>"
echo ""
