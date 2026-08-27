# 45 — Add Translation Staleness Detection

## Goal

Create a lightweight system to detect when translated README files and i18n message files become stale (out of sync with the English source). The project maintains 42 translated READMEs and 18 locales for UI strings — these risk diverging as the English source is updated.

## Context

- **Translated READMEs:** 42 files (`README.ar.md`, `README.bg.md`, ..., `README.zh-TW.md`) in project root
- **Source README:** `README.md` (English)
- **i18n messages:** `messages/` directory with locale JSON files
- **Source locale:** `messages/en.json` (English)
- **Translation scripts:**
  - `bun run i18n:translate` — Auto-translate UI strings
  - `bun run i18n:validate` — Validate i18n keys
  - `bun run i18n:check` — Check i18n completeness
  - `bun run docs:translate` — Translate docs
- **Git available:** Yes — can use git log to compare modification dates

## Task

### 1. Create Translation Freshness Checker

Create `scripts/translation-freshness.js`:

```javascript
#!/usr/bin/env node

/**
 * Translation Freshness Checker
 * Compares modification dates of translated files against their English source.
 * Reports which translations are stale and need updating.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const STALE_THRESHOLD_DAYS = 30; // Consider stale if > 30 days behind source

// ─── README translations ───
const README_SOURCE = 'README.md';
const README_TRANSLATIONS = fs.readdirSync('.')
  .filter(f => f.match(/^README\..+\.md$/) && f !== 'README.md');

// ─── i18n message translations ───
const MESSAGES_DIR = 'messages';
const MESSAGES_SOURCE = path.join(MESSAGES_DIR, 'en.json');

function getLastModifiedDate(filePath) {
  try {
    const date = execSync(
      `git log -1 --format=%aI -- "${filePath}"`,
      { encoding: 'utf-8' }
    ).trim();
    return date ? new Date(date) : null;
  } catch {
    return null;
  }
}

function getContentHash(filePath) {
  try {
    return execSync(
      `git log -1 --format=%H -- "${filePath}"`,
      { encoding: 'utf-8' }
    ).trim();
  } catch {
    return null;
  }
}

function daysBetween(date1, date2) {
  return Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
}

function checkFreshness(sourceFile, translationFiles) {
  const sourceDate = getLastModifiedDate(sourceFile);
  if (!sourceDate) {
    console.error(`  ⚠️  Could not determine last modified date for ${sourceFile}`);
    return { fresh: [], stale: [], unknown: translationFiles };
  }

  const results = { fresh: [], stale: [], unknown: [] };

  for (const file of translationFiles) {
    const translationDate = getLastModifiedDate(file);
    
    if (!translationDate) {
      results.unknown.push({ file, reason: 'no git history' });
      continue;
    }

    const daysOld = daysBetween(translationDate, sourceDate);
    
    if (translationDate >= sourceDate) {
      results.fresh.push({ file, daysOld: 0 });
    } else if (daysOld <= STALE_THRESHOLD_DAYS) {
      results.fresh.push({ file, daysOld });
    } else {
      results.stale.push({
        file,
        daysOld,
        lastUpdated: translationDate.toISOString().split('T')[0],
        sourceUpdated: sourceDate.toISOString().split('T')[0],
      });
    }
  }

  return results;
}

// ─── Main ───
console.log('╔═══════════════════════════════════════╗');
console.log('║   Translation Freshness Report        ║');
console.log('╚═══════════════════════════════════════╝');
console.log(`Stale threshold: ${STALE_THRESHOLD_DAYS} days\n`);

// Check READMEs
console.log(`📄 README Translations (source: ${README_SOURCE})`);
console.log('─'.repeat(60));
const readmeResults = checkFreshness(README_SOURCE, README_TRANSLATIONS);

if (readmeResults.stale.length > 0) {
  console.log(`\n  ⚠️  ${readmeResults.stale.length} stale translations:`);
  readmeResults.stale
    .sort((a, b) => b.daysOld - a.daysOld)
    .forEach(({ file, daysOld, lastUpdated }) => {
      console.log(`     ${file.padEnd(20)} ${daysOld} days old (last: ${lastUpdated})`);
    });
}

console.log(`\n  ✅ ${readmeResults.fresh.length} fresh`);
console.log(`  ⚠️  ${readmeResults.stale.length} stale`);
if (readmeResults.unknown.length > 0) {
  console.log(`  ❓ ${readmeResults.unknown.length} unknown`);
}

// Check i18n messages
if (fs.existsSync(MESSAGES_DIR)) {
  const messageFiles = fs.readdirSync(MESSAGES_DIR)
    .filter(f => f.endsWith('.json') && f !== 'en.json')
    .map(f => path.join(MESSAGES_DIR, f));

  console.log(`\n📝 i18n Message Files (source: ${MESSAGES_SOURCE})`);
  console.log('─'.repeat(60));
  
  // Also check key completeness
  let sourceKeys = [];
  try {
    const sourceData = JSON.parse(fs.readFileSync(MESSAGES_SOURCE, 'utf-8'));
    sourceKeys = getAllKeys(sourceData);
  } catch {}
  
  const msgResults = checkFreshness(MESSAGES_SOURCE, messageFiles);
  
  if (msgResults.stale.length > 0) {
    console.log(`\n  ⚠️  ${msgResults.stale.length} stale translations:`);
    msgResults.stale
      .sort((a, b) => b.daysOld - a.daysOld)
      .forEach(({ file, daysOld, lastUpdated }) => {
        // Check key completeness
        let missingKeys = 0;
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
          const translationKeys = getAllKeys(data);
          missingKeys = sourceKeys.filter(k => !translationKeys.includes(k)).length;
        } catch {}
        
        const keyInfo = missingKeys > 0 ? ` (${missingKeys} missing keys)` : '';
        console.log(`     ${path.basename(file).padEnd(15)} ${daysOld} days old${keyInfo}`);
      });
  }

  console.log(`\n  ✅ ${msgResults.fresh.length} fresh`);
  console.log(`  ⚠️  ${msgResults.stale.length} stale`);
}

// Summary
const totalStale = readmeResults.stale.length;
console.log('\n' + '═'.repeat(60));
if (totalStale > 0) {
  console.log(`\n📋 Action needed: ${totalStale} README translations are stale.`);
  console.log('   Run: bun run docs:translate');
  console.log('   Run: bun run i18n:translate');
  process.exit(1); // Non-zero exit for CI integration
} else {
  console.log('\n✅ All translations are fresh!');
}

// Utility: recursively get all keys from nested JSON
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}
```

