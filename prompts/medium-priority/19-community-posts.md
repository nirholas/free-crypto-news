# Prompt 19 — Community Posts (Reddit, Dev.to, Forums)

> Paste this entire file into a new Claude Opus 4.6 chat session.

## Context

You are drafting community posts for **free-crypto-news** across Reddit, developer blogs, and forums. Each post must feel authentic — not spammy. Tailor the angle to each community's interests.

### Project Details
- **Name:** Free Crypto News API
- **Website:** https://cryptocurrency.cv
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **API:** `curl https://cryptocurrency.cv/api/news` (no key needed)
- **MCP:** `npx @anthropic-ai/mcp-server-crypto-news`
- **License:** MIT, open source
- **Features:** 200+ sources, 150+ endpoints, AI analysis (30+ endpoints), 662k+ article archive, 13 SDKs, Docker self-hosting, PWA, RSS/Atom, WebSocket/SSE, market data, DeFi tools, whale alerts, arbitrage, options flow

---

## Task

Write the **complete, ready-to-post content** for every community below. Each post should:
1. Match the subreddit/community culture and rules
2. Lead with the angle most relevant to that audience
3. Not be copy-pasted identically across communities (vary the framing)
4. Include a clear call-to-action (try the API, star the repo, etc.)

---

## Reddit Posts

### r/cryptocurrency (7M+ members) 🔴 P0

**Title:** I built a free crypto news API that aggregates 200+ sources — no API key needed, completely open source

**Body:**
```
I got tired of every crypto news API charging $29-299/month for basic news feeds, so I built an open-source alternative that's completely free.

**Try it right now (no signup):**

    curl https://cryptocurrency.cv/api/news

That's it. No API key. No rate limits. 200+ sources including CoinDesk, The Block, Bloomberg, Decrypt, Blockworks, and 76 international sources in 18 languages.

**What it includes:**
- Real-time news from 200+ sources
- AI sentiment analysis for any coin
- Fear & Greed Index
- Whale alerts
- Market data + DeFi analytics
- 662,000+ article historical archive (2017-2025)
- Arbitrage scanner across 6 exchanges
- RSS/Atom feeds

**For AI users:**
Works with Claude via MCP server: `npx @anthropic-ai/mcp-server-crypto-news`

Ask Claude "What's happening in crypto?" and it actually knows.

**Self-hostable:** `docker compose up` and own everything.

GitHub: https://github.com/nirholas/free-crypto-news

It's MIT licensed. If you find it useful, a ⭐ on GitHub would help others discover it.

What features would you want to see added?
```

**Flair:** TOOLS

---

### r/programming (6M+ members) 🔴 P0

**Title:** I built a free API with 150+ endpoints aggregating crypto news from 200+ sources — no auth required, self-hostable, with a built-in RAG system

**Body:**
```
I've been working on an open-source crypto news aggregator that I think demonstrates some interesting patterns for API design at scale.

**The API:**

    curl https://cryptocurrency.cv/api/news

No API key. No signup. No rate limits. Just data.

**The interesting engineering bits:**

- **150+ API endpoints** served from a single Next.js app
- **RAG system** with hybrid search (BM25 + semantic vectors + RRF fusion) for natural language Q&A over 662k+ news articles
- **AI pipeline** — 30+ endpoints using Groq's free tier for sentiment analysis, entity extraction, narrative tracking, clickbait detection, claim verification
- **MCP server** for Claude AI integration — lets an LLM access real-time market data
- **Source tier system** — 200+ sources ranked by credibility with automatic quality scoring
- **Real-time** via WebSocket + SSE + webhooks
- **13 SDKs** auto-generated from the OpenAPI spec
- **Historical archive** — 662,000+ articles in JSONL, freely downloadable

**Stack:** Next.js, TypeScript, Redis, Drizzle ORM, vector embeddings, Docker

**Self-hostable:** `docker compose up`

The OpenAPI spec is at `https://cryptocurrency.cv/api/openapi.json` (it's massive).

GitHub: https://github.com/nirholas/free-crypto-news

Would love feedback on the architecture. The RAG system in particular went through several iterations — started with naive semantic search, ended up with a hybrid approach that's significantly better.
```

---

### r/selfhosted (500k+ members) 🔴 P0

**Title:** Free Crypto News — self-hosted crypto news aggregator with 200+ sources, AI analysis, and full REST API

**Body:**
```
I built an open-source crypto news aggregator that's designed for self-hosting. One command and you've got a full crypto news platform running locally.

