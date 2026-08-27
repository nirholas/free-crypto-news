# Technical Architecture, Security and Testing

> Runtime and caching design, authentication and x402 payment security, and the test suites that guard the platform.
>
> Moved here from the project README. Back to the [reference index](../../README.md).

## 🏗️ Technical Architecture

### Runtime & Performance

**Edge Runtime:** 140+ endpoints optimized for Edge runtime  
**Target Metrics:**

- TTFB: <200ms (actual ~150ms on Edge)
- FCP: <1.8s (actual ~1.2s)
- LCP: <2.5s (actual ~2.0s)
- CLS: <0.1 (actual ~0.05)
- TTI: <3.8s (actual ~2.8s)

### Caching Strategy (4-Layer)

| Layer       | Technology          | TTL      | Purpose             |
| ----------- | ------------------- | -------- | ------------------- |
| L1 - Memory | In-memory Map       | 180-300s | Hot data            |
| L2 - Redis  | Vercel KV / Upstash | Variable | Persistent cache    |
| L3 - ISR    | Next.js             | 60-300s  | Static regeneration |
| L4 - CDN    | Vercel Edge         | Custom   | Global distribution |

### Database Backends

**Supported Storage:**

- ✅ Vercel KV (Primary - Production)
- ✅ Upstash Redis (Alternative - Production)
- 🔧 Memory (Development only)
- 🔧 File System (Local testing)

**Features:**

- Document-based operations with versioning
- TTL support for automatic expiration
- Batch operations (mget, mset)
- Pattern matching for keys
- Statistics and monitoring
- Content-addressable storage (CAS)

### Data Architecture

**Database Schema Patterns:**

| Pattern                   | Example              | Purpose             |
| ------------------------- | -------------------- | ------------------- |
| `feed:{source}`           | `feed:coindesk`      | Cached RSS feeds    |
| `article:{id}`            | `article:abc123`     | Individual articles |
| `user:{userId}:watchlist` | `user:123:watchlist` | User watchlists     |
| `portfolio:{userId}`      | `portfolio:123`      | User portfolios     |
| `alert:{id}`              | `alert:xyz789`       | Price alerts        |
| `apikey:{hash}`           | `apikey:sha256...`   | API key hashing     |

### Real-time Updates

| Method    | Use Case                      | Implementation |
| --------- | ----------------------------- | -------------- |
| WebSocket | Live prices, liquidations     | Binance stream |
| SSE       | News updates, breaking alerts | `/api/sse`     |
| Polling   | Portfolio updates             | Client-side    |

---

## 🔐 Authentication & Security

### API Key System

**Key Format:** `cda_{tier}_{random}`

**Tiers & Limits:**

| Tier       | Daily Limit     | Rate Limit | Price   |
| ---------- | --------------- | ---------- | ------- |
| Free       | 100 requests    | 10/min     | $0/mo   |
| Pro        | 10,000 requests | 100/min    | $29/mo  |
| Enterprise | Unlimited       | 1,000/min  | $299/mo |

**Features:**

- SHA-256 key hashing for security
- Per-key rate limiting
- Usage tracking and analytics
- Automatic expiration support
- Tier upgrades via x402 payments
- API key management endpoints

**Create API Key:**

```bash
curl -X POST https://cryptocurrency.cv/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "tier": "free"}'
```

**Use API Key:**

```bash
curl -H "X-API-Key: cda_free_abc123" \
  https://cryptocurrency.cv/api/news
```

### Security Headers

| Header                    | Value                           |
| ------------------------- | ------------------------------- |
| X-Content-Type-Options    | nosniff                         |
| X-Frame-Options           | SAMEORIGIN                      |
| X-XSS-Protection          | 1; mode=block                   |
| Strict-Transport-Security | max-age=63072000                |
| Referrer-Policy           | strict-origin-when-cross-origin |

### x402 Payment Security

**Protocol:** x402 v2  
**Network:** Base Mainnet (eip155:8453)  
**Token:** USDC (0x833589...)

**Verification Steps:**

1. Parse payment signature from `PAYMENT-SIGNATURE` header
2. Validate signature format and structure
3. Verify payment amount matches endpoint price
4. Check facilitator confirmation
5. Verify wallet signature cryptographically
6. Grant access if all checks pass

**Discovery:** `/.well-known/x402` provides machine-readable pricing

---

## 🧪 Testing & Quality Assurance

### Test Coverage

**Test Suites:**

- **E2E Tests:** 9 Playwright test files covering critical user paths
- **Component Tests:** 8 Storybook stories for key UI components
- **API Tests:** Postman collection with 182 endpoint tests
- **Unit Tests:** Vitest for core utility functions

**E2E Test Coverage:**

| Suite         | File                        | Tests                     |
| ------------- | --------------------------- | ------------------------- |
| API           | `e2e/api.spec.ts`           | API endpoint validation   |
| Home          | `e2e/home.spec.ts`          | Homepage functionality    |
| i18n          | `e2e/i18n.spec.ts`          | Internationalization      |
| Order Book    | `e2e/orderbook.spec.ts`     | Trading order book        |
| TradingView   | `e2e/tradingview.spec.ts`   | Chart integrations        |
| x402          | `e2e/x402.spec.ts`          | Payment protocol          |
| Exports       | `e2e/exports.spec.ts`       | Data export functionality |
| Article Slugs | `e2e/article-slugs.spec.ts` | URL routing               |
| Regulatory    | `e2e/regulatory.spec.ts`    | Regulatory tracking       |

**Run Tests:**

```bash
# E2E tests
npm run test:e2e

# Component tests
npm run storybook

# Unit tests
npm run test
```

