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
 * Fix archive index.json - remove invalid dates
 */

const fs = require('fs');
const path = require('path');

const archiveDir = path.join(__dirname, '../../archive');
const indexPath = path.join(archiveDir, 'index.json');

console.log('Fixing archive index.json...');

// Read current index
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log(`Current dates: ${index.availableDates.length}`);
console.log(`Current range: ${index.dateRange.earliest} to ${index.dateRange.latest}`);

// Filter out invalid dates (must start with 19xx or 20xx)
const validDates = index.availableDates.filter(d => /^(19|20)\d{2}-\d{2}-\d{2}$/.test(d));
validDates.sort();

// Update index
index.availableDates = validDates;
index.dateRange.earliest = validDates[0];
index.dateRange.latest = validDates[validDates.length - 1];
index.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

console.log(`\nFixed! Valid dates: ${validDates.length}`);
console.log(`New range: ${index.dateRange.earliest} to ${index.dateRange.latest}`);
