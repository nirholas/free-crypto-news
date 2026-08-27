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

import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.join(__dirname, '../../..');
const CSV = path.join(WORKSPACE, '.temp-import/news_currencies_source_joinedResult.csv');
const OUT = path.join(WORKSPACE, '.temp-import/article-ids.json');

async function main() {
  const ids = new Set();
  const rl = createInterface({ input: createReadStream(CSV), crlfDelay: Infinity });
  let n = 0;
  for await (const line of rl) {
    if (++n === 1) continue;
    const id = line.split(',')[0]?.replace(/"/g, '');
    if (id) ids.add(id);
    if (n % 100000 === 0) console.log(`Scanned ${n} rows, ${ids.size} unique...`);
  }
  const arr = [...ids].sort((a, b) => parseInt(a) - parseInt(b));
  fs.writeFileSync(OUT, JSON.stringify(arr));
  console.log(`Extracted ${arr.length} unique IDs to ${OUT}`);
}
main();
