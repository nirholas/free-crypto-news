#!/usr/bin/env bash

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

# Adds a newline to each file and commits with a unique emoji+description message
# so every entry in the GitHub UI file listing shows a distinct, descriptive commit.
set -e

GIT_USER_EMAIL="${GIT_AUTHOR_EMAIL:-$(git config user.email)}"
GIT_USER_NAME="${GIT_AUTHOR_NAME:-$(git config user.name)}"

commit_file() {
  local filepath="$1"
  local message="$2"

  # Skip binary files & things we can't/shouldn't touch
  if [[ "$filepath" == *.png || "$filepath" == *.jpg || "$filepath" == *.jpeg \
     || "$filepath" == *.gif || "$filepath" == *.ico || "$filepath" == *.woff \
     || "$filepath" == *.woff2 || "$filepath" == *.ttf || "$filepath" == *.eot \
     || "$filepath" == *.otf || "$filepath" == *.mp4 || "$filepath" == *.webp \
     || "$filepath" == *.svg || "$filepath" == *.pdf || "$filepath" == *.zip \
     || "$filepath" == *-lock.json || "$filepath" == "package-lock.json" ]]; then
    echo "⏭  Skipping binary/lock file: $filepath"
    return
  fi

  if [[ ! -f "$filepath" ]]; then
    echo "⏭  Not a regular file, skipping: $filepath"
    return
  fi

  # Append a single blank line (idempotent-ish)
  printf '\n' >> "$filepath"
  git add "$filepath"

  if git diff --cached --quiet; then
    echo "⏭  No change after newline (possibly already has trailing newline): $filepath"
    return
  fi

  git commit -m "$message"
  echo "✅ Committed: $message"
}

