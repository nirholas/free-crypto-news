---
name: scale-to-1m
description: Step-by-step prompts to prepare free-crypto-news for 1M+ concurrent users. Covers database, job queues, WebSocket scaling, CDN caching, observability, load testing, DDoS protection, graceful degradation, API gateway, multi-region deployment, and disaster recovery.
license: MIT
metadata:
  category: infrastructure
  difficulty: advanced
  author: free-crypto-news
  tags: [scaling, infrastructure, redis, database, caching, load-testing, websocket, observability, kubernetes, security]
---

# Scale to 1M+ Users — Prompt Playbook

> **Goal**: Transform free-crypto-news from a single-instance Vercel app into a horizontally-scaled, multi-region platform capable of serving 1M+ concurrent users — surpassing CoinGecko and DeFiLlama.

## Current State (Feb 2026)

- ~82% Edge Runtime routes on Vercel (226/351 API routes)
- Redis (Upstash) for distributed caching + rate limiting
- Nginx load balancer with 2+ app replicas in Docker
- WebSocket server with Redis pub/sub, leader election, 10K connection cap per instance
- SSE with 500 concurrent connection cap + auto-disconnect at 30min
- HTTP connection pool via undici Agent for upstream API calls
- No persistent database — static JSON archive + Redis cache
- Provider framework with circuit breakers, anomaly detection, health monitoring
- Only `market-price` category wired through ProviderChain (3 adapters: CoinGecko, CoinCap, Binance)
- 11 API client libs (CoinMarketCap, CryptoQuant, DeFiLlama, Glassnode, L2Beat, LunarCrush, Messari, NFT Markets, The Graph, CryptoPanic, NewsAPI) NOT wired through ProviderChain

## Prompt Sequence

Execute these prompts in order. Each builds on the previous.

---

### Prompt 1 — PostgreSQL + Drizzle ORM

```
Add a PostgreSQL database to free-crypto-news using Drizzle ORM.

Requirements:
1. Add drizzle-orm, drizzle-kit, @neondatabase/serverless as dependencies
2. Create src/lib/db/schema.ts:
   - articles (id, slug, title, summary, url, source, category, coin_tags text[],
     published_at, fetched_at, embedding vector(1536), language, sentiment_score, impact_score)
   - prices_snapshot (id, coin_id, symbol, price_usd, market_cap, volume_24h, change_24h, timestamp)
   - provider_health (id, provider_name, chain_name, success_rate, avg_latency_ms, circuit_state, recorded_at)
   - api_usage (id, api_key, endpoint, method, status_code, latency_ms, timestamp, ip_hash)
   - users (id, email, api_key, tier, created_at, last_active_at)
   - alerts (id, user_id, type, config jsonb, last_triggered_at, created_at)
3. src/lib/db/index.ts — drizzle client, @neondatabase/serverless HTTP mode for Edge Runtime
4. drizzle.config.ts, db:generate/migrate/push/studio scripts
5. src/lib/db/queries/ — reusable query functions
6. GIN indexes on coin_tags, full-text on title, btree on published_at DESC
7. Migration script: scripts/db/migrate-archive.ts (JSONL → PostgreSQL)
8. File-based fallback if DATABASE_URL not set

Target: <100ms queries for 1M+ articles.
```

---

### Prompt 2 — Background Job Queue with Inngest

```
Add Inngest for reliable background job processing.

Requirements:
1. Install inngest, create src/lib/inngest/client.ts (id: "free-crypto-news")
2. src/app/api/inngest/route.ts serve endpoint
3. Migrate crons: archive (5m), digest (daily), x-sentiment (15m),
   predictions (daily), tag-scores (1h), enrich-articles (10m)
4. New functions:
   - prices/snapshot.capture (30s) — snapshot top 100 prices to DB
   - providers/health.record (1m) — health metrics to DB
   - alerts/check.all (1m) — user alert evaluation
   - cache/warm.predictive (2m) — predictive cache warming
   - analytics/usage.aggregate (1h) — rollup stats
5. 3x retry with backoff, idempotency keys, error reporting
6. Fallback to Vercel cron when Inngest not configured

Target: 10K+ articles/hr, 100K+ price updates/hr.
```

---

### Prompt 3 — WebSocket TypeScript Rewrite + Scaling

```
Refactor ws-server.js to TypeScript with production hardening.

Current state: JavaScript with Redis pub/sub, leader election, 10K cap,
safeSend, maxPayload 64KB, graceful shutdown.

Requirements:
1. Refactor → src/lib/ws/server.ts (TypeScript)
2. Keep all existing: pub/sub, leader election, safeSend, caps, shutdown
3. Add ioredis for cluster support
4. Type-safe channels: "prices:{coinId}", "news:latest", "news:breaking",
   "alerts:{userId}", "market:global", "sentiment:live"
5. Per-client subscription tracking: Map<WebSocket, Set<string>>
6. Per-IP limit (100 conns) + per-instance limit (50K)
7. /ws/stats metrics endpoint
8. 4 replicas in docker-compose.yml

Target: 50K connections/instance, 200K total.
```

---

### Prompt 4 — CDN + Edge Caching Strategy

