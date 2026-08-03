const SYMBOLS: Record<string, string> = {
  BTC: 'XBTUSD', ETH: 'ETHUSD', BNB: 'BNBUSD', SOL: 'SOLUSD', XRP: 'XRPUSD',
  ADA: 'ADAUSD', AVAX: 'AVAXUSD', DOGE: 'DOGEUSD', DOT: 'DOTUSD', LINK: 'LINKUSD',
  POL: 'POLUSD', SHIB: 'SHIBUSD'
};
const TIMEFRAMES = [5, 15, 30, 60, 240];
const RSI_MID = 50;
const ADX_THRESHOLD = 25;
const MIN_SCORE = 65;
const CROSS_LOOKBACK_BARS = 3;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };

function ema(values: number[], length: number) {
  const out: number[] = [];
  const k = 2 / (length + 1);
  values.forEach((v, i) => out.push(i === 0 ? v : v * k + out[i - 1] * (1 - k)));
  return out;
}
function rsi(values: number[], length = 14) {
  const out = Array(values.length).fill(50);
  let gain = 0, loss = 0;
  for (let i = 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gain = (gain * (length - 1) + Math.max(d, 0)) / length;
    loss = (loss * (length - 1) + Math.max(-d, 0)) / length;
    out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  }
  return out;
}
function macd(values: number[]) {
  const fast = ema(values, 12), slow = ema(values, 26);
  const line = values.map((_, i) => fast[i] - slow[i]);
  return { line, signal: ema(line, 9) };
}
function atr(c: Candle[], length = 14) {
  const tr = c.map((x, i) => i === 0 ? x.high - x.low : Math.max(x.high - x.low, Math.abs(x.high - c[i - 1].close), Math.abs(x.low - c[i - 1].close)));
  return ema(tr, length);
}
function adx(c: Candle[], length = 14) {
  const tr: number[] = [], plus: number[] = [], minus: number[] = [];
  for (let i = 0; i < c.length; i++) {
    if (!i) { tr.push(c[i].high - c[i].low); plus.push(0); minus.push(0); continue; }
    const up = c[i].high - c[i - 1].high, down = c[i - 1].low - c[i].low;
    tr.push(Math.max(c[i].high - c[i].low, Math.abs(c[i].high - c[i - 1].close), Math.abs(c[i].low - c[i - 1].close)));
    plus.push(up > down && up > 0 ? up : 0); minus.push(down > up && down > 0 ? down : 0);
  }
  const atrE = ema(tr, length), p = ema(plus, length), m = ema(minus, length);
  const dx = atrE.map((a, i) => { const pi = a ? 100 * p[i] / a : 0, mi = a ? 100 * m[i] / a : 0; return pi + mi ? 100 * Math.abs(pi - mi) / (pi + mi) : 0; });
  return ema(dx, length);
}
function vwap(c: Candle[]) {
  let pv = 0, vol = 0, day = '';
  const out: number[] = [];
  for (const x of c) {
    const d = new Date(x.time * 1000).toISOString().slice(0, 10);
    if (d !== day) { day = d; pv = 0; vol = 0; }
    pv += ((x.high + x.low + x.close) / 3) * x.volume; vol += x.volume;
    out.push(vol ? pv / vol : x.close);
  }
  return out;
}
function parseKraken(payload: any): Candle[] {
  const key = Object.keys(payload?.result || {}).find(k => k !== 'last');
  const rows = key ? payload.result[key] : [];
  return rows.map((r: any[]) => ({ time: Number(r[0]), open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]), volume: Number(r[6] ?? r[5] ?? 0) })).filter((x: Candle) => Number.isFinite(x.close));
}
async function fetchCandles(pair: string, interval: number): Promise<Candle[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}`);
      if (res.ok) { const rows = parseKraken(await res.json()); if (rows.length >= 60) return rows.slice(-250); }
    } catch (_) {}
    await sleep(250);
  }
  return [];
}
async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []; let next = 0;
  async function worker() { while (next < items.length) { const i = next++; out[i] = await fn(items[i]); } }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker)); return out;
}

function evaluate(symbol: string, frames: Record<number, Candle[]>) {
  const base = frames[15];
  if (!base || base.length < 60) return null;
  const close = base.map(x => x.close), fast = ema(close, 9), slow = ema(close, 21);
  const rv = rsi(close), m = macd(close), ax = adx(base), vw = vwap(base), at = atr(base);
  const i = base.length - 1, prev = i - 1;
  const bullCross = Array.from({ length: CROSS_LOOKBACK_BARS }, (_, n) => i - n).some(j => j > 0 && fast[j - 1] <= slow[j - 1] && fast[j] > slow[j]);
  const bearCross = Array.from({ length: CROSS_LOOKBACK_BARS }, (_, n) => i - n).some(j => j > 0 && fast[j - 1] >= slow[j - 1] && fast[j] < slow[j]);
  const volAvg = close.map((_, n) => base.slice(Math.max(0, n - 20), n).reduce((a, x) => a + x.volume, 0) / Math.max(1, Math.min(20, n)));
  const bullish = [
    close[i] > vw[i], rv[i] > RSI_MID, m.line[i] > m.signal[i], fast[i] > slow[i],
    ax[i] > ADX_THRESHOLD && close[i] > fast[i], base[i].volume > volAvg[i] && base[i].close > base[i].open,
    ...[5, 15, 30, 60, 240].map(tf => { const c = frames[tf]; return !!c?.length && rsi(c.map(x => x.close))[c.length - 1] > RSI_MID; })
  ];
  const bearish = [
    close[i] < vw[i], rv[i] < RSI_MID, m.line[i] < m.signal[i], fast[i] < slow[i],
    ax[i] > ADX_THRESHOLD && close[i] < fast[i], base[i].volume > volAvg[i] && base[i].close < base[i].open,
    ...[5, 15, 30, 60, 240].map(tf => { const c = frames[tf]; return !!c?.length && rsi(c.map(x => x.close))[c.length - 1] < RSI_MID; })
  ];
  const bullPct = bullish.filter(Boolean).length / bullish.length * 100;
  const bearPct = bearish.filter(Boolean).length / bearish.length * 100;
  const dominantScore = Math.max(bullPct, bearPct);
  const activeDirection = bullCross && bullPct >= MIN_SCORE ? 'buy' : bearCross && bearPct >= MIN_SCORE ? 'sell' : null;
  const direction = activeDirection || (dominantScore >= MIN_SCORE ? (bullPct >= bearPct ? 'buy' : 'sell') : null);
  if (!direction) return null;
  const signalStatus = activeDirection ? 'active' : 'watch';
  const score = Math.round(direction === 'buy' ? bullPct : bearPct);
  const risk = at[i] * 1.5, entry = close[i];
  const stop = direction === 'buy' ? entry - risk : entry + risk;
  const targets = [1, 2, 3, 4, 5].map(n => direction === 'buy' ? entry + risk * n : entry - risk * n);
  const prior = base.slice(Math.max(0, i - 20), i);
  const orderBlock = direction === 'buy' ? base[i - 1]?.close < base[i - 1]?.open && base[i].close > base[i - 1].high : base[i - 1]?.close > base[i - 1]?.open && base[i].close < base[i - 1].low;
  const sweptLiquidity = direction === 'buy' ? base[i].low < Math.min(...prior.map(x => x.low)) && base[i].close > Math.min(...prior.map(x => x.low)) : base[i].high > Math.max(...prior.map(x => x.high)) && base[i].close < Math.max(...prior.map(x => x.high));
  return { symbol, type: 'sniper', signalStatus, action: direction, price: entry, entry, target: targets[1], targets, stop, confidence: score, timeframe: '15m', signalWindow: `recent ${CROSS_LOOKBACK_BARS} x 15m candles`, historicalBars: Object.fromEntries(Object.entries(frames).map(([tf, candles]) => [tf, candles.length])), historicalContext: 'Historical OHLC candles collected across 5m/15m/30m/1h/4h', indicator: [signalStatus === 'watch' ? 'Waiting for EMA Cross' : null, orderBlock ? 'Order Block' : null, sweptLiquidity ? 'Liquidity Sweep' : null, `MTF RSI ${score}%`, ax[i] > ADX_THRESHOLD ? 'ADX Trend' : null].filter(Boolean).join(' · '), metrics: { bullPct: Math.round(bullPct), bearPct: Math.round(bearPct), rsi: rv[i], adx: ax[i], atr: at[i], ema9: fast[i], ema21: slow[i], vwap: vw[i], multiTimeframeRsi: Object.fromEntries([5, 15, 30, 60, 240].map(tf => [tf, rsi(frames[tf].map(x => x.close)).at(-1)])) } };
}

Deno.serve(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const jobs = Object.entries(SYMBOLS).flatMap(([symbol, pair]) => TIMEFRAMES.map(interval => ({ symbol, pair, interval })));
  const results = await mapLimit(jobs, 5, async job => ({ ...job, candles: await fetchCandles(job.pair, job.interval) }));
  const data = Object.keys(SYMBOLS).map(symbol => { const frames: Record<number, Candle[]> = {}; results.filter(x => x.symbol === symbol).forEach(x => frames[x.interval] = x.candles); return evaluate(symbol, frames); }).filter(Boolean);
  return Response.json({ agent: 'CryptoVault Sniper AI Agent', type: 'sniper', mode: 'historical-candle-analysis', timeframe: '15m execution · 5m/15m/30m/1h/4h RSI confirmation', lookback: 'up to 250 candles per timeframe', min_score: MIN_SCORE, cross_lookback_bars: CROSS_LOOKBACK_BARS, logic: ['EMA 9/21 crossover or crossunder; watch candidates wait for trigger' , 'VWAP direction', 'RSI and multi-timeframe RSI alignment', 'MACD 12/26/9', 'ADX > 25', 'volume vs 20-period average', 'ATR 14 with 1.5x stop and 1R-5R targets'], data, scanned: Object.keys(SYMBOLS).length, generated_at: new Date().toISOString() });
});