# ─── Root-level files ──────────────────────────────────────────────────────────
commit_file "README.md"              "📚 README.md: project overview, quick-start guide, and feature list"
commit_file "package.json"           "📦 package.json: npm dependencies, scripts, and project metadata"
commit_file "next.config.js"         "⚙️  next.config.js: Next.js build configuration, headers, and rewrites"
commit_file "tsconfig.json"          "🔷 tsconfig.json: TypeScript compiler options and path aliases"
commit_file "tailwind.config.js"     "🎨 tailwind.config.js: Tailwind CSS theme, colors, and design tokens"
commit_file "eslint.config.mjs"      "🔍 eslint.config.mjs: ESLint rules and code-quality configuration"
commit_file "postcss.config.js"      "🔧 postcss.config.js: PostCSS plugins including Tailwind and Autoprefixer"
commit_file "vitest.config.ts"       "🧪 vitest.config.ts: Vitest unit-test configuration and setup"
commit_file "vitest.setup.ts"        "🧪 vitest.setup.ts: global test setup and mock initialisation"
commit_file "playwright.config.ts"   "🎭 playwright.config.ts: Playwright end-to-end test configuration"
commit_file "docker-compose.yml"     "🐳 docker-compose.yml: multi-container Docker setup for local development"
commit_file "Dockerfile"             "🐋 Dockerfile: container image definition for production deployment"
commit_file "vercel.json"            "▲  vercel.json: Vercel deployment config, routes, and env mappings"
commit_file "railway.json"           "🚂 railway.json: Railway.app deployment configuration"
commit_file "server.json"            "🖥️  server.json: MCP server registry schema and endpoint definitions"
commit_file "ws-server.js"           "🔌 ws-server.js: WebSocket server for real-time news push updates"
commit_file "add-oracle.js"          "🔮 add-oracle.js: script to inject on-chain oracle data into messages"
commit_file "analyze-cda.sh"         "📊 analyze-cda.sh: shell script for CDA (content-delivery analytics) analysis"
commit_file "knip.json"              "✂️  knip.json: Knip config to detect unused exports and dead code"
commit_file "mkdocs.yml"             "📖 mkdocs.yml: MkDocs site configuration for documentation publishing"
commit_file "humans.txt"             "👥 humans.txt: credits and acknowledgements for contributors"
commit_file "llms.txt"               "🤖 llms.txt: LLM-readable site index for AI crawlers (short form)"
commit_file "llms-full.txt"          "🤖 llms-full.txt: full LLM-readable content index for AI/RAG ingestion"
commit_file "ARCHITECTURE.md"        "🏛️  ARCHITECTURE.md: system architecture overview, data flow, and design decisions"
commit_file "CHANGELOG.md"           "📝 CHANGELOG.md: versioned release notes and feature history"
commit_file "CONTRIBUTING.md"        "🤝 CONTRIBUTING.md: contributor guidelines, PR process, and coding standards"
commit_file "DEPLOYMENT.md"          "🚀 DEPLOYMENT.md: step-by-step deployment guide for all platforms"
commit_file "SECURITY.md"            "🔒 SECURITY.md: security policy and responsible disclosure process"
commit_file "CODE_OF_CONDUCT.md"     "🌱 CODE_OF_CONDUCT.md: community standards and contributor expectations"
commit_file "CITATION.cff"           "🎓 CITATION.cff: academic citation metadata in CFF format"
commit_file "LICENSE"                "⚖️  LICENSE: open-source license terms (MIT)"
commit_file "AGENTS.md"              "🤖 AGENTS.md: AI agent guidelines and development workflow docs"
commit_file "AGENT_PROMPTS.md"       "💬 AGENT_PROMPTS.md: curated prompts for AI agents working on this project"
commit_file "AGENT-PROMPTS.md"       "💬 AGENT-PROMPTS.md: additional agent prompt reference and examples"
commit_file "CLAUDE.md"              "🧠 CLAUDE.md: Claude AI assistant configuration and terminal management rules"
commit_file "GEMINI.md"              "♊ GEMINI.md: Gemini AI assistant guidelines and project context"
commit_file "next.config.analyzer.js" "📈 next.config.analyzer.js: bundle-analyzer variant of the Next.js config"
commit_file ".editorconfig"          "🖊️  .editorconfig: editor formatting rules shared across all IDEs"
commit_file ".env.example"           "🔑 .env.example: template of required and optional environment variables"
commit_file ".gitattributes"         "🗂️  .gitattributes: Git attribute rules for line endings and diff drivers"
commit_file ".gitignore"             "🚫 .gitignore: files and directories excluded from version control"
commit_file ".i18nrc.js"             "🌍 .i18nrc.js: i18n configuration listing all supported locale codes"
commit_file ".lintstagedrc.js"       "🔎 .lintstagedrc.js: lint-staged hooks that run linters on staged files"
commit_file ".npmrc"                 "📦 .npmrc: npm registry settings including legacy-peer-deps for Vercel"
commit_file ".nvmrc"                 "🟩 .nvmrc: Node.js version pin (v22) for consistent runtime environments"
commit_file ".stylelintrc.json"      "💅 .stylelintrc.json: Stylelint rules for CSS and Tailwind class ordering"
commit_file ".vercelignore"          "▲  .vercelignore: files excluded from Vercel deployment bundle"

