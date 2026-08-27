# Prompt 24 — RSS Directories, Newsletters, SEO & Long-Tail Submissions

> Paste this entire file into a new Claude Opus 4.6 chat session.

## Context

You are submitting **free-crypto-news** to RSS directories, newsletter curators, SEO/comparison sites, and other long-tail discovery channels.

### Project Details
- **Name:** Free Crypto News API
- **Website:** https://cryptocurrency.cv
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **RSS Feed:** https://cryptocurrency.cv/api/rss
- **Atom Feed:** https://cryptocurrency.cv/api/atom
- **OPML Export:** https://cryptocurrency.cv/api/opml
- **License:** MIT
- **Pricing:** Free, no API key

### Feeds Description
The project serves aggregated crypto news feeds from 200+ sources in multiple formats:
- RSS 2.0 at `/api/rss`
- Atom at `/api/atom`
- OPML export at `/api/opml` (users can import all 200+ individual source feeds)
- Category-specific feeds via query params
- Real-time updates via SSE at `/api/sse`

---

## Task

Prepare complete submission content for each target. For web forms, provide all field values. For email pitches, write the complete email. For GitHub PRs, draft the PR content.

---

## RSS / Feed Directories

### 1. Feedly 🔴 P0

**URL:** https://feedly.com

Steps:
1. Visit https://feedly.com and search for `https://cryptocurrency.cv/api/rss`
2. If not auto-indexed, submit via their "Add Content" feature
3. The feed should auto-discover from the RSS URL

Feedly also has a "Power Search" feature — ensure the feed metadata is rich:
- Title: Free Crypto News — 200+ Sources
- Description: Aggregated crypto news from Bloomberg, CoinDesk, The Block, and 200+ more sources
- Category: Cryptocurrency / Finance
- Language: English

---

### 2. Feedspot 🟠 P1

**URL:** https://www.feedspot.com/submit-rss-feed
**Action:** Submit for inclusion in "Top Crypto News Feeds" rankings

**Submission:**
- **Blog/Website URL:** https://cryptocurrency.cv
- **RSS Feed URL:** https://cryptocurrency.cv/api/rss
- **Blog Name:** Free Crypto News
- **Category:** Cryptocurrency
- **Description:** Aggregated crypto news from 200+ sources including Bloomberg, CoinDesk, The Block, and Decrypt. Updated in real-time. Free, no API key required.
- **Email:** (your contact email)

---

### 3. Inoreader 🟠 P1

**URL:** https://www.inoreader.com
Steps: Search or add feed URL `https://cryptocurrency.cv/api/rss` within Inoreader. The feed will be indexed automatically.

---

### 4. NewsBlur 🟡 P2

**URL:** https://newsblur.com
Steps: Add feed URL. NewsBlur is open-source and indexes feeds added by users.

---

## SEO & Comparison Sites

### 5. AlternativeTo 🟠 P1

**URL:** https://alternativeto.net/contribute/

**Submission:**
- **Software Name:** Free Crypto News API
- **URL:** https://cryptocurrency.cv
- **Description:** Free, open-source crypto news API that aggregates 200+ sources. No API key required. Features AI sentiment analysis, historical archive, and self-hosting via Docker. A free alternative to CryptoPanic, CoinGecko Pro API, and Messari.
- **Category:** Development, News
- **Tags:** API, Cryptocurrency, News, Open Source, Self-Hosted, AI, Free
- **Platforms:** Web, Self-Hosted, Docker
- **License:** MIT (Open Source)
- **Alternatives to:** CryptoPanic, CoinGecko API, Messari API, LunarCrush
- **Pricing:** Free

---

### 6. StackShare 🟡 P2

**URL:** https://stackshare.io

**Action:** Create a tool listing

**Tool Name:** Free Crypto News API
**Category:** Data APIs
**Description:** Free crypto news API aggregating 200+ sources with AI analysis. No API key required. Self-hostable.
**Tech Stack Used By The Project:**
- Next.js
- TypeScript
- Redis
- Docker
- Drizzle ORM
- Tailwind CSS
- OpenAI API
- Groq
- Vercel
- Railway

---

### 7. Slant 🟡 P2

**URL:** https://www.slant.co

Find and answer the question "What are the best crypto news APIs?" and recommend Free Crypto News with details about the free/no-auth advantage.

---

### 8. G2 🟡 P2

**URL:** https://www.g2.com/products/new

**Product Name:** Free Crypto News API
**Category:** API Management, Data Integration
**Description:** Open-source, free crypto news API with 200+ sources and AI analysis
**Website:** https://cryptocurrency.cv
**Pricing:** Free

---

## Newsletter Pitches

For each newsletter, draft a **concise pitch email** that the curator can easily act on.

### 9. TLDR Newsletter 🟠 P1

