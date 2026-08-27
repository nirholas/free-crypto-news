# MCP Server for Crypto News

Use Free Crypto News with Claude Desktop **or** ChatGPT Developer Mode!

## 🚀 Quick Start

**Live MCP Server:** `https://plugins.support/sse` (deployed on Railway)

### Option 1: Claude Desktop (stdio)

1. Clone and install:
```bash
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news/mcp
npm install
```

2. Add to Claude Desktop config:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

3. Restart Claude Desktop

4. Ask: *"Get me the latest crypto news"*

### Option 2: ChatGPT Developer Mode (HTTP/SSE)

**Prerequisites:**
- ChatGPT Pro, Plus, Business, Enterprise, or Education account
- Developer Mode enabled in [Settings → Apps → Advanced settings](https://chatgpt.com/#settings/Connectors/Advanced)

**Setup:**

1. Clone and install:
```bash
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news/mcp
npm install
```

2. Start the HTTP/SSE server:
```bash
npm run start:http
# or with custom port:
PORT=3001 npm run start:http
```

Server will start at `http://localhost:3001`

3. In ChatGPT, create a new app:
   - Go to [ChatGPT Apps settings](https://chatgpt.com/#settings/Connectors)
   - Click **"Create app"** (only visible in Developer Mode)
   - Configure the app:
     - **Name:** Free Crypto News
     - **Protocol:** SSE
     - **Endpoint:** `https://plugins.support/sse` (or run locally)
     - **Authentication:** No Authentication

4. Enable the app in a conversation:
   - Start a new chat
   - Select **Developer mode** from the Plus menu
   - Choose **Free Crypto News** app
   - Ask: *"Use the Free Crypto News app to get the latest crypto headlines"*

**Production Deployment for ChatGPT:**

Deploy the HTTP server to any cloud provider:

```bash
# Deploy to Railway, Render, Fly.io, etc.
# Set environment variable:
# API_BASE=https://cryptocurrency.cv

# The server will be accessible at your deployment URL
# Use that URL + /sse as your ChatGPT app endpoint
```

**Example deployment on Railway:**
```bash
railway up
# Get your deployment URL, e.g., https://your-app.railway.app
# In ChatGPT app settings, use: https://your-app.railway.app/sse
```

## 📋 Available Tools (49 Total)

All tools are marked as **read-only** for ChatGPT Developer Mode (no confirmation prompts needed).

### 📰 News Tools

| Tool | Description |
|------|-------------|
| `get_crypto_news` | Latest news from all 130+ sources |
| `search_crypto_news` | Search by keywords |
| `get_defi_news` | DeFi-specific news |
| `get_bitcoin_news` | Bitcoin-specific news |
| `get_ethereum_news` | Ethereum-specific news |
| `get_altcoin_news` | Altcoin news (non-BTC/ETH) |
| `get_nft_news` | NFT collections, drops, art |
| `get_breaking_news` | News from last 2 hours |
| `get_regulatory_news` | SEC, CFTC, global regulation news |
| `get_news_sources` | List all available sources |
| `get_portfolio_news` | News for specific coins with prices |
| `get_rss_feeds` | Get RSS feed URLs for categories |

### 📊 Market Data Tools

| Tool | Description |
|------|-------------|
| `get_crypto_prices` | Live prices for 100+ coins |
| `get_market_data` | Prices, market cap, volume |
| `get_market_overview` | Total market cap, BTC dominance, gainers/losers |
| `get_fear_greed_index` | Fear & Greed sentiment (0-100) |
| `get_gas_prices` | Ethereum gas fees |
| `compare_coins` | Side-by-side coin comparison |
| `get_stablecoin_data` | Stablecoin market caps and peg status |
| `get_exchanges` | Exchange volumes and trust scores |

### 💹 Trading & Derivatives Tools

| Tool | Description |
|------|-------------|
| `get_funding_rates` | Perpetual futures funding rates |
| `get_liquidations` | Exchange liquidation data |
| `get_options_data` | Options OI, max pain, put/call ratio |
| `get_arbitrage` | Cross-exchange arbitrage opportunities |
| `get_orderbook` | Order book depth and liquidity |

### 🐋 On-Chain Tools

| Tool | Description |
|------|-------------|
| `get_whale_alerts` | Large transaction alerts |
| `get_exchange_flows` | Exchange inflow/outflow |
| `get_token_unlocks` | Upcoming token unlock schedules |

### 🔗 DeFi & Layer 2 Tools

| Tool | Description |
|------|-------------|
| `get_defi_yields` | Top DeFi yield opportunities |
| `get_l2_data` | Layer 2 network TVL and stats |

### 🎁 Discovery Tools

| Tool | Description |
|------|-------------|
| `get_airdrops` | Upcoming and active airdrops |
| `get_events_calendar` | Conferences, forks, launches |
| `get_predictions` | AI price predictions and forecasts |

### 🤖 AI & Analytics Tools

| Tool | Description |
|------|-------------|
| `get_ai_sentiment` | AI sentiment for specific asset |
| `get_ai_summary` | AI-generated news summary |
| `get_ai_market_brief` | AI market overview |
| `get_trending_topics` | Trending topics with sentiment |
| `get_crypto_stats` | News analytics & statistics |
| `analyze_news` | Topic classification & sentiment |
| `get_social_sentiment` | Twitter/Reddit/Telegram sentiment |
| `find_original_sources` | Trace news origins |
| `ask_crypto_question` | Natural language Q&A |

### 🏛️ Macro & Reference Tools

| Tool | Description |
|------|-------------|
| `get_macro_data` | Macroeconomic indicators & correlations |
| `get_glossary` | Crypto term definitions |

### 📚 Archive & System Tools

| Tool | Description |
|------|-------------|
| `get_archive` | Query historical news |
| `get_archive_stats` | Archive statistics |
| `get_api_health` | API & feed health status |
| `get_alerts` | Active price/news alerts |

## 💬 Example Prompts

### Claude Desktop

**News & Search:**
- "Get me the latest crypto news"
- "Search for news about Ethereum ETF"
- "What's happening in DeFi?"
- "Any breaking crypto news?"
- "Show me regulatory news from the SEC"

**Market Data:**
- "What's the Bitcoin price right now?"
- "Give me a market overview"
- "Check the Fear & Greed Index"
- "What are the current Ethereum gas prices?"
- "Compare Bitcoin, Ethereum, and Solana"
- "Show me the funding rates for BTC"

**On-Chain & Whales:**
- "Any recent whale alerts over $10M?"
- "Show me exchange flows for Bitcoin"
- "What token unlocks are coming up?"
- "Get the latest liquidation data"

**DeFi, Yields & L2:**
- "What are the top DeFi yields on Ethereum?"
- "Show me staking opportunities on Solana"
- "How are Layer 2 networks doing?"
- "DeFi news from this week"

**Trading & Analytics:**
- "Show me arbitrage opportunities for ETH"
- "What does the order book look like for BTC?"
- "Give me an AI market brief"
- "Analyze recent news for bullish signals"

**Predictions & Discovery:**
- "What's the price prediction for SOL?"
- "Any upcoming crypto airdrops?"
- "What events are coming up this month?"

**Macro & Reference:**
- "How do macro factors affect crypto right now?"
- "What does 'impermanent loss' mean?"
- "What is the DXY index doing?"

**Portfolio & Historical:**
- "Get news for BTC, ETH, SOL with prices"
- "Search the archive for SEC news from last month"
- "Find the original source of this Binance story"

**Q&A:**
- "What happened to Bitcoin this week?"
- "Why is Ethereum dropping today?"
- "Summarize the crypto market in 2025"

### ChatGPT Developer Mode

For ChatGPT, be explicit about using the app and tool names:

**Market Analysis:**
- "Use `get_crypto_prices` with coin='bitcoin,ethereum' to show me current prices"
- "Call `get_market_overview` for a full market summary"
- "Use `get_fear_greed_index` to check market sentiment"
- "Use `get_funding_rates` with symbol='BTCUSDT' to analyze derivatives positioning"

**Whale Tracking:**
- "Use `get_whale_alerts` with min_usd=10000000 to find big moves"
- "Call `get_exchange_flows` for Bitcoin to see accumulation patterns"
- "Use `get_liquidations` to check how much got rekt today"

**News & Portfolio:**
- "Use `get_portfolio_news` with coins='btc,eth,sol' to get news for my holdings"
- "Call `get_regulatory_news` with region='us' for SEC-related news"
- "Use `get_breaking_news` only (no other tools) to show urgent updates"

**Discovery & Reference:**
- "Use `get_airdrops` to find upcoming token airdrops"
- "Call `get_l2_data` to see Layer 2 network stats"
- "Use `get_glossary` with term='staking' to explain what it means"
- "Use `ask_crypto_question` with question='What happened to Bitcoin this week?'"

**Best Practices for ChatGPT:**
- Always mention the app name: "Free Crypto News"
- Specify the exact tool name in backticks
- Add "Do not use built-in tools" if you want only MCP results
- Use explicit parameters: `{ "coins": "btc,eth", "limit": 5 }`

## ✨ Features

- **100% Free** - No API keys required
- **Dual Transport** - Works with both Claude (stdio) and ChatGPT (HTTP/SSE)
- **49 Tools** - The most comprehensive crypto MCP server
- **Read-Only** - All tools marked as safe for ChatGPT (no confirmation prompts)
- **Real-Time** - Breaking news, live prices, whale alerts
- **Market Data** - Prices, fear/greed, gas, funding rates, options
- **Trading** - Arbitrage opportunities, order books, liquidations
- **On-Chain** - Exchange flows, whale alerts, token unlocks
- **AI-Powered** - Sentiment analysis, summaries, market briefs, Q&A
- **Social Tracking** - Twitter, Reddit, Telegram sentiment
- **Historical Archive** - Query past news by date/source
- **Portfolio Tracking** - Get news for specific coins with prices
- **Original Sources** - Trace where news actually originated
- **Events Calendar** - Conferences, hard forks, launches
- **Predictions** - AI price predictions and analyst forecasts
- **Airdrops** - Upcoming and active token airdrops
- **Layer 2** - L2 network TVL, fees, and transaction data
- **Macro Data** - Economic indicators and crypto correlations
- **Glossary** - Crypto term definitions and explanations
- **Exchange Data** - Volume, trust scores, and comparisons

## 🛠️ Technical Details

**Transports Supported:**
- `stdio` - For Claude Desktop (default)
- `HTTP/SSE` - For ChatGPT Developer Mode and remote clients

**API Endpoints (HTTP mode):**
- `GET /health` - Health check
- `GET /sse` - Server-Sent Events endpoint for MCP
- `POST /message` - Message endpoint (used with SSE)
- `POST /mcp` - Single request/response endpoint

**Environment Variables:**
- `PORT` - HTTP server port (default: 3001)
- `API_BASE` - Backend API URL (default: https://cryptocurrency.cv)

## No API Key Required!

This MCP server calls the free API at `cryptocurrency.cv` - no authentication needed.

## 📚 Related

- **Main API:** https://cryptocurrency.cv
- **OpenAPI Docs:** https://cryptocurrency.cv/api/docs
- **GitHub:** https://github.com/nirholas/free-crypto-news
