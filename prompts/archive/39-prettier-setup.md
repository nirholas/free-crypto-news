# 39 — Add Prettier for Consistent Code Formatting

## Goal

Add a Prettier configuration to enforce consistent code formatting across the entire project. Prettier is already installed as a dependency but has no config file — formatting relies entirely on individual IDE settings, which causes inconsistency.

## Context

- **Current state:** Prettier is in `pnpm-lock.yaml` as a dependency but no `.prettierrc` or `prettier.config.js` exists
- **Linting:** ESLint 10 with `eslint.config.mjs` (TypeScript + jsx-a11y rules)
- **Styling:** Tailwind CSS 4.2 via PostCSS
- **Package manager:** pnpm
- **Runtime:** bun for scripts
- **Editor:** VS Code (Codespaces) — most contributors use this

## Task

### 1. Create `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["clsx", "cn", "cva"]
}
```

### 2. Create `.prettierignore`

```gitignore
# Build outputs
.next/
dist/
out/
build/
coverage/

# Dependencies
node_modules/
pnpm-lock.yaml

# Generated
drizzle/
archive/
public/sw.js
public/workbox-*.js

# SDK packages (have their own formatting)
sdk/
mcp/
cli/
widget/

# Non-code
*.md
*.json
*.yaml
*.yml
*.svg
*.png
*.ico
LICENSE
```

### 3. Install Prettier Tailwind Plugin

```bash
pnpm add -D prettier-plugin-tailwindcss
```

This automatically sorts Tailwind classes in a consistent order.

### 4. Add package.json Scripts

Add these scripts to `package.json`:

```json
{
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
  "format:all": "prettier --write \"**/*.{ts,tsx,js,jsx,css}\" --ignore-path .prettierignore"
}
```

### 5. Add Prettier to Quality Gate

Read `scripts/quality-gate.sh` and add a Prettier check step. Add this command to the gate:

```bash
echo "▸ Checking code formatting..."
bunx prettier --check "src/**/*.{ts,tsx,css}" || { echo "❌ Formatting issues found. Run 'bun run format' to fix."; exit 1; }
```

### 6. Add VS Code Settings

Create or update `.vscode/settings.json` to enable format-on-save:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 7. Initial Format Run

Run `bun run format` to format all existing code. This will be a large diff — commit it as a standalone commit:

```
style: apply prettier formatting across codebase
```

## Requirements

- Do NOT change any logic — only whitespace/formatting changes
- The Prettier config should NOT conflict with ESLint rules (Prettier handles formatting, ESLint handles logic)
- Tailwind class sorting must work with the existing `cn()` and `clsx()` utility usage
- The `.prettierignore` must exclude generated files, archives, and sub-packages
- Format the initial codebase in a single, dedicated commit (separate from config changes)

## Success Criteria

- `bun run format:check` passes with zero issues
- `bun run lint` still passes (no ESLint/Prettier conflicts)
- `bun run build` still succeeds
- VS Code formats on save for `.ts`, `.tsx`, and `.css` files
- Tailwind classes are auto-sorted consistently
