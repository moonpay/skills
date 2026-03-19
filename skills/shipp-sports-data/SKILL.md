---
name: shipp-sports-data
description: >
  Real-time sports & events data for AI agents via Shipp. Use when the user
  wants live scores, schedules, or game events for NBA, NFL, NCAA Football,
  MLB, or Soccer — especially to power prediction market trading strategies
  on Polymarket or Kalshi using a MoonPay wallet.
tags: [sports, prediction-markets, polymarket, kalshi, real-time-data]
---

# Shipp — Real-Time Sports Data + MoonPay Trading

## Overview

Shipp gives AI agents live, authoritative sports data — schedules, scores, and events as they happen. Pair it with a MoonPay-managed wallet to pipe live scores directly into Polymarket or Kalshi trading logic.

**Supported sports:** NBA, NFL, NCAA Football (NCAAF), MLB, Soccer

## Prerequisites

1. **Shipp API key** — register at https://platform.shipp.ai
2. **MoonPay CLI** — `npm install -g @moonpay/cli`
3. **Funded wallet** — USDC.e on Polygon for Polymarket trades

```bash
export SHIPP_API_KEY="sk_..."
```

## Setup Workflow

```bash
# 1. Create a MoonPay wallet for your sports agent
mp wallet create --name "shipp-sports-agent"
mp wallet list  # note your Polygon address

# 2. Fund with USDC.e (for trading) and POL (for gas)
mp buy --token usdc_polygon --amount 100 --wallet <polygon-address> --email <email>
mp buy --token pol_polygon --amount 5 --wallet <polygon-address> --email <email>

# 3. Register wallet with Polymarket (one-time)
mp prediction-market user create --provider polymarket --wallet <polygon-address>

# 4. Create a Shipp connection for your target market
# (see Shipp API section below)
```

## Shipp API

### Create a Connection (one-time per query type)

```bash
curl -X POST https://api.shipp.ai/api/v1/connections/create \
  -H "Authorization: Bearer $SHIPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"filter_instructions": "NBA games with final scores from the last 24 hours"}'
# → returns { "connection_id": "conn_..." }
```

### Poll for Live Updates

```bash
curl -X POST https://api.shipp.ai/api/v1/connections/{connection_id} \
  -H "Authorization: Bearer $SHIPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 20, "since_event_id": "<last_seen_id>"}'
```

### Get Sport Schedule (±7 days)

```bash
curl "https://api.shipp.ai/api/v1/sports/nba/schedule?api_key=$SHIPP_API_KEY"
# sports: nba | nfl | ncaaf | mlb | soccer
```

### List Saved Connections (free)

```bash
curl "https://api.shipp.ai/api/v1/connections?api_key=$SHIPP_API_KEY"
```

## Live Data → Trade Loop

Create a connection once, then poll every 15 seconds for live events:

```bash
# 1. Create connection (run once — save the connection_id)
curl -X POST https://api.shipp.ai/api/v1/connections/create \
  -H "Authorization: Bearer $SHIPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"filter_instructions": "NBA games with final scores from the last 24 hours"}'
# → { "connection_id": "conn_..." }

# 2. Poll for updates (run every 15s, passing last seen event_id)
curl -X POST https://api.shipp.ai/api/v1/connections/{connection_id} \
  -H "Authorization: Bearer $SHIPP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 20, "since_event_id": "<last_event_id>"}'
```

On signal (final score, lead change, key event), execute the Polymarket trade:

```bash
mp prediction-market position buy \
  --wallet shipp-sports-agent \
  --provider polymarket \
  --tokenId <outcome-token-id> \
  --price 0.85 \
  --size 50
```


## Wallet Operations

```bash
# Check balance
mp token balance list --wallet <polygon-address> --chain polygon

# Sign a message (EIP-191)
mp message sign --wallet shipp-sports-agent --chain polygon --message "I own this wallet"

# Withdraw winnings to bank
mp virtual-account offramp create \
  --amount 500 --chain polygon --wallet <polygon-address>

# Hardware wallet (high security)
mp wallet add-ledger --name "shipp-sports-ledger"
```

## Funding Options

| Method | Command | Best for |
|--------|---------|----------|
| Buy with fiat | `mp buy --token usdc_polygon ...` | Getting started |
| Bridge crypto | `mp token bridge --from-chain ethereum ...` | Existing crypto holders |
| Bank transfer | `mp virtual-account onramp create ...` | Large amounts |
| Deposit link | `mp deposit create ...` | Permissionless funding from anyone |

**Key token addresses on Polygon:**
- USDC.e: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- POL (gas): native

## End-to-End Workflow

1. Get Shipp API key → https://platform.shipp.ai
2. `mp wallet create --name "shipp-sports-agent"`
3. `mp buy --token usdc_polygon --amount 100 --wallet <address> --email <email>`
4. `mp buy --token pol_polygon --amount 5 --wallet <address> --email <email>`
5. Create Shipp connection for target sport/market
6. Poll Shipp every 15–30s for live game events
7. On signal (final score, lead change, key event): execute Polymarket trade
8. `mp virtual-account offramp create` to withdraw winnings

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request |
| 401 | Auth failed — check `SHIPP_API_KEY` |
| 402 | Billing — top up your Shipp account |
| 429 | Rate limited — back off and retry |
| 5xx | Shipp server error — retry with exponential backoff |

## Resources

- **Shipp API docs:** https://docs.shipp.ai
- **Platform & API keys:** https://platform.shipp.ai
- **Platform guides:** https://docs.shipp.ai/platform-guides
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-prediction-market** — Search markets, buy/sell positions, track PnL
- **moonpay-fund-polymarket** — Fund wallet with USDC.e and POL for gas
- **moonpay-check-wallet** — Verify balances before trading
- **moonpay-trading-automation** — Automate recurring trading strategies