# ─── Localised READMEs ────────────────────────────────────────────────────────
commit_file "README.ar.md"    "🇸🇦 README.ar.md: Arabic translation of the project README"
commit_file "README.bg.md"    "🇧🇬 README.bg.md: Bulgarian translation of the project README"
commit_file "README.bn.md"    "🇧🇩 README.bn.md: Bengali translation of the project README"
commit_file "README.cs.md"    "🇨🇿 README.cs.md: Czech translation of the project README"
commit_file "README.da.md"    "🇩🇰 README.da.md: Danish translation of the project README"
commit_file "README.de.md"    "🇩🇪 README.de.md: German translation of the project README"
commit_file "README.el.md"    "🇬🇷 README.el.md: Greek translation of the project README"
commit_file "README.es.md"    "🇪🇸 README.es.md: Spanish translation of the project README"
commit_file "README.fa.md"    "🇮🇷 README.fa.md: Persian (Farsi) translation of the project README"
commit_file "README.fi.md"    "🇫🇮 README.fi.md: Finnish translation of the project README"
commit_file "README.fr.md"    "🇫🇷 README.fr.md: French translation of the project README"
commit_file "README.he.md"    "🇮🇱 README.he.md: Hebrew translation of the project README"
commit_file "README.hi.md"    "🇮🇳 README.hi.md: Hindi translation of the project README"
commit_file "README.hr.md"    "🇭🇷 README.hr.md: Croatian translation of the project README"
commit_file "README.hu.md"    "🇭🇺 README.hu.md: Hungarian translation of the project README"
commit_file "README.id.md"    "🇮🇩 README.id.md: Indonesian translation of the project README"
commit_file "README.it.md"    "🇮🇹 README.it.md: Italian translation of the project README"
commit_file "README.ja.md"    "🇯🇵 README.ja.md: Japanese translation of the project README"
commit_file "README.ko.md"    "🇰🇷 README.ko.md: Korean translation of the project README"
commit_file "README.ms.md"    "🇲🇾 README.ms.md: Malay translation of the project README"
commit_file "README.nl.md"    "🇳🇱 README.nl.md: Dutch translation of the project README"
commit_file "README.no.md"    "🇳🇴 README.no.md: Norwegian translation of the project README"
commit_file "README.pl.md"    "🇵🇱 README.pl.md: Polish translation of the project README"
commit_file "README.pt.md"    "🇵🇹 README.pt.md: Portuguese translation of the project README"
commit_file "README.ro.md"    "🇷🇴 README.ro.md: Romanian translation of the project README"
commit_file "README.ru.md"    "🇷🇺 README.ru.md: Russian translation of the project README"
commit_file "README.sk.md"    "🇸🇰 README.sk.md: Slovak translation of the project README"
commit_file "README.sl.md"    "🇸🇮 README.sl.md: Slovenian translation of the project README"
commit_file "README.sr.md"    "🇷🇸 README.sr.md: Serbian translation of the project README"
commit_file "README.sv.md"    "🇸🇪 README.sv.md: Swedish translation of the project README"
commit_file "README.sw.md"    "🇹🇿 README.sw.md: Swahili translation of the project README"
commit_file "README.ta.md"    "🇮🇳 README.ta.md: Tamil translation of the project README"
commit_file "README.te.md"    "🇮🇳 README.te.md: Telugu translation of the project README"
commit_file "README.th.md"    "🇹🇭 README.th.md: Thai translation of the project README"
commit_file "README.tl.md"    "🇵🇭 README.tl.md: Filipino/Tagalog translation of the project README"
commit_file "README.tr.md"    "🇹🇷 README.tr.md: Turkish translation of the project README"
commit_file "README.uk.md"    "🇺🇦 README.uk.md: Ukrainian translation of the project README"
commit_file "README.ur.md"    "🇵🇰 README.ur.md: Urdu translation of the project README"
commit_file "README.vi.md"    "🇻🇳 README.vi.md: Vietnamese translation of the project README"
commit_file "README.zh-CN.md" "🇨🇳 README.zh-CN.md: Simplified Chinese translation of the project README"
commit_file "README.zh-TW.md" "🇹🇼 README.zh-TW.md: Traditional Chinese translation of the project README"

# ─── Directories — touch a representative file inside each ────────────────────

# src/
SRC_FILE=$(git ls-files src/ | head -1)
[[ -n "$SRC_FILE" ]] && commit_file "$SRC_FILE" "🏗️  src/: main Next.js application — pages, components, API routes, and hooks"

# docs/
DOCS_FILE=$(git ls-files docs/ | grep -E '\.md$' | head -1)
[[ -n "$DOCS_FILE" ]] && commit_file "$DOCS_FILE" "📖 docs/: full project documentation — API reference, guides, and architecture"

