const assert = require('assert');
const { getChartTimeframeSeconds, buildChartSeriesData } = require('../js/chart-utils.js');

const candles = [
  { open: 100, high: 110, low: 90, close: 105, volume: 1000 },
  { open: 105, high: 115, low: 95, close: 110, volume: 1200 },
  { open: 110, high: 120, low: 100, close: 115, volume: 1300 },
];

assert.strictEqual(getChartTimeframeSeconds('1m'), 60);
assert.strictEqual(getChartTimeframeSeconds('5m'), 300);
assert.strictEqual(getChartTimeframeSeconds('1d'), 86400);

const data1m = buildChartSeriesData(candles, '1m', { now: 1_700_000_000 });
const data5m = buildChartSeriesData(candles, '5m', { now: 1_700_000_000 });

assert.ok(data1m.length === candles.length);
assert.ok(data5m.length === candles.length);
assert.notStrictEqual(data1m[0].time, data5m[0].time);
assert.ok(data1m[0].time - data5m[0].time > 0);
console.log('chart timeframe tests passed');
