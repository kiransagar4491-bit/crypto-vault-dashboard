/* ==========================================================
   CryptoVault — Crypto Dashboard App
   Tab navigation, market data, sparklines, live updates
   ========================================================== */

/* ---------- Coin dataset ---------- */
const COINS = [
  { rank: 1, sym: 'BTC', name: 'Bitcoin', price: 68420, change: 3.42, icon: '₿', color: '#f7931a' },
  { rank: 2, sym: 'ETH', name: 'Ethereum', price: 3521, change: 2.18, icon: 'Ξ', color: '#627eea' },
  { rank: 3, sym: 'BNB', name: 'BNB', price: 601.2, change: -1.24, icon: '⬡', color: '#f3ba2f' },
  { rank: 4, sym: 'SOL', name: 'Solana', price: 178.45, change: 5.67, icon: '◎', color: '#14f195' },
  { rank: 5, sym: 'XRP', name: 'XRP', price: 0.6243, change: 1.95, icon: '✕', color: '#23292f' },
  { rank: 6, sym: 'ADA', name: 'Cardano', price: 0.4521, change: -2.36, icon: '₳', color: '#0033ad' },
  { rank: 7, sym: 'AVAX', name: 'Avalanche', price: 36.51, change: -0.84, icon: '▲', color: '#e84142' },
  { rank: 8, sym: 'DOGE', name: 'Dogecoin', price: 0.1612, change: 8.94, icon: 'Ð', color: '#c2a633' },
  { rank: 9, sym: 'DOT', name: 'Polkadot', price: 7.84, change: 0.62, icon: '●', color: '#e6007a' },
  { rank: 10, sym: 'LINK', name: 'Chainlink', price: 15.32, change: 4.11, icon: '⬡', color: '#2a5ada' },
  { rank: 11, sym: 'POL', name: 'Polygon', price: 0.743, change: 2.75, icon: '⬡', color: '#8247e5' },
  { rank: 12, sym: 'SHIB', name: 'Shiba Inu', price: 0.0000245, change: 6.33, icon: '🐕', color: '#e6432d' },
];

/* ---------- News dataset ---------- */
const NEWS = [
  { title: 'Bitcoin ETF inflows hit $1.2B weekly record as institutional demand surges', cat: 'Market', time: '2h ago', emoji: '📈' },
  { title: 'SEC delays decision on spot Ethereum ETF options — analysts weigh in', cat: 'Regulation', time: '4h ago', emoji: '⚖️' },
  { title: 'Solana network upgrade reduces fees by 40% — validators prepare for rollout', cat: 'Tech', time: '6h ago', emoji: '⚙️' },
  { title: 'Major retail chain now accepts crypto payments across 5,000+ stores', cat: 'Adoption', time: '8h ago', emoji: '🛒' },
  { title: 'Ethereum gas fees fall to 6-month low amid Layer-2 migration wave', cat: 'Tech', time: '10h ago', emoji: '⛽' },
  { title: 'Global regulators propose unified framework for stablecoin oversight', cat: 'Regulation', time: '12h ago', emoji: '🏛️' },
  { title: 'Bitcoin mining difficulty adjusts upward 3.5% as hash rate reaches new ATH', cat: 'Market', time: '14h ago', emoji: '⛏️' },
  { title: 'Top bank launches institutional crypto custody service in 12 countries', cat: 'Adoption', time: '18h ago', emoji: '🏦' },
];

