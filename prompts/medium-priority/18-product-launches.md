# Prompt 18 — Product Launch Platforms

> Paste this entire file into a new Claude Opus 4.6 chat session.

## Context

You are preparing launch materials for **free-crypto-news** on product launch platforms. The goal is to create polished, ready-to-submit content for a coordinated launch day.

### Project Details
- **Name:** Free Crypto News API
- **Website:** https://cryptocurrency.cv
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **Creator:** nirholas
- **License:** MIT
- **Pricing:** Free forever, no API key

### Key Differentiators (lead with these)
1. **Free forever** — competitors charge $29–299/mo
2. **No API key** — `curl https://cryptocurrency.cv/api/news` just works
3. **200+ sources** — Bloomberg, CoinDesk, The Block, 18 languages
4. **Self-hostable** — `docker compose up` and you own everything
5. **AI-native** — MCP for Claude, ChatGPT plugin, RAG, sentiment, 30+ AI endpoints
6. **662k+ article archive** — largest free crypto news dataset (2017–2025)
7. **13 SDKs** — Python, TypeScript, Go, React, PHP, Rust, Ruby, Java, Kotlin, C#, Swift, R
8. **150+ endpoints** — news, market data, DeFi, whale alerts, arbitrage, options

### Comparison Table
```
|                   | Free Crypto News | CryptoPanic  | Others   |
| Price             | 🆓 Free forever  | $29-299/mo   | Paid     |
| API Key           | ❌ None needed   | Required     | Required |
| Rate Limit        | Unlimited        | 100-1000/day | Limited  |
| Sources           | 200+             | 1            | Varies   |
| Historical        | 662k+ articles   | Limited      | None     |
| International     | 18 languages     | No           | No       |
| Self-host         | ✅ Docker        | No           | No       |
| AI / MCP          | ✅ Built-in      | No           | No       |
```

---

## Task

Draft the **complete, ready-to-submit content** for each platform. Do not just give outlines — write the actual submission text. I will copy-paste these directly.

---

## 1. Product Hunt 🔴 P0

**URL:** https://www.producthunt.com

### Submission Content

**Name:** Free Crypto News API

**Tagline (60 chars max):**
```
Free crypto news API — 200+ sources, no API key, AI-powered
```

**Description (260 chars max):**
```
Real-time crypto news from 200+ sources. Completely free, no API key required. AI sentiment analysis, MCP server for Claude, ChatGPT plugin, 662k+ article archive, 13 SDKs, self-hostable via Docker. The crypto news API that CryptoPanic should be.
```

**Full Description:**
```
## What is Free Crypto News?

Free Crypto News API is the most comprehensive free crypto news aggregator. One API call gives you real-time news from 200+ sources — Bloomberg, CoinDesk, The Block, Decrypt, and 130+ more English outlets, plus 76 international sources in 18 languages.

## Why we built it

Every crypto news API charges $29–299/month and requires API keys. We believe market information should be free. So we built the API we wished existed:

• `curl https://cryptocurrency.cv/api/news` — that's it. No signup, no key, no paywall.

## What makes it special

🆓 **Free forever** — No API key, no rate limits, no paywall
🤖 **AI-native** — 30+ AI endpoints: sentiment analysis, entity extraction, narrative tracking, RAG Q&A, clickbait detection
🔌 **Works with AI agents** — MCP server for Claude, ChatGPT plugin, llms.txt
📚 **662,000+ article archive** — Largest free crypto news dataset (2017–2025)
🐳 **Self-hostable** — `docker compose up` and own your data
📦 **13 SDKs** — Python, TypeScript, Go, React, PHP, Rust, Ruby, Java, Kotlin, C#, Swift, R
📡 **Real-time** — WebSocket, SSE, webhooks, push notifications
📊 **Market data** — Prices, DeFi analytics, whale alerts, arbitrage scanner, options flow, Fear & Greed

## Who is it for?

- Developers building crypto dashboards, bots, or apps
- AI engineers who want to give LLMs real-time crypto awareness
- Researchers analyzing crypto news patterns
- Self-hosters who want full control over their news feed
- Anyone tired of paying $300/month for a news API

## Links

🌐 Live API: https://cryptocurrency.cv/api/news
📖 Docs: https://cryptocurrency.cv/developers
💻 GitHub: https://github.com/nirholas/free-crypto-news
```

**Topics:** Developer Tools, Artificial Intelligence, Crypto, APIs, Open Source

**Gallery:** Include screenshots of:
1. API response in terminal (`curl` example)
2. Web UI showing news feed
3. Swagger docs page
4. MCP server in Claude
5. Market data / Fear & Greed page

**Maker comment (post after launch):**
```
Hey Product Hunt! 👋

I built Free Crypto News because I was frustrated paying $300/month for crypto news APIs that only covered a handful of sources.

The API aggregates 200+ sources, runs AI analysis on everything, and is completely free — no API key, no signup. Just curl it.

My favorite feature? The MCP server. You can give Claude real-time crypto market awareness in 30 seconds:

npx @anthropic-ai/mcp-server-crypto-news

Then ask Claude "What's happening in crypto right now?" and it actually knows.

The 662k+ article archive (2017–2025) is also great for researchers and anyone training crypto-focused models.

Would love your feedback! What features would you want to see next?
```

---

## 2. Hacker News (Show HN) 🔴 P0

**URL:** https://news.ycombinator.com/submit

**Title (80 chars max):**
```
Show HN: Free Crypto News API – 200+ sources, no API key, self-hostable, AI-native
```

**URL:** `https://github.com/nirholas/free-crypto-news`

