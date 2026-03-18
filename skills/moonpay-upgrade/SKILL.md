---
name: moonpay-upgrade
description: "Increase your MoonPay API rate limit by paying with crypto via x402."
tags: [payments]
---

# Upgrade Rate Limit

Increase your MoonPay API rate limit by paying with crypto via x402.

## Options

| Duration | Length | Price |
|----------|--------|-------|
| day | 24 hours | $1 USDC |
| month | 30 days | $20 USDC |

## Usage

```bash
# Upgrade for 24 hours ($1 USDC)
mp upgrade --duration day --wallet <wallet-name> --chain solana

# Upgrade for 30 days ($20 USDC)
mp upgrade --duration month --wallet <wallet-name> --chain base
```

## Requirements

- Must be logged in (`mp login`)
- Need a funded local wallet with USDC on Solana or Base
- Payment is handled automatically via x402

## How It Works

1. Run `mp upgrade` with your duration, wallet, and chain
2. x402 automatically pays from your local wallet
3. Your rate limit is increased immediately
4. Upgrades stack — buying again extends your expiry

## Check Status

Run `mp user retrieve` to see your current `upgradeExpiresAt`.
