# Prompt 21 — Browser Extension & App Store Submissions

> Paste this entire file into a new Claude Opus 4.6 chat session with terminal access to the codebase.

## Context

You are preparing **free-crypto-news** extensions and apps for submission to various stores. The project has:

- **Browser extension:** `/extension/` (Chrome manifest v3)
- **Copilot extension:** `/copilot-extension/` (VS Code / GitHub Copilot)
- **CLI tool:** `/cli/` (Node.js CLI)
- **Mobile app:** `/mobile/` (React Native)
- **Alfred workflow:** `/alfred/`
- **Raycast extension:** `/raycast/` (if exists)
- **PWA:** The main web app at https://cryptocurrency.cv is installable

### Project Details
- **Name:** Free Crypto News
- **Website:** https://cryptocurrency.cv
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **License:** MIT
- **Author:** nirholas

### IMPORTANT RULES
- Use `bun` to run scripts, `pnpm` for packages
- Always use background terminals, kill after completion
- Git as `nirholas` / `22895867+nirholas@users.noreply.github.com`

---

## Task

For each store/platform, inspect the existing code, ensure it's ready for submission, fix any issues, and prepare all submission materials. Where manual web upload is required, prepare the exact content and assets.

---

## 1. Chrome Web Store 🔴 P0

**Directory:** `/extension/`

Steps:
1. Read all files in `/extension/` (manifest.json, popup.html, popup.js, background.js, options.html, options.js)
2. Ensure `manifest.json` is valid manifest v3 with:
   - Proper name, description, version
   - Required permissions only
   - Icons at 16, 48, 128px
   - Correct content security policy
3. Create a zip file for upload: `cd extension && zip -r ../free-crypto-news-extension.zip .`
4. Prepare store listing content:

**Store Listing:**
- **Name:** Free Crypto News
- **Short description (132 chars):** Real-time crypto news from 200+ sources. Breaking news alerts, market sentiment, and trending topics.
- **Detailed description:**
```
Free Crypto News brings real-time cryptocurrency news from 200+ sources directly to your browser.

FEATURES:
• Breaking news from CoinDesk, The Block, Bloomberg, Decrypt, and 200+ more sources
• AI-powered sentiment analysis for any cryptocurrency
• Fear & Greed Index at a glance
• Trending crypto topics
• Quick search across all sources
• Dark mode support
• Completely free — no account required

PRIVACY:
• No data collection
• No tracking
• No accounts
• Open source (MIT license)

Powered by the Free Crypto News API (https://cryptocurrency.cv) — the most comprehensive free crypto news aggregator.

Source code: https://github.com/nirholas/free-crypto-news/tree/main/extension
```
- **Category:** News & Weather (or Productivity)
- **Language:** English
- **Screenshots:** Need 1280x800 or 640x400 screenshots of the popup

5. Generate icons if missing (create simple SVG→PNG conversion)
6. Note: Chrome Web Store requires a one-time $5 developer registration fee

---

## 2. Firefox Add-ons 🟠 P1

**Directory:** Create from `/extension/` with adaptations

Steps:
1. Copy the Chrome extension
2. Adapt manifest.json for Firefox (manifest v2 or v3 depending on Firefox support)
3. Key differences:
   - Replace `chrome.*` API calls with `browser.*` (or use webextension-polyfill)
   - Adjust manifest for Firefox compatibility
4. Create zip for submission
5. Prepare listing with same content as Chrome

---

## 3. Microsoft Edge Add-ons 🟡 P2

Chrome extensions are mostly compatible with Edge. Steps:
1. Same zip as Chrome extension
2. Submit to Edge Add-ons portal
3. Same listing content

---

## 4. VS Code Marketplace 🟠 P1

**Directory:** `/copilot-extension/`

Steps:
1. Read the existing files
2. Ensure `package.json` has VS Code extension metadata:
   ```json
   {
     "name": "free-crypto-news",
     "displayName": "Free Crypto News",
     "description": "Real-time crypto news, market data, and AI analysis from 200+ sources",
     "version": "1.0.0",
     "publisher": "nirholas",
     "engines": { "vscode": "^1.80.0" },
     "categories": ["Other"],
     "keywords": ["crypto", "cryptocurrency", "news", "bitcoin", "market"],
     "repository": {
       "type": "git",
       "url": "https://github.com/nirholas/free-crypto-news"
     },
     "icon": "icon.png"
   }
   ```