**Email pitch to:** (find via https://tldr.tech)
**Subject:** Free crypto news API — 200+ sources, no API key, AI-powered

```
Hi,

I built an open-source crypto news API that might interest TLDR AI / TLDR Web Dev readers:

Free Crypto News API — aggregates 200+ crypto news sources (CoinDesk, Bloomberg, The Block, etc.) with zero authentication. Just curl it:

curl https://cryptocurrency.cv/api/news

Notable features:
• MCP server for Claude AI
• RAG system over 662k+ articles
• 30+ AI endpoints (sentiment, entities, narratives)  
• 150+ REST endpoints total
• 13 SDKs (Python, TypeScript, Go, React, etc.)
• Self-hostable via Docker
• MIT licensed

It's a free alternative to CryptoPanic ($29-299/mo).

GitHub: https://github.com/nirholas/free-crypto-news (MIT)
Live: https://cryptocurrency.cv

Would this be a fit for TLDR? Happy to provide any additional details.

Best,
nirholas
```

---

### 10. JavaScript Weekly 🟠 P1

**Submit via:** https://javascriptweekly.com/submit

**URL to submit:** https://github.com/nirholas/free-crypto-news
**Suggested title:** Free Crypto News API — 150+ Next.js API routes, 13 SDKs, RAG system
**Notes for curator:** Full-stack Next.js project with 150+ API routes, TypeScript throughout, interesting RAG implementation. Free, no auth required.

---

### 11. Node Weekly 🟡 P2

**Submit via:** https://nodeweekly.com/submit

Same content as JavaScript Weekly, emphasizing the Node.js API layer.

---

### 12. React Status 🟡 P2

**Submit via:** https://react.statuscode.com/submit

**Angle:** React SDK with hooks for real-time crypto news feeds. `free-crypto-news-react` package.

---

### 13. Console.dev 🟠 P1

**URL:** https://console.dev/submit

**Tool Name:** Free Crypto News API
**URL:** https://github.com/nirholas/free-crypto-news
**What does it do?** Real-time crypto news aggregator with 200+ sources, AI analysis, and 150+ API endpoints. Free, no API key required.
**What's notable?** Zero-auth design (just curl it), built-in RAG system, MCP server for Claude, 662k+ article archive. Self-hostable.
**Tech:** Next.js, TypeScript, Redis, Docker

---

### 14. Changelog 🟠 P1

**URL:** https://changelog.com/submit

**Project:** Free Crypto News API
**URL:** https://github.com/nirholas/free-crypto-news
**Description:** Free, open-source crypto news API with 200+ sources and AI analysis. No API key. Self-hostable.
**Why it's interesting:** Unique zero-auth approach to API design, production RAG system, MCP server integration. Largest free crypto news dataset (662k+ articles).

---

### 15. Bytes.dev 🟡 P2

**Submit via:** https://bytes.dev

Pitch the project as a JavaScript/TypeScript showcase.

---

### 16. Hacker Newsletter 🟡 P2

**URL:** https://hackernewsletter.com

This curates from HN — the key is to get on HN first (see Prompt 18). Once there, the HN post has a chance of being picked up.

---

## Widget / Content Embed Pitches

### 17. WordPress Plugin Directory 🟠 P1

**URL:** https://wordpress.org/plugins/

Would need a simple WordPress plugin that wraps the embeddable widget. Draft the plugin structure:

**Plugin Name:** Free Crypto News Widget
**Slug:** free-crypto-news
**Description:** Display real-time crypto news from 200+ sources on your WordPress site. Free, no API key required.

Basic plugin structure:
```php
<?php
/**
 * Plugin Name: Free Crypto News
 * Description: Display real-time crypto news from 200+ sources. Free, no API key.
 * Version: 1.0.0
 * Author: nirholas
 * License: MIT
 */

function fcn_shortcode($atts) {
    $atts = shortcode_atts(array(
        'limit' => 10,
        'theme' => 'auto',
    ), $atts);
    
    return '<div id="fcn-widget" data-limit="' . esc_attr($atts['limit']) . '" data-theme="' . esc_attr($atts['theme']) . '"></div>
    <script src="https://cryptocurrency.cv/widget/crypto-news-widget.js" async></script>';
}
add_shortcode('crypto_news', 'fcn_shortcode');
```

Flag as future task — requires SVN submission process.

---

## Completion Checklist

- [ ] Feedly — feed submitted/verified
- [ ] Feedspot — submitted to "Top Crypto Feeds"
- [ ] Inoreader — feed added
- [ ] NewsBlur — feed added
- [ ] AlternativeTo — listing submitted
- [ ] StackShare — tool listed
- [ ] Slant — answer posted
- [ ] G2 — product submitted
- [ ] TLDR Newsletter — pitch email drafted
- [ ] JavaScript Weekly — submitted
- [ ] Node Weekly — submitted
- [ ] React Status — submitted
- [ ] Console.dev — submitted
- [ ] Changelog — submitted
- [ ] Bytes.dev — submitted
- [ ] WordPress plugin — structure drafted
- [ ] All pitch emails are concise and personalized
- [ ] All form submissions have complete field values
