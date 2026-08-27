# Scaling Prompts — Road to 1M+ Users & Beyond CoinGecko

> Actionable AI prompts to prepare free-crypto-news for massive scale.
> Feed these to your AI coding agent one at a time, in order.
> Each prompt is self-contained and produces a shippable result.

---

## Phase 1: Database & Persistence (Week 1)

### Prompt 1.1 — PostgreSQL + Drizzle ORM

```
Add a PostgreSQL database to free-crypto-news using Drizzle ORM.

Project: /workspaces/free-crypto-news

Current state:
- Articles stored as JSONL files in archive/articles/YYYY-MM.jsonl
- Daily snapshots in archive/YYYY/MM/YYYY-MM-DD.json
- DATABASE_URL and POSTGRES_URL already in .env.example but unused
- No persistent database for articles, users, or usage tracking

Requirements:
1. Add drizzle-orm, drizzle-kit, @neondatabase/serverless as dependencies
2. Create src/lib/db/schema.ts with Drizzle ORM schema:
   - articles table: id, title, slug, pub_date, source, source_key, category,
     link, description, content_hash, tickers text[], sentiment_score,
     sentiment_label, ai_summary, ai_entities text[], impact_score, language,
     embedding vector(1536), created_at, updated_at
   - market_snapshots table: id, coin_id, symbol, price_usd, market_cap,
     volume_24h, change_24h, timestamp
   - provider_health table: id, provider_name, chain_name, success_rate,
     avg_latency_ms, circuit_state, recorded_at
   - api_usage table: id, api_key, endpoint, method, status_code,
     latency_ms, timestamp, ip_hash
   - users table: id, email, api_key, tier, created_at, last_active_at
   - alerts table: id, user_id, type, config jsonb, last_triggered_at, created_at
   - Indexes: articles(pub_date DESC), articles(slug UNIQUE),
     articles(tickers) GIN, articles(title) full-text,
     market_snapshots(coin_id, timestamp DESC),
     api_usage(timestamp DESC, endpoint)
3. Create src/lib/db/client.ts with @neondatabase/serverless + connection pooling
4. Create drizzle.config.ts at project root
5. Add "db:generate", "db:migrate", "db:push", "db:studio" scripts to package.json
6. Create src/lib/db/queries/ with reusable query functions for articles and prices
7. Create migration script: scripts/db/migrate-archive.ts that reads all JSONL
   files and inserts into PostgreSQL
8. Keep file-based fallback if DATABASE_URL is not set

Target: Archive queries <100ms for 1M+ articles with full-text search.
```

### Prompt 1.2 — Migrate from Vercel KV to Dedicated Redis Cluster

```
Migrate from Vercel KV (Upstash REST) to support a dedicated Redis cluster.

Project: /workspaces/free-crypto-news

Current state:
- Vercel KV via @upstash/redis REST API in src/lib/redis.ts, src/lib/database.ts
- In-memory fallback when KV is unavailable
- Rate limiting in middleware.ts uses @upstash/ratelimit

Requirements:
1. Add ioredis as a dependency alongside existing @upstash/redis
2. Create src/lib/redis-cluster.ts that supports:
   - Upstash REST (current, for serverless/edge)
   - ioredis direct connection (for Node runtime routes — lower latency)
   - Redis Cluster mode with automatic failover
   - Connection pooling (max 20 connections)
   - Read replicas for GET-heavy workloads
3. Update src/lib/database.ts to use the new client
4. Add REDIS_CLUSTER_NODES env var support
5. Keep full backward compatibility — if only KV_REST_API_URL is set, use Upstash

Target: <50ms p99 for cache reads at 10K concurrent connections.
```

### Prompt 1.3 — Background Job Queue with Inngest

