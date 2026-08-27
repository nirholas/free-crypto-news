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
 * Monthly Statistics Generator
 * 
 * Generates comprehensive statistics for a given month's archive data.
 * Useful for reports, insights, and monitoring archive health.
 */

const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = process.env.ARCHIVE_DIR || path.join(__dirname, '../../archive');

/**
 * Parse JSONL file into articles
 */
function parseJsonl(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.trim().split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Generate monthly statistics
 */
function generateMonthlyStats(yearMonth) {
  const articlesPath = path.join(ARCHIVE_DIR, 'v2', 'articles', `${yearMonth}.jsonl`);
  const articles = parseJsonl(articlesPath);
  
  if (articles.length === 0) {
    console.log(`No articles found for ${yearMonth}`);
    return null;
  }
  
  console.log(`📊 Generating stats for ${yearMonth} (${articles.length} articles)\n`);
  
  // Basic counts
  const stats = {
    month: yearMonth,
    generated_at: new Date().toISOString(),
    total_articles: articles.length,
    unique_sources: new Set(articles.map(a => a.source_key)).size,
    
    // Date range
    date_range: {
      first: articles.reduce((min, a) => a.first_seen < min ? a.first_seen : min, articles[0].first_seen),
      last: articles.reduce((max, a) => a.first_seen > max ? a.first_seen : max, articles[0].first_seen)
    },
    
    // By source
    by_source: {},
    
    // By ticker
    by_ticker: {},
    ticker_total_mentions: 0,
    
    // By sentiment
    by_sentiment: {
      very_positive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      very_negative: 0
    },
    sentiment_average: 0,
    
    // By tag
    by_tag: {},
    
    // By category
    by_category: {},
    
    // By day
    by_day: {},
    
    // Entities
    top_people: {},
    top_companies: {},
    top_protocols: {},
    
    // Meta
    breaking_news_count: 0,
    opinion_count: 0,
    articles_with_numbers: 0,
    average_word_count: 0,
    
    // Fetch stats
    average_fetch_count: 0,
    most_seen_articles: []
  };
  
  let totalSentiment = 0;
  let totalWordCount = 0;
  let totalFetchCount = 0;
  
  for (const article of articles) {
    // By source
    const source = article.source_key || 'unknown';
    stats.by_source[source] = (stats.by_source[source] || 0) + 1;
    
    // By ticker
    for (const ticker of (article.tickers || [])) {
      stats.by_ticker[ticker] = (stats.by_ticker[ticker] || 0) + 1;
      stats.ticker_total_mentions++;
    }
    
    // By sentiment
    if (article.sentiment?.label) {
      stats.by_sentiment[article.sentiment.label]++;
      totalSentiment += article.sentiment.score || 0;
    }
    
    // By tag
    for (const tag of (article.tags || [])) {
      stats.by_tag[tag] = (stats.by_tag[tag] || 0) + 1;
    }
    
    // By category
    const category = article.category || 'general';
    stats.by_category[category] = (stats.by_category[category] || 0) + 1;
    
    // By day
    const day = (article.first_seen || '').split('T')[0];
    if (day) {
      stats.by_day[day] = (stats.by_day[day] || 0) + 1;
    }
    
    // Entities
    for (const person of (article.entities?.people || [])) {
      stats.top_people[person] = (stats.top_people[person] || 0) + 1;
    }
    for (const company of (article.entities?.companies || [])) {
      stats.top_companies[company] = (stats.top_companies[company] || 0) + 1;
    }
    for (const protocol of (article.entities?.protocols || [])) {
      stats.top_protocols[protocol] = (stats.top_protocols[protocol] || 0) + 1;
    }
    
    // Meta
    if (article.meta?.is_breaking) stats.breaking_news_count++;
    if (article.meta?.is_opinion) stats.opinion_count++;
    if (article.meta?.has_numbers) stats.articles_with_numbers++;
    totalWordCount += article.meta?.word_count || 0;
    
    // Fetch count
    totalFetchCount += article.fetch_count || 1;
  }
  
  // Calculate averages
  stats.sentiment_average = Math.round((totalSentiment / articles.length) * 100) / 100;
  stats.average_word_count = Math.round(totalWordCount / articles.length);
  stats.average_fetch_count = Math.round((totalFetchCount / articles.length) * 10) / 10;
  
  // Sort and limit top entities
  const sortByValue = (obj, limit = 20) => 
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
  
  stats.by_ticker = sortByValue(stats.by_ticker, 30);
  stats.by_tag = sortByValue(stats.by_tag, 20);
  stats.top_people = sortByValue(stats.top_people, 15);
  stats.top_companies = sortByValue(stats.top_companies, 20);
  stats.top_protocols = sortByValue(stats.top_protocols, 20);
  
  // Find most-seen articles
  stats.most_seen_articles = articles
    .filter(a => a.fetch_count > 1)
    .sort((a, b) => b.fetch_count - a.fetch_count)
    .slice(0, 10)
    .map(a => ({
      id: a.id,
      title: a.title.substring(0, 80),
      source: a.source_key,
      fetch_count: a.fetch_count
    }));
  
  return stats;
}

/**
 * Print stats in a readable format
 */
function printStats(stats) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ARCHIVE STATS: ${stats.month}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`📰 Total Articles: ${stats.total_articles}`);
  console.log(`📡 Unique Sources: ${stats.unique_sources}`);
  console.log(`📅 Date Range: ${stats.date_range.first.split('T')[0]} → ${stats.date_range.last.split('T')[0]}`);
  console.log(`📊 Avg Sentiment Score: ${stats.sentiment_average}`);
  console.log(`📝 Avg Word Count: ${stats.average_word_count}`);
  console.log(`🔄 Avg Fetch Count: ${stats.average_fetch_count}`);
  
  console.log('\n📡 BY SOURCE:');
  for (const [source, count] of Object.entries(stats.by_source).sort((a, b) => b[1] - a[1])) {
    const pct = Math.round((count / stats.total_articles) * 100);
    console.log(`   ${source.padEnd(20)} ${count.toString().padStart(4)} (${pct}%)`);
  }
  
  console.log('\n💰 TOP TICKERS:');
  const topTickers = Object.entries(stats.by_ticker).slice(0, 10);
  for (const [ticker, count] of topTickers) {
    console.log(`   ${ticker.padEnd(10)} ${count.toString().padStart(4)} mentions`);
  }
  
  console.log('\n😊 SENTIMENT DISTRIBUTION:');
  for (const [label, count] of Object.entries(stats.by_sentiment)) {
    if (count > 0) {
      const pct = Math.round((count / stats.total_articles) * 100);
      const emoji = label.includes('positive') ? '🟢' : label.includes('negative') ? '🔴' : '⚪';
      console.log(`   ${emoji} ${label.padEnd(15)} ${count.toString().padStart(4)} (${pct}%)`);
    }
  }
  
  console.log('\n🏷️ TOP TAGS:');
  const topTags = Object.entries(stats.by_tag).slice(0, 8);
  for (const [tag, count] of topTags) {
    console.log(`   ${tag.padEnd(15)} ${count.toString().padStart(4)}`);
  }
  
  console.log('\n🏢 TOP COMPANIES:');
  const topCompanies = Object.entries(stats.top_companies).slice(0, 8);
  for (const [company, count] of topCompanies) {
    console.log(`   ${company.padEnd(20)} ${count.toString().padStart(4)}`);
  }
  
  console.log('\n👤 TOP PEOPLE:');
  const topPeople = Object.entries(stats.top_people).slice(0, 5);
  for (const [person, count] of topPeople) {
    console.log(`   ${person.padEnd(25)} ${count.toString().padStart(4)}`);
  }
  
  if (stats.most_seen_articles.length > 0) {
    console.log('\n🔥 MOST PERSISTENT STORIES:');
    for (const article of stats.most_seen_articles.slice(0, 5)) {
      console.log(`   [${article.fetch_count}x] ${article.title}...`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

/**
 * Save stats to file
 */
function saveStats(stats) {
  const outputDir = path.join(ARCHIVE_DIR, 'v2', 'meta', 'monthly');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, `${stats.month}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
  console.log(`💾 Stats saved to: ${outputPath}`);
}

// CLI
if (require.main === module) {
  const yearMonth = process.argv[2] || (() => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  })();
  
  const stats = generateMonthlyStats(yearMonth);
  
  if (stats) {
    printStats(stats);
    saveStats(stats);
  }
}

module.exports = { generateMonthlyStats };
