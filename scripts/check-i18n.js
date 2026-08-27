/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

const fs = require('fs');
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf-8'));

function getAllKeys(obj, prefix) {
  prefix = prefix || '';
  return Object.keys(obj).reduce(function(keys, key) {
    const fullKey = prefix ? prefix+'.'+key : key;
    const val = obj[key];
    if (typeof val === 'object' && val !== null && Array.isArray(val) === false) {
      return keys.concat(getAllKeys(val, fullKey));
    }
    return keys.concat([fullKey]);
  }, []);
}

const enKeys = getAllKeys(en);
const locales = ['es','fr','de','pt','zh-CN','zh-TW','ko','ar','ru','it','nl','pl','tr','vi','th','id','ja'];

locales.forEach(function(loc) {
  try {
    const f = JSON.parse(fs.readFileSync('messages/'+loc+'.json','utf-8'));
    const locsKeys = getAllKeys(f);
    const missing = enKeys.filter(function(k) { return locsKeys.indexOf(k) === -1; });
    console.log(loc + ': ' + missing.length + ' missing');
    if (missing.length > 0 && missing.length <= 15) {
      missing.forEach(function(m) { console.log('  - ' + m); });
    }
  } catch(e) { console.log(loc + ': FILE ERROR - ' + e.message); }
});
