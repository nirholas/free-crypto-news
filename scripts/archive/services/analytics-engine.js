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
 * Comprehensive Analytics Engine
 * 
 * Generates insights, analytics, and digests from the archive:
 * - Daily/weekly digest generation
 * - Narrative momentum tracking
 * - Anomaly detection
 * - Trend analysis
 * - Correlation discovery
 */

const fs = require('fs').promises;
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

const ARCHIVE_DIR = path.join(__dirname, '../../archive');
const ANALYTICS_DIR = path.join(ARCHIVE_DIR, 'analytics');

// Anomaly detection thresholds
const ANOMALY_THRESHOLDS = {
  volume_spike: 2.0,      // 2x normal volume
  sentiment_shift: 0.3,    // 30% sentiment change
  source_concentration: 0.7 // 70%+ from single source = suspicious
};

// =============================================================================
// DATA LOADING
// =============================================================================

async function loadArticles(monthFile) {
  const articles = [];
  const filePath = path.join(ARCHIVE_DIR, 'articles', monthFile);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          articles.push(JSON.parse(line));
        } catch (e) {}
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  
  return articles;
}

async function loadMarketData(monthFile) {
  const data = [];
  const filePath = path.join(ARCHIVE_DIR, 'market', monthFile);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          data.push(JSON.parse(line));
        } catch (e) {}
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  
  return data;
}

// =============================================================================
// DIGEST GENERATOR
// =============================================================================

