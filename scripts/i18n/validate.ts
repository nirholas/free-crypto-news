#!/usr/bin/env npx tsx

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
 * Validates translation files for completeness and quality.
 * Checks for missing keys, invalid placeholders, and more.
 * 
 * Usage:
 *   npx tsx scripts/i18n/validate.ts
 *   npx tsx scripts/i18n/validate.ts --locale es
 */

import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

interface ValidationResult {
  locale: string;
  totalKeys: number;
  missingKeys: string[];
  extraKeys: string[];
  invalidPlaceholders: { key: string; expected: string[]; found: string[] }[];
  emptyValues: string[];
  valid: boolean;
}

/**
 * Flatten nested object to dot-notation keys
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }
  
  return result;
}

/**
 * Extract placeholders from a string (e.g., {count}, {name})
 */
function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{[^}]+\}/g);
  return matches ? matches.sort() : [];
}

/**
 * Validate a translation file against the source
 */
function validateLocale(
  sourceFlat: Record<string, string>,
  translationFlat: Record<string, string>,
  locale: string
): ValidationResult {
  const sourceKeys = new Set(Object.keys(sourceFlat));
  const translationKeys = new Set(Object.keys(translationFlat));
  
  // Find missing and extra keys
  const missingKeys = [...sourceKeys].filter(k => !translationKeys.has(k));
  const extraKeys = [...translationKeys].filter(k => !sourceKeys.has(k));
  
  // Check placeholders match
  const invalidPlaceholders: ValidationResult['invalidPlaceholders'] = [];
  for (const key of sourceKeys) {
    if (translationKeys.has(key)) {
      const sourcePlaceholders = extractPlaceholders(sourceFlat[key]);
      const translationPlaceholders = extractPlaceholders(translationFlat[key]);
      
      if (JSON.stringify(sourcePlaceholders) !== JSON.stringify(translationPlaceholders)) {
        invalidPlaceholders.push({
          key,
          expected: sourcePlaceholders,
          found: translationPlaceholders,
        });
      }
    }
  }
  
  // Find empty values
  const emptyValues = Object.entries(translationFlat)
    .filter(([_, value]) => !value || value.trim() === '')
    .map(([key]) => key);
  
  return {
    locale,
    totalKeys: translationKeys.size,
    missingKeys,
    extraKeys,
    invalidPlaceholders,
    emptyValues,
    valid: missingKeys.length === 0 && invalidPlaceholders.length === 0 && emptyValues.length === 0,
  };
}

/**
 * Main validation function
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 i18n Translation Validation');
  console.log('='.repeat(60) + '\n');
  
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const specificLocale = args.find(arg => arg.startsWith('--locale='))?.split('=')[1]
    || args[args.indexOf('--locale') + 1];
  
  // Paths
  const messagesDir = path.resolve(process.cwd(), 'messages');
  const sourceFile = path.join(messagesDir, 'en.json');
  
  // Check source file exists
  if (!fs.existsSync(sourceFile)) {
    console.log(`${colors.red}❌ Source file not found: ${sourceFile}${colors.reset}`);
    process.exit(1);
  }
  
  // Load and flatten source
  const sourceMessages = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  const sourceFlat = flattenObject(sourceMessages);
  const totalSourceKeys = Object.keys(sourceFlat).length;
  
  console.log(`📄 Source: en.json (${totalSourceKeys} keys)\n`);
  
  // Find all translation files
  const files = fs.readdirSync(messagesDir)
    .filter(f => f.endsWith('.json') && f !== 'en.json')
    .filter(f => !specificLocale || f === `${specificLocale}.json`)
    .sort();
  
  if (files.length === 0) {
    console.log(`${colors.yellow}⚠️ No translation files found${colors.reset}`);
    if (specificLocale) {
      console.log(`   Looking for: ${specificLocale}.json`);
    }
    process.exit(0);
  }
  
  // Validate each file
  const results: ValidationResult[] = [];
  
  for (const file of files) {
    const locale = file.replace('.json', '');
    const filePath = path.join(messagesDir, file);
    
    try {
      const translation = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const translationFlat = flattenObject(translation);
      
      const result = validateLocale(sourceFlat, translationFlat, locale);
      results.push(result);
      
      // Print result
      const icon = result.valid ? '✅' : '⚠️';
      const color = result.valid ? colors.green : colors.yellow;
      const coverage = Math.round(((totalSourceKeys - result.missingKeys.length) / totalSourceKeys) * 100);
      
      console.log(`${icon} ${color}${locale}${colors.reset} - ${coverage}% coverage (${result.totalKeys} keys)`);
      
      if (result.missingKeys.length > 0) {
        console.log(`   ${colors.red}Missing: ${result.missingKeys.length} keys${colors.reset}`);
        if (result.missingKeys.length <= 5) {
          result.missingKeys.forEach(k => console.log(`     - ${k}`));
        } else {
          result.missingKeys.slice(0, 3).forEach(k => console.log(`     - ${k}`));
          console.log(`     ... and ${result.missingKeys.length - 3} more`);
        }
      }
      
      if (result.invalidPlaceholders.length > 0) {
        console.log(`   ${colors.yellow}Invalid placeholders: ${result.invalidPlaceholders.length}${colors.reset}`);
        result.invalidPlaceholders.slice(0, 3).forEach(p => {
          console.log(`     - ${p.key}: expected ${JSON.stringify(p.expected)}, found ${JSON.stringify(p.found)}`);
        });
      }
      
      if (result.emptyValues.length > 0) {
        console.log(`   ${colors.yellow}Empty values: ${result.emptyValues.length}${colors.reset}`);
      }
      
      if (result.extraKeys.length > 0) {
        console.log(`   ${colors.dim}Extra keys: ${result.extraKeys.length} (will be ignored)${colors.reset}`);
      }
      
    } catch (error) {
      console.log(`❌ ${colors.red}${locale}${colors.reset} - Parse error: ${(error as Error).message}`);
      results.push({
        locale,
        totalKeys: 0,
        missingKeys: [],
        extraKeys: [],
        invalidPlaceholders: [],
        emptyValues: [],
        valid: false,
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60) + '\n');
  
  const validCount = results.filter(r => r.valid).length;
  const totalCount = results.length;
  
  if (validCount === totalCount) {
    console.log(`${colors.green}✅ All ${totalCount} translation files are valid!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️ ${validCount}/${totalCount} files are fully valid${colors.reset}`);
    console.log(`   Run translation to fix missing keys:\n`);
    console.log(`   ${colors.cyan}GROQ_API_KEY=your-key npx tsx scripts/i18n/translate.ts${colors.reset}\n`);
  }
}

// Run
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
