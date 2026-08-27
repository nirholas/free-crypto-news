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
 * Fix Historical Archive Data
 * 
 * Cleans up the imported historical data:
 * - Removes "NULL" and placeholder descriptions
 * - Fixes source names by extracting from URLs
 * - Updates sourceKey based on actual source
 * - Recategorizes based on content
 * 
 * Usage:
 *   node fix-historical-data.js [options]
 * 
 * Options:
 *   --dry-run     Preview changes without writing
 *   --verbose     Show detailed progress
 */

const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '../../archive');

// Domain to source mapping
const DOMAIN_TO_SOURCE = {
  'cointelegraph.com': { source: 'CoinTelegraph', sourceKey: 'cointelegraph', category: 'general' },
  'coindesk.com': { source: 'CoinDesk', sourceKey: 'coindesk', category: 'general' },
  'decrypt.co': { source: 'Decrypt', sourceKey: 'decrypt', category: 'general' },
  'theblock.co': { source: 'The Block', sourceKey: 'theblock', category: 'general' },
  'bitcoinmagazine.com': { source: 'Bitcoin Magazine', sourceKey: 'bitcoinmagazine', category: 'bitcoin' },
  'blockworks.co': { source: 'Blockworks', sourceKey: 'blockworks', category: 'general' },
  'thedefiant.io': { source: 'The Defiant', sourceKey: 'defiant', category: 'defi' },
  'bitcoinist.com': { source: 'Bitcoinist', sourceKey: 'bitcoinist', category: 'bitcoin' },
  'beincrypto.com': { source: 'BeInCrypto', sourceKey: 'beincrypto', category: 'trading' },
  'newsbtc.com': { source: 'NewsBTC', sourceKey: 'newsbtc', category: 'bitcoin' },
  'cryptoslate.com': { source: 'CryptoSlate', sourceKey: 'cryptoslate', category: 'general' },
  'cryptopotato.com': { source: 'CryptoPotato', sourceKey: 'cryptopotato', category: 'general' },
  'u.today': { source: 'U.Today', sourceKey: 'utoday', category: 'general' },
  'ambcrypto.com': { source: 'AMBCrypto', sourceKey: 'ambcrypto', category: 'trading' },
  'dailycoin.com': { source: 'DailyCoin', sourceKey: 'dailycoin', category: 'general' },
  'cryptobriefing.com': { source: 'Crypto Briefing', sourceKey: 'cryptobriefing', category: 'general' },
  'coingape.com': { source: 'CoinGape', sourceKey: 'coingape', category: 'general' },
  'investing.com': { source: 'Investing.com', sourceKey: 'investing', category: 'mainstream' },
  'finance.yahoo.com': { source: 'Yahoo Finance', sourceKey: 'yahoo', category: 'mainstream' },
  'reuters.com': { source: 'Reuters', sourceKey: 'reuters', category: 'mainstream' },
  'bloomberg.com': { source: 'Bloomberg', sourceKey: 'bloomberg', category: 'mainstream' },
  'cnbc.com': { source: 'CNBC', sourceKey: 'cnbc', category: 'mainstream' },
  'forbes.com': { source: 'Forbes', sourceKey: 'forbes', category: 'mainstream' },
  'watcher.guru': { source: 'Watcher Guru', sourceKey: 'watcherguru', category: 'general' },
  'coinspeaker.com': { source: 'CoinSpeaker', sourceKey: 'coinspeaker', category: 'general' },
  'cryptonews.com': { source: 'CryptoNews', sourceKey: 'cryptonews', category: 'general' },
  'fxstreet.com': { source: 'FXStreet', sourceKey: 'fxstreet', category: 'trading' },
  'dailyhodl.com': { source: 'The Daily Hodl', sourceKey: 'dailyhodl', category: 'general' },
  'zycrypto.com': { source: 'ZyCrypto', sourceKey: 'zycrypto', category: 'general' },
  'nulltx.com': { source: 'NullTX', sourceKey: 'nulltx', category: 'general' },
  'blockonomi.com': { source: 'Blockonomi', sourceKey: 'blockonomi', category: 'general' },
  'cryptopanic.com': { source: 'CryptoPanic', sourceKey: 'cryptopanic', category: 'general' },
};

// Category detection keywords
const CATEGORY_KEYWORDS = {
  'bitcoin': ['bitcoin', 'btc', 'satoshi', 'lightning network', 'halving'],
  'ethereum': ['ethereum', 'eth', 'vitalik', 'erc-20', 'erc20', 'gas fee'],
  'defi': ['defi', 'aave', 'uniswap', 'compound', 'yield', 'liquidity', 'tvl', 'lending', 'sushiswap', 'curve'],
  'nft': ['nft', 'opensea', 'bayc', 'cryptopunk', 'azuki', 'blur'],
  'trading': ['price', 'pump', 'dump', 'bull', 'bear', 'rally', 'crash', 'surge', 'plunge', 'soar'],
  'regulation': ['sec', 'cftc', 'regulation', 'lawsuit', 'congress', 'legal', 'ban', 'law'],
  'altcoin': ['solana', 'sol', 'cardano', 'ada', 'xrp', 'ripple', 'dogecoin', 'doge', 'shiba'],
  'exchange': ['binance', 'coinbase', 'kraken', 'ftx', 'exchange', 'cex', 'dex'],
  'stablecoin': ['usdt', 'usdc', 'tether', 'stablecoin', 'circle', 'dai'],
  'mining': ['mining', 'miner', 'hashrate', 'difficulty', 'asic'],
  'layer2': ['layer 2', 'l2', 'rollup', 'optimism', 'arbitrum', 'polygon', 'zksync'],
};

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // Try to extract domain from malformed URLs
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Get source info from URL
 */
