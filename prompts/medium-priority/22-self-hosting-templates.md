# Prompt 22 — Self-Hosting & Deploy Template Submissions

> Paste this entire file into a new Claude Opus 4.6 chat session with terminal access to the codebase.

## Context

You are creating one-click deploy templates for **free-crypto-news** and submitting them to hosting platforms. The project already has:

- `Dockerfile` — production Docker image
- `docker-compose.yml` — full stack with Redis
- `railway.json` — Railway deployment config
- `vercel.json` — Vercel deployment config
- `nginx.conf` — Nginx reverse proxy config

### Project Details
- **Name:** Free Crypto News
- **Repo:** https://github.com/nirholas/free-crypto-news
- **License:** MIT
- **Runtime:** Node.js 20+ / Next.js
- **Dependencies:** Redis (optional but recommended for caching)
- **Port:** 3000

### Environment Variables
```env
# Required (none — works with zero config!)

# Optional — enhance features:
GROQ_API_KEY=           # Free at console.groq.com — enables AI features
OPENAI_API_KEY=         # OpenAI for AI features
ANTHROPIC_API_KEY=      # Anthropic for AI features  
REDIS_URL=              # Redis for caching (recommended)
DATABASE_URL=           # PostgreSQL for persistence
ADMIN_TOKEN=            # Admin API access
```

### IMPORTANT RULES
- Use `bun` to run scripts, `pnpm` for packages
- Always use background terminals, kill after completion
- Git as `nirholas` / `22895867+nirholas@users.noreply.github.com`
- **Never create or modify GitHub Actions workflows**

---

## Task

For each platform, create the necessary template files, configuration, and submission content. Commit all files to the repo and submit where possible.

---

## 1. Railway Template 🟠 P1

**Existing file:** `railway.json`

Steps:
1. Read current `railway.json`
2. Ensure it's properly configured with:
   - Service name
   - Build command
   - Start command
   - Environment variable templates
   - Health check URL
3. Create a "Deploy on Railway" button for the README:
   ```markdown
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/TEMPLATE_ID?referralCode=REFERRAL)
   ```
4. Submit template to https://railway.app/templates via their submission process

**Railway Template Metadata:**
```json
{
  "name": "Free Crypto News API",
  "description": "Real-time crypto news from 200+ sources. No API key required. AI-powered analysis.",
  "icon": "🆓",
  "tags": ["crypto", "news", "api", "ai"],
  "repo": "https://github.com/nirholas/free-crypto-news"
}
```

---

## 2. Vercel Deploy Button 🟠 P1

**Existing file:** `vercel.json`

Steps:
1. Read current `vercel.json`
2. Create a deploy button link:
   ```markdown
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nirholas/free-crypto-news&env=GROQ_API_KEY&envDescription=Optional%20API%20keys%20for%20AI%20features&project-name=free-crypto-news&repository-name=free-crypto-news)
   ```
3. Submit to Vercel Templates gallery

---

## 3. Render Blueprint 🟡 P2

Create `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: free-crypto-news
    runtime: node
    plan: free
    buildCommand: pnpm install && pnpm run build
    startCommand: pnpm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: GROQ_API_KEY
        sync: false
      - key: REDIS_URL
        fromService:
          type: redis
          name: crypto-news-cache
          property: connectionString
    healthCheckPath: /api/health

  - type: redis
    name: crypto-news-cache
    plan: free
    maxmemoryPolicy: allkeys-lru
```

Add deploy button:
```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/nirholas/free-crypto-news)
```

---

## 4. DigitalOcean App Platform 🟡 P2

Create `.do/app.yaml`:

```yaml
name: free-crypto-news
services:
  - name: web
    github:
      repo: nirholas/free-crypto-news
      branch: main
      deploy_on_push: true
    build_command: pnpm install && pnpm run build
    run_command: pnpm run start
    http_port: 3000
    instance_size_slug: basic-xxs
    instance_count: 1
    envs:
      - key: NODE_ENV
        value: production
      - key: GROQ_API_KEY
        type: SECRET
    health_check:
      http_path: /api/health
```

Add deploy button:
```markdown
[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/nirholas/free-crypto-news/tree/main)
```

---

## 5. Portainer Template 🟡 P2

Create a Portainer app template JSON. This can be submitted to the community templates repo.

```json
{
  "version": "2",
  "templates": [
    {
      "type": 3,
      "title": "Free Crypto News",
      "description": "Real-time crypto news aggregator with 200+ sources, AI analysis, and full REST API",
      "categories": ["news", "cryptocurrency", "api"],
      "platform": "linux",
      "logo": "https://cryptocurrency.cv/favicon.ico",
      "repository": {
        "url": "https://github.com/nirholas/free-crypto-news",
        "stackfile": "docker-compose.yml"
      },
      "env": [
        {
          "name": "GROQ_API_KEY",
          "label": "Groq API Key",
          "description": "Optional — enables AI features (free at console.groq.com)",
          "default": ""
        }
      ]
    }
  ]
}
```