```
Add Inngest as the background job queue for reliable async processing.

Project: /workspaces/free-crypto-news

Requirements:
1. Install inngest package
2. Create src/lib/inngest/client.ts — Inngest client with id "free-crypto-news"
3. Create src/app/api/inngest/route.ts — the Inngest serve endpoint
4. Migrate existing cron jobs to Inngest functions:
   - cron/archive → "archive/news.archive" (every 5 min)
   - cron/digest → "digest/daily.generate" (daily at 06:00 UTC)
   - cron/x-sentiment → "sentiment/x.analyze" (every 15 min)
   - cron/predictions → "predictions/daily.score" (daily at 00:00 UTC)
   - cron/tag-scores → "tags/scores.update" (every hour)
   - cron/enrich-articles → "articles/enrich.batch" (every 10 min)
5. Add NEW job functions:
   - "prices/snapshot.capture" — snapshot top 100 coin prices to DB every 30s
   - "providers/health.record" — record provider health metrics every minute
   - "alerts/check.all" — check user alerts against latest data every minute
   - "cache/warm.predictive" — predictive cache warming every 2 min
   - "analytics/usage.aggregate" — aggregate API usage stats hourly
6. Each function: 3x retry with backoff, idempotency keys, error reporting
7. Add INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY to .env.example
8. Keep Vercel cron routes as fallback when Inngest is not configured

Target: Process 10K+ articles/hour and 100K+ price updates/hour.
```

---

## Phase 2: API Performance (Week 2)

### Prompt 2.1 — CDN + Edge Caching with Surrogate Keys

```
Implement CDN-level cache invalidation so we can cache aggressively and purge
selectively when new data arrives.

Project: /workspaces/free-crypto-news

Current state:
- middleware.ts sets default Cache-Control: public, s-maxage=60, stale-while-revalidate=300
- nginx.conf has proxy_cache with 30s TTL
- No tag-based purging

Requirements:
1. Create src/lib/cache/cdn-headers.ts with setCacheHeaders(res, preset):
   - REALTIME (prices, orderbook): s-maxage=5, max-age=0, swr=10
   - FAST (news, trending): s-maxage=30, max-age=15, swr=60
   - STANDARD (search, articles): s-maxage=120, max-age=60, swr=300
   - SLOW (archive, historical): s-maxage=3600, max-age=1800, swr=86400
   - STATIC (docs, openapi): s-maxage=86400, immutable
2. Add Surrogate-Key headers to all API responses:
   - news: "news news:{category} news:source:{source}"
   - prices: "prices prices:{coinId}"
   - archive: "archive archive:{month}"
3. Create src/lib/cache/purge.ts:
   - purgeByTag(tag) — calls Vercel revalidation / Cloudflare purge API
   - purgeByPath(path) — purge specific URL
   - Support CACHE_PURGE_PROVIDER env (vercel, cloudflare, fastly)
4. Apply presets to ALL /api/* route handlers
5. Add Cache-Status header: HIT/MISS/STALE/BYPASS
6. Add ?force=1 bypass (admin only)

Target: 95% cache hit ratio, <10ms for cached responses at edge.
```

### Prompt 2.2 — Response Streaming for Large Datasets

```
Large API responses should stream as NDJSON instead of buffering in memory.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/streaming.ts:
   - streamNdjson(items: AsyncIterable<T>) → ReadableStream
   - streamCsv(items: AsyncIterable<T>, columns) → ReadableStream
   - Backpressure handling — pause source when client is slow
2. Update /api/archive to support Accept: application/x-ndjson
3. Update /api/export to stream results
4. Support ?stream=true query parameter
5. Transfer-Encoding: chunked headers

Target: Serve 100K+ article archives without OOM, <200MB server memory.
```

### Prompt 2.3 — GraphQL Subscriptions

```
Add GraphQL subscriptions for real-time data via WebSocket.

Project: /workspaces/free-crypto-news

Current: ws-server.js handles WebSocket with Redis pub/sub and leader election.

Requirements:
1. Add graphql-ws dependency
2. Create src/lib/graphql/subscriptions.ts:
   - priceUpdate(coins: [String!]!) — fires every 30s
   - newArticle(categories: [String], sources: [String]) — fires on new article
   - marketAlert(type: AlertType) — fires on significant moves
3. Wire into ws-server.js alongside existing WS functionality
4. Reuse Redis pub/sub infrastructure
5. Max 100 subscriptions per client, heartbeat every 30s

Target: 50K+ concurrent subscriptions across 4 WS replicas.
```

---

## Phase 3: Horizontal Scaling (Week 3)

### Prompt 3.1 — Kubernetes Deployment Manifests