/* ---------- Signals dataset ---------- */
const SIGNALS = [
  { sym: 'BTC', action: 'buy', entry: 67200, target: 72300, stop: 65200, strength: 88, indicator: 'RSI + MACD', tf: '4h' },
  { sym: 'SOL', action: 'buy', entry: 171.2, target: 192.5, stop: 164.8, strength: 84, indicator: 'Breakout', tf: '1d' },
  { sym: 'DOGE', action: 'buy', entry: 0.1501, target: 0.1740, stop: 0.1432, strength: 79, indicator: 'Volume Surge', tf: '1hr' },
  { sym: 'LINK', action: 'buy', entry: 14.85, target: 16.90, stop: 14.20, strength: 77, indicator: 'Golden Cross', tf: '1d' },
  { sym: 'BNB', action: 'buy', entry: 594, target: 628, stop: 581, strength: 74, indicator: 'Support Hold', tf: '1d' },
  { sym: 'ETH', action: 'sell', entry: 3568, target: 3380, stop: 3645, strength: 81, indicator: 'Overbought', tf: '4h' },
  { sym: 'ADA', action: 'sell', entry: 0.4612, target: 0.4280, stop: 0.4740, strength: 76, indicator: 'Death Cross', tf: '1d' },
{ sym: 'AVAX', action: 'sell', entry: 37.20, target: 34.10, stop: 38.55, strength: 72, indicator: 'Resistance', tf: '1hr' },
  { sym: 'BTC', action: 'buy', type: 'sniper', entry: 67200, target: 68900, stop: 66850, strength: 94, indicator: 'Precision Entry', tf: '15m' },
  { sym: 'SOL', action: 'buy', type: 'sniper', entry: 171.2, target: 176.8, stop: 169.9, strength: 92, indicator: 'Order Block', tf: '15m' },
  { sym: 'ETH', action: 'buy', type: 'sniper', entry: 3521, target: 3610, stop: 3498, strength: 90, indicator: 'Liquidity Sweep', tf: '5m' },
];

/* ---------- State ---------- */
let activeTab = 'home';
let signalFilter = 'all';
let newsFilter = 'all';
let searchOpen = false;
let chartCoin = 'BTC';
let chartTF = '1d';
let chartLiveTimer = null;

const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1hr', '4hr', '1d'];

