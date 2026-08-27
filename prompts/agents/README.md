# Crypto Vision — Agent Prompts Index

> 50 agent prompts organized into 10 sections for building the complete Crypto Vision platform at cryptocurrency.cv

## How to Use

1. Open a new chat with Claude Opus 4.6
2. Paste the **entire section file** or an **individual agent prompt** into the chat
3. Add the preamble below before the prompt
4. Each agent works on the `nirholas/xeepy` repo (branch `master`)
5. Agents can run **in parallel** within a section — no file conflicts

### Preamble (paste before each agent prompt)

```
You are building Crypto Vision — the most comprehensive cryptocurrency API, competing with CoinGecko and DeFiLlama. 

Repo: nirholas/xeepy (branch: master)  
Domain: cryptocurrency.cv  
Stack: TypeScript, Next.js 14+ App Router, Drizzle ORM, PostgreSQL + TimescaleDB, Redis, Bun runtime, pnpm package manager  
Cloud: GCP ($100k credits, 6 months)  
AI: Google Gemini 2.5 Pro  

Rules:
- Use `bun` for scripts, `pnpm` for packages
- Git identity: nirholas / 22895867+nirholas@users.noreply.github.com
- Commit and push all changes
- Do NOT create GitHub Actions workflows
- Stay within your assigned files — do not touch other agents' files

Your task:
```

---

## Section Map

| Section | File | Agents | Focus |
|---------|------|--------|-------|
| 1 | [section-01-infrastructure-devops.md](section-01-infrastructure-devops.md) | 1–5 | Terraform, CI/CD, Docker, K8s, Observability |
| 2 | [section-02-database-pipeline.md](section-02-database-pipeline.md) | 6–10 | DB schema, Price pipeline, News pipeline, Redis, WebSocket |
| 3 | [section-03-auth-billing-keys.md](section-03-auth-billing-keys.md) | 11–15 | Auth, Stripe, API keys, Dashboard, Admin |
| 4 | [section-04-market-data-apis.md](section-04-market-data-apis.md) | 16–20 | Coins, Exchanges, Global, Historical, Orderbook |
| 5 | [section-05-defi-onchain.md](section-05-defi-onchain.md) | 21–25 | DeFi, On-chain, Derivatives, NFT, Bitcoin/Solana/Sui/Aptos |
| 6 | [section-06-news-social-sentiment.md](section-06-news-social-sentiment.md) | 26–30 | News, Sentiment, Social, Stablecoins/Macro, Alerts |
| 7 | [section-07-sdks-integrations.md](section-07-sdks-integrations.md) | 31–37 | Python/TS/Go SDKs, React, MCP, ChatGPT, Widgets |
| 8 | [section-08-frontend-website.md](section-08-frontend-website.md) | 38–42 | Marketing site, Docs site, Coin pages, GraphQL, SDK stubs |
| 9 | [section-09-testing-docs-quality.md](section-09-testing-docs-quality.md) | 43–47 | Tests, MkDocs, Data quality, Community files, Dev tools |
| 10 | [section-10-advanced-features.md](section-10-advanced-features.md) | 48–50 | Portfolio, AI/ML, Export/Bulk/Compliance |

---

## Agent Summary (All 50)

