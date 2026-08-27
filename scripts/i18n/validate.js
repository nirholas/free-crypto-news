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
 * i18n Validation Script
 * 
 * Validates translated files for:
 * - Language accuracy (is it actually in the target language?)
 * - Markdown structure preservation
 * - Missing translations
 * 
 * Usage:
 *   node scripts/i18n/validate.js
 *   bun run i18n:validate
 */

const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(__dirname, '../../.i18nrc.js');
const config = require(configPath);

const LOCALES_DIR = path.join(__dirname, '../..', config.outputDir || 'locales');

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Get all expected translation files
 */
function getExpectedFiles() {
  const expected = [];
  
  for (const sourceFile of config.sourceFiles) {
    const fileName = path.basename(sourceFile, path.extname(sourceFile));
    const fileExt = path.extname(sourceFile);
    
    // Use folder-per-source structure: locales/{source-name}/index.{locale}.ext
    for (const locale of config.outputLocales) {
      if (locale === config.entryLocale) continue;
      
      const localePath = path.join(LOCALES_DIR, fileName, `index.${locale}${fileExt}`);
      expected.push({
        source: sourceFile,
        locale,
        path: localePath,
      });
    }
  }
  
  return expected;
}

/**
 * Basic language detection heuristics
 * Not perfect, but catches obvious issues
 */
function detectLanguageIssues(content, expectedLocale) {
  const issues = [];
  
  // Check for common patterns that indicate wrong language
  const patterns = {
    'zh-CN': /[\u4e00-\u9fff]/,  // Chinese characters
    'zh-TW': /[\u4e00-\u9fff]/,  // Chinese characters (traditional uses same range)
    'ja-JP': /[\u3040-\u309f\u30a0-\u30ff]/,  // Hiragana/Katakana
    'ko-KR': /[\uac00-\ud7af]/,  // Korean Hangul
    'ar': /[\u0600-\u06ff]/,      // Arabic
    'ru-RU': /[\u0400-\u04ff]/,   // Cyrillic
    'fa-IR': /[\u0600-\u06ff]/,   // Persian (Arabic script)
  };
  
  // For CJK and RTL languages, check if they have the expected characters
  if (patterns[expectedLocale]) {
    const hasExpectedChars = patterns[expectedLocale].test(content);
    if (!hasExpectedChars) {
      issues.push(`Missing expected ${expectedLocale} characters`);
    }
  }
  
  // Check if content still looks mostly English (for non-English locales)
  if (expectedLocale !== 'en-US') {
    const englishWords = content.match(/\b(the|and|is|are|was|were|have|has|been|this|that|with|for|from)\b/gi) || [];
    const totalWords = content.split(/\s+/).length;
    const englishRatio = englishWords.length / totalWords;
    
    // If more than 30% common English words, probably not translated
    if (englishRatio > 0.3 && totalWords > 100) {
      issues.push(`High English word ratio (${(englishRatio * 100).toFixed(1)}%) - may not be translated`);
    }
  }
  
  return issues;
}

/**
 * Validate Markdown structure
 */
function validateMarkdownStructure(original, translated) {
  const issues = [];
  
  // Count headers
  const originalHeaders = (original.match(/^#{1,6}\s/gm) || []).length;
  const translatedHeaders = (translated.match(/^#{1,6}\s/gm) || []).length;
  
  if (Math.abs(originalHeaders - translatedHeaders) > 2) {
    issues.push(`Header count mismatch (original: ${originalHeaders}, translated: ${translatedHeaders})`);
  }
  
  // Count code blocks
  const originalCodeBlocks = (original.match(/```/g) || []).length;
  const translatedCodeBlocks = (translated.match(/```/g) || []).length;
  
  if (originalCodeBlocks !== translatedCodeBlocks) {
    issues.push(`Code block count mismatch (original: ${originalCodeBlocks}, translated: ${translatedCodeBlocks})`);
  }
  
  // Count links
  const originalLinks = (original.match(/\[.*?\]\(.*?\)/g) || []).length;
  const translatedLinks = (translated.match(/\[.*?\]\(.*?\)/g) || []).length;
  
  if (Math.abs(originalLinks - translatedLinks) > 5) {
    issues.push(`Link count mismatch (original: ${originalLinks}, translated: ${translatedLinks})`);
  }
  
  return issues;
}

/**
 * Main validation function
 */
async function validate() {
  console.log('🔍 Validating i18n translations...\n');
  
  const expectedFiles = getExpectedFiles();
  const results = {
    valid: 0,
    missing: 0,
    issues: 0,
  };
  
  const allIssues = [];
  
  for (const file of expectedFiles) {
    if (!fileExists(file.path)) {
      results.missing++;
      allIssues.push({
        file: file.path,
        type: 'missing',
        issues: ['File does not exist'],
      });
      continue;
    }
    
    const content = fs.readFileSync(file.path, 'utf-8');
    const sourcePath = path.join(__dirname, '../..', file.source);
    const sourceContent = fs.existsSync(sourcePath) 
      ? fs.readFileSync(sourcePath, 'utf-8') 
      : '';
    
    const languageIssues = detectLanguageIssues(content, file.locale);
    const structureIssues = sourceContent 
      ? validateMarkdownStructure(sourceContent, content) 
      : [];
    
    const allFileIssues = [...languageIssues, ...structureIssues];
    
    if (allFileIssues.length > 0) {
      results.issues++;
      allIssues.push({
        file: file.path,
        locale: file.locale,
        type: 'issues',
        issues: allFileIssues,
      });
    } else {
      results.valid++;
    }
  }
  
  // Print results
  console.log('═'.repeat(60));
  console.log('📊 Validation Results:');
  console.log(`   ✅ Valid: ${results.valid}`);
  console.log(`   ⚠️  Issues: ${results.issues}`);
  console.log(`   ❌ Missing: ${results.missing}`);
  console.log('═'.repeat(60));
  
  if (allIssues.length > 0) {
    console.log('\n📋 Details:\n');
    
    for (const issue of allIssues) {
      const icon = issue.type === 'missing' ? '❌' : '⚠️';
      console.log(`${icon} ${issue.file}`);
      for (const msg of issue.issues) {
        console.log(`   └─ ${msg}`);
      }
    }
  }
  
  return results.issues === 0 && results.missing === 0;
}

/**
 * CLI handling
 */
validate()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
