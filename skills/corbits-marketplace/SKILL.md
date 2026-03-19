---
name: corbits-marketplace
description: >
  Paid API marketplace for AI agents via Corbits. Search hundreds of premium
  API proxies, call them with automatic USDC micropayments (x402 protocol),
  and fund the payment wallet with MoonPay. Use when the user wants to access
  paid data APIs (crypto prices, weather, financial data, etc.) with per-request
  billing and no API key management.
tags: [api-marketplace, x402, micropayments, usdc, defi]
---

# Corbits — Paid API Marketplace for AI Agents

## Overview

Corbits is a discovery and proxy platform for premium APIs. Agents search, select, and call paid APIs with automatic per-request USDC micropayments via the x402 protocol. MoonPay provides the wallet that powers every payment — your MoonPay wallet IS your Corbits payment wallet.

```
/corbits search <topic>  → find matching API proxies
/corbits list            → browse endpoints + USDC pricing
/corbits call            → select endpoint → review cost → confirm → execute
                           (payment auto-deducted from MoonPay wallet)
```

**Supports:** EVM wallets (Ethereum, Polygon, Base, Arbitrum) and Solana

## Prerequisites

```bash
# 1. Install Corbits skill
npx clawhub@latest install corbits

# 2. Install MoonPay CLI
npm install -g @moonpay/cli
mp login
```

## Setup (One-Time)

```bash
# 1. Create your payment wallet
mp wallet create --name "corbits-agent"
mp wallet retrieve --wallet "corbits-agent"  # note your EVM address

# 2. Fund with USDC
mp buy --token usdc_ethereum --amount 50 --wallet <evm-address> --email <email>

# 3. Export private key for Corbits
# ⚠️ Security: your private key gives full access to your wallet.
# Never share it, commit it, or paste it anywhere other than the corbits init prompt.
# Use a dedicated low-balance wallet — not your primary wallet.
mp wallet export --wallet "corbits-agent"
# Copy the EVM private key

# 4. Initialize Corbits — paste the exported key when prompted
/corbits init
```

`/corbits init` stores the key in macOS Keychain or `~/.config/corbits/`, scaffolds a TypeScript project with `@faremeter/rides`, and optionally configures a Solana keypair.

## Key Commands

| Command | Description |
|---------|-------------|
| `/corbits init` | First-time setup (wallet + project scaffold) |
| `/corbits search <query>` | Find API proxies by name or category |
| `/corbits list` | View all available proxies and endpoint pricing in USDC |
| `/corbits call` | Execute a paid API call with auto-payment |
| `/corbits status` | Show currently selected proxy |

## Usage Examples

```bash
# Crypto price data
/corbits search "crypto prices"
/corbits list
/corbits call
# → Select: GET /prices/latest
# → Cost: 0.001 USDC
# → Confirm: y
# → Response: { "BTC": 67420.00, "ETH": 3540.00, ... }

# Weather data
/corbits search "weather"
/corbits list
/corbits call
```

All pricing shown in USDC before execution. The `@faremeter/rides` library handles x402 payment authentication automatically — no manual transaction signing.

**Context storage:** `~/.config/corbits/context.json`
**Base URL:** `https://api.corbits.dev`

## Funding Your Wallet

Corbits payments settle in USDC. Keep a balance before calling paid APIs.

### Buy USDC with Fiat

```bash
# Ethereum (standard)
mp buy --token usdc_ethereum --amount 50 --wallet <evm-address> --email <email>

# Polygon (lower gas)
mp buy --token usdc_polygon --amount 50 --wallet <evm-address> --email <email>
```

### Swap ETH → USDC

```bash
mp token swap \
  --from-wallet corbits-agent --chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --to-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 0.02
```

### Bank Transfer (Large Budgets)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 500 --currency usd --chain ethereum --wallet <evm-address>
```

### Deposit Link (Permissionless)

Anyone can fund your Corbits wallet from any chain — auto-converts to USDC:

```bash
mp deposit create \
  --name "Corbits Agent Fund" \
  --wallet <evm-address> \
  --chain ethereum --token USDC
```

### Check Balance

```bash
mp token balance list --wallet <evm-address> --chain ethereum
```

### Auto Top-Up

Keep the wallet funded automatically in agent pipelines:

```bash
BALANCE=$(mp token balance list --wallet <address> --chain ethereum --json | \
  jq '.[] | select(.symbol=="USDC") | .balance')

if (( $(echo "$BALANCE < 5" | bc -l) )); then
  mp token bridge \
    --from-wallet primary --from-chain polygon \
    --from-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 \
    --from-amount 20 \
    --to-chain ethereum \
    --to-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
fi
```

## End-to-End Workflow

1. `npx clawhub@latest install corbits`
2. `mp wallet create --name "corbits-agent"`
3. `mp buy --token usdc_ethereum --amount 50 --wallet <address> --email <email>`
4. `mp wallet export --wallet "corbits-agent"` — copy EVM private key
5. `/corbits init` — paste key when prompted
6. `/corbits search <topic>` — discover APIs
7. `/corbits call` — payment auto-deducted from MoonPay wallet
8. Top up when needed: `mp buy` or `mp token bridge`

## Key Token Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| ETH (gas) | Ethereum | native |

## Resources

- **Platform:** https://corbits.dev
- **API base:** https://api.corbits.dev
- **Payment SDK:** `@faremeter/rides` (npm)
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Verify USDC balance before API calls
- **moonpay-x402** — Direct x402 pay-per-request for other endpoints
- **moonpay-swap-tokens** — Swap tokens to USDC for Corbits payments
