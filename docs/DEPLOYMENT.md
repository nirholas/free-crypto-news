# Deployment

Free Crypto News supports multiple deployment targets: **Vercel** (recommended), **Docker / self-hosted**, **Railway**, and **manual builds**.

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js 18+**
- **pnpm** — `npm install -g pnpm` (package manager)
- **Bun** — `curl -fsSL https://bun.sh/install | bash` (script runner)

---

## Vercel (recommended)

One-click deploy — no configuration required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nirholas/cryptocurrency.cv)

### Cron jobs

`vercel.json` configures automatic cron jobs:

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/cron/archive-kv` | Every hour | Syncs latest articles to KV cache |
| `/api/cron/x-sentiment` | Daily at midnight | Refreshes X/Twitter sentiment data |

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KV_REST_API_URL` | Optional | Upstash Redis URL for distributed caching |
| `KV_REST_API_TOKEN` | Optional | Upstash Redis token |
| `UPSTASH_REDIS_REST_URL` | Optional | Alternative Redis URL (Upstash direct) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Alternative Redis token |
| `DATABASE_URL` | Optional | Neon Postgres connection string (for Drizzle ORM) |
| `OPENAI_API_KEY` | Optional | Enables AI summaries and RAG chat (OpenAI) |
| `ANTHROPIC_API_KEY` | Optional | Alternative LLM for AI features (Claude) |
| `GROQ_API_KEY` | Optional | Fast, free AI provider (recommended for getting started) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | Google Gemini AI provider |
| `INNGEST_EVENT_KEY` | Optional | Inngest background job orchestration |
| `INNGEST_SIGNING_KEY` | Optional | Inngest event signing |
| `VAPID_PUBLIC_KEY` | Optional | Web push notification public key |
| `VAPID_PRIVATE_KEY` | Optional | Web push notification private key |
| `SENTRY_DSN` | Optional | Sentry error monitoring |

> **Tip:** Without Redis the app falls back to in-memory caching — fully functional but not shared across serverless instances. Without a database, features like API keys, predictions, and watchlists are disabled but all read-only API endpoints work.

### Vercel-specific settings

The `vercel.json` file configures:
- Cron schedules for data sync
- Header overrides (CORS, caching)
- Redirects and rewrites

---

## Docker

### Quick start

```bash
docker compose up -d
```

This starts the Next.js app on port `3000` and an optional Redis container on `6379`.

### Manual build

```bash
docker build -t free-crypto-news .
docker run -p 3000:3000 free-crypto-news
```

### docker-compose.yml overview

```yaml
services:
  app:           # Next.js app — port 3000
  redis:         # Optional Redis cache — port 6379
```

Pass environment variables via `.env` or the `environment:` block in `docker-compose.yml`.

### Production Docker configuration

For production deployments, consider using the scaled configuration:

```bash
# Production with Nginx reverse proxy and multiple app instances
docker compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

The `docker-compose.scale.yml` adds:
- **Nginx reverse proxy** — load balancing, SSL termination, static file serving
- **Multiple app replicas** — horizontal scaling
- **Health checks** — automatic container restart on failure

### Observability stack

For monitoring and tracing:

```bash
# Add observability services (Jaeger, Prometheus, Grafana)
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

### Health check

The container exposes a health endpoint at `/api/health`. Docker Compose polls it every 30 s with a 40 s start grace period.

```bash
# Check health manually
curl http://localhost:3000/api/health
```

### Nginx configuration

The `nginx.conf` file provides a production-ready reverse proxy configuration:
- Gzip compression
- Static file caching
- WebSocket proxy support
- Rate limiting at the proxy level
- SSL-ready configuration

---

## Railway

`railway.json` is pre-configured for Railway deployments using Nixpacks:

```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "node ws-server.js",
    "healthcheckPath": "/health"
  }
}
```

1. Connect your GitHub repo in the Railway dashboard
2. Railway will auto-detect `railway.json` and build with Nixpacks
3. Add environment variables in the Railway service settings
4. Domain is provisioned automatically

> **Note:** Railway is ideal for WebSocket support, which Vercel does not natively provide. The WebSocket server (`ws-server.js`) runs as the primary process on Railway.

---

## WebSocket server

The real-time feed (`ws-server.js`) runs as a separate process alongside the Next.js app. On Railway it is the primary start command. On Vercel, Server-Sent Events (SSE) routes replace WebSockets.

```bash
# Start WebSocket server manually
node ws-server.js
```

The server supports:
- Topic-based rooms (bitcoin, ethereum, defi, etc.)
- Auto-reconnection
- Heartbeat/ping-pong for connection health
- Configurable via `server.json`

---

## Building locally

```bash
# Install dependencies
pnpm install

# Build for production
bun run build

# Start production server
bun run start          # production server on port 3000
```

### Environment file

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings. See the [Environment variables](#environment-variables) table above.

---

## Database setup (optional)

If you want user features (API keys, watchlists, predictions):

```bash
# Set DATABASE_URL in .env.local
# Then run migrations:
bun run db:migrate

# Or push schema directly (development):
bun run db:push
```

---

## Production hardening checklist

Before going to production, verify:

- [ ] **HTTPS enabled** — TLS certificate configured (automatic on Vercel/Railway)
- [ ] **Environment variables secured** — No secrets in code or logs
- [ ] **Redis configured** — Distributed caching for multi-instance deployments
- [ ] **Rate limiting active** — Verify rate limit headers in responses
- [ ] **Health checks passing** — `/api/health` returns 200
- [ ] **Error monitoring** — Sentry DSN configured (optional but recommended)
- [ ] **Logging level** — Set appropriate log level for production
- [ ] **CORS origins** — Restrict to known frontend domains if needed
- [ ] **Cron jobs scheduled** — Archive sync and sentiment refresh running

---

## Monitoring

### Key endpoints to monitor

| Endpoint | Expected | Frequency |
|----------|----------|-----------|
| `/api/health` | 200 OK | Every 30s |
| `/api/news?limit=1` | 200 + articles | Every 5 min |
| `/api/prices` | 200 + price data | Every 1 min |

### Recommended tools

- **Uptime monitoring**: UptimeRobot, Pingdom, or Better Stack
- **Error tracking**: Sentry (configure `SENTRY_DSN`)
- **Tracing**: OpenTelemetry → Jaeger / Grafana Tempo
- **Metrics**: Prometheus + Grafana (via observability docker-compose)

---

## Related docs

- [Architecture](ARCHITECTURE.md) — system design and data flow
- [Scaling](SCALING.md) — caching, edge runtime, load handling
- [Security](SECURITY.md) — security policy, headers, and rate limiting
- [Real-Time](REALTIME.md) — SSE, WebSocket, and push notifications
- [Database](DATABASE.md) — storage backends and Drizzle ORM
