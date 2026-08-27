# Prompt 25 — Content Creation (Articles & Tutorials)

> Paste this entire file into a new Claude Opus 4.6 chat session.

## Context

You are writing polished, ready-to-publish article content for **free-crypto-news** to post on developer blogs and content platforms. Each article should be unique, high-quality, and optimized for the target platform.

### Project Details
- **Name:** Free Crypto News API
- **Website:** https://cryptocurrency.cv
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **API:** `curl https://cryptocurrency.cv/api/news` (no key needed)
- **MCP:** `npx @anthropic-ai/mcp-server-crypto-news`
- **License:** MIT, open source
- **Features:** 200+ sources, 150+ endpoints, AI analysis, 662k+ archive, 13 SDKs, Docker, PWA, RSS/Atom, WebSocket/SSE, RAG

---

## Task

Write **5 complete, ready-to-publish articles** targeting different platforms and audiences. Each article should be 800–1500 words, include working code examples, and avoid being copy-pasted from each other.

---

## Article 1: Dev.to — Tutorial

**Title:** Build a Real-Time Crypto Dashboard in 10 Minutes (No API Key Needed)

**Tags:** javascript, webdev, tutorial, cryptocurrency

**Target audience:** Frontend developers who want a quick, practical project

**Structure:**
1. Hook — "Every crypto API charges monthly and requires keys. Here's one that doesn't."
2. Setup — Literally just fetch(), no npm install needed
3. Step-by-step dashboard build:
   - Fetch latest news
   - Add sentiment analysis
   - Add Fear & Greed Index
   - Add real-time updates with SSE
   - Add search
4. Full working HTML file (single file, no build tools)
5. Extend with React/Next.js (brief)
6. Link to SDKs and docs

**Code examples must be working and testable.** The reader should be able to paste any snippet and have it work with zero setup.

Include a complete single-file HTML dashboard:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Crypto Dashboard</title>
  <style>
    /* Clean, modern styling */
  </style>
</head>
<body>
  <h1>🪙 Crypto Dashboard</h1>
  <div id="fear-greed"></div>
  <div id="news"></div>
  <script>
    // Fetch and render news, sentiment, fear & greed
    // Real-time SSE updates
  </script>
