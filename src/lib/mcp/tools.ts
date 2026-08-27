/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * MCP tool registry shared by the hosted Streamable-HTTP endpoint
 * (`src/app/api/mcp/route.ts`) and the standalone stdio server in `mcp/`
 * (`mcp/tools.js` is a plain-JS mirror of this file; keep them in sync).
 *
 * Every tool is a thin, declarative mapping onto one public REST endpoint of
 * cryptocurrency.cv. Nothing here bypasses auth or the x402 paywall: paid
 * endpoints answer anonymous callers with HTTP 402 and the tool surfaces that
 * payload as a readable "Payment required" message.
 *
 * @module lib/mcp/tools
 */

export const MCP_SERVER_NAME = 'free-crypto-news';
export const MCP_SERVER_VERSION = '3.0.0';
export const DEFAULT_API_BASE = 'https://cryptocurrency.cv';

/** Tool output is capped so one call cannot flood a model's context window. */
export const MAX_RESULT_CHARS = 60_000;

export type ToolParamType = 'string' | 'number' | 'boolean';

export interface ToolParam {
  type: ToolParamType;
  description: string;
  default?: string | number | boolean;
  enum?: readonly string[];
}

export interface ToolDefinition {
  /** Unique MCP tool name (snake_case). */
  name: string;
  /** Model-facing description. Paid endpoints mention x402. */
  description: string;
  /** REST path on the API origin. Always starts with `/api/`. */
  path: string;
  method?: 'GET' | 'POST';
  /** Input parameters. Keys are the MCP argument names. */
  params: Record<string, ToolParam>;
  required?: readonly string[];
  /** Renames an argument when it becomes a query-string key. */
  query?: Record<string, string>;
  /** Query pairs always appended regardless of arguments. */
  fixedQuery?: Record<string, string>;
  /** Send arguments as a JSON body (POST) instead of the query string. */
  body?: boolean;
  /** True when anonymous callers get HTTP 402 from the x402 paywall. */
  x402?: boolean;
  /** Endpoints that answer with non-JSON bodies (RSS XML). */
  responseType?: 'json' | 'text';
}

const limit = (max: number, def = 10): ToolParam => ({
  type: 'number',
  description: `Maximum items to return (1-${max})`,
  default: def,
});

const X402 = ' Paid endpoint: anonymous callers receive an x402 payment-required response with the price and payment instructions.';

