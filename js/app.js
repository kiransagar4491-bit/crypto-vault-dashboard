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
  { rank: 11, sym: 'MATIC', name: 'Polygon', price: 0.743, change: 2.75, icon: '⬡', color: '#8247e5' },
  { rank: 12, sym: 'SHIB', name: 'Shiba Inu', price: 0.0000245, change: 6.33, icon: '🐕', color: '#e6432d' },
];

/* ---------- Signals dataset ---------- */
const SIGNALS = [
  { coin: 'BTC', type: 'buy', title: 'Strong Buy — Bitcoin', sub: 'Bullish breakout above $68k resistance', conf: 87 },
  { coin: 'SOL', type: 'buy', title: 'Buy — Solana', sub: 'Momentum shift, volume spike detected', conf: 82 },
  { coin: 'ETH', type: 'hold', title: 'Hold — Ethereum', sub: 'Range-bound, wait for direction', conf: 64 },
  { coin: 'DOGE', type: 'sell', title: 'Sell — Dogecoin', sub: 'Overbought RSI, profit taking expected', conf: 71 },
  { coin: 'BNB', type: 'hold', title: 'Hold — BNB', sub: 'Consolidation phase, support holding', conf: 58 },
  { coin: 'LINK', type: 'buy', title: 'Buy — Chainlink', sub: 'Breakout from falling wedge pattern', conf: 78 },
  { coin: 'AVAX', type: 'sell', title: 'Sell — Avalanche', sub: 'Weakness on higher timeframe', conf: 66 },
  { coin: 'ADA', type: 'hold', title: 'Hold — Cardano', sub: 'Awaiting catalyst, low volatility', conf: 52 },
  { coin: 'SOL', type: 'sniper', title: 'SNIPER — Solana', sub: 'Liquidity sweep + reversal, high-prob entry', conf: 91 },
  { coin: 'LINK', type: 'sniper', title: 'SNIPER — Chainlink', sub: 'Order-block rejection, quick scalp setup', conf: 88 },
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

/* ---------- State ---------- */
let watchlist = ['BTC', 'ETH', 'SOL'];
let activeTab = 'home';
let signalFilter = 'all';
let signalCoin = 'all';
let newsFilter = 'all';
let searchOpen = false;
let chartCoin = 'BTC';
let chartTF = '1d';

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
      <button class="star-btn ${watchlist.includes(c.sym) ? 'active' : ''}" data-star="${c.sym}">★</button>
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

function renderWatchlist() {
  const el = $('#watchlist');
  const empty = $('#watchEmpty');
  if (!watchlist.length) {
    el.innerHTML = '';
    empty.classList.add('show');
    return;
  }
  empty.classList.remove('show');
  el.innerHTML = watchlist.map(sym => {
    const c = getCoin(sym);
    if (!c) return '';
    return `
      <div class="coin-row" data-sym="${c.sym}">
        ${coinIcon(c)}
        <div class="coin-info">
          <div class="coin-name">${c.name} <span class="coin-sym">${c.sym}</span></div>
          <div class="coin-price-sub">In watchlist</div>
        </div>
        ${sparkline(c.sym, c.change)}
        <div class="coin-price-col">
          <div class="coin-price">${fmtPrice(c.price)}</div>
          <div class="coin-change ${changeColorClass(c.change)}">${changeArrow(c.change)} ${Math.abs(c.change).toFixed(2)}%</div>
        </div>
        <button class="star-btn active" data-remove="${c.sym}">✕</button>
      </div>
    `;
  }).join('');
}

function renderSignals() {
  const list = SIGNALS.filter(s =>
    (signalFilter === 'all' || s.type === signalFilter) &&
    (signalCoin === 'all' || s.coin === signalCoin)
  );
  $('#signalsList').innerHTML = list.length ? list.map(s => {
    const c = getCoin(s.coin);
    const confColor = s.type === 'buy' ? 'buy' : s.type === 'sell' ? 'sell' : s.type === 'sniper' ? 'sniper' : 'hold';
    const barColor = s.type === 'buy' ? 'linear-gradient(90deg,#16a34a,#22c55e)' : s.type === 'sell' ? 'linear-gradient(90deg,#dc2626,#ef4444)' : s.type === 'sniper' ? 'linear-gradient(90deg,#db2777,#ec4899)' : 'linear-gradient(90deg,#d97706,#f59e0b)';
    return `
      <div class="signal-card" data-type="${s.type}">
        ${coinIcon(c)}
        <div class="signal-badge ${s.type}">${s.type.toUpperCase()}</div>
        <div class="signal-info">
          <div class="signal-title">${s.title}</div>
          <div class="signal-sub">${s.sub}</div>
        </div>
        <div class="signal-conf">
          <div class="conf-label">Confidence</div>
          <div class="conf-val ${confColor}">${s.conf}%</div>
          <div class="signal-bar"><span style="width:${s.conf}%;background:${barColor}"></span></div>
        </div>
      </div>
    `;
  }).join('') : '<p class="empty-note show" style="text-align:center">No signals match your filters.</p>';
}

function renderSignalCoinMenu() {
  const coins = [...new Set(SIGNALS.map(s => s.coin))];
  $('#signalCoinDropdown').innerHTML = `
    <button type="button" data-val="all" class="${signalCoin === 'all' ? 'active' : ''}">All Coins</button>
    ${coins.map(c => `
      <button type="button" data-val="${c}" class="${signalCoin === c ? 'active' : ''}">${getCoin(c) ? getCoin(c).name : c} (${c})</button>
    `).join('')}
  `;
}

function syncSignalLabels() {
  const typeMap = { all: 'All Types', buy: 'Buy', sell: 'Sell', hold: 'Hold', sniper: 'Sniper' };
  $('#signalTypeLabel').textContent = typeMap[signalFilter] || signalFilter;
  $('#signalCoinLabel').textContent = signalCoin === 'all' ? 'All Coins' : signalCoin;
}

function toggleSignalMenu(id) {
  const trigger = $('#' + id);
  const menuItem = trigger.closest('.menu-item');
  const dropdown = menuItem.querySelector('.menu-dropdown');
  const isOpen = menuItem.classList.contains('open');
  // close the other one
  $$('.signal-top-menu .menu-item').forEach(mi => {
    mi.classList.remove('open');
    mi.querySelector('.menu-dropdown').classList.remove('open');
  });
  if (!isOpen) {
    menuItem.classList.add('open');
    dropdown.classList.add('open');
  }
}
function closeSignalMenus() {
  $$('.signal-top-menu .menu-item').forEach(mi => {
    mi.classList.remove('open');
    mi.querySelector('.menu-dropdown').classList.remove('open');
  });
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
const VALID_TABS = ['home', 'watchlist', 'signals', 'news', 'chart'];

function setActiveTab(tab) {
  if (!VALID_TABS.includes(tab)) tab = 'home';
  activeTab = tab;
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  $('#panel-' + tab).classList.add('active');

  const btns = $$('.nav-btn');
  const idx = btns.findIndex(b => b.dataset.tab === tab);
  btns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

  const indicator = $('.nav-indicator');
  const btn = btns[idx];
  if (btn) {
    const center = btn.offsetLeft + btn.offsetWidth / 2 - indicator.offsetWidth / 2;
    indicator.style.left = center + 'px';
  }
  // update hash so #signals etc. can deep-link to a tab
  if (location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab);
}

/* ---------- Simulated live price updates ---------- */
let liveTimer = null;
function startLiveUpdates() {
  if (liveTimer) clearInterval(liveTimer);
  liveTimer = setInterval(() => {
    COINS.forEach(c => {
      const drift = (Math.random() - 0.48) * 0.4;
      c.price = Math.max(c.price * (1 + drift / 1000), 0.00001);
      c.change = Math.min(15, Math.max(-15, c.change + (Math.random() - 0.5) * 0.3));
    });
    renderMarketList(currentMarketFilter);
    renderFeatured();
    renderWatchlist();
  }, 4000);
}

let currentMarketFilter = 'all';

/* ---------- Chart helpers ---------- */
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
  const base = coin.price;
  const seed = sym.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) + tf.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const rnd = scopedRand(seed + 7);
  const volatility = base * (tf === '1d' ? 0.006 : 0.003);
  const candles = [];
  let prevClose = base * (1 - 0.03 + rnd() * 0.06);
  for (let i = 0; i < count; i++) {
    const drift = (rnd() - 0.5) * 2 * volatility * 0.6;
    const open = prevClose;
    const close = open + drift + (rnd() - 0.5) * volatility;
    const high = Math.max(open, close) + rnd() * volatility * 0.6;
    const low = Math.min(open, close) - rnd() * volatility * 0.6;
    candles.push({ open, close, high, low });
    prevClose = close;
  }
  return candles;
}

