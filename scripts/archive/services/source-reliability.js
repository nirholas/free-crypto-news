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
 * Source Reliability Tracker
 * 
 * Tracks source performance over time:
 * - First-mover frequency (who breaks stories first)
 * - Accuracy tracking (for predictions/claims)
 * - Coverage patterns
 * - Credibility scoring
 */

const fs = require('fs').promises;
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

const DATA_DIR = path.join(__dirname, '../../archive/meta');
const SOURCE_STATS_FILE = path.join(DATA_DIR, 'source-stats.json');

// Scoring weights
const SCORING_WEIGHTS = {
  first_mover: 0.3,         // Being first matters
  coverage_consistency: 0.2, // Regular coverage
  accuracy: 0.3,            // Prediction accuracy
  original_reporting: 0.2    // Original vs aggregation
};

// Source categories — mirrors the canonical tier definitions in src/lib/source-tiers.ts.
// Keep in sync with that file when adding or re-tiering sources.
const SOURCE_CATEGORIES = {
  tier1:    ['reuters', 'bloomberg', 'wsj', 'ft', 'cnbc', 'forbes', 'yahoofinance'],
  tier2:    ['coindesk', 'theblock', 'blockworks', 'decrypt', 'unchained', 'defiant', 'dlnews'],
  tier3:    ['cointelegraph', 'bitcoinmagazine', 'bankless', 'cryptoslate', 'bitcoinist', 'beincrypto', 'newsbtc'],
  tier4:    ['cryptonews', 'ambcrypto', 'cryptopotato'],
  research: ['messari', 'delphi', 'paradigm', 'a16z'],
  fintech:  ['finextra', 'pymnts', 'fintechfutures'],
  social:   ['twitter', 'reddit', 'telegram'],
};

// =============================================================================
// SOURCE STATS MANAGER
// =============================================================================

class SourceStatsManager {
  constructor() {
    this.stats = {};
  }

  async load() {
    try {
      const data = await fs.readFile(SOURCE_STATS_FILE, 'utf8');
      this.stats = JSON.parse(data);
      console.log(`📂 Loaded stats for ${Object.keys(this.stats).length} sources`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.stats = {};
        console.log('📂 No existing source stats, starting fresh');
      } else {
        throw error;
      }
    }
    return this;
  }