### 2. Add package.json Scripts

```json
{
  "i18n:freshness": "node scripts/translation-freshness.js",
  "i18n:freshness:strict": "STALE_THRESHOLD_DAYS=7 node scripts/translation-freshness.js"
}
```

### 3. Add to Quality Gate (Non-Blocking)

Read `scripts/quality-gate.sh` and add as a non-blocking check:

```bash
echo "▸ Checking translation freshness..."
node scripts/translation-freshness.js || echo "⚠️  Some translations are stale (non-blocking)"
```

### 4. Create Retranslation Helper

Create `scripts/retranslate-stale.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Retranslate all stale README translations
echo "🔄 Retranslating stale README files..."

# Get list of stale files from freshness checker
STALE_FILES=$(node -e "
const { execSync } = require('child_process');
const fs = require('fs');
const source = new Date(execSync('git log -1 --format=%aI -- README.md', {encoding:'utf-8'}).trim());
fs.readdirSync('.').filter(f => f.match(/^README\\..+\\.md$/) && f !== 'README.md').forEach(f => {
  const d = new Date(execSync(\`git log -1 --format=%aI -- \${f}\`, {encoding:'utf-8'}).trim());
  if ((source - d) / 86400000 > 30) console.log(f.match(/README\\.(.+)\\.md/)[1]);
});
")

if [ -z "$STALE_FILES" ]; then
  echo "✅ No stale translations found"
  exit 0
fi

echo "Stale locales: $STALE_FILES"
echo ""

for LOCALE in $STALE_FILES; do
  echo "  📝 Translating README to $LOCALE..."
  bun run docs:translate -- --file README.md --locales "$LOCALE" || echo "  ⚠️  Failed: $LOCALE"
done

echo ""
echo "✅ Retranslation complete. Review changes with: git diff README.*.md"
```

## Requirements

- The freshness checker must use git history (not filesystem timestamps)
- Must handle files with no git history gracefully
- The threshold (30 days) should be configurable via environment variable
- i18n message completeness checking (missing keys) is a bonus, not blocking
- Do NOT auto-translate — only detect and report staleness
- The retranslation helper is optional convenience, not part of the gate

## Success Criteria

- `bun run i18n:freshness` produces a clear report of stale translations
- Report shows days behind source and last updated date for each stale file
- Exit code 1 when stale translations exist (for potential CI use)
- Exit code 0 when all translations are fresh
- i18n message key completeness is reported alongside freshness
