# 41 — Document and Automate Database Migration Strategy

## Goal

Create a clear, documented database migration workflow for Drizzle ORM with PostgreSQL (Neon Serverless). Currently, `drizzle.config.ts` exists with migration commands in `package.json`, but there's no documented runbook for how migrations are applied in production, no safety checks, and no rollback strategy.

## Context

- **ORM:** Drizzle ORM v0.45.1 with `drizzle-kit` v0.31.9
- **Database:** PostgreSQL via Neon Serverless (`@neondatabase/serverless`)
- **Schema file:** `src/lib/db/schema.ts`
- **Migrations output:** `src/lib/db/migrations/` (configured but check if migrations exist)
- **Config:** `drizzle.config.ts` — uses `DATABASE_URL` env var
- **Existing scripts:**
  - `db:generate` — `drizzle-kit generate`
  - `db:migrate` — `drizzle-kit migrate`
  - `db:push` — `drizzle-kit push`
  - `db:studio` — `drizzle-kit studio`
  - `db:import` — `npx tsx scripts/db/import-archive.ts`
- **Deployment:** Vercel (no CI/CD pipeline — deploys are triggered by git push)

## Task

### 1. Audit Current State

- Read `src/lib/db/schema.ts` to understand the database schema
- List `src/lib/db/migrations/` to see if any migrations have been generated
- Read `scripts/run-migration.mjs` to understand the existing migration runner
- Read `scripts/db/` directory for any existing database scripts
- Check if there's a seed script

### 2. Create Migration Safety Script

Create `scripts/db/safe-migrate.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Safe Database Migration Script
# Usage: ./scripts/db/safe-migrate.sh [--dry-run] [--production]

DRY_RUN=false
PRODUCTION=false

for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --production) PRODUCTION=true ;;
  esac
done

echo "╔══════════════════════════════════════╗"
echo "║   Database Migration — Safety Check  ║"
echo "╚══════════════════════════════════════╝"

# 1. Verify DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# 2. Show which database we're targeting
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
echo "🎯 Target: $DB_HOST"

# 3. Production confirmation
if [ "$PRODUCTION" = true ]; then
  echo "⚠️  PRODUCTION migration requested"
  read -p "Type 'yes-migrate' to confirm: " CONFIRM
  if [ "$CONFIRM" != "yes-migrate" ]; then
    echo "❌ Aborted"
    exit 1
  fi
fi

# 4. Generate migration if schema changed
echo "📝 Generating migration from schema diff..."
bunx drizzle-kit generate 2>&1 | tee /tmp/drizzle-generate.log

# 5. Show pending migrations
echo ""
echo "📋 Pending migrations:"
ls -la src/lib/db/migrations/*.sql 2>/dev/null || echo "   (none)"

# 6. Dry run — show SQL without executing
if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "🔍 DRY RUN — SQL that would be executed:"
  cat src/lib/db/migrations/*.sql 2>/dev/null || echo "   No SQL files found"
  echo ""
  echo "✅ Dry run complete. No changes applied."
  exit 0
fi

# 7. Create backup point (Neon supports branching)
echo "💾 Recommendation: Create a Neon branch backup before proceeding"
echo "   neon branches create --name pre-migration-$(date +%Y%m%d%H%M%S)"

# 8. Apply migration
echo ""
echo "🚀 Applying migration..."
bunx drizzle-kit migrate 2>&1 | tee /tmp/drizzle-migrate.log

echo ""
echo "✅ Migration complete"
```

### 3. Create Migration Documentation

Create `docs/DATABASE-MIGRATIONS.md`:

Document the following:

#### Development Workflow
```bash
# 1. Edit schema
#    Modify src/lib/db/schema.ts

# 2. Generate migration
bun run db:generate

# 3. Review the generated SQL
cat src/lib/db/migrations/<timestamp>_*.sql

# 4. Apply to dev database
bun run db:migrate

# 5. Verify with Drizzle Studio
bun run db:studio
```

#### Production Workflow
```bash
# 1. Generate migration locally
bun run db:generate

# 2. Review the SQL carefully
cat src/lib/db/migrations/<latest>.sql

# 3. Dry run against production
DATABASE_URL=$PROD_DATABASE_URL ./scripts/db/safe-migrate.sh --dry-run --production

# 4. Create Neon branch backup
neon branches create --name pre-migration-$(date +%Y%m%d%H%M%S)

# 5. Apply migration
DATABASE_URL=$PROD_DATABASE_URL ./scripts/db/safe-migrate.sh --production

# 6. Verify application health
curl -s https://cryptocurrency.cv/api/health | jq .
```

#### Rollback Strategy
1. **Neon Branch Restore:** Restore from the pre-migration branch
2. **Manual SQL Rollback:** Keep a `down.sql` next to each migration
3. **Schema Revert:** Revert the schema change in git and run `db:push` (destructive — data loss possible)

#### Common Pitfalls
- Never use `db:push` in production (it can drop columns/tables)
- Always review generated SQL before applying
- Neon serverless connections may timeout on large migrations — use direct connection string
- Migrations must be idempotent where possible (use `IF NOT EXISTS`)

### 4. Add package.json Scripts

Add to `package.json`:

```json
{
  "db:migrate:safe": "./scripts/db/safe-migrate.sh",
  "db:migrate:dry-run": "./scripts/db/safe-migrate.sh --dry-run",
  "db:migrate:production": "./scripts/db/safe-migrate.sh --production"
}
```

### 5. Add Migration Checklist to CONTRIBUTING.md

Add a section to CONTRIBUTING.md under "Development Process":

```markdown
### Database Changes

If your PR modifies `src/lib/db/schema.ts`:
1. Run `bun run db:generate` to create a migration file
2. Review the generated SQL in `src/lib/db/migrations/`
3. Include the migration file in your PR
4. Test the migration locally with `bun run db:migrate`
5. Note any data migration needs in the PR description
```

## Requirements

- Do NOT modify the database schema itself
- Do NOT run any migrations — only create documentation and tooling
- The safe-migrate script must require explicit confirmation for production
- Dry-run mode must show SQL without executing
- Documentation must cover both dev and production workflows
- Rollback strategy must be clearly documented

## Success Criteria

- `scripts/db/safe-migrate.sh` exists and is executable
- `docs/DATABASE-MIGRATIONS.md` covers dev, production, and rollback workflows
- `bun run db:migrate:dry-run` works (shows help/generates SQL without applying)
- CONTRIBUTING.md includes database change checklist