function renderChart() {
  const coin = getCoin(chartCoin);
  const candles = generateCandles(chartCoin, chartTF);
  const W = 560, H = 220, PAD = 8;
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;
  const step = (W - PAD * 2) / candles.length;
  const bodyW = Math.max(3, step * 0.55);

  const y = v => PAD + (max - v) / range * (H - PAD * 2);
  const x = i => PAD + i * step + step / 2;

  const gridLines = [];
  for (let g = 0; g <= 4; g++) {
    const gy = PAD + (H - PAD * 2) * g / 4;
    const price = max - range * g / 4;
    gridLines.push(`<line x1="${PAD}" y1="${gy}" x2="${W - PAD}" y2="${gy}" stroke="rgba(255,255,255,0.06)"/>`);
    gridLines.push(`<text x="${W - PAD}" y="${gy - 3}" fill="rgba(148,163,184,0.6)" font-size="9" text-anchor="end">${fmtPrice(price)}</text>`);
  }

  let rects = '';
  let wicks = '';
  let lastClose = candles[candles.length - 1].close;
  candles.forEach((c, i) => {
    const up = c.close >= c.open;
    const color = up ? '#22c55e' : '#ef4444';
    const cx = x(i);
    const top = Math.min(y(c.open), y(c.close));
    const bh = Math.max(2, Math.abs(y(c.close) - y(c.open)));
    rects += `<rect x="${cx - bodyW / 2}" y="${top}" width="${bodyW}" height="${bh}" rx="${Math.min(2, bodyW / 3)}" fill="${color}"/>`;
    wicks += `<line x1="${cx}" y1="${y(c.high)}" x2="${cx}" y2="${y(c.low)}" stroke="${color}" stroke-width="1"/>`;
  });

  const first = candles[0].open;
  const pct = (lastClose - first) / first * 100;
  const pctColor = pct >= 0 ? 'var(--green)' : 'var(--red)';
  const coinInfo = `
    <div class="chart-coin-name">${coinIcon(coin)}<span>${coin.name}</span><span class="coin-sym">${coin.sym}</span></div>
    <div class="chart-coin-price" style="color:${pctColor}">${fmtPrice(lastClose)}</div>
    <div class="chart-coin-change ${changeColorClass(pct)}">${changeArrow(pct)} ${Math.abs(pct).toFixed(2)}%</div>`;

  $('#chartCoinInfo').innerHTML = coinInfo;
  $('#chartTfLabel').textContent = chartTF;
  $('#chartWrap').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(109,92,255,0.12)"/>
          <stop offset="100%" stop-color="rgba(109,92,255,0)"/>
        </linearGradient>
      </defs>
      ${gridLines.join('')}
      <rect x="${PAD}" y="${PAD}" width="${W - PAD * 2}" height="${H - PAD * 2}" fill="url(#chartBg)" opacity="0.6"/>
      ${wicks}
      ${rects}
    </svg>`;
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

/* ---------- Watchlist helpers ---------- */
function addToWatch(sym) {
  if (!sym) return;
  const upper = sym.trim().toUpperCase();
  if (watchlist.includes(upper)) return;
  if (COINS.find(c => c.sym === upper)) {
    watchlist.push(upper);
    renderWatchlist();
    renderMarketList(currentMarketFilter);
  }
}
function removeFromWatch(sym) {
  watchlist = watchlist.filter(s => s !== sym);
  renderWatchlist();
  renderMarketList(currentMarketFilter);
}

/* ---------- Event wiring ---------- */
function initEvents() {
  // Bottom nav
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  });

  // Market list + featured click → add to watchlist if not there
  document.addEventListener('click', e => {
    const star = e.target.closest('[data-star]');
    if (star) {
      const sym = star.dataset.star;
      if (watchlist.includes(sym)) removeFromWatch(sym);
      else addToWatch(sym);
      return;
    }
    const remove = e.target.closest('[data-remove]');
    if (remove) {
      removeFromWatch(remove.dataset.remove);
      return;
    }
    const row = e.target.closest('.coin-row');
    if (row && row.dataset.sym) {
      addToWatch(row.dataset.sym);
    }
    const featured = e.target.closest('.featured-card');
    if (featured && featured.dataset.sym) {
      addToWatch(featured.dataset.sym);
    }
  });

  // Segmented filter (market)
  $$('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const label = btn.textContent.toLowerCase();
      currentMarketFilter = label === 'gainers' ? 'gainers' : label === 'losers' ? 'losers' : 'all';
      renderMarketList(currentMarketFilter);
    });
  });

  // Watchlist add
  $('#btnAddWatch').addEventListener('click', () => {
    addToWatch($('#watchInput').value);
    $('#watchInput').value = '';
  });
  $('#watchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addToWatch($('#watchInput').value);
      $('#watchInput').value = '';
    }
  });

  // Signal filters
  $$('#signalFilters .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('#signalFilters .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      signalFilter = chip.dataset.filter;
      syncSignalLabels();
      renderSignals();
    });
  });

  // Signal top menu dropdowns
  $('#signalTypeMenu').addEventListener('click', e => {
    e.stopPropagation();
    toggleSignalMenu('signalTypeMenu');
  });
  $('#signalCoinMenu').addEventListener('click', e => {
    e.stopPropagation();
    toggleSignalMenu('signalCoinMenu');
  });

  $('#signalTypeDropdown').addEventListener('click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    signalFilter = btn.dataset.val;
    // sync chips
    $$('#signalFilters .chip').forEach(c => c.classList.toggle('active', c.dataset.filter === signalFilter));
    syncSignalLabels();
    renderSignals();
    closeSignalMenus();
  });

  $('#signalCoinDropdown').addEventListener('click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    signalCoin = btn.dataset.val;
    renderSignalCoinMenu();
    syncSignalLabels();
    renderSignals();
    closeSignalMenus();
  });

  document.addEventListener('click', closeSignalMenus);

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
    $$('#tfSelect .tf-btn').forEach(b => b.classList.toggle('active', b.dataset.tf === chartTF));
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
      addToWatch(item.dataset.sym);
      closeSearch();
    }
  });

  // Alert button toast
  $('#btnAlert').addEventListener('click', () => {
    showToast('🔔 No active alerts. Add coins to your watchlist to get price alerts!');
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
  renderWatchlist();
  renderSignals();
  renderSignalCoinMenu();
  syncSignalLabels();
  renderNews();
  renderChartCoins();
  renderChart();

  // Deep-link: open the tab from URL hash (e.g. #signals, #home, #news)
  const initialTab = (location.hash || '#home').slice(1);
  setActiveTab(initialTab);

  // Support hash changes for direct tab navigation
  window.addEventListener('hashchange', () => {
    setActiveTab((location.hash || '#home').slice(1));
  });

  startLiveUpdates();
  window.addEventListener('resize', () => {
    // re-align indicator on resize
    setActiveTab(activeTab);
  });
}

document.addEventListener('DOMContentLoaded', init);

