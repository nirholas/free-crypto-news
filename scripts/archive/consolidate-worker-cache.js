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
 * Consolidate worker cache files into resolved-urls.json
 * and analyze the results
 */

const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../../.temp-import');
const CACHE_DIR = path.join(TEMP_DIR, 'cache');
const OUTPUT_PATH = path.join(TEMP_DIR, 'resolved-urls.json');

function consolidate() {
  console.log('Consolidating worker cache files...\n');
  
  // Read all worker files
  const workerFiles = fs.readdirSync(CACHE_DIR)
    .filter(f => f.startsWith('worker-') && f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });
  
  console.log(`Found ${workerFiles.length} worker files\n`);
  
  // Consolidate all data
  const consolidated = {};
  let totalEntries = 0;
  let resolvedCount = 0;
  let nullCount = 0;
  let invalidCount = 0;
  
  for (const file of workerFiles) {
    const filePath = path.join(CACHE_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let fileResolved = 0;
      let fileNull = 0;
      let fileInvalid = 0;
      
      for (const [key, value] of Object.entries(data)) {
        // Skip invalid keys (not numeric IDs)
        if (!/^\d+$/.test(key)) {
          fileInvalid++;
          invalidCount++;
          continue;
        }
        
        totalEntries++;
        
        if (value === null) {
          fileNull++;
          nullCount++;
          // Don't add nulls to consolidated
        } else if (typeof value === 'string' && value.startsWith('http')) {
          consolidated[key] = value;
          fileResolved++;
          resolvedCount++;
        } else {
          fileInvalid++;
          invalidCount++;
        }
      }
      
      console.log(`${file}: ${fileResolved} resolved, ${fileNull} null, ${fileInvalid} invalid`);
    } catch (e) {
      console.error(`Error processing ${file}: ${e.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  console.log(`Total entries processed: ${totalEntries.toLocaleString()}`);
  console.log(`Successfully resolved:   ${resolvedCount.toLocaleString()} (${((resolvedCount/totalEntries)*100).toFixed(2)}%)`);
  console.log(`Failed (null):          ${nullCount.toLocaleString()} (${((nullCount/totalEntries)*100).toFixed(2)}%)`);
  console.log(`Invalid entries:        ${invalidCount.toLocaleString()}`);
  
  // Save consolidated cache
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(consolidated, null, 2));
  console.log(`\nSaved ${resolvedCount.toLocaleString()} resolved URLs to: ${OUTPUT_PATH}`);
  
  // Show sample of resolved URLs
  console.log('\nSample resolved URLs:');
  const resolvedIds = Object.keys(consolidated).slice(0, 5);
  for (const id of resolvedIds) {
    console.log(`  [${id}] ${consolidated[id].substring(0, 80)}...`);
  }
  
  // Analyze sources
  console.log('\nResolved URLs by domain:');
  const domains = {};
  for (const url of Object.values(consolidated)) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      domains[domain] = (domains[domain] || 0) + 1;
    } catch {}
  }
  
  const sortedDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
    
  for (const [domain, count] of sortedDomains) {
    console.log(`  ${domain}: ${count.toLocaleString()}`);
  }
}

consolidate();