export const MCP_TOOLS: readonly ToolDefinition[] = [
  {
    name: 'get_crypto_news',
    description:
      'Get the latest crypto news from 300+ sources including CoinDesk, The Block, Decrypt, Bloomberg and Reuters. Use for general crypto news or headlines. Free.',
    path: '/api/news',
    params: {
      limit: limit(50),
      source: {
        type: 'string',
        description: 'Filter by source id: coindesk, theblock, decrypt, cointelegraph, bitcoinmagazine, blockworks, defiant',
      },
      category: {
        type: 'string',
        description: 'Filter by category',
        enum: [
          'general', 'bitcoin', 'ethereum', 'defi', 'nft', 'research', 'institutional', 'etf',
          'derivatives', 'onchain', 'macro', 'quant', 'journalism', 'asia', 'tradfi', 'mainstream',
          'mining', 'gaming', 'altl1', 'stablecoin', 'geopolitical', 'security', 'developer',
          'layer2', 'solana', 'trading',
        ],
      },
    },
  },
  {
    name: 'search_crypto_news',
    description:
      'Full-text search of crypto news across all sources. Use when the user wants news about a specific topic, coin, or event.' + X402,
    path: '/api/search',
    params: {
      keywords: { type: 'string', description: 'Search keywords, comma-separated (e.g. "ethereum,ETF" or "SEC,regulation")' },
      limit: limit(30),
    },
    required: ['keywords'],
    query: { keywords: 'q' },
    x402: true,
  },
  {
    name: 'get_defi_news',
    description: 'DeFi-specific news: yield farming, DEXs, lending, protocols.' + X402,
    path: '/api/defi',
    params: { limit: limit(30) },
    x402: true,
  },
  {
    name: 'get_bitcoin_news',
    description: 'Bitcoin-specific news: BTC, Lightning Network, miners, ordinals.' + X402,
    path: '/api/bitcoin',
    params: { limit: limit(30) },
    x402: true,
  },
  {
    name: 'get_ethereum_news',
    description: 'Ethereum-specific news: ETH, L2s, EIPs, staking, dApps. Free.',
    path: '/api/news',
    params: { limit: limit(30) },
    fixedQuery: { category: 'ethereum' },
  },
  {
    name: 'get_altcoin_news',
    description: 'News about alternative Layer-1 chains and altcoins (non-BTC/ETH ecosystems). Free.',
    path: '/api/news',
    params: { limit: limit(30) },
    fixedQuery: { category: 'altl1' },
  },
  {
    name: 'get_breaking_news',
    description: 'Breaking crypto news from the last few hours. Use for the most recent or urgent headlines.' + X402,
    path: '/api/breaking',
    params: { limit: limit(20, 5) },
    x402: true,
  },
  {
    name: 'get_crypto_prices',
    description:
      'Live cryptocurrency prices in USD with 24h change. Accepts CoinGecko coin ids. Use when the user asks about specific coin prices. Free.',
    path: '/api/prices',
    params: {
      coins: {
        type: 'string',
        description: 'Comma-separated CoinGecko coin ids (e.g. "bitcoin,ethereum,solana")',
        default: 'bitcoin,ethereum,solana',
      },
    },
  },
  {
    name: 'get_market_coins',
    description: 'Top coins ranked by market cap with price, volume, supply and 24h change. Use for a broad market snapshot. Free.',
    path: '/api/market/coins',
    params: {},
  },
  {
    name: 'get_market_overview',
    description: 'Global crypto market overview: total market cap, BTC dominance, volume and active coins.' + X402,
    path: '/api/global',
    params: {},
    x402: true,
  },
  {
    name: 'compare_coins',
    description: 'Compare two or more coins side by side: price, market cap, volume, 24h change. Free.',
    path: '/api/market/compare',
    params: {
      coins: { type: 'string', description: 'Comma-separated CoinGecko coin ids to compare (e.g. "bitcoin,ethereum,solana"), max 25' },
    },
    required: ['coins'],
    query: { coins: 'ids' },
  },
  {
    name: 'get_fear_greed_index',
    description:
      'Crypto Fear & Greed Index (0 = Extreme Fear, 100 = Extreme Greed) with history. Use when the user asks about market sentiment. Free.',
    path: '/api/fear-greed',
    params: { days: { type: 'number', description: 'Days of history (1-30)', default: 7 } },
  },
  {
    name: 'get_gas_prices',
    description: 'Current Ethereum gas prices (slow, standard, fast) in Gwei and network congestion.' + X402,
    path: '/api/gas',
    params: {},
    x402: true,
  },
  {
    name: 'get_regulatory_news',
    description: 'Regulatory and legal crypto news: SEC, CFTC, global regulation, lawsuits, compliance.' + X402,
    path: '/api/regulatory',
    params: {
      limit: limit(30),
      region: { type: 'string', description: 'Filter by region', enum: ['us', 'eu', 'asia', 'global'] },
    },
    x402: true,
  },
  {
    name: 'get_whale_alerts',
    description: 'Large on-chain transactions (whale movements) between wallets and exchanges.' + X402,
    path: '/api/whales',
    params: {
      limit: limit(50),
      min_usd: { type: 'number', description: 'Minimum transaction value in USD', default: 1_000_000 },
      coin: { type: 'string', description: 'Filter by coin symbol (btc, eth, usdt, ...)' },
    },
    x402: true,
  },
  {
    name: 'get_funding_rates',
    description: 'Perpetual futures funding rates across exchanges. Positive = longs pay shorts.' + X402,
    path: '/api/funding',
    params: { symbol: { type: 'string', description: 'Trading pair (e.g. BTCUSDT, ETHUSDT)', default: 'BTCUSDT' } },
    x402: true,
  },
  {
    name: 'get_liquidations',
    description: 'Recent forced liquidations across crypto exchanges.' + X402,
    path: '/api/liquidations',
    params: { hours: { type: 'number', description: 'Time window in hours (1-24)', default: 24 } },
    x402: true,
  },
  {
    name: 'get_defi_yields',
    description: 'Top DeFi yield opportunities with APY, TVL and risk level.' + X402,
    path: '/api/defi/yields',
    params: {
      limit: limit(50),
      chain: { type: 'string', description: 'Filter by chain: ethereum, bsc, polygon, arbitrum, solana, avalanche' },
      min_tvl: { type: 'number', description: 'Minimum TVL in USD', default: 1_000_000 },
    },
    x402: true,
  },
  {
    name: 'get_ai_market_brief',
    description: 'AI-generated market brief: price action, sentiment, key news and notable events.' + X402,
    path: '/api/ai/brief',
    params: {
      focus: { type: 'string', description: 'Focus area: general, bitcoin, ethereum, defi, altcoins', default: 'general' },
    },
    x402: true,
  },
  {
    name: 'get_exchange_flows',
    description: 'Exchange inflow/outflow data showing net coin movement to and from exchanges.' + X402,
    path: '/api/onchain/exchange-flows',
    params: {
      coin: { type: 'string', description: 'Coin to track (btc, eth)', default: 'btc' },
      hours: { type: 'number', description: 'Time window in hours (1-168)', default: 24 },
    },
    x402: true,
  },
  {
    name: 'get_token_unlocks',
    description: 'Upcoming token unlock schedules with amounts, USD value and expected impact. Free.',
    path: '/api/unlocks',
    params: {
      limit: limit(30),
      days: { type: 'number', description: 'Days to look ahead (1-90)', default: 30 },
    },
  },
  {
    name: 'get_social_sentiment',
    description: 'Social media sentiment for a coin across X/Twitter, Reddit and Telegram.' + X402,
    path: '/api/social/sentiment',
    params: {
      coin: { type: 'string', description: 'Coin symbol (btc, eth, sol, ...)', default: 'btc' },
      source: { type: 'string', description: 'Platform: twitter, reddit, telegram, all', default: 'all' },
    },
    x402: true,
  },
  {
    name: 'get_api_health',
    description: 'Health status of the cryptocurrency.cv API and its data sources. Free.',
    path: '/api/health',
    params: {},
  },
  {
    name: 'get_trending_topics',
    description: 'Trending crypto topics with bullish/bearish/neutral sentiment. Free.',
    path: '/api/trending',
    params: {
      limit: limit(20),
      hours: { type: 'number', description: 'Time window in hours (1-72)', default: 24 },
    },
  },
  {
    name: 'get_crypto_stats',
    description: 'News analytics: articles per source, hourly distribution, category breakdown.' + X402,
    path: '/api/stats',
    params: {},
    x402: true,
  },
  {
    name: 'analyze_news',
    description: 'News with topic classification and sentiment analysis, filterable by topic or sentiment.' + X402,
    path: '/api/analyze',
    params: {
      limit: limit(50),
      topic: { type: 'string', description: 'Filter by topic: Bitcoin, Ethereum, DeFi, NFTs, Regulation, Exchange, ...' },
      sentiment: { type: 'string', description: 'Filter by sentiment', enum: ['bullish', 'bearish', 'neutral'] },
    },
    x402: true,
  },
  {
    name: 'get_archive',
    description: 'Query the historical crypto news archive by date range, source, or keywords. Free.',
    path: '/api/archive',
    params: {
      start_date: { type: 'string', description: 'Start date, YYYY-MM-DD' },
      end_date: { type: 'string', description: 'End date, YYYY-MM-DD' },
      source: { type: 'string', description: 'Filter by source name' },
      search: { type: 'string', description: 'Search query for titles and descriptions' },
      limit: limit(200, 20),
    },
    query: { search: 'q' },
  },
  {
    name: 'get_archive_stats',
    description: 'Statistics about the historical news archive (coverage, counts, date range). Free.',
    path: '/api/archive',
    params: {},
    fixedQuery: { stats: 'true' },
  },
  {
    name: 'find_original_sources',
    description:
      'Trace who published a story first (official announcements, government agencies, social media, research firms) before aggregators picked it up.' + X402,
    path: '/api/origins',
    params: {
      limit: limit(50),
      search: { type: 'string', description: 'Search query to filter articles' },
      source_type: {
        type: 'string',
        description: 'Filter by origin type',
        enum: ['official', 'press-release', 'social', 'blog', 'government'],
      },
    },
    query: { search: 'q' },
    x402: true,
  },
  {
    name: 'get_portfolio_news',
    description: 'News for a set of coins with optional price data. Use when the user names specific holdings.' + X402,
    path: '/api/portfolio',
    params: {
      coins: { type: 'string', description: 'Comma-separated coin symbols or names (e.g. "btc,eth,sol")' },
      limit: limit(50),
      prices: { type: 'boolean', description: 'Include price data (USD, 24h change, market cap)', default: true },
    },
    required: ['coins'],
    x402: true,
  },
  {
    name: 'get_arbitrage',
    description: 'Cross-exchange arbitrage opportunities for a trading pair.' + X402,
    path: '/api/trading/arbitrage',
    params: {
      symbol: { type: 'string', description: 'Asset symbol (e.g. BTC, ETH)', default: 'BTC' },
      limit: limit(50),
    },
    x402: true,
  },
  {
    name: 'get_orderbook',
    description: 'Order book depth (bid/ask levels and liquidity) for a trading pair on an exchange.' + X402,
    path: '/api/trading/orderbook',
    params: {
      symbol: { type: 'string', description: 'Trading pair (e.g. BTCUSDT)', default: 'BTCUSDT' },
      exchange: { type: 'string', description: 'Exchange: binance, coinbase, kraken', default: 'binance' },
      depth: { type: 'number', description: 'Number of price levels (1-100)', default: 20 },
    },
    x402: true,
  },
  {
    name: 'get_nft_news',
    description: 'NFT news: collections, marketplaces, drops, digital art.' + X402,
    path: '/api/nft',
    params: { limit: limit(30) },
    x402: true,
  },
  {
    name: 'get_stablecoin_data',
    description: 'Stablecoin market data: market caps, volumes and peg status (USDT, USDC, DAI, ...).' + X402,
    path: '/api/stablecoins',
    params: { limit: limit(20) },
    x402: true,
  },
  {
    name: 'get_options_data',
    description: 'Crypto options market data: open interest, max pain, put/call ratios.' + X402,
    path: '/api/options',
    params: { coin: { type: 'string', description: 'Coin symbol (btc, eth)', default: 'btc' } },
    x402: true,
  },
  {
    name: 'get_events_calendar',
    description: 'Upcoming crypto events: conferences, hard forks, token unlocks, launches.' + X402,
    path: '/api/events',
    params: {
      days: { type: 'number', description: 'Days to look ahead (1-90)', default: 30 },
      category: { type: 'string', description: 'Event category: conference, hardfork, unlock, launch, all', default: 'all' },
    },
    x402: true,
  },
  {
    name: 'get_ai_sentiment',
    description: 'AI sentiment analysis for one asset: score, confidence and key drivers from recent news.' + X402,
    path: '/api/sentiment',
    params: {
      asset: { type: 'string', description: 'Asset symbol (BTC, ETH, SOL, ...)' },
      limit: limit(50, 20),
    },
    required: ['asset'],
    x402: true,
  },
  {
    name: 'get_ai_summary',
    description: 'AI-generated summary of the latest news, optionally for one source, in a chosen style.' + X402,
    path: '/api/summarize',
    params: {
      limit: { type: 'number', description: 'Number of articles to summarize (1-50)', default: 10 },
      source: { type: 'string', description: 'Restrict to one source id' },
      style: { type: 'string', description: 'Summary style: brief, detailed, bullets', default: 'brief' },
    },
    x402: true,
  },
  {
    name: 'get_alerts',
    description: 'Active price and news alerts with thresholds and recent triggers.' + X402,
    path: '/api/alerts',
    params: {},
    x402: true,
  },
  {
    name: 'get_rss_feed',
    description: 'RSS feed (XML) for a news category, for subscribing in a feed reader. Free.',
    path: '/api/rss',
    params: {
      feed: { type: 'string', description: 'Feed name: all, bitcoin, defi, ...', default: 'all' },
      limit: limit(50, 20),
    },
    responseType: 'text',
  },
  {
    name: 'get_predictions',
    description: 'AI price predictions and analyst forecasts for a coin over a timeframe.' + X402,
    path: '/api/predictions',
    params: {
      coin: { type: 'string', description: 'Coin symbol (btc, eth, sol, ...)', default: 'btc' },
      timeframe: { type: 'string', description: 'Prediction horizon', enum: ['24h', '7d', '30d', '90d'], default: '7d' },
    },
    x402: true,
  },
  {
    name: 'get_l2_data',
    description: 'Layer 2 data (TVL, transactions, fees) for Arbitrum, Optimism, Base, zkSync and more.' + X402,
    path: '/api/l2',
    params: { limit: limit(20) },
    x402: true,
  },
  {
    name: 'get_airdrops',
    description: 'Upcoming, active and ended crypto airdrops with eligibility and estimated value.' + X402,
    path: '/api/airdrops',
    params: {
      status: { type: 'string', description: 'Filter by status', enum: ['upcoming', 'active', 'ended'], default: 'upcoming' },
      limit: limit(30),
    },
    x402: true,
  },
  {
    name: 'get_macro_data',
    description: 'Macro indicators relevant to crypto: interest rates, CPI, DXY, correlation with equities.' + X402,
    path: '/api/macro',
    params: { indicators: { type: 'string', description: 'Comma-separated indicators (e.g. "dxy,cpi,fed_rate,sp500")' } },
    x402: true,
  },
  {
    name: 'get_exchanges',
    description: 'Exchange directory: volume, trust score, fees, KYC and regulation status. Free.',
    path: '/api/exchanges',
    params: { limit: limit(50, 20) },
  },
  {
    name: 'get_glossary',
    description: 'Crypto glossary: look up a term or browse a category.' + X402,
    path: '/api/glossary',
    params: {
      term: { type: 'string', description: 'Term to define (e.g. "DeFi", "staking", "halving")' },
      category: {
        type: 'string',
        description: 'Filter by category',
        enum: ['trading', 'defi', 'blockchain', 'mining', 'nft', 'general'],
      },
    },
    x402: true,
  },
  {
    name: 'ask_crypto_question',
    description: 'Ask a natural-language question about crypto news and markets; returns an AI answer with sources.' + X402,
    path: '/api/ask',
    method: 'POST',
    params: {
      question: { type: 'string', description: 'The question (e.g. "What happened to Bitcoin this week?")' },
      context: { type: 'string', description: 'Optional extra context to refine the answer' },
    },
    required: ['question'],
    body: true,
    x402: true,
  },
];