```
Create production Kubernetes manifests for 1M+ deployment.

Project: /workspaces/free-crypto-news

Requirements:
1. Create k8s/ directory with:
   - namespace.yaml
   - app-deployment.yaml: Next.js, 4-20 replicas, HPA at 70% CPU
   - ws-deployment.yaml: WebSocket, 2-8 replicas, HPA at 60% CPU
   - worker-deployment.yaml: Inngest/BullMQ workers, 2-4 replicas
   - redis-statefulset.yaml: Redis with sentinel (3 nodes)
   - postgres-statefulset.yaml: PostgreSQL with read replica
   - ingress.yaml: Nginx ingress with rate limiting
   - hpa.yaml: Horizontal pod autoscalers
   - pdb.yaml: Pod disruption budgets
   - configmap.yaml, secrets.yaml (template)
   - service-monitor.yaml: Prometheus scrape targets
2. Resource limits: app=512Mi/500m, WS=256Mi/250m, worker=1Gi/1000m
3. Liveness + readiness probes on /api/health
4. Rolling updates: maxSurge=1, maxUnavailable=0
5. Spread across availability zones

Target: Auto-scale 4→40 pods, handle 10K req/sec sustained.
```

### Prompt 3.2 — S3/R2 Object Storage for Archive

```
Move archival content to object storage for cost efficiency.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/object-storage.ts:
   - Cloudflare R2 (primary — no egress fees)
   - AWS S3 (fallback)
   - Local filesystem (development)
2. Migrate: archive/ (JSONL, snapshots), public/fallback/, generated exports
3. CloudFront/R2 CDN URLs for public reads
4. Create scripts/sync-archive-to-r2.ts
5. Pre-signed URLs for large file downloads
6. LRU filesystem cache for hot files

Target: Archive storage <$5/mo for 10GB+ of data.
```

---

## Phase 4: Observability & Reliability (Week 4)

### Prompt 4.1 — OpenTelemetry Distributed Tracing

```
Add distributed tracing across the full request lifecycle.

Project: /workspaces/free-crypto-news

Current state:
- src/lib/telemetry.ts exists but has missing @opentelemetry/* dependencies (TS2307 errors)
- X-Response-Time header in middleware.ts

Requirements:
1. Install @opentelemetry/sdk-node, @opentelemetry/exporter-trace-otlp-http,
   @opentelemetry/sdk-metrics, @opentelemetry/exporter-metrics-otlp-http
2. Fix src/lib/telemetry.ts TS errors
3. Create src/lib/tracing.ts:
   - Service name: "free-crypto-news"
   - Auto-instrument fetch(), Redis, PostgreSQL
   - Custom spans: middleware, rate-limit, upstream-api, cache-lookup, ai-enrichment
4. Propagate trace context through src/lib/http-pool.ts (pooledFetch)
5. Export to Grafana Tempo / Jaeger via OTLP
6. X-Trace-ID response header
7. /api/admin/traces endpoint

Target: Full request waterfall, <1% overhead.
```

### Prompt 4.2 — Prometheus Metrics + Grafana Dashboard

```
Add Prometheus-compatible metrics for all API endpoints.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/metrics.ts with prom-client:
   - http_request_duration_seconds (histogram: method, route, status)
   - http_requests_total (counter: method, route, status)
   - upstream_api_duration_seconds (histogram: service, status)
   - cache_hit_total / cache_miss_total (counters: cache_name)
   - circuit_breaker_state (gauge: service, state)
   - active_websocket_connections (gauge)
   - rate_limit_exceeded_total (counter: tier)
   - articles_processed_total (counter: source)
   - queue_depth (gauge: queue_name)
2. GET /api/metrics (protected by ADMIN_TOKEN)
3. Middleware auto-records request metrics
4. Grafana dashboard JSON in monitoring/grafana/

Target: Identify any endpoint >200ms p99 within 1 minute.
```

### Prompt 4.3 — K6 Load Testing Suite

```
Validate scaling targets with comprehensive load tests.

Project: /workspaces/free-crypto-news

Requirements:
1. Create loadtest/ directory:
   - smoke.js: 10 VUs, 30s
   - average.js: 100 VUs, 5min
   - stress.js: 500 → 2000 VUs, 10min
   - spike.js: 10 → 2000 → 10 VUs
   - soak.js: 200 VUs, 1hr (memory leak detection)
   - websocket.js: 5000 concurrent WS connections
2. Realistic endpoint mix: 40% /api/news, 25% /api/prices, 15% /api/market, 10% /api/search, 10% other
3. Thresholds: p95 <200ms cached, p99 <1s, error <0.1%
4. CI: smoke on PR, full suite nightly
5. HTML report + Grafana annotations

Target: Prove 10K req/sec with <200ms p95.
```

---

