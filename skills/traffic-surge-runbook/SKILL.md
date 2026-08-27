---
name: traffic-surge-runbook
description: Emergency runbook for handling sudden traffic surges (viral events, market crashes, exchange collapses). Provides step-by-step actions to keep the platform stable under 10-100x normal load. Use during or before anticipated high-traffic events.
license: MIT
metadata:
  category: operations
  difficulty: advanced
  author: free-crypto-news
  tags: [runbook, traffic, surge, incident, scaling, emergency, performance]
---

# Traffic Surge Runbook

## When to use this skill

Use when:
- Traffic spikes 5x+ above normal (viral post, market crash, hack)
- Anticipating a major event (ETF decision, halving, exchange listing)
- API response times degrading (p99 > 1s)
- WebSocket connections approaching limit
- Redis/cache memory approaching capacity
- Upstream providers being rate-limited

## Severity Levels

| Level | Trigger | Response Time |
|-------|---------|---------------|
| **S1 Critical** | Site down, all APIs 500 | Immediate |
| **S2 Major** | p99 > 2s, 10%+ error rate | 15 min |
| **S3 Minor** | p99 > 1s, 5%+ error rate | 1 hour |
| **S4 Warning** | Traffic 3x normal, cache hit < 80% | 4 hours |

## Immediate Actions (first 5 minutes)

### 1. Increase Cache TTLs

The single most impactful action. Every cache hit saves an upstream request.

```bash
# Emergency cache TTL overrides (set via environment)
CACHE_TTL_NEWS=300       # 2min → 5min
CACHE_TTL_PRICES=60      # 30s → 60s
CACHE_TTL_AI=600         # 5min → 10min
CACHE_TTL_STATIC=7200    # 1hr → 2hr
```

Or if no env-based override, update the stale-while-revalidate window to serve stale for longer.

### 2. Enable Aggressive Rate Limiting

Temporarily lower rate limits to protect the system:

```
anonymous:    30 req/min  (was 60)
free:        100 req/min  (was 200)
pro:         500 req/min  (was 1,000)
```

### 3. Scale Horizontally

```bash
# Docker: add replicas
docker compose -f docker-compose.scale.yml up -d --scale app=8

# Vercel: scales automatically (but check function limits)
# Railway: increase instance count via dashboard
```

### 4. Disable Non-Essential Endpoints

Temporarily return 503 for expensive endpoints:

```
/api/ai/*          → 503 (AI analysis is expensive)
/api/podcast/*     → 503 (TTS generation)
/api/commentary/*  → 503 (streaming AI)
/api/translate/*   → 503 (Gemini API calls)
/api/vector-search → 503 (embedding computation)
```

Keep running:
```
/api/news          → Essential (core product)
/api/prices        → Essential (most popular)
/api/rss           → Essential (feed readers, low cost)
/api/breaking      → Essential (core product)
/api/health        → Essential (monitoring)
```

### 5. Check Provider Health

```typescript
// Via API: GET /api/health
// Or in code:
import { registry } from '@/lib/providers/registry';
console.log(registry.report());
```

If providers are failing:
- Check if upstream APIs are also experiencing high load
- If CoinGecko is down → system falls back to CoinCap → Binance
- If all market price providers fail → serve stale cache

## Medium-Term Actions (30 min – 2 hours)

### 6. Enable CDN Edge Caching

Add cache headers to responses if not already present:

```typescript
// In API route:
return new Response(json, {
  headers: {
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    'CDN-Cache-Control': 'max-age=120',
    'Vercel-CDN-Cache-Control': 'max-age=120',
  },
});
```

### 7. WebSocket Shedding

If WebSocket connections are maxed:
- Increase heartbeat interval: 30s → 60s
- Reduce broadcast frequency: every 5s → every 15s
- Disconnect idle connections (no subscription, no recent messages)
- Reject new connections with 503 + Retry-After header

### 8. Database Connection Pool

```bash
# If using Neon PostgreSQL:
# Increase connection pool via dashboard
# Enable connection pooler (PgBouncer)

# If Redis is under pressure:
# Increase maxmemory
# Switch eviction to allkeys-lru
# Increase maxclients
```

### 9. RSS Polling Throttle

Reduce RSS polling frequency during surges:
- Tier 1 sources (CoinDesk, Decrypt): keep 1min polling
- Tier 2 sources: reduce to 5min polling
- Tier 3 sources: reduce to 15min polling
- Disabled sources: skip entirely

## Recovery Actions (post-surge)

### 10. Restore Normal Configuration

After traffic returns to normal (< 2x baseline):

1. Restore original cache TTLs
2. Restore original rate limits
3. Re-enable disabled endpoints
4. Restore RSS polling frequency
5. Verify all provider chains are healthy
6. Check for any data gaps during the surge

### 11. Post-Incident Review

Collect:
- Peak request rate (req/s)
- Peak concurrent WebSocket connections
- Max error rate
- Cache hit rate during surge
- Which providers failed
- Which endpoints were slowest
- Total duration of degraded service

Then:
- File an incident report
- Identify permanent fixes
- Update capacity planning targets
- Add monitoring for any blind spots discovered

## Monitoring Dashboards

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Request rate | Vercel Analytics | > 3x normal |
| Error rate | Sentry | > 1% |
| p99 latency | Vercel Speed Insights | > 500ms |
| Cache hit rate | Redis metrics | < 80% |
| WS connections | Custom metric | > 80% capacity |
| RSS polling success | Pino logs | < 90% |
| Provider health | registry.report() | Any "critical" |

## Notes for Agent Use

- This runbook should be run proactively before known events
- The most impactful single action is increasing cache TTLs
- Horizontal scaling is fast with docker-compose.scale.yml
- AI endpoints are the most expensive — disable first
- RSS and news endpoints are cheap — keep running
- Always verify recovery with a health check sweep
