#!/usr/bin/env node

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
 * Comprehensive Market Data Service
 * 
 * Integrates multiple data sources for complete market state capture:
 * - CoinGecko: Prices, market caps, trending, global stats
 * - DeFiLlama: Protocol TVL, chain TVL, yields
 * - Alternative.me: Fear & Greed Index
 * 
 * Designed for high-value historical archival with rate limiting
 * and fallbacks for reliability.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const DEFILLAMA_BASE = 'https://api.llama.fi';
const DEFILLAMA_YIELDS = 'https://yields.llama.fi';
const ALTERNATIVE_ME = 'https://api.alternative.me';

// Rate limiting (free tier friendly)
const RATE_LIMITS = {
  coingecko: { minInterval: 6000, lastCall: 0 },    // 10 calls/min for free tier
  defillama: { minInterval: 1000, lastCall: 0 },    // More generous
  alternativeme: { minInterval: 1000, lastCall: 0 }
};

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimitedFetch(service, url, options = {}, timeout = 15000) {
  const limit = RATE_LIMITS[service];
  if (limit) {
    const now = Date.now();
    const timeSinceLastCall = now - limit.lastCall;
    if (timeSinceLastCall < limit.minInterval) {
      await sleep(limit.minInterval - timeSinceLastCall);
    }
    limit.lastCall = Date.now();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FreeCryptoNews/2.0 (https://github.com/nirholas/free-crypto-news)',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout fetching ${url}`);
    }
    throw error;
  }
}

// =============================================================================
// COINGECKO SERVICE
// =============================================================================

const CoinGeckoService = {
  /**
   * Get top coins by market cap with full details
   */
  async getTopCoins(limit = 100, page = 1) {
    try {
      const data = await rateLimitedFetch(
        'coingecko',
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d,30d`
      );
      
      return data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol?.toUpperCase(),
        name: coin.name,
        rank: coin.market_cap_rank,
        price: coin.current_price,
        market_cap: coin.market_cap,
        volume_24h: coin.total_volume,
        change_1h: coin.price_change_percentage_1h_in_currency,
        change_24h: coin.price_change_percentage_24h,
        change_7d: coin.price_change_percentage_7d_in_currency,
        change_30d: coin.price_change_percentage_30d_in_currency,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        ath_date: coin.ath_date,
        atl: coin.atl,
        atl_change_percentage: coin.atl_change_percentage,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        sparkline_7d: coin.sparkline_in_7d?.price?.slice(-24) // Last 24 data points
      }));
    } catch (error) {
      console.error('CoinGecko getTopCoins failed:', error.message);
      return [];
    }
  },

  /**
   * Get trending coins
   */
  async getTrending() {
    try {
      const data = await rateLimitedFetch(
        'coingecko',
        `${COINGECKO_BASE}/search/trending`
      );
      
      return {
        coins: data.coins?.map(c => ({
          id: c.item.id,
          symbol: c.item.symbol?.toUpperCase(),
          name: c.item.name,
          rank: c.item.market_cap_rank,
          score: c.item.score,
          price_btc: c.item.price_btc
        })) || [],
        nfts: data.nfts?.slice(0, 5) || [],
        categories: data.categories?.slice(0, 5) || []
      };
    } catch (error) {
      console.error('CoinGecko getTrending failed:', error.message);
      return { coins: [], nfts: [], categories: [] };
    }
  },

  /**
   * Get global market data
   */
  async getGlobalData() {
    try {
      const data = await rateLimitedFetch(
        'coingecko',
        `${COINGECKO_BASE}/global`
      );
      
      const g = data.data;
      return {
        active_cryptocurrencies: g.active_cryptocurrencies,
        markets: g.markets,
        total_market_cap_usd: g.total_market_cap?.usd,
        total_volume_24h_usd: g.total_volume?.usd,
        btc_dominance: g.market_cap_percentage?.btc,
        eth_dominance: g.market_cap_percentage?.eth,
        market_cap_change_24h: g.market_cap_change_percentage_24h_usd,
        defi_market_cap: g.total_market_cap?.usd * (g.market_cap_percentage?.defi || 0) / 100,
        updated_at: g.updated_at
      };
    } catch (error) {
      console.error('CoinGecko getGlobalData failed:', error.message);
      return null;
    }
  },

  /**
   * Get specific coin prices (for quick updates)
   */
  async getPrices(coinIds = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple']) {
    try {
      const data = await rateLimitedFetch(
        'coingecko',
        `${COINGECKO_BASE}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );
      
      const result = {};
      for (const [id, values] of Object.entries(data)) {
        result[id] = {
          price: values.usd,
          market_cap: values.usd_market_cap,
          volume_24h: values.usd_24h_vol,
          change_24h: values.usd_24h_change
        };
      }
      return result;
    } catch (error) {
      console.error('CoinGecko getPrices failed:', error.message);
      return {};
    }
  },

  /**
   * Get DeFi specific data
   */
  async getDefiData() {
    try {
      const data = await rateLimitedFetch(
        'coingecko',
        `${COINGECKO_BASE}/global/decentralized_finance_defi`
      );
      
      const d = data.data;
      return {
        defi_market_cap: parseFloat(d.defi_market_cap),
        eth_market_cap: parseFloat(d.eth_market_cap),
        defi_to_eth_ratio: parseFloat(d.defi_to_eth_ratio),
        trading_volume_24h: parseFloat(d.trading_volume_24h),
        defi_dominance: parseFloat(d.defi_dominance),
        top_coin_name: d.top_coin_name,
        top_coin_defi_dominance: parseFloat(d.top_coin_defi_dominance)
      };
    } catch (error) {
      console.error('CoinGecko getDefiData failed:', error.message);
      return null;
    }
  }
};

