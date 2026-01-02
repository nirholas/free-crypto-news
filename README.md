# 🆓 Free Crypto News API

**100% FREE. No API keys. No rate limits. No BS.**

Get real-time crypto news from 7 major sources with one API call.

```bash
curl https://free-crypto-news.vercel.app/api/news
```

That's it. It just works.

---

## Why?

Every crypto news API charges $30-300/month and requires API keys.

We said no.

| | Free Crypto News | CryptoPanic | Others |
|---|---|---|---|
| **Price** | 🆓 Free forever | $29-299/mo | Paid |
| **API Key** | ❌ None needed | Required | Required |
| **Rate Limit** | Unlimited* | 100-1000/day | Limited |
| **Sources** | 7 | 1 | Varies |
| **Self-host** | ✅ One click | No | No |

*Fair use. Don't hammer it.

---

## Sources

We aggregate from **7 trusted outlets**:

- 🟠 **CoinDesk** — General crypto news
- 🔵 **The Block** — Institutional & research
- 🟢 **Decrypt** — Web3 & culture
- 🟡 **CoinTelegraph** — Global crypto news
- 🟤 **Bitcoin Magazine** — Bitcoin maximalist
- 🟣 **Blockworks** — DeFi & institutions
- 🔴 **The Defiant** — DeFi native

---

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/news` | Latest from all sources |
| `/api/search?q=bitcoin` | Search by keywords |
| `/api/defi` | DeFi-specific news |
| `/api/bitcoin` | Bitcoin-specific news |
| `/api/breaking` | Last 2 hours only |
| `/api/sources` | List all sources |

**Base URL:** `https://free-crypto-news.vercel.app`

---

## Response Format

```json
{
  "articles": [
    {
      "title": "Bitcoin Hits New ATH",
      "link": "https://coindesk.com/...",
      "description": "Bitcoin surpassed...",
      "pubDate": "2025-01-02T12:00:00Z",
      "source": "CoinDesk",
      "timeAgo": "2h ago"
    }
  ],
  "totalCount": 150,
  "fetchedAt": "2025-01-02T14:30:00Z"
}
```

---

# Integration Examples

Pick your platform. Copy the code. Ship it.

---

## 🐍 Python

**Zero dependencies.** Just copy the file.

```bash
curl -O https://raw.githubusercontent.com/nirholas/free-crypto-news/main/sdk/python/crypto_news.py
```

```python
from crypto_news import CryptoNews

news = CryptoNews()

# Get latest news
for article in news.get_latest(5):
    print(f"📰 {article['title']}")
    print(f"   {article['source']} • {article['timeAgo']}")
    print(f"   {article['link']}\n")

# Search for topics
eth_news = news.search("ethereum,etf", limit=5)

# DeFi news
defi = news.get_defi(5)

# Bitcoin news
btc = news.get_bitcoin(5)

# Breaking (last 2 hours)
breaking = news.get_breaking(5)
```

**One-liner:**
```python
import urllib.request, json
news = json.loads(urllib.request.urlopen("https://free-crypto-news.vercel.app/api/news?limit=5").read())
print(news["articles"][0]["title"])
```

---

## 🟨 JavaScript / TypeScript

**Works in Node.js and browsers.**

```bash
curl -O https://raw.githubusercontent.com/nirholas/free-crypto-news/main/sdk/javascript/crypto-news.js
```

```javascript
import { CryptoNews } from './crypto-news.js';

const news = new CryptoNews();

// Get latest
const articles = await news.getLatest(5);
articles.forEach(a => console.log(`${a.title} - ${a.source}`));

// Search
const eth = await news.search("ethereum");

// DeFi / Bitcoin / Breaking
const defi = await news.getDefi(5);
const btc = await news.getBitcoin(5);
const breaking = await news.getBreaking(5);
```

**One-liner:**
```javascript
const news = await fetch("https://free-crypto-news.vercel.app/api/news?limit=5").then(r => r.json());
console.log(news.articles[0].title);
```

---

## 🤖 ChatGPT (Custom GPT)

Build a crypto news GPT in 2 minutes.

