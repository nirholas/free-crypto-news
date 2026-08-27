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
 * Market Context Fetcher
 * 
 * Fetches current market data to attach to archived articles.
 * Uses free APIs (CoinGecko, Alternative.me) with fallbacks.
 */

// Rate limiting state
let lastCoinGeckoCall = 0;
const COINGECKO_RATE_LIMIT = 10000; // 10 seconds between calls for free tier

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch Fear & Greed Index from Alternative.me
 */
async function fetchFearGreedIndex() {
  try {
    const response = await fetchWithTimeout(
      'https://api.alternative.me/fng/?limit=1',
      {},
      5000
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.data && data.data[0]) {
      return parseInt(data.data[0].value, 10);
    }
    return null;
  } catch (error) {
    console.error('Fear & Greed fetch failed:', error.message);
    return null;
  }
}

/**
 * Fetch price data from CoinGecko (free tier)
 */
async function fetchCoinGeckoPrices() {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastCoinGeckoCall;
  if (timeSinceLastCall < COINGECKO_RATE_LIMIT) {
    await sleep(COINGECKO_RATE_LIMIT - timeSinceLastCall);
  }
  lastCoinGeckoCall = Date.now();
  
  try {
    const response = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_market_cap=true',
      {
        headers: {
          'Accept': 'application/json'
        }
      },
      10000
    );
    
    if (!response.ok) {
      console.error('CoinGecko response not ok:', response.status);
      return null;
    }
    
    const data = await response.json();
    return {
      btc_price: data.bitcoin?.usd || null,
      eth_price: data.ethereum?.usd || null,
      sol_price: data.solana?.usd || null,
      btc_market_cap: data.bitcoin?.usd_market_cap || null
    };
  } catch (error) {
    console.error('CoinGecko fetch failed:', error.message);
    return null;
  }
}

/**
 * Fetch total market data from CoinGecko
 */
async function fetchGlobalMarketData() {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastCoinGeckoCall;
  if (timeSinceLastCall < COINGECKO_RATE_LIMIT) {
    await sleep(COINGECKO_RATE_LIMIT - timeSinceLastCall);
  }
  lastCoinGeckoCall = Date.now();
  
  try {
    const response = await fetchWithTimeout(
      'https://api.coingecko.com/api/v3/global',
      {
        headers: {
          'Accept': 'application/json'
        }
      },
      10000
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      total_market_cap: data.data?.total_market_cap?.usd || null,
      total_volume_24h: data.data?.total_volume?.usd || null,
      btc_dominance: data.data?.market_cap_percentage?.btc || null,
      eth_dominance: data.data?.market_cap_percentage?.eth || null,
      active_cryptocurrencies: data.data?.active_cryptocurrencies || null
    };
  } catch (error) {
    console.error('Global market data fetch failed:', error.message);
    return null;
  }
}

/**
 * Get complete market context
 */
async function getMarketContext() {
  const [prices, fearGreed, global] = await Promise.all([
    fetchCoinGeckoPrices(),
    fetchFearGreedIndex(),
    fetchGlobalMarketData()
  ]);
  
  const context = {
    timestamp: new Date().toISOString(),
    btc_price: prices?.btc_price || null,
    eth_price: prices?.eth_price || null,
    sol_price: prices?.sol_price || null,
    total_market_cap: global?.total_market_cap || null,
    btc_dominance: global?.btc_dominance || null,
    fear_greed_index: fearGreed
  };
  
  // Check if we got any useful data
  const hasData = Object.values(context).some(v => v !== null && v !== undefined);
  
  return hasData ? context : null;
}

/**
 * Cache market context to avoid repeated API calls
 */
let cachedContext = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedMarketContext() {
  const now = Date.now();
  if (cachedContext && (now - cacheTime) < CACHE_DURATION) {
    return cachedContext;
  }
  
  cachedContext = await getMarketContext();
  cacheTime = now;
  return cachedContext;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  getMarketContext,
  getCachedMarketContext,
  fetchCoinGeckoPrices,
  fetchFearGreedIndex,
  fetchGlobalMarketData
};

// CLI usage
if (require.main === module) {
  (async () => {
    console.log('Fetching market context...');
    const context = await getMarketContext();
    console.log(JSON.stringify(context, null, 2));
  })();
}
