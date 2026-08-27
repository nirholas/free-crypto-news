# 37 — Refactor Middleware into Composable Modules

## Goal

Break the monolithic `middleware.ts` into small, composable, independently testable middleware functions. The current file is a single orchestrator handling 8+ concerns (i18n, bot detection, auth, rate limiting, x402 payment gate, CSP headers, CORS, request validation) — making it hard to test, debug, and maintain.

## Context

- **Framework:** Next.js 16 with `middleware.ts` at project root
- **Current structure:** Single `middleware()` function with inline branching for:
  1. Internationalization (next-intl locale detection & routing)
  2. Trusted-origin bypass (Sperax domains skip rate limiting + x402)
  3. Bot detection (blocks scrapers by User-Agent)
  4. Admin route authentication (bearer-token guard)
  5. Request size validation (rejects oversized bodies)
  6. Rate limiting (60 req/hour free tier via @upstash/ratelimit)
  7. x402 payment gate (USDC micropayments on Base)
  8. Security & observability headers (CSP nonce, HSTS, X-Frame-Options, request ID)
- **Existing sub-modules:** `src/middleware/` already has some extracted logic
- **Test file:** `src/__tests__/middleware.test.ts` tests security utilities imported from `src/lib/security`
- **Config matcher:** The middleware config already excludes static assets, images, favicon

## Architecture

### Target Structure

```
src/middleware/
  index.ts              # Re-exports compose() and all middleware
  compose.ts            # Middleware composition utility
  intl.ts               # Internationalization (next-intl)
  bot-detection.ts      # Bot/scraper blocking
  admin-auth.ts         # Admin route bearer-token guard
  request-validation.ts # Body size limits, malformed request rejection
  rate-limit.ts         # Per-IP and per-API-key rate limiting
  x402-gate.ts          # USDC micropayment verification
  security-headers.ts   # CSP nonce, HSTS, X-Frame-Options, Permissions-Policy
  cors.ts               # CORS preflight and header injection
  observability.ts      # Request ID generation, tracing headers
  trusted-origin.ts     # Sperax domain bypass logic
  types.ts              # Shared types (MiddlewareContext, MiddlewareResult)
```

### Middleware Composition Pattern

Create a `compose()` utility that chains middleware functions. Each middleware should:

```typescript
// src/middleware/types.ts
import { type NextRequest, NextResponse } from "next/server";

export interface MiddlewareContext {
  request: NextRequest;
  response?: NextResponse;
  requestId: string;
  isTrustedOrigin: boolean;
  isBot: boolean;
  isApiRoute: boolean;
  isEmbedRoute: boolean;
  apiKeyTier?: "free" | "pro" | "enterprise";
  cspNonce?: string;
  // Add fields as needed
}

export type MiddlewareHandler = (
  ctx: MiddlewareContext,
) =>
  | Promise<MiddlewareContext | NextResponse>
  | MiddlewareContext
  | NextResponse;
```

```typescript
// src/middleware/compose.ts
export function compose(...handlers: MiddlewareHandler[]): MiddlewareHandler {
  return async (ctx) => {
    for (const handler of handlers) {
      const result = await handler(ctx);
      if (result instanceof NextResponse) return result; // Short-circuit (e.g., 403, 429)
      ctx = result; // Pass enriched context to next handler
    }
    return ctx;
  };
}
```

### Root middleware.ts (simplified)

```typescript
import { compose } from "@/middleware/compose";
import { intl } from "@/middleware/intl";
import { trustedOrigin } from "@/middleware/trusted-origin";
import { botDetection } from "@/middleware/bot-detection";
import { adminAuth } from "@/middleware/admin-auth";
import { requestValidation } from "@/middleware/request-validation";
import { rateLimit } from "@/middleware/rate-limit";
import { x402Gate } from "@/middleware/x402-gate";
import { securityHeaders } from "@/middleware/security-headers";
import { cors } from "@/middleware/cors";
import { observability } from "@/middleware/observability";

const pipeline = compose(
  observability, // Add request ID + tracing
  trustedOrigin, // Check if trusted origin
  botDetection, // Block bots (short-circuits with 403)
  intl, // Locale routing (non-API only)
  adminAuth, // Admin auth (admin routes only)
  requestValidation, // Body size check
  rateLimit, // Rate limiting (API routes only)
  x402Gate, // Payment gate (API routes only)
  cors, // CORS headers
  securityHeaders, // CSP, HSTS, etc.
);

export async function middleware(request: NextRequest) {
  const ctx: MiddlewareContext = {
    request,
    requestId: crypto.randomUUID(),
    isTrustedOrigin: false,
    isBot: false,
    isApiRoute: request.nextUrl.pathname.startsWith("/api"),
    isEmbedRoute: request.nextUrl.pathname.startsWith("/embed"),
  };

  const result = await pipeline(ctx);
  if (result instanceof NextResponse) return result;
  return result.response ?? NextResponse.next();
}

export const config = {
  /* keep existing matcher */
};
```

## Task

1. **Read** the current `middleware.ts` fully to understand all logic branches
2. **Read** existing files in `src/middleware/` to see what's already extracted
3. **Create** `src/middleware/types.ts` with the shared context interface
4. **Create** `src/middleware/compose.ts` with the composition utility
5. **Extract** each concern into its own file in `src/middleware/`
6. **Simplify** the root `middleware.ts` to use the composed pipeline
7. **Preserve all existing behavior exactly** — this is a refactor, not a feature change
8. **Add unit tests** for each extracted middleware:
   - `src/__tests__/middleware/bot-detection.test.ts`
   - `src/__tests__/middleware/rate-limit.test.ts`
   - `src/__tests__/middleware/security-headers.test.ts`
   - `src/__tests__/middleware/compose.test.ts`
   - etc.
9. **Run** `bun run test:run` to verify all tests pass
10. **Run** `bun run build` to verify the build succeeds

## Requirements

- Every extracted middleware must be independently testable with mocked context
- The compose utility must support short-circuiting (returning NextResponse early)
- Preserve ALL existing security headers, rate limiting logic, and bot detection
- Preserve the existing `config.matcher` array exactly
- Do not change any external behavior — same headers, same status codes, same rate limits
- Each middleware should handle its own route matching (e.g., rate-limit only runs on /api/ routes)

## Success Criteria

- `bun run build` succeeds
- `bun run test:run` passes (existing + new tests)
- The root `middleware.ts` is < 50 lines
- Each middleware module is self-contained and testable
- No behavior regression for any route type (API, embed, page, admin, docs)