function getSourceFromUrl(url) {
  const domain = extractDomain(url);
  if (!domain) return null;
  
  // Direct domain match
  if (DOMAIN_TO_SOURCE[domain]) {
    return DOMAIN_TO_SOURCE[domain];
  }
  
  // Check if domain contains any known source
  for (const [knownDomain, info] of Object.entries(DOMAIN_TO_SOURCE)) {
    if (domain.includes(knownDomain.split('.')[0])) {
      return info;
    }
  }
  
  return null;
}

/**
 * Detect category from title
 */
function detectCategory(title) {
  const titleLower = title.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'general';
}

/**
 * Check if description is valid
 */
function isValidDescription(desc) {
  if (!desc) return false;
  const trimmed = desc.trim();
  if (!trimmed) return false;
  
  // Filter out placeholder values
  const invalidValues = ['null', 'none', 'n/a', '-', '--', '...', 'undefined', 'no description'];
  if (invalidValues.includes(trimmed.toLowerCase())) return false;
  
  // Too short to be useful
  if (trimmed.length < 10) return false;
  
  return true;
}

/**
 * Fix a single article
 */
function fixArticle(article) {
  const fixed = { ...article };
  let changed = false;
  
  // Fix description - remove if invalid
  if (article.description && !isValidDescription(article.description)) {
    delete fixed.description;
    changed = true;
  }
  
  // Fix source from URL if currently "Historical"
  if (article.source === 'Historical' && article.link) {
    const sourceInfo = getSourceFromUrl(article.link);
    if (sourceInfo) {
      fixed.source = sourceInfo.source;
      fixed.sourceKey = sourceInfo.sourceKey;
      // Update category from source if still general
      if (fixed.category === 'general' && sourceInfo.category !== 'general') {
        fixed.category = sourceInfo.category;
      }
      changed = true;
    }
  }
  
  // Improve category detection from title
  if (article.title) {
    const detectedCategory = detectCategory(article.title);
    if (detectedCategory !== 'general' && fixed.category === 'general') {
      fixed.category = detectedCategory;
      changed = true;
    }
  }
  
  return { article: fixed, changed };
}

/**
 * Process a single archive file
 */
function processArchiveFile(filePath, dryRun, verbose) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!data.articles || !Array.isArray(data.articles)) {
      return { processed: 0, fixed: 0, error: null };
    }
    
    let fixedCount = 0;
    const fixedArticles = data.articles.map(article => {
      const { article: fixed, changed } = fixArticle(article);
      if (changed) fixedCount++;
      return fixed;
    });
    
    if (fixedCount > 0) {
      const newData = {
        ...data,
        articles: fixedArticles,
        articleCount: fixedArticles.length,
        fixedAt: new Date().toISOString(),
      };
      
      // Remove old source marker if present
      if (newData.source === 'historical-import') {
        delete newData.source;
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
      }
      
      if (verbose) {
        console.log(`  Fixed ${fixedCount}/${data.articles.length} articles in ${path.basename(filePath)}`);
      }
    }
    
    return { processed: data.articles.length, fixed: fixedCount, error: null };
  } catch (error) {
    return { processed: 0, fixed: 0, error: error.message };
  }
}

/**
 * Find all archive JSON files
 */
function findArchiveFiles() {
  const files = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip v2 and other non-year directories
        if (/^\d{4}$/.test(entry.name)) {
          scanDir(fullPath);
        } else if (/^\d{2}$/.test(entry.name)) {
          // Month directory
          scanDir(fullPath);
        }
      } else if (entry.name.endsWith('.json') && entry.name !== 'index.json') {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(ARCHIVE_DIR);
  return files.sort();
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  console.log('Fix Historical Archive Data');
  console.log('===========================');
  if (dryRun) console.log('[DRY RUN MODE]');
  console.log();
  
  // Find all archive files
  const files = findArchiveFiles();
  console.log(`Found ${files.length} archive files to process`);
  console.log();
  
  let totalProcessed = 0;
  let totalFixed = 0;
  let totalErrors = 0;
  let filesWithFixes = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = processArchiveFile(file, dryRun, verbose);
    
    totalProcessed += result.processed;
    totalFixed += result.fixed;
    
    if (result.fixed > 0) {
      filesWithFixes++;
    }
    
    if (result.error) {
      totalErrors++;
      console.error(`Error processing ${file}: ${result.error}`);
    }
    
    // Progress indicator
    if ((i + 1) % 100 === 0 || i === files.length - 1) {
      process.stdout.write(`\rProcessed ${i + 1}/${files.length} files...`);
    }
  }
  
  console.log('\n');
  console.log('Summary:');
  console.log(`  Files processed: ${files.length}`);
  console.log(`  Files with fixes: ${filesWithFixes}`);
  console.log(`  Articles processed: ${totalProcessed}`);
  console.log(`  Articles fixed: ${totalFixed}`);
  console.log(`  Errors: ${totalErrors}`);
  
  if (dryRun) {
    console.log('\n[DRY RUN] No changes were written. Run without --dry-run to apply fixes.');
  } else {
    console.log('\nDone! Archive data has been fixed.');
  }
}

main().catch(console.error);
