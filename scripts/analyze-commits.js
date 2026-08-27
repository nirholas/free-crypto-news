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
 * Analyze Commit History
 *
 * Comprehensive tool to analyze git commits, compare against CHANGELOG.md,
 * identify missing entries, and generate reports.
 *
 * Usage:
 *   node scripts/analyze-commits.js                    # Full analysis
 *   node scripts/analyze-commits.js --check            # CI check mode
 *   node scripts/analyze-commits.js --since=v2.0.0     # Since tag
 *   node scripts/analyze-commits.js --json             # JSON output
 *   node scripts/analyze-commits.js --update           # Update CHANGELOG.md
 *
 * Author: Free Crypto News Team
 * License: MIT
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  check: args.includes('--check'),
  json: args.includes('--json'),
  update: args.includes('--update'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  since: args.find(a => a.startsWith('--since='))?.split('=')[1] || null,
  until: args.find(a => a.startsWith('--until='))?.split('=')[1] || null,
  help: args.includes('--help') || args.includes('-h'),
};

if (options.help) {
  console.log(`
Analyze Commit History

Usage: node scripts/analyze-commits.js [options]

Options:
  --check      CI mode - exit 1 if missing entries (for CI/CD)
  --json       Output results as JSON
  --update     Automatically update CHANGELOG.md with missing entries
  --verbose    Show detailed output
  --since=TAG  Analyze commits since tag or date
  --until=TAG  Analyze commits until tag or date
  -h, --help   Show this help

Examples:
  node scripts/analyze-commits.js
  node scripts/analyze-commits.js --check --since=v2.5.0
  node scripts/analyze-commits.js --json > report.json
  node scripts/analyze-commits.js --update
`);
  process.exit(0);
}

// Project paths
const projectRoot = path.resolve(__dirname, '..');
const changelogPath = path.join(projectRoot, 'CHANGELOG.md');

// Conventional commit types
const commitTypes = {
  feat: { section: 'Added', emoji: '✨', priority: 1 },
  fix: { section: 'Fixed', emoji: '🐛', priority: 2 },
  docs: { section: 'Documentation', emoji: '📚', priority: 5 },
  style: { section: 'Changed', emoji: '💄', priority: 6 },
  refactor: { section: 'Changed', emoji: '♻️', priority: 3 },
  perf: { section: 'Changed', emoji: '⚡', priority: 4 },
  test: { section: 'Testing', emoji: '✅', priority: 7 },
  build: { section: 'Maintenance', emoji: '📦', priority: 8 },
  ci: { section: 'Maintenance', emoji: '👷', priority: 9 },
  chore: { section: 'Maintenance', emoji: '🔧', priority: 10 },
  revert: { section: 'Reverted', emoji: '⏪', priority: 11 },
};

/**
 * Execute git command and return output
 */
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
  } catch (error) {
    if (options.verbose) {
      console.error(`${colors.red}Git error: ${error.message}${colors.reset}`);
    }
    return '';
  }
}

/**
 * Get all commits in range
 */
function getCommits() {
  let range = '';
  
  if (options.since) {
    // Check if it's a tag
    const isTag = git(`rev-parse ${options.since} 2>/dev/null`);
    if (isTag) {
      range = `${options.since}..HEAD`;
    } else {
      range = `--since="${options.since}"`;
    }
  }
  
  if (options.until) {
    const isTag = git(`rev-parse ${options.until} 2>/dev/null`);
    if (isTag) {
      range = range ? `${options.since}..${options.until}` : `${options.until}`;
    } else {
      range += ` --until="${options.until}"`;
    }
  }
  
  const format = '%H|%s|%an|%ae|%ai|%b';
  const log = git(`log --no-merges --pretty=format:"${format}" ${range}`);
  
  if (!log) return [];
  
  return log.split('\n').filter(Boolean).map(line => {
    const parts = line.split('|');
    const [hash, subject, author, email, date, ...bodyParts] = parts;
    const body = bodyParts.join('|');
    
    return parseCommit({ hash, subject, author, email, date, body });
  });
}

/**
 * Parse a commit into structured format
 */
