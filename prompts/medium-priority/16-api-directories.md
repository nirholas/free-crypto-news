# Prompt 16 — Submit to API Directories & Marketplaces

> Paste this entire file into a new Claude Opus 4.6 chat session with web access / browser capabilities.

## Context

You are submitting **free-crypto-news** to API directories and marketplaces. This is an open-source, free, no-auth crypto news API.

### Project Details
- **Name:** Free Crypto News API
- **Tagline:** Real-time crypto news from 200+ sources. Free forever. No API key required.
- **Website:** https://cryptocurrency.cv
- **API Base URL:** https://cryptocurrency.cv/api/news
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **OpenAPI Spec:** https://cryptocurrency.cv/api/openapi.json
- **Swagger Docs:** https://cryptocurrency.cv/api/docs
- **Postman Collection:** Available in the repo at `/postman/`
- **License:** MIT
- **Auth:** None required (free tier is completely keyless)
- **Rate Limit:** Unlimited (fair use)
- **Category:** Cryptocurrency, News, Data, Finance
- **Pricing:** Free

### Description (short — 160 chars)
```
Free crypto news API aggregating 200+ sources. No API key. Real-time feeds, AI analysis, 662k+ article archive. Self-hostable.
```

### Description (medium — 500 chars)
```
Free Crypto News API is an open-source, real-time crypto news aggregator pulling from 200+ sources including Bloomberg, CoinDesk, The Block, and 130+ more. No API key required, no rate limits, free forever. Features include AI-powered sentiment analysis, entity extraction, RAG question answering, RSS/Atom feeds, 662,000+ article historical archive, market data, DeFi tools, whale alerts, and SDKs in 13 languages. Self-hostable via Docker. MIT licensed.
```

### Description (long — 1000+ chars)
```
Free Crypto News API is the most comprehensive free crypto news aggregator available. It pulls real-time news from 200+ sources — including Bloomberg, Reuters, CoinDesk, The Block, Decrypt, Blockworks, and 130+ English outlets plus 76 international sources across 18 languages.

No API key required. No rate limits. Free forever. MIT licensed.

Key features:
• 150+ REST API endpoints
• AI-powered sentiment analysis, entity extraction, narrative tracking
• RAG (Retrieval-Augmented Generation) for natural language Q&A over news
• MCP server for Claude AI integration
• ChatGPT plugin with OpenAPI spec
• RSS, Atom, OPML feed support
• 662,000+ article historical archive (2017–2025)
• Real-time streaming via WebSocket and Server-Sent Events
• Market data, DeFi analytics, whale alerts, arbitrage scanner
• SDKs in Python, TypeScript, Go, React, PHP, Rust, Ruby, Java, Kotlin, C#, Swift, R
• Embeddable widgets (news ticker, carousel)
• Progressive Web App with offline mode
• Self-hostable via Docker (one command)

Perfect for: trading bots, portfolio dashboards, research tools, AI agents, news aggregators, crypto apps.
```

### Key Endpoints for Listings
```
GET /api/news                    — Latest news from all sources
GET /api/news?category=bitcoin   — Filter by category
GET /api/breaking                — Breaking news (last 2 hours)
GET /api/search?q=ethereum       — Full-text search
GET /api/trending                — Trending topics with sentiment
GET /api/ai/sentiment?asset=BTC  — AI sentiment analysis
GET /api/market/coins            — Market data
GET /api/fear-greed              — Fear & Greed Index
GET /api/rss                     — RSS feed
GET /api/archive?date=2024-01    — Historical archive
```

### Tags/Keywords
```
cryptocurrency, crypto, bitcoin, ethereum, defi, news, api, free-api, no-auth, real-time, sentiment-analysis, ai, mcp, chatgpt, rss, market-data, open-source, self-hosted
```

### Logo/Icon
Use the GitHub repository social preview image or the favicon from `https://cryptocurrency.cv/favicon.ico`

---

## Task

For each directory below, provide the **exact submission content** ready to copy-paste, and where possible, provide the direct submission URL. For directories that require account creation, list the steps.

---

## 1. RapidAPI 🔴 P0

