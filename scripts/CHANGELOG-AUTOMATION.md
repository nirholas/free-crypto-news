# Changelog Automation Scripts

This directory contains scripts for automating changelog generation and commit history analysis.

## Scripts Overview

### 1. `generate-changelog.sh`
Generate changelog entries from git commit history in Keep a Changelog format.

```bash
# Generate changelog for all commits
./scripts/generate-changelog.sh

# Generate since a specific version/tag
./scripts/generate-changelog.sh --since=v2.5.0

# Generate only unreleased commits
./scripts/generate-changelog.sh --unreleased

# Output to file
./scripts/generate-changelog.sh --unreleased --output=UNRELEASED.md

# Generate as JSON
./scripts/generate-changelog.sh --format=json
```

**Options:**
| Option | Description |
|--------|-------------|
| `--since=TAG\|DATE` | Start from a specific tag or date |
| `--until=TAG\|DATE` | End at a specific tag or date |
| `--version=X.Y.Z` | Version number for the header |
| `--unreleased` | Only show commits since last tag |
| `--output=FILE` | Write to file instead of stdout |
| `--format=FORMAT` | Output format: `markdown`, `json` |

---

### 2. `analyze-commits.js`
Compare git history against CHANGELOG.md to find missing entries.

```bash
# Full analysis report
node scripts/analyze-commits.js

# CI check mode (exits 1 if missing entries)
node scripts/analyze-commits.js --check

# Since specific tag
node scripts/analyze-commits.js --since=v2.5.0

# JSON output for tooling
node scripts/analyze-commits.js --json

# Auto-update CHANGELOG.md
node scripts/analyze-commits.js --update
```

**Options:**
| Option | Description |
|--------|-------------|
| `--check` | CI mode - exit 1 if entries are missing |
| `--json` | Output results as JSON |
| `--update` | Automatically update CHANGELOG.md |
| `--verbose` | Show detailed output |
| `--since=TAG` | Analyze from specific tag/date |
| `--until=TAG` | Analyze until specific tag/date |

**Example Output:**
```
═══════════════════════════════════════════════════════════════
                    CHANGELOG ANALYSIS REPORT
═══════════════════════════════════════════════════════════════

Summary:
  Total commits analyzed: 156
  Documented in CHANGELOG: 142
  Missing from CHANGELOG: 8
  Uncertain/minor: 6

Commit Type Breakdown:
  ✨ feat: 45
  🐛 fix: 32
  📚 docs: 23
  ...

Missing Entries (should be documented):
  ✗ [a1b2c3d4] feat(api): add CoinPaprika fallback for coin details
  ✗ [e5f6g7h8] fix(market): increase rate limit to 50/min
  ...
```

---

### 3. `commit-stats.js`
Generate comprehensive statistics about repository commit history.

```bash
# Full statistics
node scripts/commit-stats.js

# JSON output
node scripts/commit-stats.js --json

# Since date
node scripts/commit-stats.js --since=2024-01-01
```

**Example Output:**
```
═══════════════════════════════════════════════════════════════
                    GIT COMMIT STATISTICS
═══════════════════════════════════════════════════════════════

📊 Summary
  Total commits: 1,234
  Contributors: 12
  Files changed: 456
  Lines added: +125,000
  Lines deleted: -45,000
  Velocity: 23.5 commits/week

👥 Top Contributors
   1. Developer Name          █████████████████ 234

📝 Commit Types
  feat       ████████████████████ 145 (35.2%)
  fix        ████████████████ 112 (27.1%)
  ...
```

---

## Integration

### GitHub Actions CI

```yaml
# .github/workflows/changelog-check.yml
name: Changelog Check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for commit analysis
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Check changelog entries
        run: node scripts/analyze-commits.js --check --since=origin/main
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Check if significant changes are documented

if git diff --cached --name-only | grep -qE '\.(ts|tsx|js)$'; then
  node scripts/analyze-commits.js --check --since=HEAD~10 || {
    echo "⚠️  Some commits may be missing from CHANGELOG.md"
    echo "   Run: node scripts/analyze-commits.js --update"
  }
fi
```

---

## Conventional Commits

These scripts work best with [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
| Type | Description | Changelog Section |
|------|-------------|-------------------|
| `feat` | New feature | Added |
| `fix` | Bug fix | Fixed |
| `docs` | Documentation | Documentation |
| `style` | Formatting | Changed |
| `refactor` | Code restructuring | Changed |
| `perf` | Performance | Changed |
| `test` | Tests | Testing |
| `build` | Build system | Maintenance |
| `ci` | CI/CD | Maintenance |
| `chore` | Maintenance | Maintenance |

**Examples:**
```bash
git commit -m "feat(api): add WebSocket support for real-time prices"
git commit -m "fix(coin): handle rate limit errors gracefully"
git commit -m "docs(readme): add API usage examples"
```

---

## Automating Releases

### Generate Release Notes

```bash
# Generate notes for next version
./scripts/generate-changelog.sh --unreleased --version=3.0.0 > RELEASE_NOTES.md

# Preview what will be in the release
./scripts/generate-changelog.sh --since=v2.5.0 --until=HEAD
```

### Full Release Workflow

```bash
# 1. Analyze current state
node scripts/analyze-commits.js --since=v2.5.0

# 2. Update changelog if needed
node scripts/analyze-commits.js --update

# 3. Generate release notes
./scripts/generate-changelog.sh --unreleased --version=2.6.0 >> CHANGELOG.md

# 4. Commit and tag
git add CHANGELOG.md
git commit -m "chore(release): v2.6.0"
git tag v2.6.0
git push origin main --tags
```

---

## Troubleshooting

### No commits found
Make sure you have git history available:
```bash
git fetch --unshallow  # If in CI with shallow clone
```

### Script not executable
```bash
chmod +x scripts/generate-changelog.sh
```

### Missing entries not detected
The analysis uses fuzzy matching. For better results:
- Use conventional commit format
- Include descriptive scopes
- Avoid very short commit messages

---

## Contributing

When adding new features:
1. Use conventional commits
2. Update CHANGELOG.md in the same PR
3. Run `node scripts/analyze-commits.js --check` before pushing

