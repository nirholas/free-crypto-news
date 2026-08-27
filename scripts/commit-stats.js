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
 * Git Commit Statistics
 *
 * Generate comprehensive statistics about the repository's commit history.
 * Useful for understanding project velocity, contributor activity, and trends.
 *
 * Usage:
 *   node scripts/commit-stats.js              # Full stats
 *   node scripts/commit-stats.js --json       # JSON output
 *   node scripts/commit-stats.js --since=2024-01-01
 *
 * Author: Free Crypto News Team
 * License: MIT
 */

const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const args = process.argv.slice(2);
const options = {
  json: args.includes('--json'),
  since: args.find(a => a.startsWith('--since='))?.split('=')[1] || null,
  until: args.find(a => a.startsWith('--until='))?.split('=')[1] || null,
};

const projectRoot = path.resolve(__dirname, '..');

function git(command) {
  // Sanitize: only allow safe git subcommand characters
  if (!/^[a-zA-Z0-9\s\-_.\/='":%^~@{}|,\\]+$/.test(command)) {
    throw new Error(`Potentially unsafe git command rejected: ${command}`);
  }
  try {
    return execSync(`git ${command}`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

function getStats() {
  let dateRange = '';
  if (options.since) dateRange += ` --since="${options.since}"`;
  if (options.until) dateRange += ` --until="${options.until}"`;

  // Basic stats
  const totalCommits = parseInt(git(`rev-list --count HEAD${dateRange}`) || '0');
  const firstCommit = git('log --reverse --format=%ai | head -1').split(' ')[0];
  const lastCommit = git('log -1 --format=%ai').split(' ')[0];
  
  // Contributors
  const contributors = git(`shortlog -sn${dateRange}`)
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
      return match ? { name: match[2], commits: parseInt(match[1]) } : null;
    })
    .filter(Boolean);

  // Files changed
  const filesChanged = parseInt(git(`log --oneline${dateRange} --name-only | grep -v '^[a-f0-9]' | sort -u | wc -l`) || '0');

  // Lines added/removed (approximate)
  const diffStats = git(`log --shortstat${dateRange} | grep -E 'files? changed' | awk '{ins+=$4; del+=$6} END {print ins","del}'`);
  const [linesAdded, linesDeleted] = diffStats.split(',').map(n => parseInt(n) || 0);

  // Commit frequency by day of week
  const dayOfWeek = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const dayLog = git(`log --format=%ad --date=format:%a${dateRange}`);
  dayLog.split('\n').filter(Boolean).forEach(day => {
    if (dayOfWeek.hasOwnProperty(day)) dayOfWeek[day]++;
  });

  // Commit frequency by hour
  const hourOfDay = {};
  for (let i = 0; i < 24; i++) hourOfDay[i] = 0;
  const hourLog = git(`log --format=%ad --date=format:%H${dateRange}`);
  hourLog.split('\n').filter(Boolean).forEach(hour => {
    const h = parseInt(hour);
    if (hourOfDay.hasOwnProperty(h)) hourOfDay[h]++;
  });

  // Commits by month
  const commitsByMonth = {};
  const monthLog = git(`log --format=%ad --date=format:%Y-%m${dateRange}`);
  monthLog.split('\n').filter(Boolean).forEach(month => {
    commitsByMonth[month] = (commitsByMonth[month] || 0) + 1;
  });

  // Commit types (conventional commits)
  const commitTypes = {
    feat: 0, fix: 0, docs: 0, style: 0, refactor: 0,
    perf: 0, test: 0, build: 0, ci: 0, chore: 0, other: 0,
  };
  const subjectLog = git(`log --format=%s${dateRange}`);
  subjectLog.split('\n').filter(Boolean).forEach(subject => {
    const match = subject.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)/i);
    if (match) {
      commitTypes[match[1].toLowerCase()]++;
    } else {
      commitTypes.other++;
    }
  });

  // Most modified files
  const fileModifications = {};
  const fileLog = git(`log --name-only --format=''${dateRange}`);
  fileLog.split('\n').filter(Boolean).forEach(file => {
    fileModifications[file] = (fileModifications[file] || 0) + 1;
  });
  const topFiles = Object.entries(fileModifications)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([file, count]) => ({ file, modifications: count }));

  // Tags/releases
  const tags = git('tag -l --sort=-creatordate').split('\n').filter(Boolean);

  // Calculate velocity (commits per week average)
  const daysBetween = Math.ceil((new Date(lastCommit) - new Date(firstCommit)) / (1000 * 60 * 60 * 24));
  const weeksActive = Math.max(daysBetween / 7, 1);
  const commitsPerWeek = (totalCommits / weeksActive).toFixed(1);

  return {
    summary: {
      totalCommits,
      contributors: contributors.length,
      filesChanged,
      linesAdded,
      linesDeleted,
      netLines: linesAdded - linesDeleted,
      releases: tags.length,
      firstCommit,
      lastCommit,
      daysActive: daysBetween,
      commitsPerWeek: parseFloat(commitsPerWeek),
    },
    contributors,
    commitTypes,
    dayOfWeek,
    hourOfDay,
    commitsByMonth,
    topFiles,
    recentTags: tags.slice(0, 10),
  };
}