// =============================================================================
// DEFILLAMA SERVICE
// =============================================================================

const DefiLlamaService = {
  /**
   * Get all protocols with TVL
   */
  async getProtocols() {
    try {
      const data = await rateLimitedFetch(
        'defillama',
        `${DEFILLAMA_BASE}/protocols`
      );
      
      return data.map(p => ({
        id: p.slug,
        name: p.name,
        symbol: p.symbol,
        chain: p.chain,
        chains: p.chains,
        tvl: p.tvl,
        change_1h: p.change_1h,
        change_1d: p.change_1d,
        change_7d: p.change_7d,
        category: p.category,
        mcap_tvl: p.mcap ? p.mcap / p.tvl : null,
        staking: p.staking,
        pool2: p.pool2
      }));
    } catch (error) {
      console.error('DeFiLlama getProtocols failed:', error.message);
      return [];
    }
  },

  /**
   * Get top protocols by TVL
   */
  async getTopProtocols(limit = 50) {
    const protocols = await this.getProtocols();
    return protocols
      .filter(p => p.tvl && p.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit);
  },

  /**
   * Get all chains with TVL
   */
  async getChains() {
    try {
      const data = await rateLimitedFetch(
        'defillama',
        `${DEFILLAMA_BASE}/v2/chains`
      );
      
      return data.map(c => ({
        name: c.name,
        tvl: c.tvl,
        token_symbol: c.tokenSymbol,
        gecko_id: c.gecko_id,
        chain_id: c.chainId
      }));
    } catch (error) {
      console.error('DeFiLlama getChains failed:', error.message);
      return [];
    }
  },

  /**
   * Get top chains by TVL
   */
  async getTopChains(limit = 20) {
    const chains = await this.getChains();
    return chains
      .filter(c => c.tvl && c.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit);
  },

  /**
   * Get yield pools
   */
  async getYieldPools() {
    try {
      const data = await rateLimitedFetch(
        'defillama',
        `${DEFILLAMA_YIELDS}/pools`
      );
      
      return (data.data || []).map(p => ({
        pool: p.pool,
        chain: p.chain,
        project: p.project,
        symbol: p.symbol,
        tvl_usd: p.tvlUsd,
        apy: p.apy,
        apy_base: p.apyBase,
        apy_reward: p.apyReward,
        stablecoin: p.stablecoin,
        il_risk: p.ilRisk,
        exposure: p.exposure
      }));
    } catch (error) {
      console.error('DeFiLlama getYieldPools failed:', error.message);
      return [];
    }
  },

  /**
   * Get top yields by APY
   */
  async getTopYields(limit = 30) {
    const pools = await this.getYieldPools();
    return pools
      .filter(p => p.apy && p.apy > 0 && p.apy < 10000 && p.tvl_usd > 100000) // Filter unrealistic & tiny pools
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  },

  /**
   * Get stablecoin yields
   */
  async getStablecoinYields(limit = 20) {
    const pools = await this.getYieldPools();
    return pools
      .filter(p => p.stablecoin && p.apy && p.apy > 0 && p.tvl_usd > 100000)
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);
  },

  /**
   * Get stablecoins data
   */
  async getStablecoins() {
    try {
      const data = await rateLimitedFetch(
        'defillama',
        `${DEFILLAMA_BASE}/stablecoins`
      );
      
      return (data.peggedAssets || []).slice(0, 20).map(s => ({
        id: s.id,
        name: s.name,
        symbol: s.symbol,
        peg_type: s.pegType,
        peg_mechanism: s.pegMechanism,
        circulating: s.circulating?.peggedUSD,
        price: s.price
      }));
    } catch (error) {
      console.error('DeFiLlama getStablecoins failed:', error.message);
      return [];
    }
  },

  /**
   * Get total TVL across all chains
   */
  async getTotalTVL() {
    try {
      const data = await rateLimitedFetch(
        'defillama',
        `${DEFILLAMA_BASE}/tvl`
      );
      return data;
    } catch (error) {
      console.error('DeFiLlama getTotalTVL failed:', error.message);
      return null;
    }
  }
};