/* ---------- Utils ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const getCoin = sym => COINS.find(c => c.sym === sym);

function fmtPrice(p) {
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1) return '$' + p.toFixed(2);
  return '$' + p.toFixed(4);
}

function changeColorClass(change) {
  return change >= 0 ? 'up' : 'down';
}

function changeArrow(change) {
  return change >= 0 ? '▲' : '▼';
}

/* Generate deterministic pseudo-random sparkline for a coin */
function sparkline(sym, change, width = 58, height = 30) {
  const seed = sym.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const pts = [];
  let y = height / 2;
  const drift = change >= 0 ? -1 : 1;
  for (let i = 0; i < 12; i++) {
    const wobble = Math.sin((seed + i) * 1.7) * 4 + (Math.random() - 0.5) * 5;
    y = Math.max(4, Math.min(height - 4, y + wobble + drift * 0.6));
    pts.push([i * (width / 11), y]);
  }
  const last = pts[pts.length - 1][1];
  const first = pts[0][1];
  const up = last <= first;
  const color = up ? '#22c55e' : '#ef4444';
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  return `<svg class="coin-spark" viewBox="0 0 ${width} ${height}" fill="none">
    <polyline points="${pts.map(p => `${p[0]},${p[1]}`).join(' ')}" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function formatSignalTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ---------- Render helpers ---------- */
function coinIcon(coin) {
  return `<div class="coin-icon" style="background:${coin.color}">${coin.icon}</div>`;
}

function renderMarketList(filter = 'all') {
  const el = $('#marketList');
  let list = [...COINS].sort((a, b) => a.rank - b.rank).slice(0, 10);
  if (filter === 'gainers') list = list.filter(c => c.change > 0);
  if (filter === 'losers') list = list.filter(c => c.change < 0);

  el.innerHTML = list.map(c => `
    <div class="coin-row" data-sym="${c.sym}">
      <span class="coin-rank">${c.rank}</span>
      ${coinIcon(c)}
      <div class="coin-info">
        <div class="coin-name">${c.name} <span class="coin-sym">${c.sym}</span></div>
        <div class="coin-price-sub">${c.name === 'Shiba Inu' ? 'MEME' : 'CRYPTO'}</div>
      </div>
      ${sparkline(c.sym, c.change)}
      <div class="coin-price-col">
        <div class="coin-price">${fmtPrice(c.price)}</div>
        <div class="coin-change ${changeColorClass(c.change)}">${changeArrow(c.change)} ${Math.abs(c.change).toFixed(2)}%</div>
      </div>
    </div>
  `).join('');
}

function renderFeatured() {
  const trending = [...COINS].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6);
  $('#featuredRow').innerHTML = trending.map(c => `
    <div class="featured-card" data-sym="${c.sym}">
      ${coinIcon(c)}
      <div class="coin-name">${c.sym}</div>
      <div class="coin-price">${fmtPrice(c.price)}</div>
      <div class="coin-change ${changeColorClass(c.change)}">${changeArrow(c.change)} ${Math.abs(c.change).toFixed(2)}%</div>
    </div>
  `).join('');
}

function deriveLiveSignals() {
  return COINS.filter(coin => coin.price > 0).map(coin => {
    const direction = coin.change >= 0 ? 1 : -1;
    const magnitude = Math.abs(coin.change || 0);
    const move = Math.min(0.06, Math.max(0.008, magnitude / 100 * 1.5));
    const risk = Math.min(0.035, Math.max(0.004, move * 0.55));
    const strength = Math.min(95, Math.max(55, Math.round(60 + magnitude * 4)));
    return {
      sym: coin.sym,
      action: direction > 0 ? 'buy' : 'sell',
      entry: coin.price,
      target: coin.price * (1 + direction * move),
      stop: coin.price * (1 - direction * risk),
      strength,
      indicator: magnitude >= 4 ? 'Momentum Surge' : magnitude >= 1.5 ? 'Trend Confirmation' : 'Price Action',
      tf: magnitude >= 4 ? '1hr' : magnitude >= 1.5 ? '4h' : '1d',
      generatedAt: new Date().toISOString()
    };
  });
}

function renderSignals() {
  const scannedSignals = Object.values(chartScans);
  const liveSignals = scannedSignals.length ? scannedSignals.map(scan => {
    const coin = getCoin(scan.symbol);
    const direction = scan.action === 'sell' ? -1 : 1;
    const move = Math.min(0.06, Math.max(0.008, Math.abs(scan.percent_change_24h || 0) / 100 * 1.5));
    const risk = Math.min(0.035, Math.max(0.004, move * 0.55));
    return { sym: scan.symbol, action: scan.action, entry: scan.price, target: scan.price * (1 + direction * move), stop: scan.price * (1 - direction * risk), strength: scan.confidence, indicator: scan.indicator, tf: '1h', coin };
  }) : deriveLiveSignals();

  // Sniper signals are generated by the dedicated Pine-derived multi-timeframe engine.
  // They are deliberately kept separate from the normal live Buy/Sell/Hold scanner.
  const allSignals = [...liveSignals, ...sniperSignals];

  const list = allSignals.filter(s => {
    if (signalFilter === 'all') return true;
    if (signalFilter === 'sniper') return s.type === 'sniper';
    return s.action === signalFilter;
  });
  const buys = allSignals.filter(s => s.action === 'buy').length;
  const sells = allSignals.filter(s => s.action === 'sell').length;
const snipers = sniperSignals.length;
  const avgStrength = Math.round(allSignals.reduce((a, s) => a + s.strength, 0) / allSignals.length);

  $('#signalHero').innerHTML = `
    <div class="signal-hero-top">
      <div class="signal-hero-title">⚡ Signal Engine</div>
      <span class="signal-badge live">LIVE</span>
    </div>
    <p>${allSignals.length} live setups · ${avgStrength}% avg confidence. Updated from Coinbase + Kraken.</p>
    <div class="signal-meta">
      <span>🟢 ${buys} Buy</span>
      <span>🔴 ${sells} Sell</span>
      <span>🎯 ${snipers} Sniper</span>
      <span>📶 Avg ${avgStrength}%</span>
    </div>
  `;

  $('#signalList').innerHTML = list.map(s => {
    const coin = s.coin || getCoin(s.sym);
    const isSniper = s.type === 'sniper';
    const strengthColor = isSniper ? 'var(--accent-2)' : s.action === 'buy' ? 'var(--green)' : 'var(--red)';
    const badgeLabel = isSniper ? (s.signalStatus === 'watch' ? 'WATCH' : 'SNIPER') : s.action.toUpperCase();
    return `
      <div class="signal-card" data-sym="${s.sym}">
        <div class="signal-card-left">
          <div class="signal-card-head">
            ${coinIcon(coin)}
            <div>
              <div class="coin-name">${coin.name} <span class="coin-sym">${coin.sym}</span></div>
              <div class="signal-indicator">${s.indicator} · ${s.tf}</div>
              <div class="signal-generated" title="${s.generatedAt || ''}">Generated ${formatSignalTime(s.generatedAt)}</div>
            </div>
          </div>
          <div class="signal-price-row">
            <span>CMP <strong>${fmtPrice(coin.price)}</strong></span>
            <span>Entry <strong>${fmtPrice(s.entry)}</strong></span>
            <span>Target <strong class="${s.action === 'buy' ? 'up' : 'down'}">${fmtPrice(s.target)}</strong></span>
            <span>Stop <strong class="${s.action === 'buy' ? 'down' : 'up'}">${fmtPrice(s.stop)}</strong></span>
          </div>
        </div>
        <div class="signal-card-right">
          <span class="signal-badge ${isSniper ? 'sniper' : s.action}">${badgeLabel}</span>
          <div class="signal-strength">
            <span>${s.strength}%</span>
            <div class="signal-strength-bar"><i style="width:${s.strength}%;background:${strengthColor}"></i></div>
          </div>
        </div>
      </div>
    `;
  }).join('') || '<p class="empty-note show">No signals in this filter.</p>';
}

function renderNews() {
  const list = NEWS.filter(n => newsFilter === 'all' || n.cat === newsFilter);
  const [featured, ...rest] = list;
  const featEl = $('#featuredNews');
  featEl.innerHTML = featured ? `
    <div class="news-cat">${featured.cat} · Featured</div>
    <h3>${featured.title}</h3>
    <div class="news-time">${featured.time} · CryptoVault News</div>
  ` : '<div class="news-time">No featured articles</div>';

  $('#newsList').innerHTML = rest.map(n => `
    <div class="news-card">
      <div class="news-thumb" style="background:${thumbBg(n.cat)}">${n.emoji}</div>
      <div class="news-body">
        <div class="news-head">
          <span class="news-cat-tag cat-${n.cat}">${n.cat}</span>
          <span class="news-time">${n.time}</span>
        </div>
        <div class="news-title">${n.title}</div>
      </div>
    </div>
  `).join('');
}

function thumbBg(cat) {
  const map = { Market: 'rgba(34,197,94,0.12)', Regulation: 'rgba(239,68,68,0.12)', Tech: 'rgba(0,212,255,0.12)', Adoption: 'rgba(245,158,11,0.12)' };
  return map[cat] || 'rgba(255,255,255,0.08)';
}

/* ---------- Tab navigation ---------- */
const VALID_TABS = ['home', 'chart', 'signal', 'news'];

function setActiveTab(tab) {
  if (!VALID_TABS.includes(tab)) tab = 'home';
  activeTab = tab;
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  $('#panel-' + tab).classList.add('active');

  if (tab === 'chart') {
    const activeTf = $('#tfSelect .tf-btn.active');
    if (activeTf) {
      chartTF = activeTf.dataset.tf || chartTF;
    }
    renderChart();
  }

  const btns = $$('.nav-btn');
  const idx = btns.findIndex(b => b.dataset.tab === tab);
  btns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

  const indicator = $('.nav-indicator');
  const btn = btns[idx];
  if (btn) {
    const center = btn.offsetLeft + btn.offsetWidth / 2 - indicator.offsetWidth / 2;
    indicator.style.left = center + 'px';
  }
  // update hash so #home etc. can deep-link to a tab
  if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab);
}

/* ---------- Live market data ---------- */
const COINPAPRIKA_IDS = {
  BTC: 'btc-bitcoin', ETH: 'eth-ethereum', BNB: 'bnb-binance-coin', SOL: 'sol-solana',
  XRP: 'xrp-xrp', ADA: 'ada-cardano', AVAX: 'avax-avalanche', DOGE: 'doge-dogecoin',
  DOT: 'dot-polkadot-token', LINK: 'link-chainlink', POL: 'pol-polygon-ecosystem-token', SHIB: 'shib-shiba-inu'
};
const LIVE_PRICE_URL = 'https://koda-b1059638.base44.app/functions/getCryptoMarketData';
const CHART_SCAN_URL = 'https://koda-b1059638.base44.app/functions/scanCryptoCharts';
const SNIPER_SCAN_URL = 'https://koda-b1059638.base44.app/functions/scanSniperSignals';
const LIVE_REFRESH_MS = 1000;
let liveTimer = null;
let liveRequest = null;
let scanRequest = null;
let scanTimer = null;
let chartScans = {};
let sniperSignals = [];
let sniperRequest = null;
let tvChart = null;
let tvCandleSeries = null;
let tvVolumeSeries = null;
let tvChartKey = '';

async function fetchSniperSignals() {
  if (sniperRequest) return sniperRequest;
  sniperRequest = fetch(SNIPER_SCAN_URL, { headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error(`Sniper scanner returned ${response.status}`);
      return response.json();
    })
    .then(payload => {
      sniperSignals = (payload.data || []).map(signal => ({
        ...signal,
        sym: signal.symbol,
        tf: signal.timeframe || '15m',
        strength: signal.confidence,
        generatedAt: signal.generated_at || payload.generated_at,
        coin: getCoin(signal.symbol),
      }));
      renderSignals();
      return payload;
    })
    .catch(error => {
      console.warn('Sniper scanner unavailable; keeping the latest sniper scan.', error);
      return null;
    })
    .finally(() => { sniperRequest = null; });
  return sniperRequest;
}

async function fetchChartScans() {
  if (scanRequest) return scanRequest;
  scanRequest = fetch(CHART_SCAN_URL, { headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error(`Chart scanner returned ${response.status}`);
      return response.json();
    })
    .then(payload => {
      chartScans = Object.fromEntries(payload.data.map(scan => {
        const liveCoin = getCoin(scan.symbol);
        return [scan.symbol, { ...scan, generatedAt: scan.generated_at || payload.generated_at, price: liveCoin?.price ?? scan.price }];
      }));
      renderSignals();
      renderChart();
      return payload;
    })
    .catch(error => {
      console.warn('Chart scanner unavailable; keeping the latest scan.', error);
      return null;
    })
    .finally(() => { scanRequest = null; });
  return scanRequest;
}

async function renderSourceStatus(payload) {
  const el = $('#sourceStatus');
  if (!el) return;
  const active = Object.entries(payload.sources || {}).filter(([, available]) => available).map(([name]) => name);
  el.textContent = active.length ? `LIVE · ${active.map(name => name === 'coinpaprika' ? 'CoinPaprika' : name === 'coingecko' ? 'CoinGecko' : name[0].toUpperCase() + name.slice(1)).join(' + ')}` : 'LIVE · NO SOURCES';
}

function fetchLivePrices() {
  if (liveRequest) return liveRequest;
  liveRequest = fetch(LIVE_PRICE_URL, { headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error(`Market API returned ${response.status}`);
      return response.json();
    })
    .then(payload => {
      renderSourceStatus(payload);
      const byId = Object.fromEntries(payload.data.map(ticker => [ticker.id, ticker]));
      COINS.forEach(coin => {
        const ticker = byId[COINPAPRIKA_IDS[coin.sym]];
        if (!ticker || typeof ticker.price !== 'number') return;
        coin.price = ticker.price;
        if (typeof ticker.rank === 'number') coin.rank = ticker.rank;
        if (typeof ticker.name === 'string') coin.name = ticker.name;
        if (typeof ticker.percent_change_24h === 'number') coin.change = ticker.percent_change_24h;
        // Keep Chart and Signals anchored to the same live proxy price as Market.
        if (chartScans[coin.sym]) chartScans[coin.sym].price = coin.price;
      });
renderMarketList(currentMarketFilter);
      renderFeatured();
      renderSignals();
      renderChartCoins();
      renderChart();
      return payload;
    })
    .catch(error => {
      console.warn('Live market data unavailable; keeping the last known prices.', error);
      showToast('Live market data is temporarily unavailable');
      return null;
    })
    .finally(() => { liveRequest = null; });
  return liveRequest;
}

function startLiveUpdates() {
  if (liveTimer) clearInterval(liveTimer);
  if (scanTimer) clearInterval(scanTimer);
  fetchLivePrices();
  fetchChartScans();
  fetchSniperSignals();
  liveTimer = setInterval(fetchLivePrices, LIVE_REFRESH_MS);
  scanTimer = setInterval(() => { fetchChartScans(); fetchSniperSignals(); }, 15000);
}

let currentMarketFilter = 'all';

/* ---------- Chart helpers ---------- */
const chartUtils = window.ChartUtils || {};
const getChartTimeframeSeconds = chartUtils.getChartTimeframeSeconds || function (tf) {
  const map = { '1m': 60, '3m': 180, '5m': 300, '15m': 900, '30m': 1800, '1hr': 3600, '4hr': 14400, '1d': 86400 };
  return map[tf] || 86400;
};
const buildChartSeriesData = chartUtils.buildChartSeriesData || function (candles, tf, options = {}) {
  const secondsPerBar = getChartTimeframeSeconds(tf);
  const now = options.now ?? Math.floor(Date.now() / 1000);
  return candles.map((candle, index) => {
    const fallbackTime = now - (candles.length - index) * secondsPerBar;
    const rawTime = candle?.time;
    const time = Number.isFinite(rawTime) && rawTime > 0
      ? Math.floor(rawTime > 1e12 ? rawTime / 1000 : rawTime)
      : fallbackTime;
    const item = { time, open: candle.open, high: candle.high, low: candle.low, close: candle.close };
    if (options.lastPrice !== undefined && index === candles.length - 1) {
      item.close = options.lastPrice;
      item.high = Math.max(item.high, options.lastPrice);
      item.low = Math.min(item.low, options.lastPrice);
    }
    return item;
  });
};

function scopedRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateCandles(sym, tf, count = 40) {
  const coin = getCoin(sym);
  const base = coin?.price || 1;
  const seed = sym.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) + tf.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const rnd = scopedRand(seed + 7);
  const timeframeFactor = tf === '1d' ? 1.1 : tf === '4hr' || tf === '1hr' ? 0.95 : 0.75;
  const volatility = base * (tf === '1d' ? 0.008 : 0.0045);
  const candles = [];
  let prevClose = base * (1 - 0.03 + rnd() * 0.06);
  let prevVol = base * 900;
  for (let i = 0; i < count; i++) {
    const trend = (i % 5 === 0 ? 1 : -1) * (0.18 + rnd() * 0.2);
    const drift = trend * volatility * 0.75 * timeframeFactor + (rnd() - 0.5) * volatility * 0.25;
    const open = prevClose;
    const close = open + drift;
    const high = Math.max(open, close) + Math.abs(drift) * 0.65 + rnd() * volatility * 0.25;
    const low = Math.min(open, close) - Math.abs(drift) * 0.65 - rnd() * volatility * 0.25;
    const volFactor = 0.55 + rnd() * 0.9;
    const volume = Math.round(Math.max(prevVol * volFactor, base * 60));
    candles.push({ open, close, high, low, volume });
    prevClose = close;
    prevVol = volume;
  }
  return candles;
}

async function renderChart() {
  const coin = getCoin(chartCoin);
  if (!coin) return;

  const chartKey = `${chartCoin}:${chartTF}`;
  const chartLabel = $('#chartTfLabel');
  const chartStatus = $('#chartLiveStatus');
  if (chartLabel) chartLabel.textContent = `${chartTF} · Candlestick`;
  if (chartStatus) chartStatus.textContent = 'LIVE • SYNCING';

  const pct = coin.change || 0;
  const pctColor = pct >= 0 ? 'var(--green)' : 'var(--red)';
  const coinInfo = `
    <div class="chart-coin-name">${coinIcon(coin)}<span>${coin.name}</span><span class="coin-sym">${coin.sym}</span></div>
    <div class="chart-coin-price" style="color:${pctColor}">${fmtPrice(coin.price)}</div>
    <div class="chart-coin-change ${changeColorClass(pct)}">${changeArrow(pct)} ${Math.abs(pct).toFixed(2)}%</div>`;
  $('#chartCoinInfo').innerHTML = coinInfo;

  const chartWrap = $('#chartWrap');
  if (!window.LightweightCharts) {
    chartWrap.innerHTML = '<div class="chart-loading">TradingView chart library loading…</div>';
    return;
  }

  if (!tvChart || tvChartKey !== chartKey || !document.querySelector('#tvChart')) {
    chartWrap.innerHTML = '<div id="tvChart" style="width:100%;height:220px"></div>';
    const el = $('#tvChart');
    tvChart = LightweightCharts.createChart(el, {
      width: el.clientWidth || 560,
      height: 220,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: 'rgba(148,163,184,0.07)' }, horzLines: { color: 'rgba(148,163,184,0.07)' } },
      rightPriceScale: { borderColor: 'rgba(148,163,184,0.18)' },
      timeScale: { borderColor: 'rgba(148,163,184,0.18)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    });
    tvCandleSeries = tvChart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });
    tvVolumeSeries = tvChart.addHistogramSeries({
      color: 'rgba(109,92,255,0.45)', priceFormat: { type: 'volume' }, priceScaleId: '',
    });
    tvChart.priceScale('').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    tvChartKey = chartKey;
    const resizeChart = () => { if (tvChart && $('#tvChart')?.clientWidth) tvChart.applyOptions({ width: $('#tvChart').clientWidth }); };
    new ResizeObserver(resizeChart).observe($('#tvChart'));
    resizeChart();
  }

  let candles = [];
  try {
    const symbol = buildBinanceSymbol(chartCoin);
    const interval = mapBinanceInterval(chartTF);
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=40`);
    if (!response.ok) throw new Error(`API ${response.status}`);
    const payload = await response.json();
    candles = payload.map(k => ({
      time: k[0],
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }));
    if (chartStatus) chartStatus.textContent = 'LIVE • ACTIVE';
  } catch (error) {
    console.warn('Falling back to synthetic candles:', error);
    candles = generateCandles(chartCoin, chartTF);
    if (chartStatus) chartStatus.textContent = 'LIVE • FALLBACK';
  }

  if (!candles.length) return;

  const now = Math.floor(Date.now() / 1000);
  const data = buildChartSeriesData(candles, chartTF, { now, lastPrice: coin.price });
  const volume = data.map((c, i) => ({
    time: c.time, value: Number(candles[i].volume || 0), color: candles[i].close >= candles[i].open ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
  }));
  tvCandleSeries.setData(data);
  tvVolumeSeries.setData(volume);
  requestAnimationFrame(() => {
    if (!tvChart) return;
    tvChart.applyOptions({ width: ($('#tvChart').clientWidth || 560), height: 220 });
    tvChart.timeScale().fitContent();
  });
}

