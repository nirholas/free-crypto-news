# Prompt 34: PHP SDK Composer Package

## Context

The PHP SDK (`sdk/php/`) works via direct file download (`curl -O ...CryptoNews.php`) but the README mentions Composer installation as "coming soon" (line 13: `Or via Composer (coming soon):`). The SDK needs to be packaged for Composer/Packagist.

## Current State

```
sdk/php/
├── CryptoNews.php    ← Single-file SDK (already works via curl download)
├── README.md         ← "Or via Composer (coming soon):"
```

## Task

### Phase 1: Composer Package Structure

1. **Create `sdk/php/composer.json`**

```json
{
  "name": "nirholas/crypto-news",
  "description": "Free Crypto News PHP SDK — real-time crypto news aggregator API. No API key required.",
  "type": "library",
  "license": "MIT",
  "authors": [
    {
      "name": "nirholas",
      "email": "22895867+nirholas@users.noreply.github.com"
    }
  ],
  "homepage": "https://cryptocurrency.cv",
  "keywords": ["crypto", "news", "bitcoin", "ethereum", "api", "rss", "free"],
  "require": {
    "php": ">=7.4",
    "ext-json": "*",
    "ext-curl": "*"
  },
  "require-dev": {
    "phpunit/phpunit": "^9.0 || ^10.0"
  },
  "autoload": {
    "psr-4": {
      "CryptoNews\\": "src/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "CryptoNews\\Tests\\": "tests/"
    }
  },
  "minimum-stability": "stable"
}
```

2. **Restructure for PSR-4 autoloading** — Move from single-file to proper namespace:

```
sdk/php/
├── composer.json
├── README.md
├── LICENSE
├── CryptoNews.php           ← Keep for backward compatibility (single-file users)
├── src/
│   ├── Client.php           ← Main client class (CryptoNews\Client)
│   ├── Endpoints/
│   │   ├── News.php         ← $client->news->latest(), ->search(), ->breaking()
│   │   ├── Market.php       ← $client->market->prices(), ->fearGreed(), ->trending()
│   │   ├── DeFi.php         ← $client->defi->tvl(), ->yields()
│   │   └── OnChain.php      ← $client->onchain->whaleAlerts(), ->gas()
│   ├── Models/
│   │   ├── Article.php      ← Typed article model
│   │   ├── Price.php        ← Typed price model
│   │   └── Response.php     ← Generic API response wrapper
│   ├── Exceptions/
│   │   ├── ApiException.php
│   │   └── RateLimitException.php
│   └── Http/
│       └── HttpClient.php   ← cURL wrapper with retries
└── tests/
    ├── ClientTest.php
    ├── Endpoints/
    │   └── NewsTest.php
    └── Http/
        └── HttpClientTest.php
```

### Phase 2: Implement Namespaced Client

3. **Create `sdk/php/src/Client.php`**

```php
<?php

namespace CryptoNews;

class Client
{
    private string $baseUrl;
    private Http\HttpClient $http;
    
    public News $news;
    public Market $market;
    public DeFi $defi;
    public OnChain $onchain;
    
    public function __construct(string $baseUrl = 'https://cryptocurrency.cv')
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->http = new Http\HttpClient($this->baseUrl);
        $this->news = new Endpoints\News($this->http);
        $this->market = new Endpoints\Market($this->http);
        $this->defi = new Endpoints\DeFi($this->http);
        $this->onchain = new Endpoints\OnChain($this->http);
    }
}
```

4. **Implement all endpoint classes** with typed return values
5. **Implement exception classes** for proper error handling

### Phase 3: PHPUnit Tests

6. **Create `sdk/php/tests/ClientTest.php`** — Mock HTTP responses, test all endpoints
7. **Create `sdk/php/phpunit.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php">
    <testsuites>
        <testsuite name="CryptoNews SDK">
            <directory>tests</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

### Phase 4: Update README

8. **Update `sdk/php/README.md`** — Replace "coming soon" with actual install instructions:

```markdown
## Installation

### Via Composer (recommended)

```bash
composer require nirholas/crypto-news
```

### Direct download (single file, no dependencies)

```bash
curl -O https://raw.githubusercontent.com/nirholas/free-crypto-news/main/sdk/php/CryptoNews.php
```
```

### Phase 5: Packagist Submission

9. **Create `sdk/php/PUBLISHING.md`** — Instructions for publishing to Packagist:

```markdown
## Publishing to Packagist

1. Go to https://packagist.org/packages/submit
2. Enter: https://github.com/nirholas/free-crypto-news
3. Set package path: sdk/php/
4. Packagist auto-updates from GitHub webhooks
```

## Acceptance Criteria

- [ ] `composer.json` with proper metadata, PSR-4 autoloading
- [ ] Namespaced classes under `CryptoNews\`
- [ ] All API endpoints covered (news, market, defi, onchain)
- [ ] Typed models for responses
- [ ] Exception handling for API errors
- [ ] PHPUnit tests pass
- [ ] README updated — no more "coming soon" for Composer
- [ ] Backward compatible — `CryptoNews.php` single-file still works