</body>
</html>
```

---

## Article 2: Hashnode — Technical Deep Dive

**Title:** How We Built a RAG System Over 662K Crypto News Articles

**Tags:** ai, rag, llm, architecture

**Target audience:** AI/ML engineers interested in RAG architecture

**Structure:**
1. Problem — How do you make an LLM actually knowledgeable about real-time crypto markets?
2. Dataset — 662k+ articles, data collection pipeline, deduplication
3. RAG Architecture:
   - Hybrid search: BM25 + semantic vectors + RRF fusion
   - Query routing: semantic vs keyword vs temporal vs agentic
   - Reranking: LLM reranker + time decay + source credibility + MMR diversity
   - Self-RAG: adaptive retrieval with hallucination detection
4. Performance — latency numbers, accuracy metrics
5. Service modes — fast (220ms) vs balanced (520ms) vs complete (850ms)
6. Lessons learned:
   - Naive semantic search fails for temporal queries ("what happened yesterday")
   - Source credibility reranking dramatically improves answer quality
   - Contextual compression reduces token costs 60%+
7. Code examples showing the RAG API:
   ```bash
   curl "https://cryptocurrency.cv/api/ask?q=What+happened+after+the+ETF+approval"
   ```
8. How to replicate — the system is open source

---

## Article 3: Medium — Story/Opinion

**Title:** Why I Made Crypto News Free (And Why Every API Should Consider It)

**Tags:** cryptocurrency, api, open-source, startup

**Target audience:** General tech audience, indie hackers, crypto enthusiasts

**Structure:**
1. Personal story — Trying to build a crypto app, hitting a $300/month paywall for basic news
2. The market problem — Every crypto news API is paid, key-required, limited
3. The experiment — What if we just... made it free?
4. Comparison table vs CryptoPanic, CoinGecko Pro, etc.
5. How it works — 200+ sources, aggregation pipeline, AI analysis
6. The business model question — "How do you make money?" (and why that's the wrong question for open source tools)
7. Traction — usage numbers, the archive becoming a research resource
8. The AI angle — MCP servers and the future of tool-using AI
9. Lessons for API builders
10. Call to action — try it, contribute, star

---

## Article 4: freeCodeCamp — Beginner Tutorial

**Title:** How to Build a Crypto News Bot with Python (Free API, No Key Required)

**Tags:** python, api, cryptocurrency, beginner

**Target audience:** Python beginners who want a fun API project

**Structure:**
1. What we're building — A Python script that fetches crypto news, analyzes sentiment, and sends a daily summary
2. Prerequisites — Just Python 3 and `requests`
3. Step 1: Fetch news
   ```python
   import requests
   
   news = requests.get("https://cryptocurrency.cv/api/news?limit=5").json()
   for article in news["articles"]:
       print(f"• {article['title']} — {article['source']}")
   ```
4. Step 2: Get sentiment
   ```python
   sentiment = requests.get("https://cryptocurrency.cv/api/ai/sentiment?asset=BTC").json()
   print(f"Bitcoin sentiment: {sentiment['label']}")
   ```
5. Step 3: Check Fear & Greed
6. Step 4: Get trending topics
7. Step 5: Combine into a daily digest function
8. Step 6: Add email/Slack/Discord notification
9. Step 7: Schedule with cron
10. Full working script
11. Extensions — Flask web app, Telegram bot, etc.
12. Link to Python SDK for more advanced usage

---

## Article 5: Dev.to — AI/MCP Focus

**Title:** Give Claude Real-Time Crypto Intelligence in 30 Seconds (MCP Server Guide)

**Tags:** ai, claude, mcp, cryptocurrency

**Target audience:** Claude/AI users, developers using MCP

**Structure:**
1. Hook — "Claude is smart but has no idea what's happening in crypto right now. Let's fix that."
2. What is MCP? (1 paragraph)
3. Install the server (30 seconds):
   ```json
   {
     "mcpServers": {
       "crypto-news": {
         "command": "npx",
         "args": ["@anthropic-ai/mcp-server-crypto-news"]
       }
     }
   }
   ```
4. What Claude can now do — with example conversations:
   - "What's happening in crypto today?" → Claude fetches real news
   - "Is the market fearful or greedy?" → Fear & Greed Index
   - "What's the sentiment on Solana?" → AI sentiment analysis
   - "Search for news about Ethereum upgrades" → Search results
   - "Give me a market summary" → Aggregated market data
5. How it works under the hood — MCP tools, API calls
6. Available tools list with descriptions
7. Advanced usage — combining with other MCP servers
8. The underlying API — you can also use it directly
9. Building your own crypto AI agent with the API

---

## Output Format

For each article, output the **complete, ready-to-publish content** in Markdown format with:
- Title
- Platform-specific metadata (tags, canonical URL, series info)
- Full article body with all code examples
- Author bio suggestion
- Call-to-action at the end

Each article should be:
- **Unique** — not a rehash of the others
- **Self-contained** — reader needs nothing else
- **Code-complete** — every snippet works when pasted
- **Platform-optimized** — matches the tone and style of each platform
- **SEO-friendly** — good headings, keywords in natural positions

---

## Completion Checklist

- [ ] Article 1 (Dev.to tutorial) — complete, all code tested
- [ ] Article 2 (Hashnode RAG deep dive) — complete with architecture details
- [ ] Article 3 (Medium opinion/story) — complete, engaging narrative
- [ ] Article 4 (freeCodeCamp Python tutorial) — complete, beginner-friendly
- [ ] Article 5 (Dev.to MCP guide) — complete, working MCP examples
- [ ] All articles are unique (no copy-paste between them)
- [ ] All code examples use the live API and are testable
- [ ] Each article has platform-appropriate formatting and tone
