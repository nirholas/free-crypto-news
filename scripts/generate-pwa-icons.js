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
 * PWA Icon Generator Script
 * 
 * Generates PNG icons from SVG source files for the PWA manifest.
 * 
 * Prerequisites:
 *   npm install sharp
 * 
 * Usage:
 *   node scripts/generate-pwa-icons.js
 * 
 * This script will generate all required icon sizes from the SVG sources:
 * - Standard icons: 16, 32, 72, 96, 128, 144, 152, 192, 384, 512
 * - Maskable icons: 192, 512
 * - Apple touch icon: 180
 * - MS tile icons: 70, 150, 310
 * - Shortcut icons: 96
 * - Splash screens for iOS devices
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('📦 Sharp not installed. Install with: npm install sharp');
  console.log('   Then run this script again to generate PNG icons.');
  console.log('');
  console.log('   For now, your PWA will use SVG icons which are supported');
  console.log('   by modern browsers. PNG icons are only needed for legacy');
  console.log('   device support and app store submissions.');
  process.exit(0);
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');
const SPLASH_DIR = path.join(PUBLIC_DIR, 'splash');

// Icon sizes configuration
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];
const MS_ICON_SIZES = [70, 150, 310];

// iOS splash screen sizes
const SPLASH_SCREENS = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' }, // 12.9" iPad Pro
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' }, // 11" iPad Pro
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' }, // 9.7" iPad
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' }, // iPhone X/XS
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' }, // iPhone XS Max
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },   // iPhone 8/SE2
  { width: 640, height: 1136, name: 'apple-splash-640-1136' },   // iPhone SE1
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateIcon(inputSvg, outputPng, size) {
  try {
    await sharp(inputSvg)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPng);
    console.log(`✅ Generated: ${path.basename(outputPng)}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${path.basename(outputPng)}:`, error.message);
  }
}

async function generateSplash(width, height, outputPng) {
  // Create a splash screen with centered icon
  const iconSize = Math.min(width, height) * 0.3;
  const iconSvg = fs.readFileSync(path.join(ICONS_DIR, 'icon.svg'));
  
  try {
    // Create background
    const background = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a
      }
    });

    // Resize icon
    const icon = await sharp(iconSvg)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .png()
      .toBuffer();

    // Composite icon onto background
    await background
      .composite([{
        input: icon,
        gravity: 'center'
      }])
      .png()
      .toFile(outputPng);
    
    console.log(`✅ Generated: ${path.basename(outputPng)}`);
  } catch (error) {
    console.error(`❌ Failed to generate ${path.basename(outputPng)}:`, error.message);
  }
}

async function main() {
  console.log('🎨 Generating PWA icons...\n');

  await ensureDir(ICONS_DIR);
  await ensureDir(SPLASH_DIR);

  const iconSvg = path.join(ICONS_DIR, 'icon.svg');
  const maskableSvg = path.join(ICONS_DIR, 'maskable-icon.svg');
  const appleSvg = path.join(PUBLIC_DIR, 'apple-touch-icon.svg');

  // Check for source SVGs
  if (!fs.existsSync(iconSvg)) {
    console.error('❌ Missing icon.svg source file');
    process.exit(1);
  }

  // Generate standard icons
  console.log('📱 Standard icons:');
  for (const size of ICON_SIZES) {
    await generateIcon(iconSvg, path.join(ICONS_DIR, `icon-${size}x${size}.png`), size);
  }

  // Generate maskable icons
  console.log('\n🎭 Maskable icons:');
  const maskableSource = fs.existsSync(maskableSvg) ? maskableSvg : iconSvg;
  for (const size of MASKABLE_SIZES) {
    await generateIcon(maskableSource, path.join(ICONS_DIR, `maskable-icon-${size}x${size}.png`), size);
  }

  // Generate Apple touch icon
  console.log('\n🍎 Apple touch icon:');
  const appleSource = fs.existsSync(appleSvg) ? appleSvg : iconSvg;
  await generateIcon(appleSource, path.join(PUBLIC_DIR, 'apple-touch-icon.png'), 180);

  // Generate MS icons
  console.log('\n🪟 Microsoft icons:');
  for (const size of MS_ICON_SIZES) {
    await generateIcon(iconSvg, path.join(ICONS_DIR, `ms-icon-${size}x${size}.png`), size);
  }
  // Wide tile
  try {
    await sharp(iconSvg)
      .resize(310, 150, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .png()
      .toFile(path.join(ICONS_DIR, 'ms-icon-310x150.png'));
    console.log('✅ Generated: ms-icon-310x150.png');
  } catch (error) {
    console.error('❌ Failed to generate ms-icon-310x150.png:', error.message);
  }

  // Generate shortcut icons
  console.log('\n⚡ Shortcut icons:');
  const shortcuts = ['latest', 'breaking', 'bitcoin', 'api'];
  for (const name of shortcuts) {
    const shortcutSvg = path.join(ICONS_DIR, `shortcut-${name}.svg`);
    if (fs.existsSync(shortcutSvg)) {
      await generateIcon(shortcutSvg, path.join(ICONS_DIR, `shortcut-${name}.png`), 96);
    }
  }

  // Generate badge icon
  console.log('\n🔔 Badge icon:');
  await generateIcon(iconSvg, path.join(ICONS_DIR, 'badge-72x72.png'), 72);

  // Generate favicon
  console.log('\n🌐 Favicon:');
  const faviconSvg = path.join(PUBLIC_DIR, 'favicon.svg');
  if (fs.existsSync(faviconSvg)) {
    await generateIcon(faviconSvg, path.join(PUBLIC_DIR, 'favicon.ico'), 32);
  }

  // Generate splash screens
  console.log('\n📱 Splash screens:');
  for (const splash of SPLASH_SCREENS) {
    await generateSplash(
      splash.width,
      splash.height,
      path.join(SPLASH_DIR, `${splash.name}.png`)
    );
  }

  // Generate dark/light splash variants
  console.log('\n🌓 Splash variants:');
  await generateSplash(1125, 2436, path.join(SPLASH_DIR, 'apple-splash-dark.png'));
  await generateSplash(1125, 2436, path.join(SPLASH_DIR, 'apple-splash-light.png'));

  // Generate OG image
  console.log('\n🖼️ OG Image:');
  try {
    await sharp(iconSvg)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 }
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
    console.log('✅ Generated: og-image.png');
  } catch (error) {
    console.error('❌ Failed to generate og-image.png:', error.message);
  }

  console.log('\n✨ Done! All PWA icons generated successfully.\n');
}

main().catch(console.error);
