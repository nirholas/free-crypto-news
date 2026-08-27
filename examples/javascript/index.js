/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Free Crypto News API - JavaScript/Node.js Examples
 * https://github.com/nirholas/cryptocurrency.cv
 * 
 * Complete SDK with examples for all API endpoints.
 */

const news = require('./news');
const ai = require('./ai');
const market = require('./market');
const trading = require('./trading');
const streaming = require('./streaming');
const defi = require('./defi');
const macro = require('./macro');
const blockchain = require('./blockchain');
const social = require('./social');

module.exports = {
  // News exports
  ...news,
  
  // AI exports
  ...ai,
  
  // Market exports
  ...market,
  
  // Trading exports
  ...trading,
  
  // Streaming exports
  ...streaming,
  
  // DeFi exports
  ...defi,
  
  // Macro exports
  ...macro,
  
  // Blockchain exports
  ...blockchain,
  
  // Social exports
  ...social,
  
  // Base URL
  BASE_URL: 'https://cryptocurrency.cv',
  
  // Version
  VERSION: '1.0.0'
};

// Quick reference
console.log(`
📰 Free Crypto News API - JavaScript SDK

Available modules:
  - news: News feed, search, categories, sources
  - ai: Sentiment, summarization, entity extraction
  - market: Coins, OHLC, exchanges, fear/greed
  - trading: Arbitrage, signals, funding, whale alerts
  - streaming: WebSocket and SSE real-time streams

Example:
  const { getNews, getSentiment, getCoins } = require('@crypto-news/examples');
  
  const news = await getNews({ limit: 10 });
  const sentiment = await getSentiment({ asset: 'BTC' });
  const coins = await getCoins({ limit: 100 });

Documentation: https://github.com/nirholas/cryptocurrency.cv
`);