function parseCommit({ hash, subject, author, email, date, body }) {
  const commit = {
    hash: hash?.slice(0, 8) || '',
    fullHash: hash || '',
    subject: subject || '',
    author: author || '',
    email: email || '',
    date: date?.split(' ')[0] || '',
    body: body || '',
    type: 'other',
    scope: null,
    message: subject || '',
    breaking: false,
    section: 'Other',
  };
  
  // Parse conventional commit format: type(scope)!: message
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i;
  const match = subject?.match(conventionalRegex);
  
  if (match) {
    const [, type, scope, breaking, message] = match;
    commit.type = type.toLowerCase();
    commit.scope = scope || null;
    commit.breaking = !!breaking || body?.includes('BREAKING CHANGE');
    commit.message = message;
    
    const typeInfo = commitTypes[commit.type];
    if (typeInfo) {
      commit.section = typeInfo.section;
      commit.priority = typeInfo.priority;
      commit.emoji = typeInfo.emoji;
    }
  } else {
    // Try to infer type from subject
    const lowerSubject = subject?.toLowerCase() || '';
    if (lowerSubject.includes('add') || lowerSubject.includes('implement') || lowerSubject.includes('create')) {
      commit.type = 'feat';
      commit.section = 'Added';
    } else if (lowerSubject.includes('fix') || lowerSubject.includes('bug') || lowerSubject.includes('issue')) {
      commit.type = 'fix';
      commit.section = 'Fixed';
    } else if (lowerSubject.includes('doc') || lowerSubject.includes('readme')) {
      commit.type = 'docs';
      commit.section = 'Documentation';
    } else if (lowerSubject.includes('refactor') || lowerSubject.includes('cleanup')) {
      commit.type = 'refactor';
      commit.section = 'Changed';
    } else if (lowerSubject.includes('test')) {
      commit.type = 'test';
      commit.section = 'Testing';
    } else if (lowerSubject.includes('update') || lowerSubject.includes('upgrade') || lowerSubject.includes('bump')) {
      commit.type = 'chore';
      commit.section = 'Maintenance';
    }
  }
  
  return commit;
}

/**
 * Read and parse CHANGELOG.md
 */
