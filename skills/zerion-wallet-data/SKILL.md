---
name: zerion-wallet-data
description: Use when the user asks to check a wallet's portfolio, token balances, DeFi positions, PnL, transaction history, or NFTs. Provides interpreted on-chain data across 40+ EVM chains and Solana via x402 pay-per-request or API key — no raw RPC decoding needed.
tags: [zerion, x402, wallet, portfolio, defi, pnl, transactions, nfts, positions]
---

# Zerion Wallet Data

## Goal

Query interpreted wallet data — portfolios, token positions, DeFi positions, PnL, transactions, NFTs, and chain/token metadata — via x402 pay-per-request on Base or API key auth. All data is pre-enriched with protocol labels, token names, and USD values.

## Prerequisites

1. Wallet with USDC on Base: `mp token balance list --wallet main --chain base`
2. Small ETH on Base for gas
3. If no USDC: bridge from Ethereum or swap via `mp token swap --chain base`

## Core command

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/v1/<endpoint>" \
  --wallet main \
  --chain base
```

All endpoints are GET requests. Cost is $0.01 USDC per request on Base.

---

## Endpoint Reference

### Wallet Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/wallets/{address}/portfolio` | $0.01 | Aggregated portfolio value with total USD balance |
| `/v1/wallets/{address}/positions/` | $0.01 | Token balances and DeFi positions (staked, deposited, etc.) |
| `/v1/wallets/{address}/transactions/` | $0.01 | Interpreted transaction history with labels and types |
| `/v1/wallets/{address}/pnl` | $0.01 | Profit and Loss — unrealized PnL, realized PnL, net invested |
| `/v1/wallets/{address}/charts/{period}` | $0.01 | Portfolio balance chart over time (1d, 1w, 1m, 3m, 1y, max) |
| `/v1/wallets/{address}/nft-positions/` | $0.01 | NFTs held by the wallet |
| `/v1/wallets/{address}/nft-collections/` | $0.01 | NFT collections with floor prices |
| `/v1/wallets/{address}/nft-portfolio` | $0.01 | Aggregated NFT portfolio value |

### Token (Fungible) Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/fungibles/` | $0.01 | Search and list tokens |
| `/v1/fungibles/{id}` | $0.01 | Token details — price, market cap, volume, implementations |
| `/v1/fungibles/{id}/charts/{period}` | $0.01 | Token price chart |
| `/v1/fungibles/by-implementation` | $0.01 | Look up token by chain:address pair |
| `/v1/fungibles/by-implementation/charts/{period}` | $0.01 | Price chart by implementation |

### Chain Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/chains/` | $0.01 | List all supported chains (40+ EVM + Solana) |
| `/v1/chains/{id}` | $0.01 | Chain details — RPC, explorer, native token |

### Swap Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/swap/fungibles/` | $0.01 | List swappable tokens |
| `/v1/swap/offers/` | $0.01 | Get swap/bridge quotes |

### Gas Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/gas-prices/` | $0.01 | Current gas prices by chain |

### NFT Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/nfts/` | $0.01 | Search NFTs |
| `/v1/nfts/{id}` | $0.01 | NFT details with metadata and traits |

### DApp Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/v1/dapps` | $0.01 | List DeFi protocols |
| `/v1/dapps/{id}` | $0.01 | Protocol details — TVL, chains, categories |

---

## Common query parameters

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `currency` | `usd`, `eur`, `eth`, `btc` | Fiat/crypto currency for values |
| `filter[chain_ids]` | `ethereum`, `base`, `solana` | Filter by chain (comma-separated) |
| `filter[positions]` | `only_simple`, `only_complex`, `no_filter` | `only_simple` = wallet tokens, `only_complex` = DeFi, `no_filter` = both |
| `filter[trash]` | `only_non_trash`, `only_trash`, `no_filter` | Filter spam tokens |
| `sort` | `value`, `-value` | Sort by USD value |
| `page[size]` | integer | Results per page (max 100) |
| `page[after]` | string | Cursor for next page |

---

## Example: Full wallet analysis

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/v1/wallets/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/portfolio?currency=usd" \
  --wallet main \
  --chain base
```

## Example: DeFi positions

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/v1/wallets/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/positions/?filter[positions]=only_complex&currency=usd" \
  --wallet main \
  --chain base
```

## Example: Profit and loss

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/v1/wallets/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/pnl?currency=usd" \
  --wallet main \
  --chain base
```

## Example: Token lookup by contract address

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/v1/fungibles/by-implementation?filter[implementation_address]=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&filter[implementation_chain_id]=ethereum" \
  --wallet main \
  --chain base
```

## Example: Recent transactions

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/v1/wallets/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/transactions/?currency=usd&page[size]=10" \
  --wallet main \
  --chain base
```

## Discover all endpoints

```bash
mp x402 request \
  --method GET \
  --url "https://api.zerion.io/.well-known/x402" \
  --wallet main \
  --chain base
```

---

## Alternative: Zerion CLI

You can also query Zerion data directly via the Zerion CLI:

```bash
npm install -g zerion-cli
```

```bash
zerion-cli wallet portfolio <address>
zerion-cli wallet positions <address> --positions all
zerion-cli wallet transactions <address>
zerion-cli wallet pnl <address>
zerion-cli chains list
```

Auth via API key (`ZERION_API_KEY` env var) or x402 pay-per-call (`ZERION_X402=true` env var, or `--x402` flag). Get an API key at [dashboard.zerion.io](https://dashboard.zerion.io).

---

## Notes

- Payments are in **USDC on Base Mainnet** (`--chain base`)
- If the request fails (status >= 400), payment is not settled — you don't pay for errors
- ETH on Base is needed for gas (~$0.001 per tx)
- All responses follow [JSON:API](https://jsonapi.org/) format with `data`, `links`, and `relationships`
- Data is pre-interpreted: protocol names, token symbols, USD values included — no ABI decoding needed
- Supports 40+ EVM chains and Solana in a single query

## Related skills

- **moonpay-auth** — Create or import a local wallet
- **moonpay-check-wallet** — Check USDC balance on Base before spending
- **moonpay-x402** — Learn how x402 pay-per-request works
