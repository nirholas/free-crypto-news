# 42 — Implement Coverage Ratchet to Prevent Regression

## Goal

Add a coverage ratchet mechanism that prevents test coverage from decreasing. The current thresholds (20% lines, 15% branches) are static and very permissive. A ratchet automatically raises thresholds as coverage improves, ensuring forward progress.

## Context

- **Test framework:** Vitest 4.x with v8 coverage provider
- **Config:** `vitest.config.ts`
- **Current thresholds:** 20% lines/statements, 15% branches/functions
- **Coverage command:** `bun run test:coverage`
- **Quality gate:** `scripts/quality-gate.sh`
- **No CI/CD pipeline** — quality checks run locally via pre-push hooks

## Current vitest.config.ts Coverage Section

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'src/**/*.d.ts',
    'src/app/**/layout.tsx',
    'src/app/**/loading.tsx',
    'src/app/**/error.tsx',
  ],
  thresholds: {
    lines: 20,
    branches: 15,
    functions: 15,
    statements: 20,
  },
},
```

## Task

### 1. Create Coverage Ratchet Script

Create `scripts/coverage-ratchet.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Coverage Ratchet — prevents test coverage from decreasing
# Updates vitest.config.ts thresholds to match current coverage (rounded down to nearest integer)
# Usage: ./scripts/coverage-ratchet.sh [--update] [--check]

MODE="${1:---check}"
COVERAGE_JSON="coverage/coverage-summary.json"

echo "╔═══════════════════════════════════╗"
echo "║     Coverage Ratchet Check        ║"
echo "╚═══════════════════════════════════╝"

# 1. Run coverage if summary doesn't exist
if [ ! -f "$COVERAGE_JSON" ]; then
  echo "📊 Running test coverage..."
  bun run test:coverage 2>/dev/null || true
fi

if [ ! -f "$COVERAGE_JSON" ]; then
  echo "❌ Coverage summary not found at $COVERAGE_JSON"
  echo "   Run 'bun run test:coverage' first"
  exit 1
fi

# 2. Extract current coverage percentages from JSON summary
LINES=$(node -e "const c = require('./$COVERAGE_JSON'); console.log(Math.floor(c.total.lines.pct))")
BRANCHES=$(node -e "const c = require('./$COVERAGE_JSON'); console.log(Math.floor(c.total.branches.pct))")
FUNCTIONS=$(node -e "const c = require('./$COVERAGE_JSON'); console.log(Math.floor(c.total.functions.pct))")
STATEMENTS=$(node -e "const c = require('./$COVERAGE_JSON'); console.log(Math.floor(c.total.statements.pct))")

echo "📊 Current coverage:"
echo "   Lines:      ${LINES}%"
echo "   Branches:   ${BRANCHES}%"
echo "   Functions:  ${FUNCTIONS}%"
echo "   Statements: ${STATEMENTS}%"

# 3. Extract current thresholds from vitest.config.ts
THRESH_LINES=$(grep -oP 'lines:\s*\K\d+' vitest.config.ts)
THRESH_BRANCHES=$(grep -oP 'branches:\s*\K\d+' vitest.config.ts)
THRESH_FUNCTIONS=$(grep -oP 'functions:\s*\K\d+' vitest.config.ts)
THRESH_STATEMENTS=$(grep -oP 'statements:\s*\K\d+' vitest.config.ts)

echo ""
echo "📏 Current thresholds:"
echo "   Lines:      ${THRESH_LINES}%"
echo "   Branches:   ${THRESH_BRANCHES}%"
echo "   Functions:  ${THRESH_FUNCTIONS}%"
echo "   Statements: ${THRESH_STATEMENTS}%"

# 4. Check mode — verify coverage hasn't dropped
if [ "$MODE" = "--check" ]; then
  FAILED=false
  
  if [ "$LINES" -lt "$THRESH_LINES" ]; then
    echo "❌ Lines coverage dropped: ${LINES}% < ${THRESH_LINES}% threshold"
    FAILED=true
  fi
  if [ "$BRANCHES" -lt "$THRESH_BRANCHES" ]; then
    echo "❌ Branches coverage dropped: ${BRANCHES}% < ${THRESH_BRANCHES}% threshold"
    FAILED=true
  fi
  if [ "$FUNCTIONS" -lt "$THRESH_FUNCTIONS" ]; then
    echo "❌ Functions coverage dropped: ${FUNCTIONS}% < ${THRESH_FUNCTIONS}% threshold"
    FAILED=true
  fi
  if [ "$STATEMENTS" -lt "$THRESH_STATEMENTS" ]; then
    echo "❌ Statements coverage dropped: ${STATEMENTS}% < ${THRESH_STATEMENTS}% threshold"
    FAILED=true
  fi
  
  if [ "$FAILED" = true ]; then
    echo ""
    echo "💡 Coverage has regressed. Add tests to restore coverage before pushing."
    exit 1
  fi
  
  echo ""
  echo "✅ Coverage meets or exceeds all thresholds"
  exit 0