Submit to: https://github.com/portainer/templates

---

## 6. CasaOS App 🟡 P2

Create a CasaOS app manifest:

```yaml
name: Free Crypto News
tagline: Real-time crypto news from 200+ sources
overview: |
  Free Crypto News is a self-hosted crypto news aggregator with 200+ sources,
  AI analysis, and 150+ API endpoints. No API key required.
icon: https://cryptocurrency.cv/favicon.ico
developer: nirholas
website: https://cryptocurrency.cv
container:
  image: nirholas/free-crypto-news:latest
  ports:
    - container: "3000"
      host: "3000"
  environment:
    - GROQ_API_KEY=
category: News
port_map: "3000"
```

Submit to CasaOS app store or their GitHub repo.

---

## 7. Unraid Template 🟡 P2

Create an Unraid Docker template XML:

```xml
<?xml version="1.0"?>
<Container version="2">
  <Name>FreeCryptoNews</Name>
  <Repository>nirholas/free-crypto-news:latest</Repository>
  <Registry>https://hub.docker.com/r/nirholas/free-crypto-news</Registry>
  <Network>bridge</Network>
  <Privileged>false</Privileged>
  <Support>https://github.com/nirholas/free-crypto-news/issues</Support>
  <Project>https://github.com/nirholas/free-crypto-news</Project>
  <Overview>Real-time crypto news from 200+ sources. No API key required. AI-powered analysis, market data, DeFi tools.</Overview>
  <Category>Tools: News:</Category>
  <WebUI>http://[IP]:[PORT:3000]</WebUI>
  <Icon>https://cryptocurrency.cv/favicon.ico</Icon>
  <Config Name="Web UI Port" Target="3000" Default="3000" Mode="tcp" Description="Web interface port" Type="Port" Display="always" Required="true"/>
  <Config Name="Groq API Key" Target="GROQ_API_KEY" Default="" Mode="" Description="Optional - enables AI features (free at console.groq.com)" Type="Variable" Display="always" Required="false"/>
</Container>
```

---

## 8. Coolify 🟡 P2

Coolify auto-detects Dockerfile and docker-compose.yml, but we can add a Coolify-specific config or documentation.

Add to docs or README a Coolify section:
```markdown
### Coolify
1. Add new resource → GitHub repository
2. Select `nirholas/free-crypto-news`
3. Coolify auto-detects the Dockerfile
4. Set port to 3000
5. Deploy
```

---

## 9. Heroku 🟢 P3

Create `heroku.yml` (if useful):
```yaml
build:
  docker:
    web: Dockerfile
run:
  web: pnpm run start
```

Or `Procfile`:
```
web: pnpm run start
```

Add deploy button:
```markdown
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/nirholas/free-crypto-news)
```

Create `app.json`:
```json
{
  "name": "Free Crypto News",
  "description": "Real-time crypto news API from 200+ sources. Free, no API key.",
  "repository": "https://github.com/nirholas/free-crypto-news",
  "keywords": ["crypto", "news", "api", "ai"],
  "env": {
    "GROQ_API_KEY": {
      "description": "Optional — Groq API key for AI features (free at console.groq.com)",
      "required": false
    }
  },
  "buildpacks": [
    { "url": "heroku/nodejs" }
  ]
}
```

---

## 10. Fly.io 🟢 P3

Create `fly.toml`:
```toml
app = "free-crypto-news"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[services]]
  protocol = "tcp"
  internal_port = 3000
  [[services.ports]]
    port = 80
    handlers = ["http"]
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
  [[services.http_checks]]
    interval = "15s"
    timeout = "2s"
    path = "/api/health"
```

---

## Workflow

1. Read existing deployment configs (railway.json, vercel.json, Dockerfile, docker-compose.yml)
2. Create all new template files listed above
3. Add deploy buttons to a new section in README or a DEPLOY.md doc
4. Commit all changes
5. Submit templates where possible via PRs

```bash
git config user.name "nirholas"
git config user.email "22895867+nirholas@users.noreply.github.com"
git add -A
HUSKY=0 git commit -m "Add one-click deploy templates for Railway, Render, DO, Portainer, CasaOS, Unraid, Heroku, Fly.io"
git push
```

---

## Completion Checklist

- [ ] Railway — railway.json verified, deploy button created
- [ ] Vercel — vercel.json verified, deploy button created
- [ ] Render — render.yaml created, deploy button created
- [ ] DigitalOcean — .do/app.yaml created, deploy button created
- [ ] Portainer — template JSON created
- [ ] CasaOS — manifest created
- [ ] Unraid — XML template created
- [ ] Coolify — documentation added
- [ ] Heroku — app.json + Procfile created, deploy button
- [ ] Fly.io — fly.toml created
- [ ] Deploy buttons added to README
- [ ] All files committed and pushed