3. Build: `bunx vsce package`
4. Publish: `bunx vsce publish` (requires Personal Access Token)

**VS Code Marketplace Listing:**
```
# Free Crypto News

Real-time crypto news from 200+ sources directly in VS Code. No API key required.

## Features
- Latest crypto news in sidebar
- AI sentiment analysis
- Market data and prices
- Trending topics
- Search across 200+ sources

## Commands
- `Crypto News: Latest` — Show latest news
- `Crypto News: Search` — Search articles
- `Crypto News: Sentiment` — Check sentiment for a coin
```

---

## 5. Raycast Store 🟠 P1

**Directory:** Check if `/raycast/` exists with extension code

Steps:
1. Check `/raycast/` directory structure
2. Ensure it follows Raycast extension format (package.json with raycast config)
3. Raycast extensions are submitted via PR to https://github.com/raycast/extensions
4. Prepare the PR following their contribution guidelines

**Raycast Extension Metadata:**
```json
{
  "name": "free-crypto-news",
  "title": "Free Crypto News",
  "description": "Real-time crypto news from 200+ sources",
  "icon": "command-icon.png",
  "author": "nirholas",
  "categories": ["Finance", "News", "Developer Tools"],
  "license": "MIT"
}
```

---

## 6. Homebrew Formula 🟡 P2

**Directory:** `/cli/`

Steps:
1. Read the CLI tool code
2. Create a Homebrew formula:

```ruby
class FreeCryptoNews < Formula
  desc "CLI for Free Crypto News API — real-time crypto news from 200+ sources"
  homepage "https://github.com/nirholas/free-crypto-news"
  url "https://github.com/nirholas/free-crypto-news/archive/refs/tags/v1.0.2.tar.gz"
  license "MIT"

  depends_on "node"

  def install
    cd "cli" do
      system "npm", "install"
      bin.install "index.js" => "crypto-news"
    end
  end

  test do
    assert_match "Free Crypto News", shell_output("#{bin}/crypto-news --help")
  end
end
```

3. Submit to homebrew-core via PR, or create a tap: `nirholas/homebrew-tap`

---

## 7. Alfred Gallery 🟢 P3

**Directory:** `/alfred/`

Steps:
1. Read existing Alfred workflow files
2. Ensure `info.plist` has proper metadata
3. Create `.alfredworkflow` zip
4. Prepare Alfred Gallery listing

---

## 8. Mobile Apps (future) 🟡 P2

**Directory:** `/mobile/`

Steps:
1. Read the React Native app structure
2. Assess readiness for app store submission
3. For now, focus on ensuring the project builds
4. Prepare app store listing content for when ready:

**App Store / Play Store Listing:**
- **Name:** Free Crypto News
- **Subtitle:** Real-time news from 200+ sources
- **Description:** Get cryptocurrency news from 200+ sources including Bloomberg, CoinDesk, and The Block. Free, no account required. Features AI sentiment analysis, market data, and trending topics.
- **Category:** News / Finance
- **Keywords:** crypto, cryptocurrency, bitcoin, ethereum, news, market, defi, sentiment
- **Screenshots:** Need mobile screenshots

---

## Workflow

1. Inspect each extension/app directory
2. Fix metadata and package configuration
3. Build where applicable
4. Prepare submission assets (zips, screenshots descriptions)
5. Commit all changes
6. Output manual steps that require web browser / account setup

---

## Completion Checklist

- [ ] Chrome extension — zip created, listing content written
- [ ] Firefox extension — adapted manifest, zip created
- [ ] Edge extension — verified compatibility
- [ ] VS Code extension — package.json updated, build command ready
- [ ] Raycast extension — PR prepared for raycast/extensions
- [ ] Homebrew formula — formula written, tap/PR approach decided
- [ ] Alfred workflow — .alfredworkflow created
- [ ] Mobile app — assessed readiness, listing content drafted
- [ ] All changes committed and pushed