function startChartAutoRefresh() {
  if (chartLiveTimer) clearInterval(chartLiveTimer);
  chartLiveTimer = setInterval(() => {
    if (activeTab === 'chart') {
      renderChart();
    }
  }, 5000);
}

function renderChartCoins() {
  $('#chartCoins').innerHTML = COINS.map(c => `
    <button class="coin-chip ${c.sym === chartCoin ? 'active' : ''}" data-coin="${c.sym}">${c.sym}</button>
  `).join('');
}

/* ---------- Search ---------- */
function openSearch() {
  searchOpen = true;
  $('#searchOverlay').classList.add('open');
  setTimeout(() => $('#searchInput').focus(), 60);
  $('#searchInput').value = '';
  $('#searchResults').innerHTML = '';
}
function closeSearch() {
  searchOpen = false;
  $('#searchOverlay').classList.remove('open');
}
function runSearch(q) {
  const term = q.trim().toLowerCase();
  const results = term ? COINS.filter(c => c.sym.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)) : [];
  const el = $('#searchResults');
  el.innerHTML = results.length
    ? results.map(c => `
        <div class="search-item" data-sym="${c.sym}">
          <div style="display:flex;align-items:center;gap:10px">
            ${coinIcon(c)}
            <span class="coin-name">${c.name}</span>
            <span class="coin-sym">${c.sym}</span>
          </div>
          <span class="coin-price" style="font-size:13px">${fmtPrice(c.price)}</span>
        </div>`).join('')
    : '<p style="color:var(--text-dim);font-size:13px;padding:8px">No coins found.</p>';
}