const DigestGenerator = {
  /**
   * Generate daily digest
   */
  generateDailyDigest(articles, marketData, date) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    // Filter articles for this day
    const dayArticles = articles.filter(a => {
      const articleDate = new Date(a.first_seen);
      return articleDate >= dayStart && articleDate < dayEnd;
    });
    
    // Filter market data for this day
    const dayMarket = marketData.filter(m => {
      const dataDate = new Date(m.timestamp);
      return dataDate >= dayStart && dataDate < dayEnd;
    });
    
    // Calculate stats
    const stats = this.calculateDayStats(dayArticles);
    
    // Get top stories
    const topStories = this.getTopStories(dayArticles, 10);
    
    // Get market summary
    const marketSummary = this.getMarketSummary(dayMarket);
    
    // Generate narrative
    const narrative = this.generateNarrative(stats, topStories, marketSummary);
    
    return {
      date: date,
      generated_at: new Date().toISOString(),
      
      summary: {
        article_count: dayArticles.length,
        source_count: new Set(dayArticles.map(a => a.source)).size,
        unique_tickers: [...new Set(dayArticles.flatMap(a => a.tickers || []))],
        sentiment_breakdown: stats.sentiment
      },
      
      top_stories: topStories,
      
      market_summary: marketSummary,
      
      narrative: narrative,
      
      hourly_activity: this.getHourlyActivity(dayArticles),
      
      source_breakdown: stats.sources,
      
      ticker_mentions: stats.tickers,
      
      anomalies: this.detectAnomalies(dayArticles, stats)
    };
  },

  calculateDayStats(articles) {
    const sentiment = { bullish: 0, bearish: 0, neutral: 0 };
    const sources = {};
    const tickers = {};
    const categories = {};
    
    for (const article of articles) {
      // Sentiment
      if (article.sentiment) {
        sentiment[article.sentiment] = (sentiment[article.sentiment] || 0) + 1;
      }
      
      // Sources
      sources[article.source] = (sources[article.source] || 0) + 1;
      
      // Tickers
      (article.tickers || []).forEach(t => {
        tickers[t] = (tickers[t] || 0) + 1;
      });
      
      // Categories
      (article.categories || []).forEach(c => {
        categories[c] = (categories[c] || 0) + 1;
      });
    }
    
    return {
      sentiment,
      sources: Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([source, count]) => ({ source, count })),
      tickers: Object.entries(tickers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([ticker, count]) => ({ ticker, count })),
      categories: Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count }))
    };
  },

  getTopStories(articles, limit = 10) {
    // Score articles by various factors
    const scored = articles.map(a => {
      let score = 0;
      
      // More tickers = more significant
      score += (a.tickers?.length || 0) * 2;
      
      // Certain categories are more important
      if (a.categories?.includes('breaking')) score += 10;
      if (a.categories?.includes('regulation')) score += 5;
      if (a.categories?.includes('security')) score += 5;
      
      // Longer descriptions often mean more detailed stories
      score += Math.min((a.description?.length || 0) / 100, 5);
      
      return { article: a, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ article, score }) => ({
        title: article.title,
        source: article.source,
        first_seen: article.first_seen,
        tickers: article.tickers,
        categories: article.categories,
        sentiment: article.sentiment,
        link: article.link,
        relevance_score: score
      }));
  },

  getMarketSummary(marketData) {
    if (marketData.length === 0) return null;
    
    // Get latest and earliest for the day
    const latest = marketData[marketData.length - 1];
    const earliest = marketData[0];
    
    return {
      btc: {
        open: earliest.btc_price,
        close: latest.btc_price,
        change_pct: earliest.btc_price 
          ? ((latest.btc_price - earliest.btc_price) / earliest.btc_price * 100).toFixed(2)
          : null
      },
      eth: {
        open: earliest.eth_price,
        close: latest.eth_price,
        change_pct: earliest.eth_price
          ? ((latest.eth_price - earliest.eth_price) / earliest.eth_price * 100).toFixed(2)
          : null
      },
      fear_greed: {
        open: earliest.fear_greed,
        close: latest.fear_greed,
        change: latest.fear_greed - earliest.fear_greed
      },
      total_tvl: latest.total_defi_tvl,
      data_points: marketData.length
    };
  },

  getHourlyActivity(articles) {
    const hourly = new Array(24).fill(0);
    
    for (const article of articles) {
      const hour = new Date(article.first_seen).getUTCHours();
      hourly[hour]++;
    }
    
    return hourly.map((count, hour) => ({ hour, count }));
  },

  detectAnomalies(articles, stats) {
    const anomalies = [];
    
    // Check for source concentration
    const totalArticles = articles.length;
    if (totalArticles > 10) {
      const topSource = stats.sources[0];
      if (topSource && topSource.count / totalArticles > ANOMALY_THRESHOLDS.source_concentration) {
        anomalies.push({
          type: 'source_concentration',
          severity: 'warning',
          description: `${topSource.source} accounts for ${(topSource.count / totalArticles * 100).toFixed(0)}% of articles`,
          data: topSource
        });
      }
    }
    
    // Check for sentiment extreme
    const sentimentTotal = Object.values(stats.sentiment).reduce((a, b) => a + b, 0);
    if (sentimentTotal > 10) {
      const bullishPct = stats.sentiment.bullish / sentimentTotal;
      const bearishPct = stats.sentiment.bearish / sentimentTotal;
      
      if (bullishPct > 0.7) {
        anomalies.push({
          type: 'extreme_bullish',
          severity: 'info',
          description: `Unusually bullish sentiment: ${(bullishPct * 100).toFixed(0)}% of articles`,
          data: { bullish_pct: bullishPct }
        });
      }
      
      if (bearishPct > 0.7) {
        anomalies.push({
          type: 'extreme_bearish',
          severity: 'warning',
          description: `Unusually bearish sentiment: ${(bearishPct * 100).toFixed(0)}% of articles`,
          data: { bearish_pct: bearishPct }
        });
      }
    }
    
    // Check for ticker dominance
    if (stats.tickers.length > 0 && totalArticles > 20) {
      const topTicker = stats.tickers[0];
      if (topTicker.count / totalArticles > 0.5) {
        anomalies.push({
          type: 'ticker_dominance',
          severity: 'info',
          description: `${topTicker.ticker} dominates coverage with ${(topTicker.count / totalArticles * 100).toFixed(0)}% of mentions`,
          data: topTicker
        });
      }
    }
    
    return anomalies;
  },

  generateNarrative(stats, topStories, marketSummary) {
    const parts = [];
    
    // Market context
    if (marketSummary?.btc?.change_pct) {
      const btcChange = parseFloat(marketSummary.btc.change_pct);
      if (btcChange > 5) {
        parts.push(`Bitcoin surged ${btcChange.toFixed(1)}% in a strong bullish day.`);
      } else if (btcChange < -5) {
        parts.push(`Bitcoin dropped ${Math.abs(btcChange).toFixed(1)}% in a bearish session.`);
      } else {
        parts.push(`Bitcoin moved ${btcChange > 0 ? 'up' : 'down'} ${Math.abs(btcChange).toFixed(1)}% in relatively quiet trading.`);
      }
    }
    
    // Top story
    if (topStories.length > 0) {
      parts.push(`The top story was "${topStories[0].title}" from ${topStories[0].source}.`);
    }
    
    // Sentiment summary
    const sentimentTotal = Object.values(stats.sentiment).reduce((a, b) => a + b, 0);
    if (sentimentTotal > 0) {
      const bullishPct = (stats.sentiment.bullish / sentimentTotal * 100).toFixed(0);
      const bearishPct = (stats.sentiment.bearish / sentimentTotal * 100).toFixed(0);
      parts.push(`Overall sentiment was ${bullishPct}% bullish and ${bearishPct}% bearish.`);
    }
    
    // Fear & Greed
    if (marketSummary?.fear_greed?.close) {
      const fg = marketSummary.fear_greed.close;
      let fgDesc = 'neutral';
      if (fg < 25) fgDesc = 'extreme fear';
      else if (fg < 45) fgDesc = 'fear';
      else if (fg > 75) fgDesc = 'extreme greed';
      else if (fg > 55) fgDesc = 'greed';
      parts.push(`The Fear & Greed Index ended at ${fg} (${fgDesc}).`);
    }
    
    return parts.join(' ');
  },

  /**
   * Generate weekly digest
   */
  generateWeeklyDigest(dailyDigests) {
    const weeklyStats = {
      total_articles: 0,
      total_sources: new Set(),
      all_tickers: {},
      sentiment_sum: { bullish: 0, bearish: 0, neutral: 0 },
      anomaly_count: 0
    };
    
    for (const digest of dailyDigests) {
      weeklyStats.total_articles += digest.summary.article_count;
      digest.source_breakdown.forEach(s => weeklyStats.total_sources.add(s.source));
      
      Object.entries(digest.summary.sentiment_breakdown).forEach(([sentiment, count]) => {
        weeklyStats.sentiment_sum[sentiment] += count;
      });
      
      digest.ticker_mentions.forEach(({ ticker, count }) => {
        weeklyStats.all_tickers[ticker] = (weeklyStats.all_tickers[ticker] || 0) + count;
      });
      
      weeklyStats.anomaly_count += digest.anomalies.length;
    }
    
    return {
      week_of: dailyDigests[0]?.date,
      generated_at: new Date().toISOString(),
      days_covered: dailyDigests.length,
      
      summary: {
        total_articles: weeklyStats.total_articles,
        avg_daily_articles: Math.round(weeklyStats.total_articles / dailyDigests.length),
        unique_sources: weeklyStats.total_sources.size,
        overall_sentiment: {
          bullish_pct: (weeklyStats.sentiment_sum.bullish / weeklyStats.total_articles * 100).toFixed(1),
          bearish_pct: (weeklyStats.sentiment_sum.bearish / weeklyStats.total_articles * 100).toFixed(1)
        },
        total_anomalies: weeklyStats.anomaly_count
      },
      
      top_tickers: Object.entries(weeklyStats.all_tickers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([ticker, count]) => ({ ticker, count })),
      
      daily_breakdown: dailyDigests.map(d => ({
        date: d.date,
        articles: d.summary.article_count,
        top_story: d.top_stories[0]?.title
      }))
    };
  }
};

