# Claude MCP Server

Use Free Crypto News with Claude Desktop!

## Installation

### Quick Setup

1. Clone the repo:
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

## Available Tools

| Tool | Description |
|------|-------------|
| `get_crypto_news` | Latest news from all 7 sources |
| `search_crypto_news` | Search by keywords |
| `get_defi_news` | DeFi-specific news |
| `get_bitcoin_news` | Bitcoin-specific news |
| `get_breaking_news` | News from last 2 hours |

## Example Prompts

- "Get me the latest crypto news"
- "Search for news about Ethereum ETF"
- "What's happening in DeFi?"
- "Any breaking crypto news?"
- "Bitcoin news from today"

## No API Key Required!

This MCP server calls the free API at `free-crypto-news.vercel.app` - no authentication needed.
