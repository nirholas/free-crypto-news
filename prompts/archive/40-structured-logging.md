# 40 — Implement Structured Logging with Pino

## Goal

Establish consistent, structured JSON logging across the application using the already-installed Pino library. The project has `pino` v10.3.1, `pino-pretty` v13.1.3, and `@pinojs/redact` v0.4.0 installed, plus a `src/lib/logger.ts` file — but logging usage across the codebase is inconsistent (many raw `console.log`/`console.error` calls).

## Context

- **Installed packages:** `pino` v10.3.1, `pino-pretty` v13.1.3, `@pinojs/redact` v0.4.0, `@opentelemetry/instrumentation-pino` v0.59.0
- **Existing logger:** `src/lib/logger.ts` — read this file first to understand current setup
- **OpenTelemetry:** Already configured via `instrumentation.ts` for tracing
- **Deployment:** Vercel (structured logs viewable in Vercel dashboard), Docker (stdout/stderr)
- **ESLint rule:** `"no-console": ["warn", { allow: ["warn", "error", "info"] }]`

## Task

### 1. Read and Audit Current Logger

Read `src/lib/logger.ts` to understand what's already configured. Then improve it to be the single, canonical logging module.

### 2. Enhance `src/lib/logger.ts`

The logger should support:

```typescript
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),

  // Structured JSON in production, pretty-printed in development
  transport: isProduction
    ? undefined // JSON to stdout (Vercel/Docker picks this up)
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      },

  // Redact sensitive fields
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "apiKey",
      "password",
      "token",
      "secret",
      "DATABASE_URL",
      "REDIS_URL",
    ],
    censor: "[REDACTED]",
  },

  // Base fields on every log line
  base: {
    service: "free-crypto-news",
    env: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version,
  },

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// Child loggers for specific domains
export const apiLogger = logger.child({ module: "api" });
export const cacheLogger = logger.child({ module: "cache" });
export const dbLogger = logger.child({ module: "database" });
export const wsLogger = logger.child({ module: "websocket" });
export const authLogger = logger.child({ module: "auth" });
export const rateLimitLogger = logger.child({ module: "rate-limit" });
export const aiLogger = logger.child({ module: "ai" });
export const archiveLogger = logger.child({ module: "archive" });
```

### 3. Create Request Logging Utility

Create `src/lib/request-logger.ts` for API route logging:

```typescript
import { apiLogger } from "@/lib/logger";
import { type NextRequest } from "next/server";

export function logApiRequest(
  req: NextRequest,
  extra?: Record<string, unknown>,
) {
  apiLogger.info(
    {
      method: req.method,
      url: req.nextUrl.pathname,
      search: req.nextUrl.search,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent")?.slice(0, 100),
      ...extra,
    },
    `${req.method} ${req.nextUrl.pathname}`,
  );
}

export function logApiError(
  req: NextRequest,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  apiLogger.error(
    {
      method: req.method,
      url: req.nextUrl.pathname,
      err: error instanceof Error ? error : new Error(String(error)),
      ...extra,
    },
    `Error: ${req.method} ${req.nextUrl.pathname}`,
  );
}
```

### 4. Replace Console Calls in Critical Paths

Search for `console.log`, `console.error`, `console.warn` in these critical files and replace with the appropriate logger:

- **`middleware.ts`** — Use `rateLimitLogger` and `authLogger`
- **`src/lib/cache/`** — Use `cacheLogger`
- **`src/lib/database.ts`** and `src/lib/db/`\*\* — Use `dbLogger`
- **`src/lib/api-keys.ts`** — Use `authLogger`
- **`src/lib/ratelimit.ts`** — Use `rateLimitLogger`
- **`src/lib/redis.ts`** — Use `cacheLogger`
- **`ws-server.js`** — Use `wsLogger` (or keep console for standalone process)

**Do NOT replace ALL console calls** — only in the files listed above. Leave `console.log` in scripts/, examples/, and dev-only code.

### 5. Add Log Level Environment Variable

Document in `.env.example` (or create one if it doesn't exist):

```
# Logging
LOG_LEVEL=info  # trace, debug, info, warn, error, fatal
```

### 6. Add Unit Tests

Create `src/__tests__/logger.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Logger", () => {
  it("should create logger with correct base fields");
  it("should redact sensitive fields");
  it("should create child loggers with module field");
  it("should use pino-pretty in development");
  it("should output JSON in production");
});
```

## Requirements

- Use the ALREADY INSTALLED pino packages — do not install new logging libraries
- Sensitive data (API keys, tokens, passwords, database URLs) MUST be redacted
- Production logs must be JSON (one line per log entry) for Vercel/Docker log aggregation
- Development logs must be human-readable (pino-pretty)
- Do NOT break existing functionality — only change logging calls
- Keep `console.log` in `scripts/`, `examples/`, and build-time code
- The logger must work in both Edge Runtime and Node.js runtime

## Success Criteria

- `bun run build` succeeds
- `bun run test:run` passes
- All API error responses include a `requestId` that correlates to a log entry
- No sensitive data appears in log output (test with `LOG_LEVEL=debug`)
- `grep -r "console\." src/lib/cache/ src/lib/database.ts src/lib/api-keys.ts src/lib/ratelimit.ts src/lib/redis.ts middleware.ts` returns zero results
