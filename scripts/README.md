# Scripts

Utility scripts for development, testing, and maintenance of Free Crypto News.

## Quick Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `dev-setup.sh` | New developer setup | `./scripts/dev-setup.sh` |
| `health-check.sh` | API health checks | `./scripts/health-check.sh --local` |
| `cleanup.sh` | Remove build artifacts | `./scripts/cleanup.sh --all` |
| `run-all-tests.sh` | Run all test suites | `./scripts/run-all-tests.sh` |
| `release.sh` | Version & release | `./scripts/release.sh patch` |
| `env-check.sh` | Validate env vars | `./scripts/env-check.sh` |
| `deploy.sh` | Deploy to production | `./scripts/deploy.sh --preview` |
| `backup.sh` | Backup data & config | `./scripts/backup.sh` |
| `benchmark.sh` | Performance testing | `./scripts/benchmark.sh --api` |
| `logs.sh` | View production logs | `./scripts/logs.sh --vercel` |
| `docker-build.sh` | Docker operations | `./scripts/docker-build.sh` |

## Directory Structure

```
scripts/
├── dev-setup.sh               # One-command development setup
├── health-check.sh            # Production health checks
├── cleanup.sh                 # Clean build artifacts & caches
├── run-all-tests.sh           # Run TypeScript, lint, unit & E2E tests
├── release.sh                 # Version bump, changelog, tag & push
├── env-check.sh               # Validate environment variables
├── deploy.sh                  # Deploy to Vercel/Railway
├── backup.sh                  # Backup data & configuration
├── benchmark.sh               # API & load testing
├── logs.sh                    # View/search production logs
├── docker-build.sh            # Docker build & run
├── generate-changelog.sh      # Generate changelog from git history
├── test-api.sh                # Test API endpoints
├── analyze-commits.js         # Compare commits against CHANGELOG.md
├── commit-stats.js            # Git repository statistics
├── CHANGELOG-AUTOMATION.md    # Full documentation for changelog tools
├── check-source-health.mjs    # Probe every RSS source and classify failures
├── a11y-audit.js              # Accessibility audit runner
├── contrast-audit.js          # Color contrast checker
├── generate-pwa-icons.js      # Generate PWA icons from source
├── load-test.js               # API load testing
├── compare-repos.sh           # Repository comparison
├── sync-repos.sh              # Sync between repositories
├── sync-from-cda.sh           # Sync from CDA source
├── archive/                   # News archive collection scripts
│   ├── collect.js             # Basic archive collector
│   ├── collect-enhanced.js    # Enhanced collector with social data
│   └── stats.js               # Archive statistics
└── i18n/                      # Internationalization scripts
    ├── translate.ts           # Auto-translate messages
    └── validate.ts            # Validate translations
```

## Development Setup

### First-Time Setup
```bash
# Complete development environment setup
./scripts/dev-setup.sh
```

This script:
- Checks Node.js version (18+ required)
- Installs all dependencies (main, MCP, CLI)
- Creates `.env.local` from template
- Sets up git hooks (husky)
- Runs initial lint check

### Environment Validation
```bash
# Check all environment variables
./scripts/env-check.sh

# Strict mode (fail on optional missing)
./scripts/env-check.sh --strict
```

## Changelog Automation

### Generate Changelog
```bash
# Generate from all commits
./scripts/generate-changelog.sh

# Generate unreleased changes only
./scripts/generate-changelog.sh --unreleased

# Generate since specific version
./scripts/generate-changelog.sh --since=v2.5.0

# Output as JSON
./scripts/generate-changelog.sh --format=json
```

### Analyze Commits
```bash
# Full analysis report
node scripts/analyze-commits.js

# CI check (exits 1 if entries missing)
node scripts/analyze-commits.js --check

# Auto-update CHANGELOG.md
node scripts/analyze-commits.js --update
```

### Commit Statistics
```bash
# Full repository stats
node scripts/commit-stats.js

# JSON output for tooling
node scripts/commit-stats.js --json
```

📚 **Full Documentation:** See [CHANGELOG-AUTOMATION.md](./CHANGELOG-AUTOMATION.md)

## Source Health

### Audit every news source

The project's headline claim is "200+ sources", and nothing used to verify that
those feeds still answer. `check-source-health.mjs` fetches every entry in
`RSS_SOURCES` the way the app does and classifies the outcome, so a dead URL is
distinguishable from a datacentre IP that Cloudflare refuses.

```bash
# Full audit, human-readable table
node scripts/check-source-health.mjs

# Quick sample while iterating
node scripts/check-source-health.mjs --limit 40

# Machine-readable report
node scripts/check-source-health.mjs --json source-health.json

# Just the entries that are repo bugs, tab separated
node scripts/check-source-health.mjs --only dead

# Fail the run past a threshold, for a scheduled check
node scripts/check-source-health.mjs --max-dead 20
```

