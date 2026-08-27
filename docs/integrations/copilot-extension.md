# GitHub Copilot Extension

Get real-time crypto news, market sentiment, and whale alerts directly inside **GitHub Copilot Chat** — no browser, no tab-switching.

## Overview

The `@cryptonews` Copilot agent is a GitHub Copilot Chat extension that connects Copilot to the Free Crypto News API. Ask it anything about crypto markets in plain English, or use slash commands for quick structured output.

## Installation

1. Install the extension from the VS Code Marketplace (search **Crypto News for GitHub Copilot**)
2. Ensure GitHub Copilot Chat is enabled in your workspace
3. Type `@cryptonews` in any Copilot Chat window to activate

## Commands

| Command | What it returns |
|---------|-----------------|
| `@cryptonews /breaking` | Latest breaking headlines across all sources |
| `@cryptonews /market` | Bull/bear sentiment summary with key drivers |
| `@cryptonews /prices` | Live prices for BTC, ETH, and top altcoins |
| `@cryptonews /feargreed` | Fear & Greed Index with historical context |
| `@cryptonews /whale` | Large on-chain transaction alerts |
| `@cryptonews /trending` | Trending topics and narratives in crypto |

## Natural Language Queries

You can also ask free-form questions:

```
@cryptonews what's happening with Bitcoin today?
@cryptonews latest Ethereum Layer 2 news
@cryptonews any DeFi exploits this week?
@cryptonews summarise the top 5 stories from the last hour
```

## Source Code

The extension source lives in [`copilot-extension/`](https://github.com/nirholas/cryptocurrency.cv/tree/main/copilot-extension) and is built with TypeScript.

```
copilot-extension/
├── src/
│   └── index.ts      # Agent handler — routes commands to the API
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

The extension uses `https://cryptocurrency.cv` as the API host by default — no API key required.

## Related

- [MCP Server](mcp.md) — Claude / AI assistant integration
- [ChatGPT Plugin](chatgpt.md) — ChatGPT integration
- [AI Features](../AI-FEATURES.md) — Full AI capability overview
