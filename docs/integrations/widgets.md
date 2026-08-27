# Embeddable Widgets

Embed live crypto news and market data on any website with a single script tag. Every loader is served from `https://cryptocurrency.cv/widget/` and works on plain HTML, React, Vue, WordPress, or any other stack.

## Available loaders

| File | What it does |
|------|--------------|
| `https://cryptocurrency.cv/widget/embed.js` | Universal iframe loader. Renders any `/embed/*` widget (ticker, news, coin, market, fear-greed, chart) and auto-resizes it. |
| `https://cryptocurrency.cv/widget/ticker.js` | Standalone horizontal headline ticker rendered directly into your DOM (no iframe). |
| `https://cryptocurrency.cv/widget/carousel.js` | Standalone rotating news-card carousel rendered directly into your DOM (no iframe). |

The iframe loader is the recommended path: the widget UI is served by cryptocurrency.cv, so it stays current without you redeploying, and it cannot leak styles into your page.

## Quick Start

Add this single line anywhere in your HTML:

```html
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="news" data-theme="dark" data-count="10"></script>
```

A dark-themed feed of the 10 latest articles appears exactly where the script tag sits.

## Iframe loader (`embed.js`)

Each `<script>` tag creates one widget. You can place several on the same page.

```html
<!-- Scrolling headline ticker -->
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="ticker" data-theme="dark"></script>

<!-- Latest news list -->
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="news" data-count="8" data-theme="light"></script>

<!-- Single coin card -->
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="coin" data-coin="ethereum"></script>

<!-- Market overview -->
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="market"></script>

<!-- Fear and Greed gauge -->
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="fear-greed" data-title="false"></script>

<!-- TradingView chart -->
<script src="https://cryptocurrency.cv/widget/embed.js" data-type="chart" data-symbol="BINANCE:SOLUSDT" data-interval="60"></script>
```

### Attributes

| Attribute | Applies to | Default | Description |
|-----------|-----------|---------|-------------|
| `data-type` | all | `ticker` | One of `ticker`, `news`, `coin`, `market`, `fear-greed`, `chart` |
| `data-theme` | all | `dark` | `dark`, `light`, or `auto` (follows the visitor's OS preference) |
| `data-width` | all | `100%` | Any CSS width |
| `data-title` | all | `true` | Set to `false` to hide the widget header |
| `data-count` | `news` | `10` | Number of articles (1 to 50) |
| `data-coin` | `coin` | `bitcoin` | CoinGecko coin id (`bitcoin`, `ethereum`, `solana`, ...) |
| `data-symbol` | `chart` | `BINANCE:BTCUSDT` | TradingView symbol |
| `data-interval` | `chart` | `D` | TradingView interval (`1`, `5`, `60`, `D`, `W`) |

The iframe points at `https://cryptocurrency.cv/embed/<type>?...`. Those routes send `Content-Security-Policy: frame-ancestors *` and `Access-Control-Allow-Origin: *`, so they can be framed from any origin. The loader listens for `fcn-widget-resize` messages from the iframe and grows or shrinks it to fit the content.

### Opening an embed directly

Every widget is also a normal page you can link to or iframe by hand:

```html
<iframe src="https://cryptocurrency.cv/embed/news?theme=light&count=5"
        width="100%" height="520" style="border:0" loading="lazy"></iframe>
```

## Headline ticker (`ticker.js`)

Renders into an element you own. Styles are scoped under `.crypto-ticker`.

```html
<div id="crypto-ticker" class="crypto-ticker"></div>
<script src="https://cryptocurrency.cv/widget/ticker.js"></script>
<script>
  CryptoTicker.init('#crypto-ticker', {
    limit: 15,          // number of headlines
    speed: 30,          // seconds per full scroll
    category: 'all',    // 'all' or any news category slug (bitcoin, defi, ethereum, ...)
    showSource: true,
    showTime: true,
  });
</script>
```

Add `class="crypto-ticker light"` for the light theme or `compact` for a slimmer bar. Elements carrying `data-auto-init` initialise themselves without the `init` call:

```html
<div id="ticker" class="crypto-ticker" data-auto-init data-limit="20" data-category="bitcoin"></div>
<script src="https://cryptocurrency.cv/widget/ticker.js"></script>
```

## News carousel (`carousel.js`)

```html
<div id="crypto-carousel" class="crypto-carousel"></div>
<script src="https://cryptocurrency.cv/widget/carousel.js"></script>
<script>
  CryptoCarousel.init('#crypto-carousel', {
    limit: 6,           // number of cards
    category: 'defi',   // 'all' or a category slug
    interval: 5000,     // autoplay interval in ms
  });
</script>
```

Add the `grid` class to the container to show three cards per slide.

## Framework examples

### React

```jsx
import { useEffect, useRef } from 'react';

export function CryptoNews({ type = 'news', theme = 'dark', count = 10 }) {
  const ref = useRef(null);

  useEffect(() => {
    const host = ref.current;
    const script = document.createElement('script');
    script.src = 'https://cryptocurrency.cv/widget/embed.js';
    script.dataset.type = type;
    script.dataset.theme = theme;
    script.dataset.count = String(count);
    host.appendChild(script);
    return () => { host.innerHTML = ''; };
  }, [type, theme, count]);

  return <div ref={ref} />;
}
```

### Vue

```vue
<template>
  <div ref="host"></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cryptocurrency.cv/widget/embed.js';
    script.dataset.type = 'news';
    script.dataset.theme = 'dark';
    this.$refs.host.appendChild(script);
  },
};
</script>
```

### WordPress

Paste the script tag into a Custom HTML block, or add it to a theme template:

```php
function crypto_news_widget() {
  echo '<script src="https://cryptocurrency.cv/widget/embed.js" data-type="news" data-count="10" data-theme="dark"></script>';
}
```

## Self-hosting

The loaders are plain JavaScript with no dependencies. To serve them yourself:

```bash
curl -O https://cryptocurrency.cv/widget/embed.js
curl -O https://cryptocurrency.cv/widget/ticker.js
curl -O https://cryptocurrency.cv/widget/carousel.js
```

`ticker.js` and `carousel.js` call `https://cryptocurrency.cv/api/news` (and `/api/<category>`) directly, which allows cross-origin requests. `embed.js` frames `https://cryptocurrency.cv/embed/*`; if you run your own deployment, change the `BASE_URL` constant at the top of the file.

## Source code

The loaders live in [`widget/`](https://github.com/nirholas/cryptocurrency.cv/tree/main/widget) and are published from [`public/widget/`](https://github.com/nirholas/cryptocurrency.cv/tree/main/public/widget). The embed pages themselves are in [`src/app/embed/`](https://github.com/nirholas/cryptocurrency.cv/tree/main/src/app/embed).
