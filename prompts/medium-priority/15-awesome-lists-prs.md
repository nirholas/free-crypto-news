# Prompt 15 — Submit PRs to GitHub "Awesome" Lists

> Paste this entire file into a new Claude Opus 4.6 chat session with GitHub Copilot coding agent access.

## Context

You are working on **free-crypto-news** — an open-source, free, no-auth crypto news API aggregating 200+ sources with 150+ endpoints. The project lives at:

- **Repo:** `https://github.com/nirholas/free-crypto-news`
- **Live API:** `https://cryptocurrency.cv`
- **License:** MIT

### Key features to mention in PRs:
- Free forever, no API key required, no rate limits
- 200+ news sources (130 English + 76 international in 18 languages)
- 150+ REST API endpoints
- RSS/Atom/OPML feeds
- 662,000+ article historical archive (2017–2025)
- AI-powered: sentiment analysis, RAG, entity extraction, clickbait detection
- MCP server for Claude: `npx @anthropic-ai/mcp-server-crypto-news`
- ChatGPT plugin with OpenAPI spec
- SDKs in 13 languages (Python, TypeScript, Go, React, PHP, Rust, Ruby, Java, Kotlin, C#, Swift, R)
- Docker one-click self-hosting
- PWA with offline mode
- WebSocket + SSE real-time streaming
- Embeddable widgets (ticker, carousel)
- Market data, DeFi tools, whale alerts, arbitrage scanner, options flow
- llms.txt and llms-full.txt for LLM consumption

---

## Task

Fork each target repo, create a branch, add the appropriate entry following each repo's contribution guidelines, and open a PR using `gh`. Do them all sequentially.

**IMPORTANT:** Before submitting each PR, you MUST:
1. Read the target repo's CONTRIBUTING.md or README for formatting rules
2. Check existing entries to match the exact style (alphabetical order, column format, etc.)
3. Verify you're adding to the correct section/category

---

## Target 1: public-apis/public-apis (325k+ stars)

**Repo:** `https://github.com/public-apis/public-apis`
**Section:** Cryptocurrency
**Format:** Follow their existing table format exactly

Entry to add:
```
| Free Crypto News | No | No | Unknown | Real-time crypto news from 200+ sources with AI analysis | https://cryptocurrency.cv/api/news |
```

Steps:
1. `gh repo fork public-apis/public-apis --clone`
2. Read their CONTRIBUTING.md for exact format
3. Find the Cryptocurrency section, add entry in alphabetical order
4. Commit, push, open PR with title: "Add Free Crypto News API to Cryptocurrency section"
5. PR body should emphasize: free, no-auth, 200+ sources, self-hostable

---

## Target 2: awesome-selfhosted/awesome-selfhosted (210k+ stars)

**Repo:** `https://github.com/awesome-selfhosted/awesome-selfhosted`
**Section:** News, Readers and Bookmark Managers (or closest match — check current categories)

Entry to add (match their format exactly — read existing entries):
```
- [Free Crypto News](https://github.com/nirholas/free-crypto-news) - Real-time crypto news aggregator with 200+ sources, AI analysis, 150+ API endpoints, and historical archive. `MIT` `Docker/Nodejs`
```

Steps:
1. `gh repo fork awesome-selfhosted/awesome-selfhosted --clone`
2. Read their CONTRIBUTING.md and PULL_REQUEST_TEMPLATE.md
3. Find the right section, add alphabetically
4. Commit, push, open PR

---

## Target 3: punkpeye/awesome-mcp-servers (40k+ stars)

**Repo:** `https://github.com/punkpeye/awesome-mcp-servers`
**Section:** Data & Finance (or closest match)

Entry to add (match their format):
```
- [Free Crypto News](https://github.com/nirholas/free-crypto-news) - Real-time crypto news from 200+ sources with AI sentiment analysis, market data, and historical archive. Install: `npx @anthropic-ai/mcp-server-crypto-news`
```

Steps:
1. `gh repo fork punkpeye/awesome-mcp-servers --clone`
2. Read existing entries to match format exactly
3. Add to appropriate section alphabetically
4. Commit, push, open PR

---

## Target 4: coinpride/CryptoList (awesome-crypto, 4k+ stars)

**Repo:** `https://github.com/coinpride/CryptoList`
**Section:** News / APIs (check current structure)

Entry:
```
- [Free Crypto News API](https://cryptocurrency.cv) - Free, no-auth API aggregating 200+ crypto news sources with AI analysis, sentiment tracking, and 662k+ article archive. [GitHub](https://github.com/nirholas/free-crypto-news)
```

---

## Target 5: mahseema/awesome-ai-tools (8k+ stars)

**Repo:** `https://github.com/mahseema/awesome-ai-tools`
**Section:** Data Analysis / Research Tools (check current structure)

Entry:
```
- [Free Crypto News](https://github.com/nirholas/free-crypto-news) - AI-powered crypto news aggregator with RAG, sentiment analysis, entity extraction, narrative tracking, and MCP server for Claude. Free, no API key.
```

---

## Target 6: enaqx/awesome-react (66k+ stars)

**Repo:** `https://github.com/enaqx/awesome-react`
**Section:** Components / Data (check current structure)

Entry:
```
- [free-crypto-news React SDK](https://github.com/nirholas/free-crypto-news/tree/main/sdk/react) - React hooks and components for real-time crypto news feeds. Free API, no key required.
```

---

## Target 7: unicodeveloper/awesome-nextjs (13k+ stars)

**Repo:** `https://github.com/unicodeveloper/awesome-nextjs`
**Section:** Apps / Projects (check current structure)

Entry:
```
- [Free Crypto News](https://github.com/nirholas/free-crypto-news) - Full-stack Next.js crypto news aggregator with 150+ API routes, PWA, SSR, AI analysis, and Docker deployment.
```

---

## Target 8: veggiemonk/awesome-docker (31k+ stars)

**Repo:** `https://github.com/veggiemonk/awesome-docker`
**Section:** Apps (check current structure)

Entry:
```
- [Free Crypto News](https://github.com/nirholas/free-crypto-news) - Self-hosted crypto news aggregator with 200+ sources, AI analysis, and full REST API. By [@nirholas](https://github.com/nirholas)
```

---

## Target 9: AboutRSS/ALL-about-RSS (3k+ stars)

**Repo:** `https://github.com/AboutRSS/ALL-about-RSS`
**Section:** RSS Services / Finance News (check current structure)

Entry:
```
- [Free Crypto News](https://cryptocurrency.cv) <sup>[RSS](https://cryptocurrency.cv/api/rss) [Atom](https://cryptocurrency.cv/api/atom) [OPML](https://cryptocurrency.cv/api/opml)</sup> - Aggregated crypto news feeds from 200+ sources. Free, no auth. [![Open-Source Software](icon)][GitHub](https://github.com/nirholas/free-crypto-news)
```

---

## Target 10: Search and submit to top "awesome-llm" list

1. Search GitHub for the most popular awesome-llm / awesome-llms list (likely 15k+ stars)
2. Find appropriate section (Tools / Data Sources)
3. Add entry emphasizing: llms.txt, MCP server, RAG system, 662k article dataset

---

## Target 11: awesome-chatgpt-plugins / awesome-gpts

**Repo:** Search for the most active awesome-gpts or awesome-chatgpt list
**Entry focus:** ChatGPT plugin with OpenAPI spec at `https://cryptocurrency.cv/api/openapi.json`

---

## Target 12: Free API lists

Search GitHub for repos like "free-apis", "no-auth-apis", "public-free-apis" with 1k+ stars. Submit to the top 3.

---

## Git Configuration

Before any commits:
```bash
git config user.name "nirholas"
git config user.email "22895867+nirholas@users.noreply.github.com"
```

## PR Template (adapt per repo)

**Title:** Add Free Crypto News API

**Body:**
```
## What is this?

[Free Crypto News](https://github.com/nirholas/free-crypto-news) is an open-source, free crypto news API that aggregates 200+ sources in real-time.

### Why it belongs here:
- Completely free, no API key required
- 200+ news sources across 18 languages  
- 150+ REST API endpoints
- Self-hostable via Docker
- AI-powered analysis (sentiment, entities, RAG)
- MIT licensed

### Links:
- GitHub: https://github.com/nirholas/free-crypto-news
- Live API: https://cryptocurrency.cv
- Docs: https://cryptocurrency.cv/developers
```

## Completion Checklist

After all PRs are submitted, report back with:
- [ ] PR URL for each target
- [ ] Any repos that were skipped and why
- [ ] Any formatting issues encountered
