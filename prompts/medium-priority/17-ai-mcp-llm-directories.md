# Prompt 17 — Submit to AI / MCP / LLM Directories

> Paste this entire file into a new Claude Opus 4.6 chat session.

## Context

You are submitting **free-crypto-news** to AI, MCP, and LLM tool directories. The project has deep AI integrations:

### Project Details
- **Name:** Free Crypto News API
- **Website:** https://cryptocurrency.cv
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **License:** MIT
- **Pricing:** Free, no API key

### AI/MCP-Specific Features
- **MCP Server:** `npx @anthropic-ai/mcp-server-crypto-news` — gives Claude real-time crypto news, market data, sentiment analysis
- **ChatGPT Plugin:** OpenAPI spec at `https://cryptocurrency.cv/api/openapi.json`  
- **llms.txt:** `https://cryptocurrency.cv/llms.txt` — machine-readable project docs for LLMs
- **llms-full.txt:** `https://cryptocurrency.cv/llms-full.txt` — complete API documentation for LLMs
- **RAG System:** Production-grade question answering over 662k+ crypto news articles
- **AI Endpoints (30+):**
  - `/api/ai/sentiment` — Sentiment analysis with confidence scores
  - `/api/summarize` — AI summaries (brief/detailed/bullet/eli5/technical)
  - `/api/ask` — Natural language Q&A about crypto news
  - `/api/digest` — AI-generated news digests
  - `/api/entities` — Entity extraction (7 types)
  - `/api/narratives` — Market narrative tracking
  - `/api/factcheck` — Claim verification
  - `/api/clickbait` — Clickbait detection with rewritten titles
  - `/api/ai/oracle` — Natural language crypto intelligence chat
  - `/api/ai/agent` — AI market agent for signal aggregation
  - `/api/ai/research` — Deep-dive research reports
  - `/api/ai/correlation` — News-price correlation detection
  - `/api/ai/cross-lingual` — Regional sentiment divergence
  - `/api/detect/ai-content` — AI-generated content detection
- **Supported AI Providers:** OpenAI, Anthropic, Groq (free), OpenRouter
- **Dataset:** 662,000+ crypto news articles (2017–2025) for fine-tuning/RAG

### MCP Server Configuration
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

### MCP Tools Available
- `get_latest_news` — Get latest crypto news with optional filters
- `search_news` — Search crypto news articles
- `get_market_data` — Get cryptocurrency market data
- `get_sentiment` — Get AI sentiment analysis for any asset
- `get_trending` — Get trending crypto topics
- `get_fear_greed` — Get Fear & Greed Index

---

## Task

For each directory, draft the **exact submission content** ready to use. Where submissions are GitHub PRs, create the PR. Where they are web forms, provide all field values ready to paste.

---

## 1. MCP.so 🔴 P0

**URL:** https://mcp.so
**Action:** Submit MCP server listing

Submission content:
- **Name:** Free Crypto News
- **Package:** `@anthropic-ai/mcp-server-crypto-news`
- **Install:** `npx @anthropic-ai/mcp-server-crypto-news`
- **GitHub:** https://github.com/nirholas/free-crypto-news/tree/main/mcp
- **Category:** Finance / Data
- **Description:** Get real-time crypto news, market data, and AI sentiment analysis directly in Claude. Aggregates 200+ sources. Free, no API key required.
- **Tools:** get_latest_news, search_news, get_market_data, get_sentiment, get_trending, get_fear_greed

Check if MCP.so has a submission form or GitHub repo for listings and submit accordingly.

---

## 2. Glama MCP Directory 🔴 P0

**URL:** https://glama.ai/mcp/servers
**Action:** Submit MCP server

Same content as MCP.so above. Check their submission process.

---

## 3. Smithery 🔴 P0

**URL:** https://smithery.ai
**Action:** Submit MCP server

Check if Smithery requires a `smithery.yaml` in the repo or has a web submission form. If they need a config file, create:

```yaml
name: free-crypto-news
description: Real-time crypto news, market data, and AI sentiment analysis from 200+ sources
author: nirholas
repository: https://github.com/nirholas/free-crypto-news
install: npx @anthropic-ai/mcp-server-crypto-news
category: finance
tags:
  - cryptocurrency
  - news
  - market-data
  - sentiment-analysis
  - ai
tools:
  - name: get_latest_news
    description: Get latest crypto news with optional category/source filters
  - name: search_news
    description: Search crypto news articles by keyword
  - name: get_market_data
    description: Get cryptocurrency market prices and data
  - name: get_sentiment
    description: Get AI-powered sentiment analysis for any crypto asset
  - name: get_trending
    description: Get currently trending crypto topics
  - name: get_fear_greed
    description: Get the Crypto Fear & Greed Index
```

