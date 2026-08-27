/**
 * MCP prompts: reusable workflows a client can offer as slash commands. Each
 * prompt tells the model which of this server's tools to call and how to
 * shape the answer.
 */

import { z } from 'zod';

export interface PromptDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  title: string;
  description: string;
  args: Shape;
  build: (args: z.infer<z.ZodObject<Shape>>) => string;
}

function definePrompt<Shape extends z.ZodRawShape>(prompt: PromptDefinition<Shape>): PromptDefinition<z.ZodRawShape> {
  return prompt as unknown as PromptDefinition<z.ZodRawShape>;
}

export const PROMPTS: ReadonlyArray<PromptDefinition> = [
  definePrompt({
    name: 'daily_brief',
    title: 'Daily crypto brief',
    description: 'A morning briefing: market snapshot, sentiment, top stories, derivatives positioning and what to watch.',
    args: {
      focus: z.string().max(64).optional().describe('Optional focus, e.g. "bitcoin", "defi", "regulation"'),
    },
    build: ({ focus }) => {
      const lens = focus ? ` Keep the lens on ${focus} where the data allows.` : '';
      return [
        'Write a concise daily crypto brief for a professional reader.' + lens,
        '',
        'Gather the data with these tools, in parallel where possible:',
        '1. get_market_overview and get_fear_greed (days=2) for the macro snapshot.',
        '2. get_top_gainers and get_top_losers (limit=5) for movers.',
        '3. get_breaking_news, then get_latest_news (limit=15, sort="impact") for stories.',
        '4. get_trending_topics (limit=8) and get_narratives (limit=8) for themes.',
        '5. get_funding_rates (symbol="BTCUSDT") and get_liquidations for positioning.',
        '6. get_events_calendar (limit=8) and get_token_unlocks (limit=5) for the week ahead.',
        '',
        'Then produce, in this order: a two-sentence market read; a table of key numbers (total cap, 24h change, BTC dominance, Fear & Greed); the five stories that matter with one line each and the source; positioning and risk (funding, liquidations, unlocks); and three things to watch. Cite tool data for every number. Do not speculate beyond the data.',
      ].join('\n');
    },
  }),
  definePrompt({
    name: 'coin_deep_dive',
    title: 'Coin deep dive',
    description: 'Fundamental and news-driven analysis of one coin: price context, chart, news flow, sentiment, derivatives, unlocks.',
    args: {
      coin: z.string().min(1).max(64).describe('Coin name, symbol or CoinGecko id, e.g. "solana" or "SOL"'),
    },
    build: ({ coin }) =>
      [
        `Produce a deep dive on ${coin}.`,
        '',
        'Steps:',
        `1. If "${coin}" is not already a CoinGecko id, call search_coins to resolve it. Use the id for market tools and the ticker for news tools.`,
        '2. get_coin_detail for current market data and get_price_chart (range="30d") for the trend; summarise the 7d and 30d move.',
        '3. search_news (query=coin name, limit=15) and get_sentiment (asset=ticker) for the news picture.',
        '4. get_funding_rates (symbol=<TICKER>USDT) and get_derivatives for positioning, if the coin has perps.',
        '5. get_token_unlocks (project=coin) for supply overhangs and get_whale_alerts (blockchain=the coin\'s chain) for large flows.',
        '',
        'Deliver: what the coin is and why it is in the news; price and volume context with numbers; the three most important recent developments with sources; sentiment and positioning; supply and unlock risks; and a balanced bull/bear summary. Every claim must trace to a tool result.',
      ].join('\n'),
  }),
  definePrompt({
    name: 'defi_yield_scan',
    title: 'DeFi yield scan',
    description: 'Screen DeFi yields on a chain, filter for real TVL, and cross-check protocol risk against the news.',
    args: {
      chain: z.string().max(32).default('ethereum').describe('Chain to scan, e.g. ethereum, arbitrum, solana, base'),
      min_tvl: z.string().max(16).default('5000000').describe('Minimum pool TVL in USD'),
    },
    build: ({ chain, min_tvl }) =>
      [
        `Scan DeFi yield opportunities on ${chain} with at least $${min_tvl} TVL.`,
        '',
        'Steps:',
        `1. get_defi_yields (chain="${chain}", min_tvl=${min_tvl}, max_apy=200, limit=25) and get_defi_yields with stable=true for a stablecoin subset.`,
        '2. get_defi_overview for the TVL backdrop and get_stablecoins for peg health.',
        '3. For the top five protocols by APY, search_news (query=protocol name, limit=5) to catch exploits, governance drama or incentive changes.',
        '4. get_gas_prices if the chain is Ethereum mainnet, so the reader can judge entry cost.',
        '',
        'Deliver a ranked table (protocol, pool, APY, TVL, stable or volatile), a risk note per pool grounded in the news, and a short caveat on what the APY figure does and does not include.',
      ].join('\n'),
  }),
];