  async save() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      SOURCE_STATS_FILE, 
      JSON.stringify(this.stats, null, 2)
    );
    console.log(`💾 Saved stats for ${Object.keys(this.stats).length} sources`);
  }

  getSourceStats(source) {
    const normalized = this.normalizeSource(source);
    if (!this.stats[normalized]) {
      this.stats[normalized] = this.createEmptyStats(normalized);
    }
    return this.stats[normalized];
  }

  normalizeSource(source) {
    return source?.toLowerCase().trim() || 'unknown';
  }

  createEmptyStats(source) {
    return {
      source: source,
      category: this.categorizeSource(source),
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      
      // Counts
      total_articles: 0,
      first_mover_count: 0,
      
      // Performance
      avg_delay_minutes: 0,
      total_delays: [],
      
      // Accuracy tracking
      predictions_made: 0,
      predictions_correct: 0,
      predictions_incorrect: 0,
      predictions_pending: 0,
      
      // Coverage patterns
      coverage_by_category: {},
      coverage_by_ticker: {},
      hourly_distribution: new Array(24).fill(0),
      
      // Credibility
      credibility_score: 50, // Start neutral
      score_history: [],
      
      // Metadata
      total_clusters_participated: 0,
      exclusive_stories: 0 // Stories only this source covered
    };
  }

  categorizeSource(source) {
    const lower = source.toLowerCase();
    for (const [category, sources] of Object.entries(SOURCE_CATEGORIES)) {
      if (sources.some(s => lower.includes(s))) {
        return category;
      }
    }
    return 'other';
  }

  recordArticle(article) {
    const stats = this.getSourceStats(article.source);
    stats.total_articles++;
    stats.last_seen = new Date().toISOString();
    
    // Track categories
    if (article.categories) {
      article.categories.forEach(cat => {
        stats.coverage_by_category[cat] = (stats.coverage_by_category[cat] || 0) + 1;
      });
    }
    
    // Track tickers
    if (article.tickers) {
      article.tickers.forEach(ticker => {
        stats.coverage_by_ticker[ticker] = (stats.coverage_by_ticker[ticker] || 0) + 1;
      });
    }
    
    // Track hourly distribution
    const hour = new Date(article.first_seen || article.pub_date).getUTCHours();
    stats.hourly_distribution[hour]++;
  }

  recordFirstMover(source, storyCluster) {
    const stats = this.getSourceStats(source);
    stats.first_mover_count++;
    stats.total_clusters_participated++;
    
    // Boost credibility for breaking news
    this.adjustCredibility(source, 2);
  }

  recordFollower(source, delayMinutes, storyCluster) {
    const stats = this.getSourceStats(source);
    stats.total_clusters_participated++;
    stats.total_delays.push(delayMinutes);
    
    // Update average
    stats.avg_delay_minutes = Math.round(
      stats.total_delays.reduce((a, b) => a + b, 0) / stats.total_delays.length
    );
    
    // Keep only last 1000 delays to prevent memory bloat
    if (stats.total_delays.length > 1000) {
      stats.total_delays = stats.total_delays.slice(-1000);
    }
  }

  recordExclusive(source) {
    const stats = this.getSourceStats(source);
    stats.exclusive_stories++;
    
    // Big boost for exclusive stories
    this.adjustCredibility(source, 5);
  }

  recordPrediction(source, prediction) {
    const stats = this.getSourceStats(source);
    stats.predictions_made++;
    stats.predictions_pending++;
  }

  resolvePrediction(source, correct) {
    const stats = this.getSourceStats(source);
    stats.predictions_pending = Math.max(0, stats.predictions_pending - 1);
    
    if (correct) {
      stats.predictions_correct++;
      this.adjustCredibility(source, 10);
    } else {
      stats.predictions_incorrect++;
      this.adjustCredibility(source, -10);
    }
  }

  adjustCredibility(source, delta) {
    const stats = this.getSourceStats(source);
    stats.credibility_score = Math.max(0, Math.min(100, 
      stats.credibility_score + delta
    ));
    
    stats.score_history.push({
      timestamp: new Date().toISOString(),
      score: stats.credibility_score,
      delta
    });
    
    // Keep only last 100 score changes
    if (stats.score_history.length > 100) {
      stats.score_history = stats.score_history.slice(-100);
    }
  }

  calculateCredibilityScore(source) {
    const stats = this.getSourceStats(source);
    
    // First mover rate (0-100)
    const firstMoverRate = stats.total_clusters_participated > 0
      ? (stats.first_mover_count / stats.total_clusters_participated) * 100
      : 0;
    
    // Accuracy rate (0-100)
    const totalResolved = stats.predictions_correct + stats.predictions_incorrect;
    const accuracyRate = totalResolved > 0
      ? (stats.predictions_correct / totalResolved) * 100
      : 50; // Neutral if no predictions
    
    // Coverage consistency (based on hourly distribution evenness)
    const hourlyTotal = stats.hourly_distribution.reduce((a, b) => a + b, 0);
    const expectedPerHour = hourlyTotal / 24;
    const variance = stats.hourly_distribution.reduce(
      (sum, val) => sum + Math.pow(val - expectedPerHour, 2), 0
    ) / 24;
    const consistencyScore = Math.max(0, 100 - variance / 10);
    
    // Original reporting bonus
    const originalRate = stats.exclusive_stories > 0 && stats.total_articles > 0
      ? Math.min(100, (stats.exclusive_stories / stats.total_articles) * 1000)
      : 0;
    
    // Weighted score
    const score = 
      (firstMoverRate * SCORING_WEIGHTS.first_mover) +
      (consistencyScore * SCORING_WEIGHTS.coverage_consistency) +
      (accuracyRate * SCORING_WEIGHTS.accuracy) +
      (originalRate * SCORING_WEIGHTS.original_reporting);
    
    return {
      overall: Math.round(score),
      first_mover_rate: firstMoverRate.toFixed(1),
      accuracy_rate: accuracyRate.toFixed(1),
      consistency_score: consistencyScore.toFixed(1),
      original_rate: originalRate.toFixed(1)
    };
  }

  getLeaderboard(metric = 'credibility_score', limit = 20) {
    const sources = Object.values(this.stats)
      .filter(s => s.total_articles >= 10) // Minimum threshold
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, limit);
    
    return sources.map(s => ({
      source: s.source,
      category: s.category,
      [metric]: s[metric],
      total_articles: s.total_articles,
      first_mover_count: s.first_mover_count,
      first_mover_rate: s.total_clusters_participated > 0
        ? ((s.first_mover_count / s.total_clusters_participated) * 100).toFixed(1) + '%'
        : 'N/A'
    }));
  }

  exportStats() {
    return {
      timestamp: new Date().toISOString(),
      total_sources: Object.keys(this.stats).length,
      sources: this.stats,
      leaderboards: {
        credibility: this.getLeaderboard('credibility_score'),
        first_mover: this.getLeaderboard('first_mover_count'),
        volume: this.getLeaderboard('total_articles')
      },
      category_breakdown: this.getCategoryBreakdown()
    };
  }

  getCategoryBreakdown() {
    const breakdown = {};
    
    for (const stats of Object.values(this.stats)) {
      if (!breakdown[stats.category]) {
        breakdown[stats.category] = {
          source_count: 0,
          total_articles: 0,
          avg_credibility: 0,
          credibility_sum: 0
        };
      }
      
      breakdown[stats.category].source_count++;
      breakdown[stats.category].total_articles += stats.total_articles;
      breakdown[stats.category].credibility_sum += stats.credibility_score;
    }
    
    // Calculate averages
    for (const cat of Object.values(breakdown)) {
      cat.avg_credibility = Math.round(cat.credibility_sum / cat.source_count);
      delete cat.credibility_sum;
    }
    
    return breakdown;
  }
}

