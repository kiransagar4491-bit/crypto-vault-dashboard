# Crypto Dashboard - Task Checklist

## Add Sniper Signal Type

- [x] Update index.html: add "Sniper" button to #signalFilter seg
- [x] Update js/app.js: add type: 'sniper' to high-conviction SIGNALS entries
- [x] Update js/app.js: update renderSignals() filter logic + sniper badge + hero stats
- [x] Update js/app.js: update signal filter click handler to support 'sniper'
- [x] Update css/styles.css: add .signal-badge.sniper style
- [x] Update README.md: mention Sniper signals
- [x] Verify JS syntax (node --check js/app.js)
- [x] Test by opening index.html in browser

## Fix UI Design All Pages

- [x] Review all files (index.html, styles.css, app.js)
- [ ] Add Trade tab styles to css/styles.css (portfolio card, order form, holdings, history)
- [ ] Add missing .btn-danger style
- [ ] Add .chart-trade-actions / .trade-shortcut styles
- [ ] Add .order-tabs / .order-tab styles
- [ ] Add .order-field / .order-quick / .quick-btn / .order-preview styles
- [ ] Add .holding-item / .history-item styles
- [ ] Add .btn-reset / .trade-greeting styles
- [ ] Verify all pages render correctly

## Virtual Trading Feature

- [x] Confirm plan with user
- [x] Update index.html: add Trade tab panel (portfolio summary, order form, holdings, history)
- [x] Update index.html: add 5th bottom nav button "Trade"
- [x] Update js/app.js: add portfolio state + localStorage persistence
- [x] Update js/app.js: add trade execution (buy/sell) with validation
- [x] Update js/app.js: add renderPortfolio / renderHoldings / renderHistory
- [x] Update js/app.js: add trade shortcuts from Chart & Signal tabs
- [x] Update js/app.js: update VALID_TABS to include 'trade'
- [x] Update css/styles.css: add Trade tab styles (portfolio, order form, holdings)
- [x] Update README.md: reflect new Trade feature
- [x] Verify JS syntax (node --check js/app.js)
- [x] Test by opening index.html in browser
- [x] Commit and open pull request

## Previous: Navigation Tab Bar: Home → Chart → Signal → News

- [x] Confirm plan with user
- [x] Update index.html: replace Watchlist panel with Signal panel
- [x] Update index.html: reorder bottom nav to Home, Chart, Signal, News
- [x] Update js/app.js: add SIGNALS dataset
- [x] Update js/app.js: add renderSignals() + Buy/Sell filtering + hero stats
- [x] Update js/app.js: update VALID_TABS to ['home', 'chart', 'signal', 'news']
- [x] Update js/app.js: repurpose coin/featured/search clicks to open Chart tab
- [x] Update js/app.js: remove watchlist rendering/handlers
- [x] Update css/styles.css: complete Signal tab styles (badges, cards, strength bars)
- [x] Update README.md: reflect new nav/features
- [x] Verify JS syntax (node --check js/app.js)
- [x] Test by opening index.html in browser

