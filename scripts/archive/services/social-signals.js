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
 * Social Signals Tracker
 * 
 * Captures social sentiment and activity to correlate with news:
 * - Reddit crypto sentiment (r/cryptocurrency, r/bitcoin, r/ethereum)
 * - Basic Twitter/X trending topics (limited without API)
 * - Discord activity indicators
 * - Google Trends for crypto terms
 * 
 * Uses free APIs and public data.
 * 
 * NOTE: Reddit API now requires OAuth2 authentication (as of 2023).
 * Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET env vars to enable.
 * Register an app at: https://www.reddit.com/prefs/apps
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const REDDIT_BASE = 'https://oauth.reddit.com';
const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/access_token';

// Rate limiting
const RATE_LIMITS = {
  reddit: { minInterval: 2000, lastCall: 0 }
};

// Reddit OAuth token cache
let redditToken = null;
let redditTokenExpiry = 0;

// Check if Reddit credentials are configured
const REDDIT_ENABLED = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);

// Subreddits to track
const CRYPTO_SUBREDDITS = [
  'cryptocurrency',
  'bitcoin',
  'ethereum',
  'solana',
  'defi'
];

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get Reddit OAuth2 access token (app-only auth)
 */
async function getRedditToken() {
  if (!REDDIT_ENABLED) {
    return null;
  }
  
  // Return cached token if still valid
  if (redditToken && Date.now() < redditTokenExpiry - 60000) {
    return redditToken;
  }
  
  try {
    const credentials = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');
    
    const response = await fetch(REDDIT_AUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'FreeCryptoNews/2.0 (by /u/free_crypto_news)'
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      console.error('Reddit OAuth failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    redditToken = data.access_token;
    redditTokenExpiry = Date.now() + (data.expires_in * 1000);
    
    console.log('✅ Reddit OAuth token obtained');
    return redditToken;
  } catch (error) {
    console.error('Reddit OAuth error:', error.message);
    return null;
  }
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
        'User-Agent': 'FreeCryptoNews/2.0 (by /u/free_crypto_news)',
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

/**
 * Extract tickers/coins mentioned in text
 */
function extractTickers(text) {
  if (!text) return [];
  
  const tickerPattern = /\$([A-Z]{2,10})\b/g;
  const matches = text.match(tickerPattern) || [];
  return [...new Set(matches.map(m => m.replace('$', '')))];
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(text) {
  if (!text) return 'neutral';
  
  const lower = text.toLowerCase();
  
  const bullishWords = ['moon', 'bullish', 'pump', 'buy', 'long', 'rocket', '🚀', 'ath', 'gains', 'profit', 'green', 'breakout', 'surge'];
  const bearishWords = ['crash', 'bearish', 'dump', 'sell', 'short', 'rekt', 'scam', 'rug', 'loss', 'red', 'down', 'fear', 'dead'];
  
  let bullScore = 0;
  let bearScore = 0;
  
  bullishWords.forEach(word => {
    if (lower.includes(word)) bullScore++;
  });
  
  bearishWords.forEach(word => {
    if (lower.includes(word)) bearScore++;
  });
  
  if (bullScore > bearScore + 1) return 'bullish';
  if (bearScore > bullScore + 1) return 'bearish';
  return 'neutral';
}

// =============================================================================
// REDDIT SERVICE
// =============================================================================

const RedditService = {
  /**
   * Get hot posts from a subreddit (requires OAuth)
   */
  async getHotPosts(subreddit, limit = 25) {
    const token = await getRedditToken();
    if (!token) {
      return [];
    }
    
    try {
      const data = await rateLimitedFetch(
        'reddit',
        `${REDDIT_BASE}/r/${subreddit}/hot?limit=${limit}&raw_json=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return (data.data?.children || []).map(post => {
        const p = post.data;
        return {
          id: p.id,
          title: p.title,
          selftext: p.selftext?.slice(0, 500),
          author: p.author,
          score: p.score,
          upvote_ratio: p.upvote_ratio,
          num_comments: p.num_comments,
          created_utc: p.created_utc * 1000,
          url: `https://reddit.com${p.permalink}`,
          link_flair_text: p.link_flair_text,
          tickers_mentioned: extractTickers(p.title + ' ' + (p.selftext || '')),
          sentiment: analyzeSentiment(p.title + ' ' + (p.selftext || ''))
        };
      });
    } catch (error) {
      console.error(`Reddit r/${subreddit} fetch failed:`, error.message);
      return [];
    }
  },

  /**
   * Get subreddit stats (requires OAuth)
   */
  async getSubredditStats(subreddit) {
    const token = await getRedditToken();
    if (!token) {
      return null;
    }
    
    try {
      const data = await rateLimitedFetch(
        'reddit',
        `${REDDIT_BASE}/r/${subreddit}/about`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const s = data.data;
      return {
        name: s.display_name,
        subscribers: s.subscribers,
        active_users: s.accounts_active,
        description: s.public_description?.slice(0, 200)
      };
    } catch (error) {
      console.error(`Reddit r/${subreddit} about failed:`, error.message);
      return null;
    }
  },

  /**
   * Get aggregated crypto Reddit sentiment
   */
  async getCryptoRedditSnapshot() {
    console.log('📱 Fetching Reddit data...');
    const startTime = Date.now();
    
    const results = {
      timestamp: new Date().toISOString(),
      subreddits: {},
      top_posts: [],
      sentiment_summary: { bullish: 0, bearish: 0, neutral: 0 },
      trending_tickers: {},
      total_active_users: 0,
      enabled: REDDIT_ENABLED
    };
    
    if (!REDDIT_ENABLED) {
      console.log('⚠️  Reddit API disabled (set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET)');
      console.log('   Register at: https://www.reddit.com/prefs/apps');
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Reddit snapshot complete in ${elapsed}s (disabled)`);
      return results;
    }
    
    // Fetch from key subreddits
    for (const sub of CRYPTO_SUBREDDITS) {
      const [posts, stats] = await Promise.all([
        this.getHotPosts(sub, 15),
        this.getSubredditStats(sub)
      ]);
      
      results.subreddits[sub] = {
        stats,
        post_count: posts.length,
        avg_score: posts.reduce((s, p) => s + p.score, 0) / (posts.length || 1),
        avg_comments: posts.reduce((s, p) => s + p.num_comments, 0) / (posts.length || 1)
      };
      
      if (stats?.active_users) {
        results.total_active_users += stats.active_users;
      }
      
      // Aggregate sentiment
      posts.forEach(p => {
        results.sentiment_summary[p.sentiment]++;
        
        // Track ticker mentions
        p.tickers_mentioned.forEach(ticker => {
          results.trending_tickers[ticker] = (results.trending_tickers[ticker] || 0) + 1;
        });
      });
      
      // Add top posts
      results.top_posts.push(...posts.filter(p => p.score > 50));
      
      // Small delay between subreddits
      await sleep(500);
    }
    
    // Sort and limit top posts
    results.top_posts = results.top_posts
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    
    // Calculate overall sentiment
    const total = Object.values(results.sentiment_summary).reduce((a, b) => a + b, 0);
    if (total > 0) {
      results.overall_sentiment = {
        bullish_pct: (results.sentiment_summary.bullish / total * 100).toFixed(1),
        bearish_pct: (results.sentiment_summary.bearish / total * 100).toFixed(1),
        neutral_pct: (results.sentiment_summary.neutral / total * 100).toFixed(1)
      };
    }
    
    // Sort trending tickers
    results.trending_tickers = Object.entries(results.trending_tickers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Reddit snapshot complete in ${elapsed}s`);
    
    return results;
  }
};

// =============================================================================
// TWITTER/X SERVICE (Limited without API)
// =============================================================================

const TwitterService = {
  /**
   * Note: Full Twitter integration requires API access
   * This provides structure for future integration
   */
  async getTrendingCryptoTopics() {
    return {
      available: false,
      note: 'Twitter/X API requires paid access. Consider using Nitter or premium API.',
      schema: {
        topics: ['#Bitcoin', '#Ethereum', '#Crypto'],
        mentions: { BTC: 0, ETH: 0 },
        influencer_activity: []
      }
    };
  }
};

// =============================================================================
// GOOGLE TRENDS SERVICE
// =============================================================================

const GoogleTrendsService = {
  /**
   * Note: Google Trends requires unofficial API or scraping
   * This provides structure for integration
   */
  async getCryptoTrends() {
    return {
      available: false,
      note: 'Google Trends requires unofficial API integration',
      schema: {
        terms: ['bitcoin', 'ethereum', 'crypto'],
        relative_interest: {},
        rising_queries: []
      }
    };
  }
};

// =============================================================================
// CRYPTO SOCIAL METRICS (LunarCrush-style)
// =============================================================================

const SocialMetricsService = {
  /**
   * Aggregate social metrics across platforms
   */
  async getSocialMetrics() {
    // In production, integrate with LunarCrush or Santiment
    return {
      available: false,
      note: 'Full social metrics require LunarCrush or Santiment API',
      schema: {
        social_volume: {},
        social_dominance: {},
        sentiment_score: {},
        influencer_mentions: []
      }
    };
  }
};

// =============================================================================
// UNIFIED SOCIAL SERVICE
// =============================================================================

const SocialService = {
  /**
   * Get complete social signals snapshot
   */
  async getSocialSnapshot() {
    console.log('📲 Fetching social signals...');
    const startTime = Date.now();

    const redditData = await RedditService.getCryptoRedditSnapshot();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Social snapshot complete in ${elapsed}s`);

    return {
      timestamp: new Date().toISOString(),
      
      // Reddit (fully functional)
      reddit: redditData,
      
      // Placeholders for premium integrations
      twitter: await TwitterService.getTrendingCryptoTopics(),
      google_trends: await GoogleTrendsService.getCryptoTrends(),
      social_metrics: await SocialMetricsService.getSocialMetrics(),
      
      meta: {
        fetch_duration_ms: Date.now() - startTime,
        sources: ['reddit'],
        notes: 'Full social coverage requires Twitter API and LunarCrush integration'
      }
    };
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  SocialService,
  RedditService,
  TwitterService,
  GoogleTrendsService,
  SocialMetricsService,
  extractTickers,
  analyzeSentiment
};

// CLI execution
if (require.main === module) {
  (async () => {
    console.log('🚀 Testing Social Signals Tracker...\n');
    
    const snapshot = await SocialService.getSocialSnapshot();
    
    console.log('\n📲 SOCIAL SNAPSHOT SUMMARY:');
    console.log('─'.repeat(50));
    
    const reddit = snapshot.reddit;
    
    console.log(`\n🔴 Reddit Activity:`);
    console.log(`   Total Active Users: ${reddit.total_active_users.toLocaleString()}`);
    
    Object.entries(reddit.subreddits).forEach(([sub, data]) => {
      if (data.stats) {
        console.log(`   r/${sub}: ${data.stats.active_users?.toLocaleString()} online, ${data.stats.subscribers?.toLocaleString()} subscribers`);
      }
    });
    
    if (reddit.overall_sentiment) {
      console.log(`\n📊 Sentiment Analysis:`);
      console.log(`   Bullish: ${reddit.overall_sentiment.bullish_pct}%`);
      console.log(`   Bearish: ${reddit.overall_sentiment.bearish_pct}%`);
      console.log(`   Neutral: ${reddit.overall_sentiment.neutral_pct}%`);
    }
    
    if (Object.keys(reddit.trending_tickers).length > 0) {
      console.log(`\n🏷️ Trending Tickers:`);
      Object.entries(reddit.trending_tickers).slice(0, 10).forEach(([ticker, count]) => {
        console.log(`   $${ticker}: ${count} mentions`);
      });
    }
    
    if (reddit.top_posts.length > 0) {
      console.log(`\n🔥 Top Posts:`);
      reddit.top_posts.slice(0, 5).forEach(post => {
        console.log(`   [${post.score}⬆] ${post.title.slice(0, 60)}...`);
      });
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log('✅ Social tracking complete');
  })();
}