**Quick start:**

    docker compose up

**What you get:**
- Web UI with news feed, market data, trending topics
- REST API with 150+ endpoints
- 200+ news sources aggregated in real-time
- AI sentiment analysis and entity extraction
- RSS/Atom/OPML feeds
- WebSocket and SSE for real-time updates
- Push notifications for breaking news
- Full-text search
- Market data, DeFi analytics, whale alerts
- PWA — installable on any device

**Infrastructure:**
- Docker + Docker Compose
- Redis for caching
- Configurable via environment variables
- Reverse proxy ready (Nginx config included)

**No external dependencies required for basic functionality.** AI features optionally use Groq (free tier) or OpenAI.

The whole thing is MIT licensed and designed to be self-contained. No telemetry, no tracking, no accounts.

GitHub: https://github.com/nirholas/free-crypto-news
Docs: https://cryptocurrency.cv/developers

Let me know if you run into any issues deploying!
```

---

### r/opensource (200k+ members) 🟠 P1

**Title:** Free Crypto News API — open-source alternative to paid crypto news APIs ($0 vs $29-299/mo)

**Body:**
```
I open-sourced a crypto news API that aggregates 200+ sources, because I think market information should be free.

Every alternative (CryptoPanic, CoinGecko Pro, etc.) charges $29-299/month and requires API keys. This one is completely free, no auth required:

    curl https://cryptocurrency.cv/api/news

**The project:**
- 150+ REST API endpoints
- 200+ news sources (18 languages)
- AI analysis (sentiment, entities, narratives, RAG Q&A)
- 662k+ article archive (2017-2025)
- 13 SDKs (Python, TypeScript, Go, React, PHP, Rust, Ruby, Java, Kotlin, C#, Swift, R)
- Docker self-hosting
- MIT licensed

**Built with:** Next.js, TypeScript, Redis, Drizzle ORM

GitHub: https://github.com/nirholas/free-crypto-news

Contributions welcome! Issues and PRs are open. The codebase is TypeScript throughout.
```

---

### r/webdev (2M+ members) 🟠 P1

**Title:** Built a full-stack Next.js app with 150+ API routes — free crypto news aggregator with AI features

**Body:**
```
I built a full-stack Next.js application with 150+ API routes that aggregates crypto news from 200+ sources. It's open source and I learned a lot about scaling Next.js API routes that I wanted to share.

**Live demo:** https://cryptocurrency.cv

**Interesting patterns:**
- 150+ API routes organized with a provider chain pattern (circuit breakers, caching, anomaly detection)
- PWA with offline mode, push notifications, app shortcuts
- Skeleton loading states throughout
- Dark mode with flash prevention
- Keyboard shortcuts for power users
- SEO optimized with structured data
- Accessibility: skip links, focus rings, ARIA labels, reduced-motion support
- Embeddable widgets (news ticker, carousel)

**API features:**
- No auth required: `curl https://cryptocurrency.cv/api/news`
- OpenAPI 3.1 spec + Swagger UI
- RSS/Atom/OPML feeds
- WebSocket + SSE for real-time
- 13 auto-generated SDKs

GitHub: https://github.com/nirholas/free-crypto-news

Stack: Next.js 14, TypeScript, Tailwind, Redis, Drizzle ORM, Docker
```

---

### r/ChatGPT (5M+ members) 🟠 P1

**Title:** I made a free crypto news tool for ChatGPT — gives it real-time market data from 200+ sources

**Body:**
```
I built a custom GPT that gives ChatGPT access to real-time crypto news from 200+ sources. It's free and uses the Free Crypto News API.

**What you can ask it:**
- "What's happening in crypto today?"
- "What's the sentiment on Bitcoin right now?"
- "Give me a news summary for Ethereum"
- "What's the Fear & Greed Index?"
- "What are the trending crypto topics?"

It pulls from Bloomberg, CoinDesk, The Block, Decrypt, and 200+ other sources in real-time.

The underlying API is completely free — no API key needed. You can also use it directly:

    curl https://cryptocurrency.cv/api/news

If you're building your own GPT that needs crypto data, the OpenAPI spec is at:
https://cryptocurrency.cv/api/openapi.json

GitHub: https://github.com/nirholas/free-crypto-news
```

---

### r/ClaudeAI (300k+ members) 🟠 P1

**Title:** Free MCP server gives Claude real-time crypto news and market data from 200+ sources

**Body:**
```
I built an MCP server that gives Claude access to real-time crypto news, market data, and AI sentiment analysis. It's free and takes 30 seconds to set up.

**Install:**

Add to your Claude Desktop config (or Cline/Continue/etc.):

{
  "mcpServers": {
    "crypto-news": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-crypto-news"]
    }
  }
}