## Phase 5: Data Moat — What Makes Us Better (Weeks 5-8)

### Prompt 5.1 — Proprietary "Crypto Pulse" Index

```
Build a composite index that no competitor has — our "Fear & Greed on steroids."

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/crypto-pulse/index.ts with sub-signals:
   - News Velocity: articles/hour by category, weighted by source tier
   - Sentiment Momentum: rolling 4h AI sentiment change
   - Social Buzz: Discord/Telegram/Reddit mention velocity
   - On-Chain Heat: funding rates + exchange inflows
   - Whale Activity: large tx count from whale-alert
   - Options Skew: put/call ratio from Deribit
   - DEX Volume Surge: unusual DEX spikes from DEXScreener/GeckoTerminal
   - Stablecoin Flow: net stablecoin inflow to exchanges
2. Score: 0-100, updated every 5 minutes, per-coin (BTC, ETH, SOL)
3. Historical storage in PostgreSQL @ 5-min granularity
4. GET /api/pulse?coin=bitcoin&period=24h
5. Embeddable widget: /widget/pulse
6. Pulse vs price chart overlay

CoinGecko/DeFiLlama have data — we have INTELLIGENCE.
```

### Prompt 5.2 — AI Market Narratives

```
Auto-generate market briefings every hour — Bloomberg Terminal for crypto.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/narratives/generator.ts:
   - Collect: top articles (by impact), price movers (>2%), on-chain signals
   - Feed to Groq/OpenRouter with structured prompt
   - Output: 1-paragraph summary, themes[], tickers[], outlook, confidence
2. Redis key: narrative:{YYYY-MM-DD}:{HH}
3. GET /api/narrative?period=1h|4h|24h
4. Cron every hour + archive to PostgreSQL
5. RSS feed at /api/feed/narratives
6. Include in /api/news as optional field

Target: The only API that tells you "what happened and why."
```

### Prompt 5.3 — Cross-Chain DeFi Aggregation

```
Surpass DeFiLlama by combining more sources with AI analysis.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/defi-aggregator/index.ts:
   - TVL (DeFiLlama + The Graph + Token Terminal)
   - Yields: top pools across chains (DeFiLlama Yields + subgraphs)
   - DEX volumes (GeckoTerminal + DeFiLlama)
   - Bridge volumes (DeFiLlama Bridges)
   - Protocol revenue (Token Terminal + DeFiLlama Fees)
   - Stablecoins (DeFiLlama Stablecoins)
2. Endpoints: /api/defi/tvl, /api/defi/yields, /api/defi/dex,
   /api/defi/bridges, /api/defi/stablecoins, /api/defi/revenue
3. Cache: 5min TVL, 1min DEX, 1h revenue
4. AI summary of notable DeFi movements

Target: Single API for ALL DeFi data across every chain.
```

---

## Phase 6: Protection & Resilience (Week 5)

### Prompt 6.1 — DDoS Protection & Abuse Prevention

```
Harden the API against DDoS, bot abuse, and malicious actors.

Project: /workspaces/free-crypto-news

Current: Rate limiting (60/hr public, 300/hr API), basic bot detection,
WS cap (10K), SSE cap (500).

Requirements:
1. Create src/lib/security/ip-reputation.ts:
   - Score IPs 0 (trusted) → 100 (block)
   - Factors: request rate, error rate, known proxy/VPN, geo
   - Redis storage with 24h TTL, auto-block >80 for 1h
   - Allowlist for partners
2. Create src/lib/security/request-fingerprint.ts:
   - TLS + headers + timing fingerprint
   - Detect distributed scraping (same fingerprint, multiple IPs)
   - Rate limit per fingerprint
3. Cloudflare Turnstile CAPTCHA for suspicious traffic on POST endpoints
4. Create src/lib/security/adaptive-rate-limit.ts:
   - Normal: 60/hr → High load: 30/hr → Attack: 10/hr
5. /api/admin/security dashboard

Target: Survive 100K req/sec DDoS without degrading legitimate users.
```

### Prompt 6.2 — Graceful Degradation & Load Shedding

