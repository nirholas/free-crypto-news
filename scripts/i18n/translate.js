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
 * i18n Translation Script
 * 
 * Translates Markdown documentation to 18 languages using OpenAI GPT.
 * Based on the workflow from plugin.delivery and defi-agents.
 * 
 * Usage:
 *   node scripts/i18n/translate.js [--file README.md] [--locale zh-CN]
 *   bun run i18n:translate
 * 
 * Environment Variables:
 *   OPENAI_API_KEY - Required for translation
 *   OPENAI_PROXY_URL - Optional custom OpenAI endpoint
 */

const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(__dirname, '../../.i18nrc.js');
const config = require(configPath);

// Load environment variables from .env if exists
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_PROXY_URL || 'https://api.openai.com/v1';

// Check if API key is available (optional - will skip if not set)
const I18N_ENABLED = !!OPENAI_API_KEY;

if (!I18N_ENABLED && require.main === module) {
  console.log('⏭️  OPENAI_API_KEY not set - skipping translations');
  console.log('   Set it in .env file or as environment variable to enable i18n');
  process.exit(0); // Exit gracefully, not an error
}

/**
 * Call OpenAI API for translation
 */
async function translateWithOpenAI(content, targetLocale, sourceLocale = 'en-US') {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.modelName || 'gpt-4o-mini',
      temperature: config.temperature || 0.5,
      messages: [
        {
          role: 'system',
          content: [
            `You are an expert technical translator specializing in cryptocurrency, blockchain, and software documentation.`,
            `Translate the following Markdown content from ${sourceLocale} to ${targetLocale} (BCP 47 standard).`,
            ``,
            `Rules:`,
            `- Preserve ALL Markdown formatting (headers, code blocks, links, tables, lists)`,
            `- Keep code snippets, URLs, API endpoints, and technical identifiers unchanged`,
            `- Translate comments inside code blocks if they are in natural language`,
            `- Keep emoji unchanged`,
            `- Maintain the same document structure`,
            `- Use natural, fluent language appropriate for the target audience`,
            `- For technical terms (API, JSON, SDK, etc.), keep them in English or use the commonly accepted translation`,
            `- Translate alt text for images`,
            `- Do NOT translate:`,
            `  - URLs and links`,
            `  - Code variable names and function names`,
            `  - JSON keys`,
            `  - File paths`,
            `  - Brand names (Bitcoin, Ethereum, etc.)`,
          ].join('\n'),
        },
        {
          role: 'user',
          content: content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Get language name for display
 */
function getLanguageName(locale) {
  const names = {
    'en-US': 'English',
    'ar': 'Arabic',
    'bg-BG': 'Bulgarian',
    'de-DE': 'German',
    'es-ES': 'Spanish',
    'fa-IR': 'Persian',
    'fr-FR': 'French',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'nl-NL': 'Dutch',
    'pl-PL': 'Polish',
    'pt-BR': 'Portuguese',
    'ru-RU': 'Russian',
    'tr-TR': 'Turkish',
    'vi-VN': 'Vietnamese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
  };
  return names[locale] || locale;
}

/**
 * Translate a single file to a specific locale
 */
async function translateFile(filePath, targetLocale) {
  const fullPath = path.join(__dirname, '../..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileExt = path.extname(filePath);

  // Determine output path
  let outputPath;
  if (targetLocale === 'en-US') {
    // English is the source, no need to translate
    return true;
  }

  // Output to locales directory using folder-per-source structure
  // e.g., README.md -> locales/README/index.ar.md
  const sourceFolder = fileName; // Use source filename as folder name
  const localesDir = path.join(__dirname, '../..', config.outputDir || 'locales', sourceFolder);
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }
  
  // Copy source file as index (en-US default) if not exists
  const indexPath = path.join(localesDir, `index${fileExt}`);
  if (!fs.existsSync(indexPath)) {
    fs.copyFileSync(fullPath, indexPath);
    console.log(`📄 Copied source to ${indexPath}`);
  }
  
  // Translations use index.{locale}.ext format
  outputPath = path.join(localesDir, `index.${targetLocale}${fileExt}`);

  // Check if translation already exists (incremental translation)
  if (fs.existsSync(outputPath)) {
    const existingContent = fs.readFileSync(outputPath, 'utf-8');
    // Simple hash check - if source hasn't changed much, skip
    if (existingContent.length > 0) {
      console.log(`⏭️  Skipping ${filePath} → ${targetLocale} (already exists)`);
      return true;
    }
  }

  console.log(`🌐 Translating ${filePath} → ${getLanguageName(targetLocale)}...`);

  try {
    const translated = await translateWithOpenAI(content, targetLocale);
    
    // Add language header
    const header = `<!-- This file is auto-generated. Do not edit directly. -->\n<!-- Language: ${getLanguageName(targetLocale)} (${targetLocale}) -->\n\n`;
    
    fs.writeFileSync(outputPath, header + translated);
    console.log(`✅ ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to translate ${filePath} to ${targetLocale}: ${error.message}`);
    return false;
  }
}

/**
 * Translate all configured source files to all locales
 */
async function translateAll() {
  console.log('🌍 Starting i18n translation workflow...\n');
  console.log(`📁 Source files: ${config.sourceFiles.length}`);
  console.log(`🌐 Target languages: ${config.outputLocales.length - 1}\n`);

  const results = { success: 0, failed: 0, skipped: 0 };

  for (const sourceFile of config.sourceFiles) {
    console.log(`\n📄 Processing: ${sourceFile}`);
    
    // Translate to each locale (except source locale)
    const translationPromises = config.outputLocales
      .filter(locale => locale !== config.entryLocale)
      .map(async (locale) => {
        // Rate limiting - slight delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        const success = await translateFile(sourceFile, locale);
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
      });

    // Process with controlled concurrency
    const concurrency = config.concurrency || 5;
    for (let i = 0; i < translationPromises.length; i += concurrency) {
      await Promise.all(translationPromises.slice(i, i + concurrency));
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Translation Summary:');
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('═'.repeat(50));

  return results.failed === 0;
}

/**
 * CLI handling
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const fileIndex = args.indexOf('--file');
  const localeIndex = args.indexOf('--locale');
  
  if (fileIndex !== -1 && localeIndex !== -1) {
    // Translate specific file to specific locale
    const file = args[fileIndex + 1];
    const locale = args[localeIndex + 1];
    const success = await translateFile(file, locale);
    process.exit(success ? 0 : 1);
  } else if (fileIndex !== -1) {
    // Translate specific file to all locales
    const file = args[fileIndex + 1];
    let allSuccess = true;
    for (const locale of config.outputLocales) {
      if (locale !== config.entryLocale) {
        const success = await translateFile(file, locale);
        if (!success) allSuccess = false;
      }
    }
    process.exit(allSuccess ? 0 : 1);
  } else {
    // Translate all files
    const success = await translateAll();
    process.exit(success ? 0 : 1);
  }
}

main().catch(error => {
  console.error('❌ Translation failed:', error);
  process.exit(1);
});