/* ---------- Chart navigation helper ---------- */
function openChartForCoin(sym) {
  if (!getCoin(sym)) return;
  chartCoin = sym;
  renderChartCoins();
  renderChart();
  setActiveTab('chart');
}

function syncChartTimeframeButtons() {
  $$('#tfSelect .tf-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tf === chartTF);
  });
}

/* ---------- Event wiring ---------- */
function initEvents() {
  // Bottom nav
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  });

  // Coin rows, featured cards and signal cards → open Chart tab for that coin
  document.addEventListener('click', e => {
    const row = e.target.closest('.coin-row');
    if (row && row.dataset.sym) {
      openChartForCoin(row.dataset.sym);
      return;
    }
    const featured = e.target.closest('.featured-card');
    if (featured && featured.dataset.sym) {
      openChartForCoin(featured.dataset.sym);
      return;
    }
    const signal = e.target.closest('.signal-card');
    if (signal && signal.dataset.sym) {
      openChartForCoin(signal.dataset.sym);
    }
  });

  // Segmented filter (market)
  $$('#marketFilter .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#marketFilter .seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const label = btn.textContent.toLowerCase();
      currentMarketFilter = label === 'gainers' ? 'gainers' : label === 'losers' ? 'losers' : 'all';
      renderMarketList(currentMarketFilter);
    });
  });

  // Segmented filter (signals)
  $$('#signalFilter .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#signalFilter .seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
const label = btn.textContent.toLowerCase();
      signalFilter = label === 'buy' ? 'buy' : label === 'sell' ? 'sell' : label === 'sniper' ? 'sniper' : 'all';
      renderSignals();
    });
  });

  // News filters
  $$('#newsCats .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('#newsCats .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      newsFilter = chip.dataset.cat;
      renderNews();
    });
  });

  // Chart coin selection
  $('#chartCoins').addEventListener('click', e => {
    const chip = e.target.closest('.coin-chip');
    if (!chip) return;
    chartCoin = chip.dataset.coin;
    renderChartCoins();
    renderChart();
  });

  // Chart timeframe selection
  $('#tfSelect').addEventListener('click', e => {
    const btn = e.target.closest('.tf-btn');
    if (!btn) return;
    chartTF = btn.dataset.tf;
    syncChartTimeframeButtons();
    renderChart();
  });

  // Search
  $('#btnSearch').addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  $('#searchOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSearch();
  });
  $('#searchInput').addEventListener('input', e => runSearch(e.target.value));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });
  $('#searchResults').addEventListener('click', e => {
    const item = e.target.closest('.search-item');
    if (item) {
      closeSearch();
      openChartForCoin(item.dataset.sym);
    }
  });

// Alert button toast
  $('#btnAlert').addEventListener('click', () => {
    showToast('🔔 No active alerts. Check the Signal tab for live trade setups!');
  });
}

/* ---------- Toast ---------- */
function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ---------- Init ---------- */
function init() {
  initEvents();
  renderMarketList('all');
  renderFeatured();
  renderSignals();
  renderNews();
  renderChartCoins();
  syncChartTimeframeButtons();
  renderChart();

  // Deep-link: open the tab from URL hash (e.g. #home, #news)
  const initialTab = (location.hash || '#home').slice(1);
  setActiveTab(initialTab);

  // Support hash changes for direct tab navigation
  window.addEventListener('hashchange', () => {
    setActiveTab((location.hash || '#home').slice(1));
  });

  startLiveUpdates();
  startChartAutoRefresh();
  window.addEventListener('resize', () => {
    // re-align indicator on resize
    setActiveTab(activeTab);
  });
}

document.addEventListener('DOMContentLoaded', init);

