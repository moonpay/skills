---
name: messari-x402
description: Access Messari's full API via x402 pay-per-request — no API key needed. Asset data, market metrics, signals, news, fundraising, token unlocks, on-chain networks, and AI chat, all paid with USDC on Base.
tags: [messari, x402, research, market-data, payments]
---

# Messari x402 API

## Goal

Make pay-per-request HTTP calls to Messari's API using USDC on Base Mainnet. No API key required — the CLI handles the 402 payment flow automatically.

## Prerequisites

1. Wallet with USDC on Base: `mp token balance list --wallet main --chain base`
2. Small ETH on Base for gas
3. If no USDC: bridge from Ethereum or swap via `mp token swap --chain base`

## Core command

```bash
mp x402 request \
  --method <GET|POST> \
  --url "https://api.messari.io<path>" \
  --body '<json>' \        # POST only
  --wallet main \
  --chain base
```

---

## Endpoint Reference

### AI & Intelligence

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/ai/v2/chat/completions` | POST | $0.25 | AI chat with Messari's crypto knowledge graph |
| `/ai/v1/deep-research` | POST | varies | Start async deep-research report |
| `/ai/v1/deep-research/{id}` | GET | $0 | Poll report status |

### Assets

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/v2/assets` | GET | $0.00 | List all assets |
| `/v2/assets/details` | GET | ~$0.05 | Up to 20 asset details (`?assets=btc,eth`) |
| `/v2/assets/ath` | GET | ~$0.05 | All-time highs |
| `/v2/assets/roi` | GET | ~$0.05 | Return on investment metrics |
| `/v1/assets/timeseries/{slug}` | GET | ~$0.18 | Price/volume timeseries |

### Markets & Exchanges

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/v1/markets` | GET | $0.00 | List trading pairs |
| `/v1/markets/timeseries/{slug}` | GET | ~$0.18 | Market price/volume timeseries |
| `/exchanges` | GET | $0.00–$0.55 | Exchange list and metrics |
| `/exchanges/{slug}/timeseries/{metric}` | GET | ~$0.55 | Exchange volume, futures data |

### Signals & Social

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/signal/v1/assets` | GET | ~$0.35 | Asset sentiment and mindshare |
| `/signal/v1/assets/mindshare-gainers-24h` | GET | ~$0.35 | Top mindshare movers (24h) |
| `/signal/v1/assets/mindshare-gainers-7d` | GET | ~$0.35 | Top mindshare movers (7d) |
| `/signal/v1/x-users` | GET | ~$0.75 | Influential X accounts |
| `/signal/v1/x-users/{id}/timeseries` | GET | ~$0.75 | Social engagement timeseries |

### News & Events

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/news/v1/news/feed` | GET | ~$0.55 | Aggregated crypto news feed |
| `/news/v1/news/sources` | GET | $0.00 | Available news sources |
| `/v1/events` | POST | ~$0.15 | Query governance, security, partnership events |
| `/v1/events/{id}` | GET | ~$0.05 | Event history |

### Fundraising

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/funding/v1/rounds` | GET | ~$0.35 | Recent funding rounds |
| `/funding/v1/rounds/investors` | GET | ~$0.35 | Investors by round |
| `/funding/v1/funds` | GET | ~$0.15 | Venture funds |
| `/funding/v1/funds/managers` | GET | ~$0.15 | Fund managers |
| `/funding/v1/organizations` | GET | ~$0.25 | Organizations |
| `/funding/v1/projects` | GET | ~$0.25 | Projects |
| `/funding/v1/mergers-and-acquisitions` | GET | ~$0.35 | M&A deals |

### Networks & Protocols

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/v2/networks` | GET | ~$0.10 | List networks |
| `/v1/networks/timeseries/{metric}` | GET | ~$0.25 | Network metrics (5m–1d) |
| `/protocols` | GET | ~$0.10 | All protocols |
| `/protocols/{slug}/timeseries/{metric}` | GET | ~$0.25 | Protocol metrics |
| `/protocols/dex` | GET | ~$0.10 | DEX protocols |
| `/protocols/lending` | GET | ~$0.10 | Lending protocols |

### Stablecoins

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/stablecoins` | GET | ~$0.10 | List stablecoins |
| `/stablecoins/{slug}/timeseries` | GET | ~$0.25 | Supply and usage metrics |

### Token Unlocks & Vesting

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/v1/allocations` | GET | ~$0.25 | Token allocation info |
| `/v1/assets/{id}/events` | GET | ~$0.75 | Unlock events |
| `/v1/assets/{id}/unlocks` | GET | ~$0.75 | Unlock timeseries |
| `/v1/assets/{id}/vesting-schedule` | GET | ~$0.50 | Vesting schedule |

### Trending Topics

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/v1/current` | GET | ~$0.25 | Today's trending topics |
| `/v1/daily` | GET | ~$0.25 | Historical topic timeseries (90-day max) |
| `/v1/classes` | GET | $0.00 | Topic classifications |

### Research Reports

| Endpoint | Method | Cost | Description |
|----------|--------|------|-------------|
| `/v1/reports` | GET | ~$0.15 | Research reports (filterable by asset, tags) |
| `/v1/reports/{id}` | GET | ~$0.05 | Specific report |
| `/v1/reports/tags` | GET | $0.00 | Available tags |

---

## Common query parameters

| Parameter | Values | Purpose |
|-----------|--------|---------|
| `assets` | `btc,eth,sol` | Filter by asset slug |
| `granularity` | `hourly`, `daily`, `monthly` | Timeseries resolution |
| `start_date` | ISO 8601 | Start of range |
| `end_date` | ISO 8601 | End of range |
| `limit` | integer | Max results |
| `page` | integer | Pagination |

---

## Example: AI chat

```bash
mp x402 request \
  --method POST \
  --url "https://api.messari.io/ai/v2/chat/completions" \
  --body '{"model":"messari","messages":[{"role":"user","content":"What is the current narrative driving SOL?"}]}' \
  --wallet main \
  --chain base
```

## Example: Asset details

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/v2/assets/details?assets=btc,eth,sol" \
  --wallet main \
  --chain base
```

## Example: Mindshare gainers

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/signal/v1/assets/mindshare-gainers-24h" \
  --wallet main \
  --chain base
```

## Discover all endpoints

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/.well-known/x402" \
  --wallet main \
  --chain base
```

## Notes

- Payments are in **USDC on Base Mainnet** (`--chain base`)
- If the request fails (status ≥ 400), payment is not settled — you don't pay for errors
- ETH on Base is needed for gas (small amount, ~$0.001 per tx)
- Use `--chain base` always — Messari does not accept Solana payments

## Related skills

- **messari-token-research** — Full token research workflow
- **messari-alpha-scout** — Mindshare + trending + news workflow
- **messari-funding-intel** — Funding rounds + M&A workflow
- **messari-deep-research** — Async deep-research report generation
- **moonpay-auth** — Create or import a local wallet
- **moonpay-check-wallet** — Check USDC balance on Base before spending
