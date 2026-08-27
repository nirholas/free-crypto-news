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
 * Prediction Market Tracker
 * 
 * Captures prediction market state to correlate with news:
 * - Polymarket odds for crypto predictions
 * - Manifold Markets crypto predictions
 * 
 * Tracks how news affects prediction markets and vice versa.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const POLYMARKET_API = 'https://gamma-api.polymarket.com';
const MANIFOLD_API = 'https://manifold.markets/api/v0';

// Rate limiting
const RATE_LIMITS = {
  polymarket: { minInterval: 1000, lastCall: 0 },
  manifold: { minInterval: 1000, lastCall: 0 }
};

// Crypto-related keywords for filtering
const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain',
  'solana', 'sol', 'binance', 'coinbase', 'sec', 'etf',
  'defi', 'nft', 'web3', 'stablecoin', 'usdc', 'usdt', 'tether'
];

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
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function isCryptoRelated(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRYPTO_KEYWORDS.some(kw => lower.includes(kw));
}

// =============================================================================
// POLYMARKET SERVICE
// =============================================================================

const PolymarketService = {
  /**
   * Get active crypto-related markets
   */
  async getCryptoMarkets() {
    try {
      // Polymarket's public API
      const data = await rateLimitedFetch(
        'polymarket',
        `${POLYMARKET_API}/markets?active=true&closed=false`
      );
      
      const cryptoMarkets = (data || [])
        .filter(m => isCryptoRelated(m.question || m.title || ''))
        .map(m => ({
          id: m.id || m.conditionId,
          question: m.question || m.title,
          description: m.description?.slice(0, 300),
          outcomes: m.outcomes || [],
          outcome_prices: m.outcomePrices || [],
          volume: m.volume || m.volumeNum,
          liquidity: m.liquidity,
          end_date: m.endDate || m.resolutionDate,
          created_at: m.createdAt,
          category: m.category,
          url: m.slug ? `https://polymarket.com/event/${m.slug}` : null
        }));
      
      return cryptoMarkets.slice(0, 50);
    } catch (error) {
      console.error('Polymarket fetch failed:', error.message);
      return [];
    }
  },

  /**
   * Get market details with price history
   */
  async getMarketDetails(marketId) {
    try {
      const data = await rateLimitedFetch(
        'polymarket',
        `${POLYMARKET_API}/markets/${marketId}`
      );
      
      return {
        id: data.id,
        question: data.question,
        outcomes: data.outcomes,
        prices: data.outcomePrices,
        volume: data.volume,
        liquidity: data.liquidity
      };
    } catch (error) {
      console.error(`Polymarket market ${marketId} failed:`, error.message);
      return null;
    }
  }
};

// =============================================================================
// MANIFOLD MARKETS SERVICE
// =============================================================================

const ManifoldService = {
  /**
   * Get crypto-related markets from Manifold
   */
  async getCryptoMarkets() {
    try {
      // Search for crypto-related markets
      const data = await rateLimitedFetch(
        'manifold',
        `${MANIFOLD_API}/search-markets?term=crypto&limit=50`
      );
      
      return (data || [])
        .filter(m => !m.isResolved)
        .map(m => ({
          id: m.id,
          question: m.question,
          description: m.description?.slice(0, 300),
          probability: m.probability,
          volume: m.volume,
          pool: m.pool,
          created_at: m.createdTime,
          close_time: m.closeTime,
          creator: m.creatorUsername,
          url: m.url || `https://manifold.markets/${m.creatorUsername}/${m.slug}`,
          unique_bettors: m.uniqueBettorCount,
          mechanism: m.mechanism
        }));
    } catch (error) {
      console.error('Manifold fetch failed:', error.message);
      return [];
    }
  },

  /**
   * Search for specific topic
   */
  async searchMarkets(query) {
    try {
      const data = await rateLimitedFetch(
        'manifold',
        `${MANIFOLD_API}/search-markets?term=${encodeURIComponent(query)}&limit=20`
      );
      
      return data || [];
    } catch (error) {
      console.error(`Manifold search for "${query}" failed:`, error.message);
      return [];
    }
  }
};

// =============================================================================
// PREDICTION TRACKING
// =============================================================================

const PredictionTracker = {
  /**
   * Track prediction outcomes over time
   * Stores predictions and checks resolution later
   */
  predictions: new Map(),

  /**
   * Record a prediction snapshot
   */
  recordPrediction(market) {
    const key = `${market.source}:${market.id}`;
    const existing = this.predictions.get(key) || {
      id: market.id,
      source: market.source,
      question: market.question,
      history: []
    };
    
    existing.history.push({
      timestamp: new Date().toISOString(),
      probability: market.probability,
      volume: market.volume
    });
    
    this.predictions.set(key, existing);
    return existing;
  },

  /**
   * Get prediction movement analysis
   */
  analyzePredictionMovement(history) {
    if (history.length < 2) return null;
    
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    const first = history[0];
    
    return {
      current: latest.probability,
      change_since_last: latest.probability - previous.probability,
      change_since_first: latest.probability - first.probability,
      volume_change: latest.volume - previous.volume,
      data_points: history.length
    };
  }
};

