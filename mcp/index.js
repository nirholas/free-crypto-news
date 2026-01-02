#!/usr/bin/env node
/**
 * Free Crypto News MCP Server
 * 
 * Use with Claude Desktop or any MCP-compatible client.
 * 100% FREE - no API keys required!
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE = 'https://free-crypto-news.vercel.app';

// Create server
const server = new Server(
  {
    name: 'free-crypto-news',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools = [
  {
    name: 'get_crypto_news',
    description: 'Get latest crypto news from 7 major sources (CoinDesk, The Block, Decrypt, CoinTelegraph, Bitcoin Magazine, Blockworks, The Defiant)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum articles to return (1-50)',
          default: 10,
        },
        source: {
          type: 'string',
          description: 'Filter by source: coindesk, theblock, decrypt, cointelegraph, bitcoinmagazine, blockworks, defiant',
        },
      },
    },
  },
  {
    name: 'search_crypto_news',
    description: 'Search crypto news by keywords across all sources',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Comma-separated keywords to search for',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (1-30)',
          default: 10,
        },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'get_defi_news',
    description: 'Get DeFi-specific news (yield farming, DEXs, lending, protocols)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum articles (1-30)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_bitcoin_news',
    description: 'Get Bitcoin-specific news (BTC, Lightning Network, miners, ordinals)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum articles (1-30)',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_breaking_news',
    description: 'Get breaking crypto news from the last 2 hours',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum articles (1-20)',
          default: 5,
        },
      },
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let url;
    switch (name) {
      case 'get_crypto_news':
        url = `${API_BASE}/api/news?limit=${args?.limit || 10}${args?.source ? `&source=${args.source}` : ''}`;
        break;
      case 'search_crypto_news':
        url = `${API_BASE}/api/search?q=${encodeURIComponent(args?.keywords || '')}&limit=${args?.limit || 10}`;
        break;
      case 'get_defi_news':
        url = `${API_BASE}/api/defi?limit=${args?.limit || 10}`;
        break;
      case 'get_bitcoin_news':
        url = `${API_BASE}/api/bitcoin?limit=${args?.limit || 10}`;
        break;
      case 'get_breaking_news':
        url = `${API_BASE}/api/breaking?limit=${args?.limit || 5}`;
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const response = await fetch(url);
    const data = await response.json();

    // Format nicely for Claude
    const articles = data.articles || [];
    const formatted = articles.map((a, i) => 
      `${i + 1}. **${a.title}**\n   🔗 ${a.link}\n   📰 ${a.source} • ${a.timeAgo}`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.totalCount} articles from ${data.sources?.join(', ') || 'various sources'}:\n\n${formatted}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Free Crypto News MCP server running');
}

main().catch(console.error);