**URL:** https://rapidapi.com/hub
**Action:** Create a free API listing

Submission details:
- **API Name:** Free Crypto News
- **Category:** Cryptocurrency → News
- **Base URL:** https://cryptocurrency.cv
- **Auth:** None
- **Pricing:** Free
- **Import method:** Import from OpenAPI spec URL: `https://cryptocurrency.cv/api/openapi.json`

Steps:
1. Go to https://rapidapi.com/provider
2. Sign up / log in
3. Click "Add New API"
4. Import from OpenAPI URL
5. Set pricing to Free
6. Add description, logo, tags
7. Publish

---

## 2. Postman Public Workspace 🔴 P0

**URL:** https://www.postman.com/explore
**Action:** Publish the Postman collection from `/postman/` directory

Steps:
1. Import the collection from the repo's `/postman/` folder
2. Create a public workspace named "Free Crypto News API"
3. Add the collection with documentation
4. Set the base URL variable to `https://cryptocurrency.cv`
5. Add example responses for key endpoints
6. Publish to Postman API Network

---

## 3. OpenAPI Directory (apis.guru) 🟠 P1

**URL:** https://apis.guru
**Action:** Submit OpenAPI spec

The spec is already at `https://cryptocurrency.cv/api/openapi.json`

Steps:
1. Go to https://github.com/APIs-guru/openapi-directory
2. Check their contribution guidelines
3. Submit a PR or use their submission form pointing to the OpenAPI spec URL
4. Category: Financial → Cryptocurrency

---

## 4. Free Public APIs 🟠 P1

**URL:** https://free-apis.github.io
**Action:** Submit via GitHub PR

Steps:
1. Fork the repo
2. Add entry in the cryptocurrency / finance section:
```json
{
  "name": "Free Crypto News",
  "description": "Real-time crypto news from 200+ sources with AI analysis",
  "url": "https://cryptocurrency.cv/api/news",
  "auth": "none",
  "https": true,
  "cors": "yes",
  "category": "Cryptocurrency"
}
```
3. Open PR

---

## 5. APILayer 🟠 P1

**URL:** https://apilayer.com
**Steps:** Sign up → Submit API → Category: Finance/Crypto → Free tier

---

## 6. API List 🟡 P2

**URL:** https://apilist.fun
**Steps:** Submit via their form. Use medium description + tags above.

---

## 7. Any API 🟡 P2

**URL:** https://any-api.com
**Steps:** Submit API with OpenAPI spec URL

---

## 8. APIs.io 🟡 P2

**URL:** http://apis.io
**Steps:** Create apis.json file or submit directly

Create an `apis.json` for the project:
```json
{
  "name": "Free Crypto News API",
  "description": "Real-time crypto news from 200+ sources. Free, no auth.",
  "url": "https://cryptocurrency.cv",
  "type": "Index",
  "apis": [
    {
      "name": "Free Crypto News",
      "description": "Crypto news aggregation API",
      "baseURL": "https://cryptocurrency.cv/api",
      "humanURL": "https://cryptocurrency.cv/developers",
      "properties": [
        {
          "type": "X-documentation",
          "url": "https://cryptocurrency.cv/api/docs"
        },
        {
          "type": "OpenAPI",
          "url": "https://cryptocurrency.cv/api/openapi.json"
        }
      ]
    }
  ]
}
```

---

## 9. API Ninjas 🟡 P2

**URL:** https://api-ninjas.com
**Steps:** Contact via their submission process

---

## 10. collective-api / Public APIs 🟡 P2

**URL:** https://collective-api.com
**Steps:** Submit via form or PR

---

## Completion Checklist

Report back with:
- [ ] RapidAPI — submitted (URL)
- [ ] Postman — published workspace (URL)
- [ ] APIs.guru — PR submitted (URL)
- [ ] Free Public APIs — PR submitted (URL)
- [ ] APILayer — submitted
- [ ] API List — submitted
- [ ] Any API — submitted
- [ ] APIs.io — apis.json created
- [ ] API Ninjas — submitted
- [ ] collective-api — submitted
- [ ] Any that need manual browser steps (list them)