# public/
PUB_FILE=$(git ls-files public/ | grep -v '.png\|.jpg\|.ico\|.svg\|.webp' | head -1)
[[ -n "$PUB_FILE" ]] && commit_file "$PUB_FILE" "🌐 public/: static assets, manifest, service worker, and robots.txt"

# scripts/
SCRIPTS_FILE=$(git ls-files scripts/ | head -1)
[[ -n "$SCRIPTS_FILE" ]] && commit_file "$SCRIPTS_FILE" "⚙️  scripts/: automation and build helper scripts"

# archive/
ARCHIVE_FILE=$(git ls-files archive/ | grep '\.json' | head -1)
[[ -n "$ARCHIVE_FILE" ]] && commit_file "$ARCHIVE_FILE" "🗄️  archive/: historical crypto news archive with 346k+ articles and market data"

# sdk/
SDK_FILE=$(git ls-files sdk/ | grep -E '\.(ts|js|md)$' | head -1)
[[ -n "$SDK_FILE" ]] && commit_file "$SDK_FILE" "🛠️  sdk/: official TypeScript, Python, Go, and React SDK packages"

# mcp/
MCP_FILE=$(git ls-files mcp/ | grep -E '\.(ts|js|md)$' | head -1)
[[ -n "$MCP_FILE" ]] && commit_file "$MCP_FILE" "🧩 mcp/: Model Context Protocol server for Claude AI integration"

# cli/
CLI_FILE=$(git ls-files cli/ | grep -E '\.(js|ts|md)$' | head -1)
[[ -n "$CLI_FILE" ]] && commit_file "$CLI_FILE" "💻 cli/: command-line interface for fetching crypto news from the terminal"

# widget/
WIDGET_FILE=$(git ls-files widget/ | grep -E '\.(ts|tsx|js|md)$' | head -1)
[[ -n "$WIDGET_FILE" ]] && commit_file "$WIDGET_FILE" "🪟 widget/: embeddable JavaScript widget for third-party sites"

# chatgpt/
CHATGPT_FILE=$(git ls-files chatgpt/ | head -1)
[[ -n "$CHATGPT_FILE" ]] && commit_file "$CHATGPT_FILE" "🤖 chatgpt/: ChatGPT plugin definition with OpenAPI spec"

# extension/
EXT_FILE=$(git ls-files extension/ | grep -E '\.(ts|js|json|md)$' | head -1)
[[ -n "$EXT_FILE" ]] && commit_file "$EXT_FILE" "🧩 extension/: browser extension for instant crypto news overlay"

# copilot-extension/
COPILOT_FILE=$(git ls-files copilot-extension/ | grep -E '\.(ts|js|json|md)$' | head -1)
[[ -n "$COPILOT_FILE" ]] && commit_file "$COPILOT_FILE" "🤖 copilot-extension/: GitHub Copilot Chat extension for crypto news queries"

# mobile/
MOBILE_FILE=$(git ls-files mobile/ | grep -E '\.(ts|tsx|js|md)$' | head -1)
[[ -n "$MOBILE_FILE" ]] && commit_file "$MOBILE_FILE" "📱 mobile/: React Native mobile app for iOS and Android"

# terminal/
TERM_FILE=$(git ls-files terminal/ | grep -E '\.(ts|js|md)$' | head -1)
[[ -n "$TERM_FILE" ]] && commit_file "$TERM_FILE" "🖥️  terminal/: terminal dashboard for displaying crypto news in the CLI"

# alfred/
ALFRED_FILE=$(git ls-files alfred/ | grep -E '\.(sh|md|plist)$' | head -1)
[[ -n "$ALFRED_FILE" ]] && commit_file "$ALFRED_FILE" "🔍 alfred/: Alfred workflow for macOS quick-access to crypto news"

# raycast/
RAYCAST_FILE=$(git ls-files raycast/ | grep -E '\.(ts|js|md)$' | head -1)
[[ -n "$RAYCAST_FILE" ]] && commit_file "$RAYCAST_FILE" "⚡ raycast/: Raycast extension for macOS crypto news lookup"

