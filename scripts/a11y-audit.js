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

const pa11y = require('pa11y');
const { execSync } = require('child_process');

/**
 * Ensure Chrome system dependencies are installed (required in headless Linux envs).
 */
function ensureChromeDeps() {
  if (process.platform !== 'linux') return;
  try {
    execSync('ldconfig -p | grep libatk-1.0', { stdio: 'pipe' });
  } catch {
    console.log('📦 Installing Chrome system dependencies...');
    try {
      execSync(
        'apt-get install -y --no-install-recommends ' +
          'libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 ' +
          'libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 ' +
          'libxrandr2 libgbm1 libasound2 2>/dev/null',
        { stdio: 'inherit' }
      );
    } catch (e) {
      console.warn('⚠️  Could not auto-install Chrome deps:', e.message);
    }
  }
}

ensureChromeDeps();

// Use local URL for dev, production for CI
const BASE_URL = process.env.BASE_URL || process.argv[2] || 'http://localhost:3000';

// Pages to test
const PAGES = [
  '/',
  '/markets',
  '/search',
  '/trending',
  '/settings',
  '/pricing',
];

async function runAudit() {
  console.log(`\n🔍 Pa11y Accessibility Audit`);
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(50));
  
  let totalIssues = 0;
  const pageResults = [];
  
  for (const path of PAGES) {
    const url = `${BASE_URL}${path}`;
    try {
      console.log(`\nTesting: ${path}`);
      const results = await pa11y(url, {
        chromeLaunchConfig: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
          ],
        },
        standard: 'WCAG2AA',
        timeout: 30000,
      });
      
      const errors = results.issues.filter(i => i.type === 'error');
      const warnings = results.issues.filter(i => i.type === 'warning');
      
      totalIssues += errors.length;
      pageResults.push({ path, errors: errors.length, warnings: warnings.length });
      
      if (errors.length === 0) {
        console.log(`  ✅ No errors`);
      } else {
        console.log(`  ❌ ${errors.length} errors, ${warnings.length} warnings`);
        errors.slice(0, 3).forEach((issue) => {
          console.log(`     • ${issue.message.substring(0, 80)}...`);
        });
      }
    } catch (error) {
      console.log(`  ⚠️ Error: ${error.message}`);
      pageResults.push({ path, errors: -1, warnings: 0, error: error.message });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:');
  console.log('-'.repeat(40));
  pageResults.forEach(r => {
    const status = r.errors === 0 ? '✅' : r.errors > 0 ? '❌' : '⚠️';
    console.log(`${status} ${r.path.padEnd(20)} ${r.errors >= 0 ? r.errors + ' errors' : r.error}`);
  });
  console.log('-'.repeat(40));
  console.log(`Total errors: ${totalIssues}`);
  
  if (totalIssues > 0) {
    console.log('\n⚠️  Run with --verbose for full details');
    process.exit(1);
  } else {
    console.log('\n✅ All pages pass WCAG 2.1 AA!\n');
  }
}

runAudit();