```
Gracefully degrade under extreme load — never crash.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/load-shedding.ts:
   - Monitor: active requests, memory, event loop lag, p99 latency
   - GREEN: full features
   - YELLOW (>70%): disable AI enrichment, 2x cache TTLs
   - ORANGE (>85%): disable non-essential endpoints, serve stale cache
   - RED (>95%): 503 for non-critical, serve only /api/news + /api/prices from cache
2. X-Service-Level header on all responses
3. /api/admin/load-shedding — GET status, POST manual override
4. Integrate into middleware.ts
5. WS server: ORANGE stop new conns, RED disconnect idle
6. Workers: ORANGE 50% concurrency, RED pause queues

Target: System never crashes — degrades gracefully under any load.
```

### Prompt 6.3 — Disaster Recovery

```
Survive complete infrastructure failure with <5 min recovery.

Project: /workspaces/free-crypto-news

Requirements:
1. scripts/dr/snapshot.ts — nightly export Redis + PostgreSQL to R2/S3
2. scripts/dr/restore.ts — restore from snapshot
3. docker-compose.dr.yml — warm standby (Redis replica + PG streaming replication)
4. infra/runbook.md — step-by-step recovery for 4 failure scenarios
5. RTO <5 min, RPO <1 hour
6. Monthly disaster recovery drill automation

Target: API stays up even when everything else goes down.
```

---

## Phase 7: Search & Webhooks (Week 6)

### Prompt 7.1 — Full-Text Search with Meilisearch

```
Add fast, typo-tolerant search across 1M+ articles.

Project: /workspaces/free-crypto-news

Requirements:
1. Add meilisearch-js dependency
2. Create src/lib/search/meilisearch.ts:
   - Index: articles (title, summary, source, category, tickers, pub_date)
   - Index: coins (name, symbol, description)
   - Filterable: source, category, tickers, pub_date
   - Sortable: pub_date, impact_score, sentiment_score
3. scripts/search/reindex.ts — full reindex from PostgreSQL
4. Real-time: new articles indexed within 5s
5. GET /api/search?q=ethereum+merge&category=defi
6. GET /api/search/suggest?q=eth (autocomplete)
7. Add meilisearch to docker-compose.yml
8. Fallback to basic search if unavailable

Target: <50ms search for 1M+ articles with typo tolerance.
```

### Prompt 7.2 — Reliable Webhook Delivery

```
Webhook system for real-time event notifications at scale.

Project: /workspaces/free-crypto-news

Requirements:
1. Create src/lib/webhooks/delivery.ts:
   - Exponential backoff: 1s, 5s, 30s, 5m, 30m (5 attempts)
   - HMAC-SHA256 signature header
   - Circuit breaker per endpoint
2. Events: news.published, price.alert, whale.detected, market.crash,
   market.pump, narrative.generated
3. PostgreSQL storage for registrations + delivery log
4. Job queue for async delivery
5. POST/GET/DELETE /api/webhooks, GET /:id/deliveries, POST /:id/test
6. Max 100 webhooks per key, 10K deliveries/day

Target: 99.9% delivery, <5s latency, 100K registered webhooks.
```

---

## Phase 8: Enterprise & Monetization (Weeks 7-8)

### Prompt 8.1 — API Key Tiers + Usage Metering

```
Implement paid API tiers with Stripe billing.

Project: /workspaces/free-crypto-news

Current: API keys in src/lib/api-keys.ts, Stripe price IDs in .env.example,
x402 micropayments for premium routes.

Requirements:
1. Tiers:
   - Free (no key): 60 req/hr, 3 results, no streaming
   - Starter (free key): 300 req/hr, 25 results ($0)
   - Developer: 3,000 req/hr, full results, WebSocket, batch ($19/mo)
   - Pro: 30,000 req/hr, everything + priority support ($99/mo)
   - Enterprise: 300,000 req/hr, dedicated instance, SLA ($499/mo)
2. Per-key usage in PostgreSQL: requests, bandwidth, compute_units
3. Stripe metered billing — daily usage reports
4. /dashboard/usage (authenticated)
5. Overage alerts at 80%, 100%, 120%
6. Key rotation (old key valid 24h)
7. Update middleware.ts for tier-based limits

Target: Self-serve signup in <2 min. $50K MRR at scale.
```

### Prompt 8.2 — Multi-Region Deployment

```
Global deployment for <50ms latency worldwide.

Project: /workspaces/free-crypto-news

Requirements:
1. terraform/: US-East, EU-West, Asia-Pacific
   - Neon PostgreSQL read replicas per region
   - Upstash Redis Global (multi-region)
   - Cloudflare CDN with anycast
   - GeoDNS routing
2. src/lib/geo-routing.ts — detect region, route to nearest replica
3. X-Region response header
4. docs/MULTI-REGION.md with Mermaid diagram

Target: <50ms p95 cached, <200ms uncached, globally.
```

