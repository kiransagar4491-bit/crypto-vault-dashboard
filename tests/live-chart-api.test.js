const assert = require('assert');
const { mapBinanceInterval, buildBinanceSymbol } = require('../js/chart-utils.js');

assert.strictEqual(mapBinanceInterval('1m'), '1m');
assert.strictEqual(mapBinanceInterval('1hr'), '1h');
assert.strictEqual(mapBinanceInterval('1d'), '1d');
assert.strictEqual(buildBinanceSymbol('BTC'), 'BTCUSDT');
assert.strictEqual(buildBinanceSymbol('ETH'), 'ETHUSDT');
console.log('live chart api tests passed');