---

## 4. MCPHub 🟠 P1

**URL:** https://mcphub.io
**Action:** Submit MCP server listing. Same details as above.

---

## 5. OpenAI GPT Store — Create Custom GPT 🔴 P0

**URL:** https://chatgpt.com/gpts/editor
**Action:** Create a custom GPT using the OpenAPI spec

**GPT Configuration:**
- **Name:** Free Crypto News
- **Description:** Get real-time crypto news, market data, and AI analysis from 200+ sources. Free and open source.
- **Instructions:**
```
You are a crypto news assistant powered by the Free Crypto News API. You help users:
1. Get the latest crypto news from 200+ sources
2. Search for specific crypto topics or coins
3. Analyze market sentiment for any cryptocurrency
4. Get trending topics in the crypto space
5. Check the Fear & Greed Index
6. Get market data and prices for any coin
7. Get AI-generated news digests and summaries

Always cite your sources by including article titles and source names in your responses. When discussing market data, include relevant prices and percentages. Be conversational but data-driven.

Base API URL: https://cryptocurrency.cv
```
- **Actions:** Import from URL → `https://cryptocurrency.cv/api/openapi.json`
- **Conversation starters:**
  - "What's the latest crypto news?"
  - "How is Bitcoin sentiment right now?"
  - "What's trending in crypto today?"
  - "Give me a market summary"
- **Logo:** Use crypto news icon or download from site
- **Category:** Research & Analysis
- **Make public:** Yes

---

## 6. There's an AI for That 🟠 P1

**URL:** https://theresanaiforthat.com/submit/
**Action:** Submit tool listing

Submission content:
- **Tool Name:** Free Crypto News API
- **URL:** https://cryptocurrency.cv
- **One-liner:** Free AI-powered crypto news API with sentiment analysis, RAG, and 200+ sources. No API key needed.
- **Description:** (use medium description from above)
- **Category:** Data Analysis, Finance, Developer Tools
- **Pricing:** Free
- **Tags:** crypto, news, api, sentiment-analysis, ai, mcp, rag, free

---

## 7. Future Tools 🟠 P1

**URL:** https://futuretools.io/submit-a-tool
**Action:** Submit tool listing

Use same content as TAIFT above.

---

## 8. llms.txt Directory 🟠 P1

**URL:** https://llmstxt.org
**Action:** Register the site's llms.txt

Content:
- **Domain:** cryptocurrency.cv
- **llms.txt URL:** https://cryptocurrency.cv/llms.txt
- **llms-full.txt URL:** https://cryptocurrency.cv/llms-full.txt
- **Description:** Free crypto news API with 150+ endpoints and 200+ sources

Check their submission process (may be a GitHub PR or form).

---

## 9. AI Tool Directory 🟡 P2

**URL:** https://aitoolsdirectory.com
**Action:** Submit listing. Same content as TAIFT.

---

## 10. TopAI.tools 🟡 P2

**URL:** https://topai.tools
**Action:** Submit listing. Same content.

---

## 11. Tool Finder AI 🟡 P2

**URL:** https://toolfinderai.com
**Action:** Submit listing. Same content.

---

## 12. AI Scout 🟢 P3

**URL:** https://aiscout.net
**Action:** Submit listing. Same content.

---

## 13. Awesome GPTs Lists

Search GitHub for the top "awesome-gpts" or "awesome-chatgpt" repos (5k+ stars). Submit PRs adding the Custom GPT once it's created in step 5.

---

## Completion Checklist

Report back with:
- [ ] MCP.so — submitted (URL or status)
- [ ] Glama — submitted
- [ ] Smithery — submitted (+ smithery.yaml if needed)
- [ ] MCPHub — submitted
- [ ] GPT Store — Custom GPT created (share link)
- [ ] TAIFT — submitted
- [ ] Future Tools — submitted  
- [ ] llms.txt directory — submitted
- [ ] AI Tool Directory — submitted
- [ ] TopAI.tools — submitted
- [ ] Tool Finder AI — submitted
- [ ] AI Scout — submitted
- [ ] Awesome GPTs PRs — submitted
- [ ] Any that require manual browser steps (list them with exact URLs and pre-filled content)
