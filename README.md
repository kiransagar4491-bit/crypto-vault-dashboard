# CryptoVault — Crypto Dashboard

A mobile-first crypto dashboard UI with a dark glassmorphism theme, bottom tab navigation, hover effects, live-simulated market data, and interactive candlestick charts.

## Features

- **Home tab** — Market overview with live-updating prices, 24h changes, sparklines, ranks, and Trending coin cards
- **Chart tab** — Interactive SVG candlestick chart with coin selector and timeframes (1m, 3m, 5m, 15m, 30m, 1hr, 4hr, 1d)
- **Signal tab** — Live trade setups with BUY/SELL badges, entry/target/stop levels, indicator + timeframe, and confidence bars (filter by All/Buy/Sell)
- **News tab** — Featured article + headline feed filterable by category (Market, Regulation, Tech, Adoption)
- **Bottom navigation** — Home, Chart, Signal, and News buttons with an animated active indicator and hover glow effects
- **Search overlay** — Quick coin search from the header; clicking a result opens its Chart tab

## Content Overview

The app includes market data, trade signals, news feeds, and interactive charting.

## Run It

Open `index.html` in a browser (no build step, no dependencies).

```bash
start index.html
```

Prices and market data update automatically every few seconds via a simulated live feed.

## Project Structure

```
sss/
├── index.html          # App markup (4 tab panels + bottom nav)
├── css/
│   └── styles.css      # Dark glassmorphism theme, hover effects, responsive
├── js/
│   └── app.js          # Tab logic, market data, signals, charts, and news
└── README.md
```