const toolsByName = new Map(MCP_TOOLS.map((tool) => [tool.name, tool]));

export function getTool(name: string): ToolDefinition | undefined {
  return toolsByName.get(name);
}

export type ToolArgs = Record<string, unknown>;

export interface JsonSchemaProperty {
  type: ToolParamType;
  description: string;
  default?: string | number | boolean;
  enum?: string[];
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties: false;
}

/** JSON Schema for the tool's input, as advertised in `tools/list`. */
export function toolInputSchema(tool: ToolDefinition): ToolInputSchema {
  const properties: Record<string, JsonSchemaProperty> = {};
  for (const [key, param] of Object.entries(tool.params)) {
    const property: JsonSchemaProperty = { type: param.type, description: param.description };
    if (param.default !== undefined) property.default = param.default;
    if (param.enum) property.enum = [...param.enum];
    properties[key] = property;
  }
  const schema: ToolInputSchema = { type: 'object', properties, additionalProperties: false };
  if (tool.required && tool.required.length > 0) schema.required = [...tool.required];
  return schema;
}

/** Wire-format tool descriptor for `tools/list`. */
export function toolDescriptor(tool: ToolDefinition) {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: toolInputSchema(tool),
    annotations: {
      title: tool.name.replace(/_/g, ' '),
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  };
}