| # | Agent | Directory | Dependencies |
|---|-------|-----------|--------------|
| 1 | GCP Terraform Foundation | `infra/terraform/` | None |
| 2 | CI/CD GitHub Actions | `.github/` | None |
| 3 | Docker & Containers | `docker/`, `docker-compose*.yml` | None |
| 4 | Kubernetes Helm Charts | `infra/helm/` | None |
| 5 | Observability & Monitoring | `infra/monitoring/`, `src/lib/observability/` | None |
| 6 | Database Schema & Migrations | `src/db/`, `drizzle/` | None |
| 7 | Price Data Pipeline Workers | `src/workers/` (prices, shared) | Agent 6 (schema) |
| 8 | News & Alternative Data Pipeline | `src/workers/` (news, social, alt) | Agent 6, 7 (shared) |
| 9 | Cache Layer & Redis | `src/lib/cache/` | None |
| 10 | WebSocket Streaming Server | `src/ws/` | Agent 6, 9 |
| 11 | User Authentication | `src/auth/`, `src/app/api/auth/` | Agent 6 |
| 12 | Stripe Billing | `src/billing/`, `src/app/api/billing/` | Agent 6, 11 |
| 13 | API Key Management | `src/api-keys/`, `src/app/api/keys/` | Agent 6, 9 |
| 14 | Usage Dashboard | `src/app/dashboard/`, `src/components/dashboard/` | Agent 11, 13 |
| 15 | Admin Panel | `src/app/admin/`, `src/components/admin/` | Agent 11 |
| 16 | Coin & Token API | `src/app/api/v1/coins/`, `src/lib/services/coins.ts` | Agent 6, 9 |
| 17 | Exchange & Ticker API | `src/app/api/v1/exchanges/`, `src/lib/services/exchanges.ts` | Agent 6, 9 |
| 18 | Global Market & Trending | `src/app/api/v1/global/`, `simple/`, `search/`, `fear-greed/` | Agent 6, 9 |
| 19 | OHLCV & Historical | `src/app/api/v1/historical/`, `compare/` | Agent 6 |
| 20 | Orderbook & Trading | `src/app/api/v1/orderbook/`, `trades/`, `liquidity/`, `spreads/` | Agent 6, 9 |
| 21 | DeFi Protocol & TVL | `src/app/api/v1/defi/` | Agent 6, 9 |
| 22 | On-Chain Analytics | `src/app/api/v1/onchain/` | Agent 6, 9 |
| 23 | Derivatives & Futures | `src/app/api/v1/derivatives/` | Agent 6, 9 |
| 24 | NFT & Gaming | `src/app/api/v1/nft/`, `gaming/` | Agent 6, 9 |
| 25 | Blockchain-Specific APIs | `src/app/api/v1/bitcoin/`, `solana/`, `sui/`, `aptos/` | Agent 6, 9 |
| 26 | News Aggregation API | `src/app/api/v1/news/`, `src/lib/services/news.ts` | Agent 6, 9 |
| 27 | Sentiment & Intelligence | `src/app/api/v1/sentiment/`, `predictions/` | Agent 6, 9 |
| 28 | Social Media Analytics | `src/app/api/v1/social/` | Agent 6, 9 |
| 29 | Stablecoin & Macro | `src/app/api/v1/stablecoins/`, `macro/` | Agent 6, 9 |
| 30 | Alerts & Notifications | `src/app/api/v1/alerts/`, `src/lib/alerts/` | Agent 6, 9, 10 |
| 31 | Python SDK | `sdk/python/` | None (uses API only) |
| 32 | TypeScript SDK | `sdk/typescript/` | None |
| 33 | Go SDK | `sdk/go/` | None |
| 34 | React Hooks Library | `sdk/react/` | None |
| 35 | MCP Server (Claude) | `mcp/` | None |
| 36 | ChatGPT Plugin & OpenAPI | `chatgpt/`, `openapi/`, `.well-known/` | None |
| 37 | Embeddable Widgets | `widget/` | None |
| 38 | Marketing Website | `website/` (core) | None |
| 39 | API Documentation Site | `docs-site/` | None |
| 40 | Public Coin Pages | `website/` (coins, exchanges, etc) | Agent 38 |
| 41 | GraphQL API Layer | `src/graphql/`, `src/app/api/graphql/` | Agent 6, 9 |
| 42 | Remaining SDK Stubs | `sdk/php,ruby,rust,swift,java,kotlin,csharp,r/` | None |
| 43 | Comprehensive Test Suite | `src/__tests__/`, `vitest.config.ts` | Agent 6+ |
| 44 | API Documentation (MkDocs) | `docs/`, `mkdocs.yml` | None |
| 45 | Data Quality & Validation | `src/lib/quality/`, `src/workers/quality/` | Agent 6, 9 |
| 46 | Community & OSS Files | `README.md`, `CONTRIBUTING.md`, `.github/` | None |
| 47 | Postman, CLI & Dev Tools | `postman/`, `cli/`, `tools/` | None |
| 48 | Portfolio Tracking | `src/app/api/v1/portfolio/`, `src/db/schema/portfolio.ts` | Agent 6, 11 |
| 49 | AI/ML Analysis | `src/app/api/v1/ai/`, `src/lib/ai/` | Agent 6, 9 |
| 50 | Export, Bulk & Compliance | `src/app/api/v1/export/`, `bulk/`, `compliance/` | Agent 6, 9 |

---

## Recommended Execution Order

### Wave 1 — Foundation (no dependencies, run all in parallel)
Agents: **1, 2, 3, 4, 5, 6, 9, 31, 32, 33, 34, 35, 36, 37, 38, 39, 42, 44, 46, 47**
(20 agents)

### Wave 2 — Core Features (depend on schema + cache)
Agents: **7, 8, 10, 11, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 41**
(20 agents)

### Wave 3 — Dependent Features (depend on auth, APIs)
Agents: **12, 14, 15, 30, 40, 43, 45, 48, 49, 50**
(10 agents)

---

## File Conflict Map

All agents have been designed with **non-overlapping file assignments**. No two agents touch the same files. The only shared dependency is the database schema (Agent 6) and cache layer (Agent 9), which are read-only dependencies for other agents.

**Potential merge conflicts to watch:**
- Agent 38 (website core) and Agent 40 (coin pages) both write to `website/` — run 38 first
- Agent 2 (CI/CD) and Agent 46 (community) both write to `.github/` — different subdirectories, safe in parallel
- Agent 7 and Agent 8 both write to `src/workers/` — different subdirectories, safe in parallel