fi

# 5. Update mode — ratchet thresholds up to current coverage
if [ "$MODE" = "--update" ]; then
  echo ""
  echo "🔧 Updating thresholds in vitest.config.ts..."
  
  # Only ratchet UP, never down
  NEW_LINES=$((LINES > THRESH_LINES ? LINES : THRESH_LINES))
  NEW_BRANCHES=$((BRANCHES > THRESH_BRANCHES ? BRANCHES : THRESH_BRANCHES))
  NEW_FUNCTIONS=$((FUNCTIONS > THRESH_FUNCTIONS ? FUNCTIONS : THRESH_FUNCTIONS))
  NEW_STATEMENTS=$((STATEMENTS > THRESH_STATEMENTS ? STATEMENTS : THRESH_STATEMENTS))
  
  sed -i "s/lines: $THRESH_LINES/lines: $NEW_LINES/" vitest.config.ts
  sed -i "s/branches: $THRESH_BRANCHES/branches: $NEW_BRANCHES/" vitest.config.ts
  sed -i "s/functions: $THRESH_FUNCTIONS/functions: $NEW_FUNCTIONS/" vitest.config.ts
  sed -i "s/statements: $THRESH_STATEMENTS/statements: $NEW_STATEMENTS/" vitest.config.ts
  
  echo "✅ Thresholds updated:"
  echo "   Lines:      ${THRESH_LINES}% → ${NEW_LINES}%"
  echo "   Branches:   ${THRESH_BRANCHES}% → ${NEW_BRANCHES}%"
  echo "   Functions:  ${THRESH_FUNCTIONS}% → ${NEW_FUNCTIONS}%"
  echo "   Statements: ${THRESH_STATEMENTS}% → ${NEW_STATEMENTS}%"
  echo ""
  echo "📝 Don't forget to commit vitest.config.ts"
fi
```

### 2. Add package.json Scripts

```json
{
  "coverage:ratchet": "./scripts/coverage-ratchet.sh --update",
  "coverage:check": "./scripts/coverage-ratchet.sh --check"
}
```

### 3. Integrate into Quality Gate

Read `scripts/quality-gate.sh` and add the coverage ratchet check. Insert after the test step:

```bash
echo "▸ Checking coverage ratchet..."
./scripts/coverage-ratchet.sh --check || { echo "❌ Coverage regression detected"; exit 1; }
```

### 4. Integrate into Pre-Push Hook

Read `scripts/install-pre-push-hook.sh` and add the coverage check to the pre-push hook content. The ratchet check should run as part of the pre-push quality gate.

### 5. Add to CONTRIBUTING.md

Add a section explaining the ratchet:

```markdown
### Test Coverage Ratchet

This project uses a coverage ratchet — test coverage thresholds automatically increase
as you add tests and can never decrease. If your PR reduces coverage, the quality gate
will fail.

- Check current thresholds: see `vitest.config.ts` → `coverage.thresholds`
- After adding tests: run `bun run coverage:ratchet` to update thresholds
- The pre-push hook automatically verifies coverage hasn't dropped
```

## Requirements

- The ratchet must only go UP, never down (even if you run `--update` with lower coverage)
- `--check` mode must not modify any files
- `--update` mode must only modify `vitest.config.ts`
- The script must work with the existing Vitest JSON coverage output
- Make the script executable: `chmod +x scripts/coverage-ratchet.sh`
- Keep `coverage/` in `.gitignore` (don't commit coverage reports)

## Success Criteria

- `bun run test:coverage` generates `coverage/coverage-summary.json`
- `bun run coverage:check` passes (current coverage meets thresholds)
- `bun run coverage:ratchet` updates thresholds in `vitest.config.ts` if coverage improved
- The quality gate includes the ratchet check
- Removing a test file causes `coverage:check` to fail