export interface ToolRequest {
  url: string;
  method: 'GET' | 'POST';
  body?: string;
}

function resolveArgs(tool: ToolDefinition, args: ToolArgs): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, param] of Object.entries(tool.params)) {
    const raw = args[key];
    const value = raw === undefined || raw === null || raw === '' ? param.default : raw;
    if (value === undefined) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    } else {
      out[key] = String(value);
    }
  }
  for (const key of tool.required ?? []) {
    if (out[key] === undefined) {
      throw new Error(`Missing required argument "${key}" for tool ${tool.name}`);
    }
  }
  return out;
}

/** Builds the HTTP request a tool call maps onto. Pure; no network. */
export function buildToolRequest(tool: ToolDefinition, args: ToolArgs, apiBase: string = DEFAULT_API_BASE): ToolRequest {
  const resolved = resolveArgs(tool, args);
  const url = new URL(tool.path, apiBase);
  const method = tool.method ?? 'GET';
  for (const [key, value] of Object.entries(tool.fixedQuery ?? {})) {
    url.searchParams.set(key, value);
  }
  if (tool.body) {
    return { url: url.toString(), method, body: JSON.stringify(resolved) };
  }
  for (const [key, value] of Object.entries(resolved)) {
    url.searchParams.set(tool.query?.[key] ?? key, String(value));
  }
  return { url: url.toString(), method };
}