// =============================================================================
// TREND ANALYZER
// =============================================================================

const TrendAnalyzer = {
  /**
   * Analyze narrative momentum
   */
  analyzeNarrativeMomentum(articles, windowHours = 24) {
    const now = new Date();
    const windowStart = new Date(now - windowHours * 60 * 60 * 1000);
    
    // Group articles by topic/story
    const topics = {};
    
    for (const article of articles) {
      const articleDate = new Date(article.first_seen);
      if (articleDate < windowStart) continue;
      
      // Use key terms as topic identifier
      const keyTerms = (article.tickers || []).concat(article.categories || []);
      const topicKey = keyTerms.sort().join('_') || 'general';
      
      if (!topics[topicKey]) {
        topics[topicKey] = {
          terms: keyTerms,
          articles: [],
          first_seen: article.first_seen,
          sources: new Set()
        };
      }
      
      topics[topicKey].articles.push(article);
      topics[topicKey].sources.add(article.source);
    }
    
    // Calculate momentum for each topic
    const momentum = Object.entries(topics).map(([key, data]) => {
      const hoursSinceFirst = (now - new Date(data.first_seen)) / (60 * 60 * 1000);
      const velocity = data.articles.length / Math.max(hoursSinceFirst, 1);
      
      return {
        topic: key,
        terms: data.terms,
        article_count: data.articles.length,
        source_count: data.sources.size,
        first_seen: data.first_seen,
        velocity: velocity.toFixed(2),
        momentum_score: Math.round(velocity * data.sources.size * 10),
        is_trending: velocity > 1 && data.sources.size > 2
      };
    });
    
    return momentum
      .sort((a, b) => b.momentum_score - a.momentum_score)
      .slice(0, 20);
  },

  /**
   * Detect coverage patterns
   */
  detectCoveragePatterns(articles) {
    const patterns = {
      peak_hours: [],
      quiet_hours: [],
      weekend_vs_weekday: { weekend: 0, weekday: 0 },
      source_timing: {}
    };
    
    const hourCounts = new Array(24).fill(0);
    
    for (const article of articles) {
      const date = new Date(article.first_seen);
      const hour = date.getUTCHours();
      const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
      
      hourCounts[hour]++;
      
      if (isWeekend) {
        patterns.weekend_vs_weekday.weekend++;
      } else {
        patterns.weekend_vs_weekday.weekday++;
      }
      
      // Track when each source publishes
      if (!patterns.source_timing[article.source]) {
        patterns.source_timing[article.source] = new Array(24).fill(0);
      }
      patterns.source_timing[article.source][hour]++;
    }
    
    // Find peak and quiet hours
    const avgCount = hourCounts.reduce((a, b) => a + b, 0) / 24;
    hourCounts.forEach((count, hour) => {
      if (count > avgCount * 1.5) {
        patterns.peak_hours.push({ hour, count });
      }
      if (count < avgCount * 0.5) {
        patterns.quiet_hours.push({ hour, count });
      }
    });
    
    return patterns;
  }
};

