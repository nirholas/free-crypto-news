# Prompt 20 — Publish SDKs to Package Registries

> Paste this entire file into a new Claude Opus 4.6 chat session with terminal access to the codebase.

## Context

You are publishing the **free-crypto-news** SDKs to their respective package registries. The SDKs live in `/sdk/` and the MCP server is in `/mcp/`.

### Project Details
- **Repo:** https://github.com/nirholas/free-crypto-news
- **API Base:** https://cryptocurrency.cv
- **License:** MIT
- **Author:** nirholas

### SDK Directory Structure
```
sdk/
├── csharp/
├── go/
├── java/
├── javascript/
├── kotlin/
├── php/
├── python/
├── r/
├── react/
├── ruby/
├── rust/
├── swift/
└── typescript/
```

### MCP Server
```
mcp/
├── index.js
├── package.json
└── README.md
```

---

## Task

For each SDK, inspect its current state, ensure it has proper package metadata (name, version, description, license, author, repository, keywords), and prepare it for publishing. Where possible, actually publish. Where not possible (requires account setup), output the exact commands and configuration needed.

### IMPORTANT RULES
- Use `bun` to run scripts
- Use `pnpm` for package management
- Always use background terminals (`isBackground: true`) and kill after completion
- Git commits as `nirholas` / `22895867+nirholas@users.noreply.github.com`

---

## 1. npm (TypeScript SDK) 🔴 P0

**Directory:** `/sdk/typescript/`

Steps:
1. Read the existing `package.json`
2. Ensure it has:
   ```json
   {
     "name": "free-crypto-news",
     "version": "1.0.0",
     "description": "TypeScript SDK for the Free Crypto News API — 200+ sources, no API key required",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "license": "MIT",
     "author": "nirholas",
     "repository": {
       "type": "git",
       "url": "https://github.com/nirholas/free-crypto-news",
       "directory": "sdk/typescript"
     },
     "homepage": "https://cryptocurrency.cv",
     "keywords": ["crypto", "cryptocurrency", "news", "api", "bitcoin", "ethereum", "defi", "market-data", "free-api", "no-auth"],
     "files": ["dist/", "README.md", "LICENSE"]
   }
   ```
3. Ensure a README.md exists with usage examples
4. Build: `bun run build` or `bunx tsc`
5. Publish: `npm publish` (or output the command if auth is needed)

---

## 2. npm (React SDK) 🔴 P0

**Directory:** `/sdk/react/`

Same as TypeScript SDK but with:
```json
{
  "name": "free-crypto-news-react",
  "description": "React hooks and components for the Free Crypto News API",
  "keywords": ["crypto", "react", "hooks", "news", "api", "cryptocurrency", "components"],
  "peerDependencies": {
    "react": ">=17.0.0"
  }
}
```

---

## 3. npm (JavaScript SDK) 🟠 P1

**Directory:** `/sdk/javascript/`

```json
{
  "name": "free-crypto-news-js",
  "description": "JavaScript SDK for the Free Crypto News API — works in Node.js and browsers"
}
```

---

## 4. npm (MCP Server) — Verify 🔴 P0

**Directory:** `/mcp/`

Check if already published as `@anthropic-ai/mcp-server-crypto-news`. If not, prepare for publishing under a different scope. Read the current package.json and verify.

---

## 5. PyPI (Python SDK) 🔴 P0

**Directory:** `/sdk/python/`

Steps:
1. Read existing files
2. Ensure `setup.py` or `pyproject.toml` exists with:
   ```toml
   [project]
   name = "free-crypto-news"
   version = "1.0.0"
   description = "Python SDK for the Free Crypto News API — 200+ sources, no API key required"
   authors = [{name = "nirholas"}]
   license = {text = "MIT"}
   readme = "README.md"
   requires-python = ">=3.8"
   keywords = ["crypto", "cryptocurrency", "news", "api", "bitcoin", "ethereum", "defi"]
   classifiers = [
     "Development Status :: 5 - Production/Stable",
     "Intended Audience :: Developers",
     "License :: OSI Approved :: MIT License",
     "Programming Language :: Python :: 3",
     "Topic :: Office/Business :: Financial",
   ]
   
   [project.urls]
   Homepage = "https://cryptocurrency.cv"
   Repository = "https://github.com/nirholas/free-crypto-news"
   Documentation = "https://cryptocurrency.cv/developers"
   ```
3. Ensure README.md exists with pip install instructions and usage examples
4. Build: `python -m build`
5. Publish: `twine upload dist/*` (or output command if auth needed)

---

## 6. Go Modules 🟠 P1

**Directory:** `/sdk/go/`

Steps:
1. Ensure `go.mod` exists with proper module path:
   ```
   module github.com/nirholas/free-crypto-news/sdk/go
   ```
2. Ensure proper Go package structure
3. Tag with `sdk/go/v1.0.0` for Go modules to pick up
4. Go modules are published automatically via GitHub tags — just need proper structure

---