// =============================================================================
// UNIFIED PREDICTION SERVICE
// =============================================================================

const PredictionService = {
  /**
   * Get complete prediction markets snapshot
   */
  async getPredictionSnapshot() {
    console.log('🎲 Fetching prediction markets...');
    const startTime = Date.now();

    const [polymarkets, manifoldMarkets] = await Promise.all([
      PolymarketService.getCryptoMarkets(),
      ManifoldService.getCryptoMarkets()
    ]);

    // Also search for specific hot topics
    const [btcMarkets, ethMarkets, etfMarkets] = await Promise.all([
      ManifoldService.searchMarkets('bitcoin price'),
      ManifoldService.searchMarkets('ethereum'),
      ManifoldService.searchMarkets('ETF crypto')
    ]);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Prediction snapshot complete in ${elapsed}s`);

    // Combine and deduplicate
    const allManifold = [...manifoldMarkets, ...btcMarkets, ...ethMarkets, ...etfMarkets];
    const uniqueManifold = Array.from(
      new Map(allManifold.map(m => [m.id, m])).values()
    ).filter(m => !m.isResolved);

    return {
      timestamp: new Date().toISOString(),
      
      polymarket: {
        markets: polymarkets,
        market_count: polymarkets.length,
        total_volume: polymarkets.reduce((s, m) => s + (m.volume || 0), 0)
      },
      
      manifold: {
        markets: uniqueManifold.slice(0, 50),
        market_count: uniqueManifold.length,
        total_volume: uniqueManifold.reduce((s, m) => s + (m.volume || 0), 0)
      },
      
      // Key predictions to track
      highlights: {
        btc_predictions: [...polymarkets, ...uniqueManifold]
          .filter(m => (m.question || '').toLowerCase().includes('bitcoin'))
          .slice(0, 10),
        eth_predictions: [...polymarkets, ...uniqueManifold]
          .filter(m => (m.question || '').toLowerCase().includes('ethereum'))
          .slice(0, 10),
        etf_predictions: [...polymarkets, ...uniqueManifold]
          .filter(m => (m.question || '').toLowerCase().includes('etf'))
          .slice(0, 10)
      },
      
      meta: {
        fetch_duration_ms: Date.now() - startTime,
        sources: ['polymarket', 'manifold'],
        notes: 'Tracks crypto-related prediction markets for correlation with news'
      }
    };
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  PredictionService,
  PolymarketService,
  ManifoldService,
  PredictionTracker,
  isCryptoRelated
};

// CLI execution
if (require.main === module) {
  (async () => {
    console.log('🚀 Testing Prediction Market Tracker...\n');
    
    const snapshot = await PredictionService.getPredictionSnapshot();
    
    console.log('\n🎲 PREDICTION MARKETS SUMMARY:');
    console.log('─'.repeat(50));
    
    console.log(`\n📈 Polymarket:`);
    console.log(`   Markets: ${snapshot.polymarket.market_count}`);
    console.log(`   Total Volume: $${(snapshot.polymarket.total_volume / 1e6).toFixed(2)}M`);
    
    if (snapshot.polymarket.markets.length > 0) {
      console.log(`   Top Markets:`);
      snapshot.polymarket.markets.slice(0, 3).forEach(m => {
        console.log(`   - ${m.question?.slice(0, 60)}...`);
      });
    }
    
    console.log(`\n🔮 Manifold Markets:`);
    console.log(`   Markets: ${snapshot.manifold.market_count}`);
    console.log(`   Total Volume: ${snapshot.manifold.total_volume.toFixed(0)} M$`);
    
    if (snapshot.manifold.markets.length > 0) {
      console.log(`   Top Markets:`);
      snapshot.manifold.markets.slice(0, 3).forEach(m => {
        console.log(`   - [${(m.probability * 100).toFixed(0)}%] ${m.question?.slice(0, 50)}...`);
      });
    }
    
    if (snapshot.highlights.btc_predictions.length > 0) {
      console.log(`\n₿ Bitcoin Predictions:`);
      snapshot.highlights.btc_predictions.slice(0, 3).forEach(m => {
        const prob = m.probability ? `${(m.probability * 100).toFixed(0)}%` : (m.outcome_prices?.[0] ? `${(m.outcome_prices[0] * 100).toFixed(0)}%` : '?');
        console.log(`   [${prob}] ${m.question?.slice(0, 55)}...`);
      });
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Prediction tracking complete');
  })();
}
