# BTC Lookup

Search any Bitcoin address or transaction hash — live balance, USD values,
confirmations, fee analysis, and a watchlist with alerts.

This is a **backup mirror** of the app hosted at https://pool.gadrofi.app,
kept on GitHub Pages so it stays reachable if that host is unreachable.

## What it does

- Address and transaction lookup (auto-detects which you pasted)
- USD value at the time of each transaction, plus value today
- Live BTC/USD ticker with 24h change
- Watchlist with auto-refresh and new-activity alerts (sound + vibration)
- Confirmation progress with a configurable alert target
- Fee analysis for unconfirmed transactions (sat/vB vs current network rates)
- Custom BTC price override for what-if calculations
- Dark / light mode, QR codes, installable to a phone home screen

## Deploying

`index.html` is the entire app — a single self-contained file with no build
step and no backend. Data comes from the public mempool.space API (with
CoinGecko as a price fallback). To host it anywhere, upload that one file.

To update this mirror: replace `index.html` and commit.