**Top-level comment to post immediately after:**
```
I built this because every crypto news API charges $29-299/month, requires API keys, and covers maybe a handful of sources.

Free Crypto News aggregates 200+ sources (Bloomberg, CoinDesk, The Block, Decrypt, plus 76 international sources in 18 languages) and serves it all through a simple REST API:

    curl https://cryptocurrency.cv/api/news

No signup. No API key. No rate limits. MIT licensed.

Some things that might interest HN:

• 150+ API endpoints covering news, market data, DeFi, whale alerts, options flow, arbitrage

• AI analysis built in — sentiment, entity extraction, narrative tracking, clickbait detection, RAG Q&A (powered by Groq's free tier)

• MCP server so Claude can access real-time crypto data: npx @anthropic-ai/mcp-server-crypto-news

• 662,000+ article historical archive spanning 2017-2025 — in JSONL format, all freely downloadable

• Self-hostable: docker compose up

• SDKs in 13 languages

• Progressive Web App with offline mode

Tech stack: Next.js, TypeScript, Redis caching, Drizzle ORM, vector search for RAG. Deployed on Vercel + Railway.

The archive dataset might be interesting for NLP/ML research — it's probably the largest freely available crypto news corpus.

Happy to answer questions about the architecture or data pipeline.
```

---

## 3. DevHunt 🟠 P1

**URL:** https://devhunt.org
**Action:** Submit listing

**Name:** Free Crypto News API
**Description:**
```
Free, open-source crypto news API aggregating 200+ sources. No API key required. 150+ endpoints, AI sentiment analysis, MCP server for Claude, ChatGPT plugin, 662k+ article archive, 13 SDKs, self-hostable via Docker.
```
**GitHub URL:** https://github.com/nirholas/free-crypto-news
**Tags:** api, cryptocurrency, ai, open-source, news, free

---

## 4. Indie Hackers 🟠 P1

**URL:** https://www.indiehackers.com

### Product Listing
**Name:** Free Crypto News API  
**URL:** https://cryptocurrency.cv  
**Revenue:** $0 (free/open-source)

### Community Post

**Title:** I built a free crypto news API with 200+ sources — here's what I learned

**Body:**
```
## The Problem

Every crypto news API charges $29-299/month. Most cover only a few sources. All require API keys and signup flows. I wanted something better.

## What I Built

Free Crypto News API — an open-source aggregator that pulls from 200+ crypto news sources in real-time. Completely free, no API key required.

**Try it right now:**
curl https://cryptocurrency.cv/api/news

## Key Features

- 200+ sources (Bloomberg, CoinDesk, The Block + 76 international)
- 150+ REST API endpoints
- AI sentiment analysis, entity extraction, RAG Q&A
- MCP server for Claude AI
- 662k+ article historical archive
- SDKs in 13 languages
- Self-hostable via Docker
- MIT licensed

## The Stack

Next.js + TypeScript on Vercel. Redis for caching. Drizzle ORM. Vector search for RAG. Groq for free AI inference.

## What's Working

The API serves [X] requests per day. The archive has become popular with researchers and ML engineers. The MCP server gets regular npm downloads.

## What I'd Do Differently

1. Started with fewer endpoints and polished them instead of building 150+
2. Built the MCP server earlier — AI integrations drive more discovery than traditional API usage
3. Focused on the dataset angle sooner — the archive is our most unique asset

## Links

- GitHub: https://github.com/nirholas/free-crypto-news
- Live API: https://cryptocurrency.cv
- Docs: https://cryptocurrency.cv/developers

Would love to hear what you think! Any questions about the build?
```

---

## 5. BetaList 🟡 P2

**URL:** https://betalist.com/submit

**Startup Name:** Free Crypto News API
**URL:** https://cryptocurrency.cv
**Tagline:** Free crypto news API — 200+ sources, no API key, AI-powered
**Description:** (use medium description)
**Category:** Developer Tools
**Pitch email subject:** Free Crypto News API — open-source, 200+ sources, zero-auth

---

## 6. Uneed 🟡 P2

**URL:** https://www.uneed.best
**Action:** Submit tool

Same content as DevHunt listing above.

---

## 7. Peerlist 🟡 P2

**URL:** https://peerlist.io
**Action:** Create project showcase

Use Product Hunt description adapted for developer audience.

---

## 8. Launching Next 🟡 P2

**URL:** https://www.launchingnext.com
**Action:** Submit startup

Same core content. Focus on the free + open-source angle.

---

## 9. SideProjectors 🟢 P3

**URL:** https://www.sideprojectors.com
**Action:** List project (this is a showcase/marketplace for side projects)

**Project Name:** Free Crypto News API
**Description:** Open-source, free crypto news API with 200+ sources and AI analysis
**Tech Stack:** Next.js, TypeScript, Redis, Docker
**Status:** Live
**URL:** https://cryptocurrency.cv

---

## Launch Day Timing (for reference)

Best time to post:
- **Product Hunt:** 12:01 AM PT (automatic)
- **Hacker News:** 8-9 AM ET, Tuesday or Wednesday
- **Reddit:** 9-11 AM ET (varies by subreddit)
- **DevHunt:** Same day as PH
- **Indie Hackers:** Day 2 (amplification)

---

## Completion Checklist

Draft all content and report back with:
- [ ] Product Hunt — full submission ready (all fields)
- [ ] Hacker News — title + comment ready
- [ ] DevHunt — submitted or ready to submit
- [ ] Indie Hackers — product listing + community post drafted
- [ ] BetaList — submitted or ready
- [ ] Uneed — submitted or ready
- [ ] Peerlist — submitted or ready
- [ ] Launching Next — submitted or ready
- [ ] SideProjectors — submitted or ready
- [ ] List any platforms requiring manual browser-only submission