## 7. Docker Hub 🔴 P0

Steps:
1. Check if Dockerfile is properly configured
2. Build image: `docker build -t nirholas/free-crypto-news:latest .`
3. Tag: `docker tag nirholas/free-crypto-news:latest nirholas/free-crypto-news:1.0.2`
4. Push: `docker push nirholas/free-crypto-news:latest && docker push nirholas/free-crypto-news:1.0.2`
5. Add Docker Hub description using the README content

Docker Hub description:
```
# Free Crypto News API

Real-time crypto news from 200+ sources. No API key required.

## Quick Start

docker run -p 3000:3000 nirholas/free-crypto-news

## Docker Compose

docker compose up

## Features
- 200+ news sources
- 150+ API endpoints
- AI sentiment analysis
- Market data
- Self-contained

https://github.com/nirholas/free-crypto-news
```

---

## 8. Packagist (PHP SDK) 🟡 P2

**Directory:** `/sdk/php/`

Ensure `composer.json` exists:
```json
{
  "name": "nirholas/free-crypto-news",
  "description": "PHP SDK for the Free Crypto News API",
  "type": "library",
  "license": "MIT",
  "autoload": {
    "psr-4": {
      "FreeCryptoNews\\": "src/"
    }
  },
  "require": {
    "php": ">=8.0"
  }
}
```

Packagist auto-discovers from GitHub if composer.json exists at the repo root or in the SDK path.

---

## 9. crates.io (Rust SDK) 🟡 P2

**Directory:** `/sdk/rust/`

Ensure `Cargo.toml`:
```toml
[package]
name = "free-crypto-news"
version = "1.0.0"
edition = "2021"
description = "Rust SDK for the Free Crypto News API — 200+ sources, no API key"
license = "MIT"
repository = "https://github.com/nirholas/free-crypto-news"
homepage = "https://cryptocurrency.cv"
keywords = ["crypto", "cryptocurrency", "news", "api", "bitcoin"]
categories = ["api-bindings", "web-programming"]
```

Publish: `cargo publish`

---

## 10. RubyGems (Ruby SDK) 🟢 P3

**Directory:** `/sdk/ruby/`

Ensure `.gemspec` file exists with proper metadata.

---

## 11. Maven Central (Java SDK) 🟡 P2

**Directory:** `/sdk/java/`

This requires a Sonatype account and GPG signing. Prepare the `pom.xml` with proper metadata but flag as manual step.

---

## 12. Maven Central (Kotlin SDK) 🟡 P2

**Directory:** `/sdk/kotlin/`

Same as Java — prepare build.gradle.kts with proper metadata.

---

## 13. NuGet (C# SDK) 🟡 P2

**Directory:** `/sdk/csharp/`

Ensure `.csproj` has:
```xml
<PropertyGroup>
  <PackageId>FreeCryptoNews</PackageId>
  <Version>1.0.0</Version>
  <Description>C# SDK for the Free Crypto News API</Description>
  <Authors>nirholas</Authors>
  <PackageLicenseExpression>MIT</PackageLicenseExpression>
  <RepositoryUrl>https://github.com/nirholas/free-crypto-news</RepositoryUrl>
</PropertyGroup>
```

Publish: `dotnet nuget push`

---

## 14. SwiftPM (Swift SDK) 🟢 P3

**Directory:** `/sdk/swift/`

Ensure `Package.swift` has proper metadata. SwiftPM packages are discovered via the GitHub repo — just needs proper structure and a tag.

---

## 15. CRAN (R SDK) 🟢 P3

**Directory:** `/sdk/r/`

CRAN has strict submission requirements. Prepare `DESCRIPTION` file but flag as manual.

---

## Workflow

For each SDK:
1. Read the current files
2. Fix/add package metadata
3. Ensure README.md exists with install + usage examples
4. Build if applicable
5. Publish if auth is available, otherwise output exact commands
6. Commit all changes

After all SDKs are prepared:
```bash
git config user.name "nirholas"
git config user.email "22895867+nirholas@users.noreply.github.com"
git add -A
git commit -m "Prepare all SDKs for package registry publishing"
git push
```

---

## Completion Checklist

Report back with:
- [ ] TypeScript SDK — package.json ready, npm publish command
- [ ] React SDK — package.json ready, npm publish command
- [ ] JavaScript SDK — package.json ready
- [ ] MCP server — verified/ready
- [ ] Python SDK — pyproject.toml ready, twine command
- [ ] Go SDK — go.mod ready, tag command
- [ ] Docker Hub — build + push commands
- [ ] PHP SDK — composer.json ready
- [ ] Rust SDK — Cargo.toml ready
- [ ] Ruby SDK — gemspec ready
- [ ] Java SDK — pom.xml ready
- [ ] Kotlin SDK — build.gradle.kts ready
- [ ] C# SDK — .csproj ready
- [ ] Swift SDK — Package.swift ready
- [ ] R SDK — DESCRIPTION ready
- [ ] All changes committed and pushed