function parseChangelog() {
  if (!fs.existsSync(changelogPath)) {
    return { entries: [], raw: '' };
  }
  
  const content = fs.readFileSync(changelogPath, 'utf-8');
  const entries = [];
  
  // Extract all changelog entries (rough extraction)
  const lines = content.split('\n');
  let currentVersion = null;
  let currentSection = null;
  
  for (const line of lines) {
    // Version header: ## [x.y.z] or ## [Unreleased]
    const versionMatch = line.match(/^##\s*\[([^\]]+)\]/);
    if (versionMatch) {
      currentVersion = versionMatch[1];
      continue;
    }
    
    // Section header: ### Added, ### Fixed, etc.
    const sectionMatch = line.match(/^###\s*(.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }
    
    // Entry: - something or * something
    const entryMatch = line.match(/^[-*]\s+(.+)/);
    if (entryMatch && currentVersion) {
      entries.push({
        version: currentVersion,
        section: currentSection,
        text: entryMatch[1].trim(),
        raw: line,
      });
    }
  }
  
  return { entries, raw: content };
}

/**
 * Find commits that may be missing from changelog
 */
function findMissingEntries(commits, changelogEntries) {
  const missing = [];
  const documented = [];
  const uncertain = [];
  
  const changelogText = changelogEntries.map(e => e.text.toLowerCase()).join('\n');
  
  for (const commit of commits) {
    // Skip trivial commits
    if (commit.type === 'chore' && !options.verbose) continue;
    if (commit.message.toLowerCase().includes('merge')) continue;
    if (commit.message.toLowerCase().includes('wip')) continue;
    
    // Search for commit message in changelog
    const searchTerms = [
      commit.message.toLowerCase(),
      commit.scope?.toLowerCase(),
      commit.hash,
    ].filter(Boolean);
    
    const found = searchTerms.some(term => {
      if (!term) return false;
      // Fuzzy search - check if significant words are present
      const words = term.split(/\s+/).filter(w => w.length > 3);
      return words.some(word => changelogText.includes(word));
    });
    
    if (found) {
      documented.push(commit);
    } else if (commit.type === 'feat' || commit.type === 'fix' || commit.breaking) {
      // Features, fixes, and breaking changes should definitely be documented
      missing.push(commit);
    } else {
      uncertain.push(commit);
    }
  }
  
  return { missing, documented, uncertain };
}

/**
 * Generate changelog entry from commits
 */
function generateEntry(commits) {
  const sections = {};
  
  for (const commit of commits) {
    const section = commit.section || 'Other';
    if (!sections[section]) {
      sections[section] = [];
    }
    
    let entry = `- ${commit.message}`;
    if (commit.scope) {
      entry = `- **${commit.scope}**: ${commit.message}`;
    }
    
    sections[section].push({
      entry,
      commit,
      priority: commit.priority || 99,
    });
  }
  
  // Sort entries within each section
  for (const section of Object.keys(sections)) {
    sections[section].sort((a, b) => a.priority - b.priority);
  }
  
  // Generate markdown
  const sectionOrder = ['Added', 'Changed', 'Fixed', 'Deprecated', 'Removed', 'Security', 'Documentation', 'Testing', 'Maintenance', 'Other'];
  let output = '';
  
  for (const section of sectionOrder) {
    if (sections[section] && sections[section].length > 0) {
      output += `\n### ${section}\n\n`;
      for (const item of sections[section]) {
        output += `${item.entry}\n`;
      }
    }
  }
  
  return output;
}

/**
 * Update CHANGELOG.md with missing entries
 */
function updateChangelog(missing) {
  if (missing.length === 0) {
    console.log(`${colors.green}✓ No missing entries to add${colors.reset}`);
    return;
  }
  
  const { raw } = parseChangelog();
  const newEntries = generateEntry(missing);
  
  // Find [Unreleased] section and insert after it
  const unreleasedRegex = /^(## \[Unreleased\].*?)(\n### |\n## \[)/m;
  const match = raw.match(unreleasedRegex);
  
  if (match) {
    const updated = raw.replace(
      unreleasedRegex,
      `$1\n${newEntries}\n$2`
    );
    fs.writeFileSync(changelogPath, updated);
    console.log(`${colors.green}✓ Added ${missing.length} entries to CHANGELOG.md${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Could not find [Unreleased] section in CHANGELOG.md${colors.reset}`);
  }
}

/**
 * Generate report
 */
function generateReport(commits, analysis) {
  const { missing, documented, uncertain } = analysis;
  
  if (options.json) {
    console.log(JSON.stringify({
      summary: {
        totalCommits: commits.length,
        documented: documented.length,
        missing: missing.length,
        uncertain: uncertain.length,
      },
      missing: missing.map(c => ({
        hash: c.hash,
        type: c.type,
        scope: c.scope,
        message: c.message,
        date: c.date,
        section: c.section,
      })),
      documented: documented.map(c => ({
        hash: c.hash,
        type: c.type,
        message: c.message,
      })),
      uncertain: uncertain.map(c => ({
        hash: c.hash,
        type: c.type,
        message: c.message,
      })),
    }, null, 2));
    return;
  }
  
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}                    CHANGELOG ANALYSIS REPORT${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total commits analyzed: ${colors.cyan}${commits.length}${colors.reset}`);
  console.log(`  Documented in CHANGELOG: ${colors.green}${documented.length}${colors.reset}`);
  console.log(`  Missing from CHANGELOG: ${colors.red}${missing.length}${colors.reset}`);
  console.log(`  Uncertain/minor: ${colors.yellow}${uncertain.length}${colors.reset}`);
  
  // Commit type breakdown
  const typeBreakdown = {};
  for (const commit of commits) {
    typeBreakdown[commit.type] = (typeBreakdown[commit.type] || 0) + 1;
  }
  
  console.log(`\n${colors.bold}Commit Type Breakdown:${colors.reset}`);
  for (const [type, count] of Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])) {
    const info = commitTypes[type] || { emoji: '📝' };
    console.log(`  ${info.emoji} ${type}: ${count}`);
  }
  
  // Missing entries
  if (missing.length > 0) {
    console.log(`\n${colors.bold}${colors.red}Missing Entries (should be documented):${colors.reset}`);
    for (const commit of missing.slice(0, 20)) {
      const scope = commit.scope ? `(${commit.scope})` : '';
      console.log(`  ${colors.red}✗${colors.reset} [${commit.hash}] ${commit.type}${scope}: ${commit.message}`);
    }
    if (missing.length > 20) {
      console.log(`  ... and ${missing.length - 20} more`);
    }
  }
  
  // Suggested entries
  if (missing.length > 0) {
    console.log(`\n${colors.bold}${colors.magenta}Suggested Changelog Entries:${colors.reset}`);
    console.log(`${colors.magenta}───────────────────────────────────────${colors.reset}`);
    console.log(generateEntry(missing));
  }
  
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.blue}Analyzing commit history...${colors.reset}`);
  
  // Get commits
  const commits = getCommits();
  
  if (commits.length === 0) {
    console.log(`${colors.yellow}No commits found in the specified range${colors.reset}`);
    process.exit(0);
  }
  
  // Parse changelog
  const { entries: changelogEntries } = parseChangelog();
  
  // Find missing entries
  const analysis = findMissingEntries(commits, changelogEntries);
  
  // Generate report
  generateReport(commits, analysis);
  
  // Update changelog if requested
  if (options.update) {
    updateChangelog(analysis.missing);
  }
  
  // Exit with error if in check mode and missing entries
  if (options.check && analysis.missing.length > 0) {
    console.log(`${colors.red}✗ Found ${analysis.missing.length} commits not documented in CHANGELOG.md${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ Analysis complete${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