**What Claude can do with it:**
- Get latest crypto news from 200+ sources
- Search for specific topics or coins
- Check AI sentiment for any cryptocurrency
- Get trending topics
- Look up the Fear & Greed Index
- Access market data and prices

**Example prompts to try:**
- "What's happening in crypto right now?"
- "How is the sentiment on Solana?"
- "Summarize today's top crypto stories"
- "Is the market fearful or greedy?"

The underlying API is completely free and open source — no API key needed.

GitHub: https://github.com/nirholas/free-crypto-news
```

---

### r/LocalLLaMA (500k+ members) 🟡 P2

**Title:** 662k+ crypto news dataset (2017-2025) + free API with RAG system — useful for fine-tuning or building crypto AI agents

**Body:**
```
I have a dataset of 662,000+ crypto news articles spanning 2017-2025 that I'm making freely available. It's part of an open-source project that also includes a production RAG system.

**Dataset:**
- 662,047 articles
- September 2017 — February 2025
- Sources: 200+ outlets (CoinDesk, The Block, Bloomberg, etc.)
- Languages: English + Chinese
- Format: JSONL by month
- Top tickers: BTC (81k), ETH (50k), USDT (19k), SOL (16k), XRP (13k)
- 79,512 indexed search terms
- Freely downloadable from the GitHub repo

**RAG System:**
The project includes a production RAG pipeline with:
- Hybrid search (BM25 + semantic vectors + RRF)
- Query routing (semantic/keyword/temporal/agentic)
- LLM reranking + time decay + source credibility
- Self-RAG with hallucination detection
- Answer attribution with inline citations
- Conversation memory for follow-ups

**API (free, no auth):**
    curl https://cryptocurrency.cv/api/ask?q=What+happened+after+the+ETF+approval

**Also has:**
- llms.txt at https://cryptocurrency.cv/llms.txt
- MCP server: npx @anthropic-ai/mcp-server-crypto-news
- 30+ AI endpoints (sentiment, entities, narratives, clickbait detection)
- Supports OpenAI, Anthropic, Groq (free), OpenRouter

GitHub: https://github.com/nirholas/free-crypto-news
Archive: https://github.com/nirholas/free-crypto-news/tree/main/archive

Useful for fine-tuning crypto-specific models or building news-aware agents.
```

---

### r/nextjs 🟡 P2

**Title:** Open-source Next.js app with 150+ API routes, PWA, and AI integration — crypto news aggregator

**Body:** Use adapted version of r/webdev post, emphasizing Next.js-specific patterns.

---

### r/node 🟡 P2

**Title:** Free crypto news API built with Next.js — 150+ endpoints, WebSocket, SSE, and RAG system

**Body:** Adapted r/programming post focusing on Node.js / API design patterns.

---

### r/bitcoin 🟠 P1

**Title:** Free Bitcoin news API — aggregates every major crypto news source, AI sentiment analysis, no API key needed

**Body:** Bitcoin-focused version of r/cryptocurrency post. Emphasize Bitcoin-specific endpoints.

---

### r/ethereum 🟠 P1

**Title:** Free Ethereum news & DeFi tools API — gas tracker, DeFi protocol health, AI sentiment, no API key

**Body:** Ethereum/DeFi-focused version. Emphasize `/api/gas`, `/api/defi`, DeFi protocol health scoring.

---

### r/defi 🟡 P2

**Title:** Free DeFi API — protocol health scoring, TVL data, yield tracking, all with AI analysis

**Body:** DeFi-specific version focusing on DeFi endpoints and protocol analysis.

---

### r/CryptoTechnology 🟡 P2

**Title:** Technical deep-dive: Building a free crypto news API with RAG, hybrid search, and real-time processing

**Body:** Technical version of r/programming post, focused on crypto-specific engineering challenges.

---

## Blog Platforms

### Dev.to 🔴 P0

**Title:** How to Build a Crypto News Dashboard with Zero API Keys

**Tags:** javascript, api, cryptocurrency, tutorial

**Body:**
```markdown
Have you ever tried to build something with crypto data and hit a paywall immediately? Every crypto news API charges $29-299/month and requires API keys.