function printStats(stats) {
  if (options.json) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  const { summary, contributors, commitTypes, dayOfWeek, hourOfDay, commitsByMonth, topFiles, recentTags } = stats;

  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}                    GIT COMMIT STATISTICS${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  // Summary
  console.log(`${colors.bold}📊 Summary${colors.reset}`);
  console.log(`  Total commits: ${colors.green}${summary.totalCommits.toLocaleString()}${colors.reset}`);
  console.log(`  Contributors: ${colors.green}${summary.contributors}${colors.reset}`);
  console.log(`  Files changed: ${colors.green}${summary.filesChanged.toLocaleString()}${colors.reset}`);
  console.log(`  Lines added: ${colors.green}+${summary.linesAdded.toLocaleString()}${colors.reset}`);
  console.log(`  Lines deleted: ${colors.red}-${summary.linesDeleted.toLocaleString()}${colors.reset}`);
  console.log(`  Net lines: ${summary.netLines >= 0 ? colors.green : colors.red}${summary.netLines >= 0 ? '+' : ''}${summary.netLines.toLocaleString()}${colors.reset}`);
  console.log(`  Releases: ${colors.magenta}${summary.releases}${colors.reset}`);
  console.log(`  Active period: ${summary.firstCommit} → ${summary.lastCommit} (${summary.daysActive} days)`);
  console.log(`  Velocity: ${colors.cyan}${summary.commitsPerWeek} commits/week${colors.reset}`);

  // Top contributors
  console.log(`\n${colors.bold}👥 Top Contributors${colors.reset}`);
  contributors.slice(0, 10).forEach((c, i) => {
    const bar = '█'.repeat(Math.ceil(c.commits / summary.totalCommits * 30));
    console.log(`  ${(i + 1).toString().padStart(2)}. ${c.name.padEnd(25)} ${colors.blue}${bar}${colors.reset} ${c.commits}`);
  });

  // Commit types
  console.log(`\n${colors.bold}📝 Commit Types${colors.reset}`);
  const typeTotal = Object.values(commitTypes).reduce((a, b) => a + b, 0);
  Object.entries(commitTypes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const pct = ((count / typeTotal) * 100).toFixed(1);
      const bar = '█'.repeat(Math.ceil(count / typeTotal * 20));
      console.log(`  ${type.padEnd(10)} ${colors.blue}${bar}${colors.reset} ${count} (${pct}%)`);
    });

  // Activity by day
  console.log(`\n${colors.bold}📅 Activity by Day of Week${colors.reset}`);
  const maxDay = Math.max(...Object.values(dayOfWeek));
  Object.entries(dayOfWeek).forEach(([day, count]) => {
    const bar = '█'.repeat(Math.ceil(count / maxDay * 20));
    console.log(`  ${day} ${colors.green}${bar}${colors.reset} ${count}`);
  });

  // Peak hours
  const peakHours = Object.entries(hourOfDay)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  console.log(`\n${colors.bold}🕐 Peak Hours${colors.reset}`);
  peakHours.forEach(([hour, count]) => {
    console.log(`  ${hour.toString().padStart(2, '0')}:00 - ${count} commits`);
  });

  // Monthly trend
  console.log(`\n${colors.bold}📈 Recent Months${colors.reset}`);
  const months = Object.entries(commitsByMonth).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  const maxMonth = Math.max(...months.map(([, c]) => c));
  months.forEach(([month, count]) => {
    const bar = '█'.repeat(Math.ceil(count / maxMonth * 20));
    console.log(`  ${month} ${colors.cyan}${bar}${colors.reset} ${count}`);
  });

  // Top modified files
  console.log(`\n${colors.bold}📁 Most Modified Files${colors.reset}`);
  topFiles.slice(0, 10).forEach(({ file, modifications }) => {
    const shortFile = file.length > 50 ? '...' + file.slice(-47) : file;
    console.log(`  ${modifications.toString().padStart(4)} ${shortFile}`);
  });

  // Recent releases
  if (recentTags.length > 0) {
    console.log(`\n${colors.bold}🏷️  Recent Releases${colors.reset}`);
    recentTags.slice(0, 5).forEach(tag => {
      console.log(`  ${colors.magenta}${tag}${colors.reset}`);
    });
  }

  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
}

const stats = getStats();
printStats(stats);