/** Shape of the x402 v2 payment-required payload the paywall returns. */
interface PaymentRequiredPayload {
  x402Version?: number;
  error?: string;
  accepts?: Array<{ scheme?: string; network?: string; amount?: string; extra?: { name?: string } }>;
  resource?: { url?: string; description?: string };
}

function formatUsdc(amount: string | undefined): string | undefined {
  if (!amount || !/^\d+$/.test(amount)) return undefined;
  const dollars = Number(amount) / 1_000_000;
  return `$${dollars.toFixed(dollars < 0.01 ? 3 : 2)}`;
}

/** Turns an x402 402 payload into one readable line for the model. */
export function formatPaymentRequired(payload: unknown, requestUrl: string): string {
  const data = (payload && typeof payload === 'object' ? payload : {}) as PaymentRequiredPayload;
  const url = data.resource?.url ?? requestUrl;
  const description = data.resource?.description;
  const offer = data.accepts?.[0];
  const price = formatUsdc(offer?.amount);
  const asset = offer?.extra?.name ?? 'USDC';
  const network = offer?.network;
  const parts = [`Payment required: ${url}`];
  if (description) parts.push(`(${description})`);
  if (price) parts.push(`costs ${price} ${asset}${network ? ` on ${network}` : ''} per request via x402.`);
  else parts.push('is a paid endpoint (x402).');
  parts.push('Retry with an x402-capable client (for example @x402/fetch) to pay per request. Docs: https://cryptocurrency.cv/llms.txt');
  return parts.join(' ');
}

