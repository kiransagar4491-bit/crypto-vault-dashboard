(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.ChartUtils = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function getChartTimeframeSeconds(tf) {
    const map = {
      '1m': 60,
      '3m': 180,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1hr': 3600,
      '4hr': 14400,
      '1d': 86400,
    };
    return map[tf] || 86400;
  }

  function buildChartSeriesData(candles, tf, options = {}) {
    const secondsPerBar = getChartTimeframeSeconds(tf);
    const now = options.now ?? Math.floor(Date.now() / 1000);

    return candles.map((candle, index) => {
      const fallbackTime = now - (candles.length - index) * secondsPerBar;
      const rawTime = candle?.time;
      const normalizedTime = typeof rawTime === 'number' && rawTime > 0
        ? Math.floor(rawTime > 1e12 ? rawTime / 1000 : rawTime)
        : fallbackTime;

      const item = {
        time: normalizedTime,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      };

      if (options.lastPrice !== undefined && index === candles.length - 1) {
        item.close = options.lastPrice;
        item.high = Math.max(item.high, options.lastPrice);
        item.low = Math.min(item.low, options.lastPrice);
      }

      return item;
    });
  }

  function mapBinanceInterval(tf) {
    const map = { '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m', '1hr': '1h', '4hr': '4h', '1d': '1d' };
    return map[tf] || '1h';
  }

  function buildBinanceSymbol(sym) {
    return `${sym}USDT`;
  }

  return { getChartTimeframeSeconds, buildChartSeriesData, mapBinanceInterval, buildBinanceSymbol };
});