### Prompt 8.3 — Canary Deployments

```
Zero-downtime releases with automatic rollback.

Project: /workspaces/free-crypto-news

Requirements:
1. .github/workflows/canary-deploy.yml:
   - Deploy canary (10%) → smoke test → monitor 10 min → rollout 25→50→100%
   - Auto-rollback if error rate spikes
2. scripts/canary/health-check.ts — hit critical endpoints, compare to baseline
3. k8s/canary/ manifests
4. Slack/Discord notifications per deployment stage
5. `npm run deploy:rollback`

Target: 10+ deploys/day, zero downtime, auto-rollback in 60s.
```

---

## Phase 9: Developer Experience (Week 9)

### Prompt 9.1 — Developer Portal & Playground

```
Build a developer portal that makes onboarding instant.

Project: /workspaces/free-crypto-news

Requirements:
1. /developers — interactive API playground
   - Try any endpoint with live data, no signup
   - Auto-generated code snippets: curl, Python, TypeScript, Go, PHP
2. /developers/quickstart — "First data in 30 seconds" tutorial
3. /developers/sdks — installation guides for all SDKs
4. /developers/changelog — auto-generated from CHANGELOG.md
5. /developers/status — real-time API health, 90-day uptime

Target: Landing page → working code in <2 minutes.
```

### Prompt 9.2 — Community & Ecosystem

```
Build the community that wins developers from CoinGecko.

Project: /workspaces/free-crypto-news

Requirements:
1. /api/v1/community/showcase — apps built with our API
2. /api/v1/feedback — feature requests with upvoting
3. Discord bot: !price btc, !news defi, !pulse sol + daily narratives
4. Telegram bot: same + inline mode @cryptonewsbot btc
5. Partnership program: higher limits for partners who link back

Target: 10K+ developers, 50+ community apps.
```

---

## Phase 10: Cost Optimization (Week 10)

### Prompt 10.1 — Infrastructure Cost Management

```
Scale to 1M users while keeping infra under $2K/month.

Project: /workspaces/free-crypto-news

Requirements:
1. docs/COST-MODEL.md — costs at 10K, 100K, 500K, 1M users
2. src/lib/cost-tracker.ts:
   - Per-request cost tracking (compute, cache, AI)
   - Identify expensive endpoints
   - Waste detection (cacheable data not cached)
3. /api/admin/costs dashboard
4. Optimization: deferred AI enrichment, tiered storage (hot → warm → cold),
   aggressive dedup
5. Alerts: "cache miss >20%", "AI >$X/day", "Redis memory >80%"

Target: <$0.001 per request. Infra <$2K/mo at 1M users.
```

---

## Execution Summary

| Phase | Focus | Week | Outcome |
|-------|-------|------|---------|
| 1 | Database & Persistence | 1 | PostgreSQL + Redis Cluster + Job Queue |
| 2 | API Performance | 2 | CDN caching, streaming, GraphQL subs |
| 3 | Horizontal Scaling | 3 | Kubernetes + object storage |
| 4 | Observability | 4 | Tracing + metrics + load testing |
| 5 | Data Moat | 5-8 | Crypto Pulse, AI narratives, DeFi aggregation |
| 6 | Protection | 5 | DDoS, load shedding, disaster recovery |
| 7 | Search & Webhooks | 6 | Meilisearch + reliable webhook delivery |
| 8 | Enterprise | 7-8 | API tiers, multi-region, canary deploys |
| 9 | Developer Experience | 9 | Portal, playground, community |
| 10 | Cost Optimization | 10 | <$2K/mo at 1M users |

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| API response time (p95) | ~300ms | < 100ms |
| API response time (p99) | ~1.5s | < 500ms |
| CDN cache hit rate | ~60% | > 95% |
| Error rate | ~1% | < 0.05% |
| WebSocket connections | 1K | 100K+ per region |
| DB query time (p95) | N/A (no DB) | < 50ms |
| TTFB (global) | ~400ms | < 50ms |
| Monthly requests | ~100K | 1B+ |
| Uptime | ~99% | 99.99% |
| Data sources | 7 adapters | 70+ adapters |
| Developer signups | ~0 | 10K+ |
| MRR | $0 | $50K+ |