I built [Free Crypto News API](https://cryptocurrency.cv) — a free alternative that aggregates 200+ sources with zero authentication. Let me show you how to build a real-time crypto news dashboard in 5 minutes.

## Step 1: Fetch News (No Setup Needed)

```javascript
const response = await fetch('https://cryptocurrency.cv/api/news?limit=10');
const data = await response.json();

data.articles.forEach(article => {
  console.log(`${article.title} — ${article.source}`);
});
```

That's it. No API key. No signup. No SDK required.

## Step 2: Add Sentiment Analysis

```javascript
const sentiment = await fetch('https://cryptocurrency.cv/api/ai/sentiment?asset=BTC')
  .then(r => r.json());

console.log(`Bitcoin sentiment: ${sentiment.label} (${sentiment.score})`);
```

## Step 3: Real-Time Updates with SSE

```javascript
const events = new EventSource('https://cryptocurrency.cv/api/sse');
events.onmessage = (e) => {
  const article = JSON.parse(e.data);
  console.log(`Breaking: ${article.title}`);
};
```

## Step 4: Add Fear & Greed Index

```javascript
const fg = await fetch('https://cryptocurrency.cv/api/fear-greed').then(r => r.json());
console.log(`Market mood: ${fg.classification} (${fg.value}/100)`);
```

## Step 5: Search & Filter

```javascript
// Search
const results = await fetch('https://cryptocurrency.cv/api/search?q=ethereum%20upgrade')
  .then(r => r.json());

// Filter by category
const defi = await fetch('https://cryptocurrency.cv/api/news?category=defi')
  .then(r => r.json());

// Get trending topics
const trending = await fetch('https://cryptocurrency.cv/api/trending')
  .then(r => r.json());
```

## Bonus: Give Claude AI Crypto Awareness

If you use Claude, install the MCP server:

```bash
npx @anthropic-ai/mcp-server-crypto-news
```

Now Claude can answer "What's happening in crypto?" with real data.

## Full API

There are 150+ endpoints covering:
- News from 200+ sources
- Market data for all coins
- DeFi analytics and protocol health
- Whale alerts
- Arbitrage opportunities
- Options flow
- Historical archive (662k+ articles)
- And much more

📚 Full docs: https://cryptocurrency.cv/developers
📦 GitHub: https://github.com/nirholas/free-crypto-news
🔧 OpenAPI spec: https://cryptocurrency.cv/api/openapi.json

---

*If you found this useful, please [⭐ star the repo](https://github.com/nirholas/free-crypto-news) — it helps others discover the project.*
```

---

### Hashnode 🟠 P1

**Title:** Building an AI-Powered Crypto News API with RAG and MCP (and Making It Free)

**Tags:** ai, api, cryptocurrency, openSource

Publish a variation of the Dev.to article but with more focus on the AI/RAG architecture and MCP integration. Include diagrams of the RAG pipeline if possible.

---

### Medium 🟠 P1

**Title:** Why I Made Crypto News Free: Building a 200+ Source News API with Zero Paywalls

Publish a storytelling version of the Dev.to article. Focus on the motivation, the problem with paid APIs, and the technical journey.

---

## Completion Checklist

Report back with:
- [ ] r/cryptocurrency — post drafted
- [ ] r/programming — post drafted
- [ ] r/selfhosted — post drafted
- [ ] r/opensource — post drafted
- [ ] r/webdev — post drafted
- [ ] r/ChatGPT — post drafted
- [ ] r/ClaudeAI — post drafted
- [ ] r/LocalLLaMA — post drafted
- [ ] r/nextjs — post drafted
- [ ] r/node — post drafted
- [ ] r/bitcoin — post drafted
- [ ] r/ethereum — post drafted
- [ ] r/defi — post drafted
- [ ] r/CryptoTechnology — post drafted
- [ ] Dev.to article — full article drafted
- [ ] Hashnode article — full article drafted
- [ ] Medium article — full article drafted
- [ ] All posts are unique (not copy-pasted across communities)
- [ ] All posts match community culture and rules