```
Comprehensive CDN caching with tag-based purging.

Requirements:
1. src/lib/cache/cdn-headers.ts — setCacheHeaders(res, preset):
   REALTIME (s-maxage=5), FAST (30), STANDARD (120), SLOW (3600), STATIC (86400)
2. Surrogate-Key headers for tag-based purging
3. src/lib/cache/purge.ts — purgeByTag/Path/All, support Vercel/Cloudflare/Fastly
4. Apply presets to ALL /api/* handlers:
   /api/prices/* → REALTIME, /api/news/* → FAST, /api/search → STANDARD,
   /api/archive/* → SLOW, /api/openapi.json → STATIC
5. Cache-Status: HIT/MISS/STALE/BYPASS header
6. ?force=1 bypass (admin only)
7. Vary: Accept-Encoding, Accept-Language, Accept

Target: 95% cache hit rate, <10ms edge responses.
```

---

### Prompt 5 — Observability Stack

```
Production observability for 1M+ scale.

Requirements:
1. src/lib/observability/metrics.ts — Prometheus-compatible:
   http_requests_total, http_request_duration_ms (histogram),
   cache_hits/misses, provider_requests, provider_latency,
   ws_connections, db_queries, job_executions
2. GET /api/metrics (METRICS_TOKEN protected)
3. src/lib/observability/tracing.ts — trace ID per request, structured JSON logs
4. src/lib/observability/alerts.ts — rules for p99, error rate, cache hit, circuit breakers, WS capacity → webhook alerts
5. Grafana dashboard JSON at infra/grafana/dashboard.json
6. /admin/dashboard with live metrics

Target: Identify bottlenecks within 60 seconds.
```

---

### Prompt 6 — Load Testing Suite

```
K6 load tests validating 1M user capacity.

Requirements:
1. scripts/load-tests/:
   smoke (10 VU, 1m), load (1K→10K VU, 10m), stress (10K→50K, 15m),
   spike (100→100K→100), soak (5K VU, 1h), websocket (10K conns)
2. Mix: 40% news, 25% prices, 15% market, 10% search, 10% other
3. SLOs: p95 <200ms, p99 <1s, error <0.1%, cache >90%
4. run.sh: start stack → health → smoke → load → stress → report
5. GitHub Action: smoke on PR, full on release

Target: Prove 10K req/sec, <200ms p95.
```

---

### Prompt 7 — DDoS Protection + Load Shedding

```
Survive abuse and overload without crashing.

Requirements:
1. src/lib/security/ip-reputation.ts — score 0-100, auto-block >80
2. src/lib/security/request-fingerprint.ts — detect distributed scraping
3. src/lib/security/adaptive-rate-limit.ts — tighten under load
4. src/lib/load-shedding.ts:
   GREEN → YELLOW (>70%: no AI, 2x cache) → ORANGE (>85%: stale only) → RED (>95%: 503 except news+prices)
5. X-Service-Level header
6. WS: ORANGE stop new, RED disconnect idle
7. Admin dashboards for security + load shedding

Target: Survive 100K req/sec DDoS. Never crash.
```

---

### Prompt 8 — API Gateway + Rate Limit Tiers

```
Production API gateway with paid tiers.

Requirements:
1. Tiers:
   Free (no key): 30/min, 1K/day
   Starter (free key): 300/min, 50K/day
   Pro ($29/mo): 3K/min, unlimited
   Enterprise ($199/mo): 30K/min, SLA
2. src/lib/gateway/api-key.ts — validation, issuance, rotation, tracking
3. src/lib/gateway/quota.ts — daily quotas, X-RateLimit-* headers
4. Update middleware.ts for tier-based limits
5. GET /api/v1/usage, GET /api/admin/keys
6. Backward compatible: free-tier IP limits still work

Target: Self-serve signup in <2 min.
```

---

### Prompt 9 — Multi-Region Deployment

```
Multi-region for <100ms global latency.

Requirements:
1. infra/terraform/ — Neon PG replicas (us-east, eu-west, ap-southeast),
   Upstash Redis Global, Cloudflare DNS
2. src/lib/db/read-replica.ts — route reads to nearest replica
3. X-Region response header
4. docker-compose.multi-region.yml — 3 regional clusters + Traefik
5. docs/MULTI-REGION.md with Mermaid diagram

Target: <100ms global, automatic failover.
```

---

### Prompt 10 — Disaster Recovery

```
Survive any infrastructure failure.

Requirements:
1. scripts/dr/snapshot.ts — nightly Redis + PG to R2/S3
2. scripts/dr/restore.ts — full restore + integrity check
3. docker-compose.dr.yml — warm standby
4. infra/runbook.md — 4 failure scenarios
5. RTO <5 min, RPO <1 hour
6. Monthly DR drill

Target: API stays up when everything goes down.
```

---

## Execution Order

| Phase | Prompts | Timeline | Impact |
|-------|---------|----------|--------|
| Foundation | 1 (Database), 2 (Jobs) | Week 1 | Persistent data, async processing |
| Scale | 3 (WebSocket), 4 (CDN) | Week 2 | 100K concurrent users |
| Observe | 5 (Observability), 6 (Load Test) | Week 3 | Know your limits |
| Protect | 7 (DDoS + Load Shedding) | Week 3 | Survive attacks |
| Monetize | 8 (API Gateway) | Week 4 | Revenue + abuse protection |
| Global | 9 (Multi-Region), 10 (DR) | Week 4 | <100ms worldwide |

## Success Metrics

| Metric | Target |
|--------|--------|
| p95 response time | < 100ms cached, < 500ms uncached |
| p99 response time | < 500ms cached, < 1,000ms uncached |
| CDN cache hit rate | > 95% |
| Error rate | < 0.05% |
| WebSocket connections | 100K+ per region |
| DB query time (p95) | < 50ms |
| TTFB (global) | < 100ms |
| Monthly requests | 1B+ |
| Uptime | 99.99% |
| RTO | < 5 minutes |
| Infra cost at 1M users | < $2,000/mo |