export interface ToolResultContent {
  type: 'text';
  text: string;
}

export interface ToolResult {
  content: ToolResultContent[];
  isError?: boolean;
}

export interface ExecuteOptions {
  apiBase?: string;
  userAgent: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

function clip(text: string): string {
  if (text.length <= MAX_RESULT_CHARS) return text;
  return `${text.slice(0, MAX_RESULT_CHARS)}\n\n[truncated: ${text.length - MAX_RESULT_CHARS} more characters; narrow the request with limit or filters]`;
}

function textResult(text: string, isError = false): ToolResult {
  return { content: [{ type: 'text', text: clip(text) }], isError: isError || undefined };
}

/**
 * Executes a tool against the public HTTP API and returns an MCP tool result.
 * Network and upstream errors are reported inside the result (isError) so the
 * calling model can react; nothing throws except a programming error.
 */
export async function executeTool(tool: ToolDefinition, args: ToolArgs, options: ExecuteOptions): Promise<ToolResult> {
  const apiBase = options.apiBase ?? DEFAULT_API_BASE;
  const doFetch = options.fetchImpl ?? fetch;
  let request: ToolRequest;
  try {
    request = buildToolRequest(tool, args, apiBase);
  } catch (error) {
    return textResult(error instanceof Error ? error.message : String(error), true);
  }

  const headers: Record<string, string> = {
    'User-Agent': options.userAgent,
    Accept: tool.responseType === 'text' ? 'application/rss+xml, application/xml, text/xml, application/json' : 'application/json',
  };
  if (request.body) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await doFetch(request.url, {
      method: request.method,
      headers,
      body: request.body,
      signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return textResult(`Request to ${request.url} failed: ${reason}`, true);
  }

  const raw = await response.text();
  let parsed: unknown = undefined;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }

  if (response.status === 402) {
    return textResult(formatPaymentRequired(parsed, request.url), true);
  }
  if (!response.ok) {
    const detail =
      parsed && typeof parsed === 'object'
        ? ((parsed as { message?: string; error?: string }).message ?? (parsed as { error?: string }).error)
        : undefined;
    return textResult(`${request.url} returned HTTP ${response.status}${detail ? `: ${detail}` : ''}`, true);
  }
  if (parsed !== undefined) {
    return textResult(JSON.stringify(parsed, null, 2));
  }
  return textResult(raw);
}