1. Go to [chat.openai.com](https://chat.openai.com) → Create GPT
2. Click **Configure** → **Actions** → **Create new action**
3. Paste this OpenAPI schema:

```yaml
openapi: 3.1.0
info:
  title: Free Crypto News
  version: 1.0.0
servers:
  - url: https://free-crypto-news.vercel.app
paths:
  /api/news:
    get:
      operationId: getNews
      summary: Get latest crypto news
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
  /api/search:
    get:
      operationId: searchNews
      summary: Search crypto news
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
  /api/defi:
    get:
      operationId: getDefiNews
      summary: Get DeFi news
  /api/bitcoin:
    get:
      operationId: getBitcoinNews
      summary: Get Bitcoin news
  /api/breaking:
    get:
      operationId: getBreakingNews
      summary: Get breaking news
```

4. No authentication needed
5. Save and test: *"What's the latest crypto news?"*

Full schema: [`chatgpt/openapi.yaml`](chatgpt/openapi.yaml)

---

## 🔮 Claude Desktop (MCP)

Add crypto news to Claude Desktop.

**1. Clone & install:**
```bash
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news/mcp && npm install
```

**2. Add to config**

**Edit** `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "crypto-news": {
      "command": "node",
      "args": ["/path/to/free-crypto-news/mcp/index.js"]
    }
  }
}
```

**Restart Claude.** Ask: *"Get me the latest crypto news"*

Or run locally:
```bash
cd mcp && npm install && node index.js
```

Full code: [`mcp/`](mcp/)

---

## 🦜 LangChain

```python
from langchain.tools import tool
import requests

@tool
def get_crypto_news(limit: int = 5) -> str:
    """Get latest cryptocurrency news from 7 sources."""
    r = requests.get(f"https://free-crypto-news.vercel.app/api/news?limit={limit}")
    return "\n".join([f"• {a['title']} ({a['source']})" for a in r.json()["articles"]])

@tool
def search_crypto_news(query: str) -> str:
    """Search crypto news by keyword."""
    r = requests.get(f"https://free-crypto-news.vercel.app/api/search?q={query}")
    return "\n".join([f"• {a['title']}" for a in r.json()["articles"]])

# Use in your agent
tools = [get_crypto_news, search_crypto_news]
```

Full example: [`examples/langchain-tool.py`](examples/langchain-tool.py)

---

## 🎮 Discord Bot

```javascript
const { Client, EmbedBuilder } = require('discord.js');

client.on('messageCreate', async (msg) => {
  if (msg.content === '!news') {
    const { articles } = await fetch('https://free-crypto-news.vercel.app/api/breaking?limit=5').then(r => r.json());
    
    const embed = new EmbedBuilder()
      .setTitle('🚨 Breaking Crypto News')
      .setColor(0x00ff00);
    
    articles.forEach(a => embed.addFields({ 
      name: a.source, 
      value: `[${a.title}](${a.link})` 
    }));
    
    msg.channel.send({ embeds: [embed] });
  }
});
```

Full bot: [`examples/discord-bot.js`](examples/discord-bot.js)

---

## 🤖 Telegram Bot

```python
from telegram import Update
from telegram.ext import Application, CommandHandler
import aiohttp

async def news(update: Update, context):
    async with aiohttp.ClientSession() as session:
        async with session.get('https://free-crypto-news.vercel.app/api/news?limit=5') as r:
            data = await r.json()
    
    msg = "📰 *Latest Crypto News*\n\n"
    for a in data['articles']:
        msg += f"• [{a['title']}]({a['link']})\n"
    
    await update.message.reply_text(msg, parse_mode='Markdown')

app = Application.builder().token("YOUR_TOKEN").build()
app.add_handler(CommandHandler("news", news))
app.run_polling()
```

Full bot: [`examples/telegram-bot.py`](examples/telegram-bot.py)

---

## 🌐 HTML Widget

Embed on any website:

```html
<script>
async function loadNews() {
  const { articles } = await fetch('https://free-crypto-news.vercel.app/api/news?limit=5').then(r => r.json());
  document.getElementById('news').innerHTML = articles.map(a => 
    `<div><a href="${a.link}">${a.title}</a> <small>${a.source}</small></div>`
  ).join('');
}
loadNews();
</script>
<div id="news">Loading...</div>
```

Full styled widget: [`widget/crypto-news-widget.html`](widget/crypto-news-widget.html)

---

## 🖥️ cURL / Terminal

```bash
# Latest news
curl -s https://free-crypto-news.vercel.app/api/news | jq '.articles[:3]'

# Search
curl -s "https://free-crypto-news.vercel.app/api/search?q=bitcoin,etf" | jq

# DeFi news
curl -s https://free-crypto-news.vercel.app/api/defi | jq

# Pretty print titles
curl -s https://free-crypto-news.vercel.app/api/news | jq -r '.articles[] | "📰 \(.title) (\(.source))"'
```

---

# Self-Hosting

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnirholas%2Ffree-crypto-news)

## Manual

```bash
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news
pnpm install
pnpm dev
```

Open http://localhost:3000/api/news

---

# Tech Stack

- **Runtime:** Next.js 14 Edge Functions
- **Hosting:** Vercel free tier
- **Data:** Direct RSS parsing (no database)
- **Cache:** 5-minute edge cache

---

# Contributing

PRs welcome! Ideas:

- [ ] More news sources
- [ ] Sentiment analysis
- [ ] Topic classification
- [ ] WebSocket real-time feed
- [ ] Go / Rust / Ruby SDKs

---

# License

MIT © 2025 [nich](https://github.com/nirholas)

---

<p align="center">
  <b>Stop paying for crypto news APIs.</b><br>
  <sub>Made with 💜 for the community</sub>
</p>
