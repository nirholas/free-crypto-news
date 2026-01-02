# Claude MCP Server

Use Free Crypto News with Claude Desktop!

## Installation

### Option 1: npx (Recommended)
Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "crypto-news": {
      "command": "npx",
      "args": ["-y", "@nicholasrq/free-crypto-news-mcp"]
    }
  }
}
```

### Option 2: Local Install
```bash
cd mcp
npm install
```

Then add to Claude Desktop config:
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

## No API Key Required!

This MCP server calls the free API at `free-crypto-news.vercel.app` - no authentication needed.