// =============================================================================
// ANALYTICS SERVICE
// =============================================================================

const AnalyticsService = {
  /**
   * Generate comprehensive analytics
   */
  async generateAnalytics(monthFile = '2026-01.jsonl') {
    console.log('📊 Generating comprehensive analytics...');
    const startTime = Date.now();
    
    const articles = await loadArticles(monthFile);
    const marketData = await loadMarketData(monthFile);
    
    console.log(`📰 Loaded ${articles.length} articles`);
    console.log(`📈 Loaded ${marketData.length} market snapshots`);
    
    // Group articles by day
    const articlesByDay = {};
    for (const article of articles) {
      const day = article.first_seen?.slice(0, 10);
      if (!day) continue;
      if (!articlesByDay[day]) articlesByDay[day] = [];
      articlesByDay[day].push(article);
    }
    
    // Generate daily digests
    const dailyDigests = [];
    for (const [day, dayArticles] of Object.entries(articlesByDay).sort()) {
      const dayMarket = marketData.filter(m => m.timestamp?.startsWith(day));
      const digest = DigestGenerator.generateDailyDigest(dayArticles, dayMarket, day);
      dailyDigests.push(digest);
    }
    
    // Narrative momentum
    const momentum = TrendAnalyzer.analyzeNarrativeMomentum(articles);
    
    // Coverage patterns
    const patterns = TrendAnalyzer.detectCoveragePatterns(articles);
    
    // Save analytics
    await fs.mkdir(ANALYTICS_DIR, { recursive: true });
    
    // Save daily digests
    for (const digest of dailyDigests) {
      await fs.writeFile(
        path.join(ANALYTICS_DIR, `digest-${digest.date}.json`),
        JSON.stringify(digest, null, 2)
      );
    }
    
    // Save weekly digest if enough data
    if (dailyDigests.length >= 7) {
      const weeklyDigest = DigestGenerator.generateWeeklyDigest(dailyDigests.slice(-7));
      await fs.writeFile(
        path.join(ANALYTICS_DIR, `weekly-digest-${dailyDigests[dailyDigests.length - 1].date}.json`),
        JSON.stringify(weeklyDigest, null, 2)
      );
    }
    
    // Save momentum analysis
    await fs.writeFile(
      path.join(ANALYTICS_DIR, 'narrative-momentum.json'),
      JSON.stringify({
        generated_at: new Date().toISOString(),
        trending_topics: momentum
      }, null, 2)
    );
    
    // Save patterns
    await fs.writeFile(
      path.join(ANALYTICS_DIR, 'coverage-patterns.json'),
      JSON.stringify({
        generated_at: new Date().toISOString(),
        patterns
      }, null, 2)
    );
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Analytics generated in ${elapsed}s`);
    
    return {
      daily_digests: dailyDigests.length,
      trending_topics: momentum.length,
      analytics_dir: ANALYTICS_DIR
    };
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  DigestGenerator,
  TrendAnalyzer,
  AnalyticsService,
  ANOMALY_THRESHOLDS
};

// CLI execution
if (require.main === module) {
  (async () => {
    console.log('🚀 Comprehensive Analytics Engine\n');
    
    const result = await AnalyticsService.generateAnalytics();
    
    console.log('\n📊 ANALYTICS SUMMARY:');
    console.log('─'.repeat(50));
    console.log(`Daily Digests Generated: ${result.daily_digests}`);
    console.log(`Trending Topics Found: ${result.trending_topics}`);
    console.log(`Output Directory: ${result.analytics_dir}`);
  })();
}