// =============================================================================
// ALTERNATIVE.ME SERVICE (Fear & Greed)
// =============================================================================

const AlternativeMeService = {
  /**
   * Get Fear & Greed Index with history
   */
  async getFearGreedIndex(limit = 7) {
    try {
      const data = await rateLimitedFetch(
        'alternativeme',
        `${ALTERNATIVE_ME}/fng/?limit=${limit}`,
        {},
        5000
      );
      
      if (!data.data || !data.data[0]) return null;
      
      return {
        current: {
          value: parseInt(data.data[0].value, 10),
          classification: data.data[0].value_classification,
          timestamp: parseInt(data.data[0].timestamp, 10) * 1000
        },
        history: data.data.map(d => ({
          value: parseInt(d.value, 10),
          classification: d.value_classification,
          timestamp: parseInt(d.timestamp, 10) * 1000
        }))
      };
    } catch (error) {
      console.error('Alternative.me getFearGreedIndex failed:', error.message);
      return null;
    }
  }
};

// =============================================================================
// UNIFIED MARKET DATA SERVICE
// =============================================================================

const MarketDataService = {
  /**
   * Get complete market snapshot for archival
   * This is the main function for hourly snapshots
   */
  async getCompleteSnapshot() {
    console.log('📊 Fetching complete market snapshot...');
    const startTime = Date.now();

    // Fetch all data sources in parallel where possible
    // But respect rate limits by grouping
    
    // Group 1: CoinGecko calls (rate limited)
    console.log('  → Fetching CoinGecko data...');
    const topCoins = await CoinGeckoService.getTopCoins(100);
    const trending = await CoinGeckoService.getTrending();
    const globalData = await CoinGeckoService.getGlobalData();
    const defiData = await CoinGeckoService.getDefiData();

    // Group 2: DeFiLlama calls (can be parallel)
    console.log('  → Fetching DeFiLlama data...');
    const [topProtocols, topChains, topYields, stablecoinYields, stablecoins, totalTVL] = await Promise.all([
      DefiLlamaService.getTopProtocols(30),
      DefiLlamaService.getTopChains(15),
      DefiLlamaService.getTopYields(20),
      DefiLlamaService.getStablecoinYields(15),
      DefiLlamaService.getStablecoins(),
      DefiLlamaService.getTotalTVL()
    ]);

    // Group 3: Alternative.me
    console.log('  → Fetching sentiment data...');
    const fearGreed = await AlternativeMeService.getFearGreedIndex(7);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Market snapshot complete in ${elapsed}s`);

    return {
      timestamp: new Date().toISOString(),
      schema_version: '2.0.0',
      
      // Global market state
      global: globalData,
      
      // Sentiment
      sentiment: {
        fear_greed: fearGreed?.current?.value || null,
        fear_greed_classification: fearGreed?.current?.classification || null,
        fear_greed_history: fearGreed?.history || []
      },
      
      // Price data - top coins with full details
      prices: {
        top_100: topCoins,
        summary: {
          btc: topCoins.find(c => c.id === 'bitcoin'),
          eth: topCoins.find(c => c.id === 'ethereum'),
          sol: topCoins.find(c => c.id === 'solana'),
          bnb: topCoins.find(c => c.id === 'binancecoin'),
          xrp: topCoins.find(c => c.id === 'ripple')
        }
      },
      
      // Trending
      trending: trending,
      
      // DeFi specific
      defi: {
        overview: defiData,
        total_tvl: totalTVL,
        top_protocols: topProtocols,
        top_chains: topChains,
        stablecoins: stablecoins
      },
      
      // Yields
      yields: {
        top: topYields,
        stablecoin: stablecoinYields
      },
      
      // Metadata
      meta: {
        fetch_duration_ms: Date.now() - startTime,
        sources: ['coingecko', 'defillama', 'alternative.me'],
        data_completeness: {
          prices: topCoins.length > 0,
          global: globalData !== null,
          defi: topProtocols.length > 0,
          sentiment: fearGreed !== null
        }
      }
    };
  },

  /**
   * Get quick market update (for more frequent updates)
   */
  async getQuickUpdate() {
    const [prices, fearGreed] = await Promise.all([
      CoinGeckoService.getPrices(['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'cardano', 'dogecoin']),
      AlternativeMeService.getFearGreedIndex(1)
    ]);

    return {
      timestamp: new Date().toISOString(),
      prices,
      fear_greed: fearGreed?.current?.value || null
    };
  },

  // Expose individual services for custom queries
  coingecko: CoinGeckoService,
  defillama: DefiLlamaService,
  alternativeme: AlternativeMeService
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  MarketDataService,
  CoinGeckoService,
  DefiLlamaService,
  AlternativeMeService
};

// CLI execution
if (require.main === module) {
  (async () => {
    console.log('🚀 Testing Market Data Service...\n');
    
    const snapshot = await MarketDataService.getCompleteSnapshot();
    
    console.log('\n📊 MARKET SNAPSHOT SUMMARY:');
    console.log('─'.repeat(50));
    
    if (snapshot.global) {
      console.log(`\n🌍 Global Market:`);
      console.log(`   Total Market Cap: $${(snapshot.global.total_market_cap_usd / 1e12).toFixed(2)}T`);
      console.log(`   24h Volume: $${(snapshot.global.total_volume_24h_usd / 1e9).toFixed(2)}B`);
      console.log(`   BTC Dominance: ${snapshot.global.btc_dominance?.toFixed(1)}%`);
      console.log(`   ETH Dominance: ${snapshot.global.eth_dominance?.toFixed(1)}%`);
    }
    
    if (snapshot.sentiment.fear_greed) {
      console.log(`\n😱 Sentiment:`);
      console.log(`   Fear & Greed: ${snapshot.sentiment.fear_greed} (${snapshot.sentiment.fear_greed_classification})`);
    }
    
    if (snapshot.prices.summary.btc) {
      console.log(`\n💰 Key Prices:`);
      console.log(`   BTC: $${snapshot.prices.summary.btc.price?.toLocaleString()} (${snapshot.prices.summary.btc.change_24h?.toFixed(2)}%)`);
      console.log(`   ETH: $${snapshot.prices.summary.eth?.price?.toLocaleString()} (${snapshot.prices.summary.eth?.change_24h?.toFixed(2)}%)`);
      console.log(`   SOL: $${snapshot.prices.summary.sol?.price?.toLocaleString()} (${snapshot.prices.summary.sol?.change_24h?.toFixed(2)}%)`);
    }
    
    if (snapshot.trending.coins.length > 0) {
      console.log(`\n🔥 Trending:`);
      snapshot.trending.coins.slice(0, 5).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name} (${c.symbol})`);
      });
    }
    
    if (snapshot.defi.top_protocols.length > 0) {
      console.log(`\n🏦 Top DeFi Protocols:`);
      snapshot.defi.top_protocols.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}: $${(p.tvl / 1e9).toFixed(2)}B TVL`);
      });
    }
    
    if (snapshot.defi.top_chains.length > 0) {
      console.log(`\n⛓️ Top Chains by TVL:`);
      snapshot.defi.top_chains.slice(0, 5).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name}: $${(c.tvl / 1e9).toFixed(2)}B`);
      });
    }
    
    if (snapshot.yields.top.length > 0) {
      console.log(`\n📈 Top Yields:`);
      snapshot.yields.top.slice(0, 5).forEach((y, i) => {
        console.log(`   ${i + 1}. ${y.symbol} on ${y.project}: ${y.apy?.toFixed(2)}% APY`);
      });
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Snapshot complete with ${snapshot.prices.top_100.length} coins, ${snapshot.defi.top_protocols.length} protocols`);
  })();
}