| State | Meaning | Whose bug |
| --- | --- | --- |
| `ok` | Parsed at least one `<item>` or `<entry>` | none |
| `empty` | Valid feed, zero items | ours: wrong URL or drained feed |
| `notfeed` | HTTP 200 but the body is not a feed | ours: URL now serves a web page |
| `blocked` | 403 or 429, typically Cloudflare refusing a datacentre IP | theirs, may work from production |
| `timeout` | No response inside the deadline | theirs |
| `dead` | 404, 410, DNS failure or connection refused | ours: fix or remove the source |

Flags: `--concurrency` (default 6), `--timeout` (default 15000 ms), `--limit`,
`--json <path>`, `--only dead`, `--max-dead <n>`.

## Accessibility & Quality

### Accessibility Audit
```bash
# Run full a11y audit
node scripts/a11y-audit.js

# Audit specific pages
node scripts/a11y-audit.js --pages=/,/about
```

### Contrast Audit
```bash
# Check color contrast ratios
node scripts/contrast-audit.js
```

## PWA & Assets

### Generate PWA Icons
```bash
# Generate all PWA icon sizes
node scripts/generate-pwa-icons.js
```

## Testing

### Run All Tests
```bash
# Full test suite (TypeScript, lint, unit, E2E)
./scripts/run-all-tests.sh

# Quick mode (skip E2E)
./scripts/run-all-tests.sh --quick

# With coverage
./scripts/run-all-tests.sh --coverage

# CI mode
./scripts/run-all-tests.sh --ci
```

### API Testing
```bash
# Test all API endpoints
./scripts/test-api.sh
```

### Load Testing
```bash
# Run API load tests
node scripts/load-test.js

# Custom concurrent users
node scripts/load-test.js --users=100
```

### Benchmarking
```bash
# Full benchmark (API + load)
./scripts/benchmark.sh

# API response times only
./scripts/benchmark.sh --api

# Load testing
./scripts/benchmark.sh --load --requests=500 --concurrency=20

# Custom URL
./scripts/benchmark.sh --url=https://cryptocurrency.cv
```

## Health Checks

```bash
# Check production
./scripts/health-check.sh

# Check localhost
./scripts/health-check.sh --local

# Custom URL with verbose output
./scripts/health-check.sh --url=https://staging.example.com --verbose
```

## Deployment

### Deploy to Production
```bash
# Deploy to Vercel (production)
./scripts/deploy.sh

# Preview deployment
./scripts/deploy.sh --preview

# Deploy to Railway
./scripts/deploy.sh --railway

# Dry run (pre-flight checks only)
./scripts/deploy.sh --dry-run

# Skip tests
./scripts/deploy.sh --skip-tests
```

### Release New Version
```bash
# Patch release (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# Minor release (1.0.0 -> 1.1.0)
./scripts/release.sh minor

# Major release (1.0.0 -> 2.0.0)
./scripts/release.sh major

# Specific version
./scripts/release.sh 2.0.0

# Dry run
./scripts/release.sh patch --dry-run
```

### Docker
```bash
# Build and run
./scripts/docker-build.sh

# Build only
./scripts/docker-build.sh --build

# Run existing image
./scripts/docker-build.sh --run

# Build and push to registry
./scripts/docker-build.sh --push --registry=ghcr.io/username

# Stop container
./scripts/docker-build.sh --stop
```

## Maintenance

### Cleanup
```bash
# Standard cleanup (build artifacts, caches)
./scripts/cleanup.sh

# Deep clean (includes node_modules)
./scripts/cleanup.sh --all

# Preview what would be deleted
./scripts/cleanup.sh --dry-run
```

### Backup
```bash
# Full backup (data + config)
./scripts/backup.sh

# Data only
./scripts/backup.sh --data

# Config only
./scripts/backup.sh --config

# Custom output location
./scripts/backup.sh --output=/path/to/backups
```

### Logs
```bash
# Tail Vercel logs
./scripts/logs.sh

# Search logs
./scripts/logs.sh --search="error"

# Railway logs
./scripts/logs.sh --railway

# Local logs
./scripts/logs.sh --local

# Last N lines without following
./scripts/logs.sh --lines=200 --no-follow
```

## Load Testing

## Internationalization

```bash
# Translate to specific locale
GROQ_API_KEY=your-key npx tsx scripts/i18n/translate.ts --locale es

# Validate translations
npx tsx scripts/i18n/validate.ts --locale zh-CN
```

## Archive Management

```bash
# Collect today's news to archive
node scripts/archive/collect.js

# Enhanced collection with social data
node scripts/archive/collect-enhanced.js

# View archive statistics
node scripts/archive/stats.js
node scripts/archive/stats.js 2026-01
```

## Repository Sync

```bash
# Compare with another repository
./scripts/compare-repos.sh

# Sync repositories
./scripts/sync-repos.sh
```

## Adding New Scripts

1. Create your script in the `scripts/` directory
2. Add shebang and usage documentation at the top:
   ```bash
   #!/bin/bash
   #
   # Script Name
   # Description of what it does
   #
   # Usage:
   #   ./scripts/script-name.sh [options]
   #
   ```
3. Make it executable: `chmod +x scripts/script-name.sh`
4. Update this README with script description
5. If complex, create a dedicated `SCRIPT-NAME.md` documentation file