// =============================================================================
// RELIABILITY SERVICE
// =============================================================================

const ReliabilityService = {
  manager: new SourceStatsManager(),

  async initialize() {
    await this.manager.load();
    return this;
  },

  async save() {
    await this.manager.save();
  },

  /**
   * Process clustering results to update source stats
   */
  processClusteringResults(clusteringResults) {
    console.log('📈 Processing clustering results for source reliability...');
    
    for (const cluster of clusteringResults.clusters) {
      // Record first mover
      this.manager.recordFirstMover(cluster.first_mover.source, cluster);
      
      // Record followers
      for (const article of cluster.articles) {
        if (article.source !== cluster.first_mover.source) {
          const firstTime = new Date(cluster.first_mover.first_seen);
          const articleTime = new Date(article.first_seen);
          const delayMinutes = (articleTime - firstTime) / 60000;
          
          this.manager.recordFollower(article.source, delayMinutes, cluster);
        }
      }
      
      // Record exclusive if single source
      if (cluster.sources.length === 1) {
        this.manager.recordExclusive(cluster.sources[0]);
      }
    }
    
    console.log('✅ Source reliability stats updated');
  },

  /**
   * Record articles from a collection run
   */
  recordArticles(articles) {
    for (const article of articles) {
      this.manager.recordArticle(article);
    }
  },

  /**
   * Get full report
   */
  getReport() {
    return this.manager.exportStats();
  },

  /**
   * Get credibility for a specific source
   */
  getSourceCredibility(source) {
    return this.manager.calculateCredibilityScore(source);
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  ReliabilityService,
  SourceStatsManager,
  SOURCE_CATEGORIES,
  SCORING_WEIGHTS
};

// CLI execution
if (require.main === module) {
  (async () => {
    console.log('🚀 Testing Source Reliability Tracker...\n');
    
    await ReliabilityService.initialize();
    
    // Simulate some data
    const sampleArticles = [
      { source: 'CoinDesk', tickers: ['BTC', 'ETH'], categories: ['market'], first_seen: '2026-01-11T10:00:00Z' },
      { source: 'CoinTelegraph', tickers: ['BTC'], categories: ['market'], first_seen: '2026-01-11T10:15:00Z' },
      { source: 'The Block', tickers: ['ETH'], categories: ['defi'], first_seen: '2026-01-11T10:30:00Z' },
      { source: 'CoinDesk', tickers: ['SOL'], categories: ['altcoins'], first_seen: '2026-01-11T11:00:00Z' },
      { source: 'Decrypt', tickers: ['BTC'], categories: ['market'], first_seen: '2026-01-11T11:30:00Z' },
    ];
    
    // Record articles
    ReliabilityService.recordArticles(sampleArticles);
    
    // Simulate some cluster results
    const clusterResults = {
      clusters: [
        {
          first_mover: { source: 'CoinDesk', first_seen: '2026-01-11T10:00:00Z' },
          sources: ['CoinDesk', 'CoinTelegraph', 'The Block'],
          articles: [
            { source: 'CoinDesk', first_seen: '2026-01-11T10:00:00Z' },
            { source: 'CoinTelegraph', first_seen: '2026-01-11T10:15:00Z' },
            { source: 'The Block', first_seen: '2026-01-11T10:30:00Z' }
          ]
        },
        {
          first_mover: { source: 'Decrypt', first_seen: '2026-01-11T11:30:00Z' },
          sources: ['Decrypt'],
          articles: [
            { source: 'Decrypt', first_seen: '2026-01-11T11:30:00Z' }
          ]
        }
      ]
    };
    
    ReliabilityService.processClusteringResults(clusterResults);
    
    // Get report
    const report = ReliabilityService.getReport();
    
    console.log('\n📊 SOURCE RELIABILITY REPORT:');
    console.log('─'.repeat(50));
    console.log(`Total Sources Tracked: ${report.total_sources}`);
    
    console.log('\n🏆 Credibility Leaderboard:');
    report.leaderboards.credibility.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.source}: ${s.credibility_score} points (${s.first_mover_rate} first-mover)`);
    });
    
    console.log('\n📊 Category Breakdown:');
    Object.entries(report.category_breakdown).forEach(([cat, data]) => {
      console.log(`   ${cat}: ${data.source_count} sources, ${data.total_articles} articles, avg credibility ${data.avg_credibility}`);
    });
    
    // Get specific source credibility
    const coindeskCred = ReliabilityService.getSourceCredibility('CoinDesk');
    console.log('\n🎯 CoinDesk Credibility Breakdown:');
    console.log(`   Overall: ${coindeskCred.overall}/100`);
    console.log(`   First Mover Rate: ${coindeskCred.first_mover_rate}%`);
    console.log(`   Accuracy Rate: ${coindeskCred.accuracy_rate}%`);
    
    await ReliabilityService.save();
    console.log('\n✅ Source reliability tracking complete');
  })();
}