# postman/
POSTMAN_FILE=$(git ls-files postman/ | head -1)
[[ -n "$POSTMAN_FILE" ]] && commit_file "$POSTMAN_FILE" "📮 postman/: Postman collection for testing all API endpoints"

# examples/
EXAMPLES_FILE=$(git ls-files examples/ | grep -E '\.(ts|js|md)$' | head -1)
[[ -n "$EXAMPLES_FILE" ]] && commit_file "$EXAMPLES_FILE" "💡 examples/: usage examples for the API, SDKs, and widgets"

# contracts/
CONTRACTS_FILE=$(git ls-files contracts/ | head -1)
[[ -n "$CONTRACTS_FILE" ]] && commit_file "$CONTRACTS_FILE" "🔮 contracts/: Solidity smart contract for on-chain crypto news oracle"

# content/
CONTENT_FILE=$(git ls-files content/ | grep -E '\.(md|mdx)$' | head -1)
[[ -n "$CONTENT_FILE" ]] && commit_file "$CONTENT_FILE" "✍️  content/: blog posts and editorial content managed via the file system"

# data/
DATA_FILE=$(git ls-files data/ | grep '\.json$' | head -1)
[[ -n "$DATA_FILE" ]] && commit_file "$DATA_FILE" "📊 data/: static data files including alerts, categories, and coin metadata"

# messages/
MSGS_FILE=$(git ls-files messages/ | head -1)
[[ -n "$MSGS_FILE" ]] && commit_file "$MSGS_FILE" "💬 messages/: i18n translation message files for all supported locales"

# site/
SITE_FILE=$(git ls-files site/ | grep -E '\.(ts|js|md|yml|yaml)$' | head -1)
[[ -n "$SITE_FILE" ]] && commit_file "$SITE_FILE" "🌐 site/: MkDocs documentation site source and configuration"

# stories/
STORIES_FILE=$(git ls-files stories/ | grep -E '\.(ts|tsx|js|md)$' | head -1)
[[ -n "$STORIES_FILE" ]] && commit_file "$STORIES_FILE" "📚 stories/: Storybook component stories for visual development and testing"

# e2e/
E2E_FILE=$(git ls-files e2e/ | grep -E '\.(ts|js)$' | head -1)
[[ -n "$E2E_FILE" ]] && commit_file "$E2E_FILE" "🎭 e2e/: Playwright end-to-end tests covering critical user journeys"

# .github/
GITHUB_FILE=$(git ls-files .github/ | head -1)
[[ -n "$GITHUB_FILE" ]] && commit_file "$GITHUB_FILE" "⚙️  .github/: CI/CD workflows, issue templates, and GitHub Actions"

# .storybook/
STORYBOOK_FILE=$(git ls-files .storybook/ | head -1)
[[ -n "$STORYBOOK_FILE" ]] && commit_file "$STORYBOOK_FILE" "📚 .storybook/: Storybook configuration and global decorators"

# .well-known/
WELLKNOWN_FILE=$(git ls-files .well-known/ | head -1)
[[ -n "$WELLKNOWN_FILE" ]] && commit_file "$WELLKNOWN_FILE" "🔑 .well-known/: standard well-known URIs including security.txt and ai-plugin.json"

# .data/
DATA_DIR_FILE=$(git ls-files .data/ | head -1)
[[ -n "$DATA_DIR_FILE" ]] && commit_file "$DATA_DIR_FILE" "🗃️  .data/: local runtime data cache used by the development server"

# playwright-report/
PR_FILE=$(git ls-files playwright-report/ | grep -v '.png\|.jpg' | head -1)
[[ -n "$PR_FILE" ]] && commit_file "$PR_FILE" "📋 playwright-report/: generated Playwright test result reports"

echo ""
echo "🎉 Done! All files committed with unique descriptive messages."
