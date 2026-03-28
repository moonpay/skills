---
name: jupiter-api
description: >
  Jupiter DEX aggregator on Solana — swap tokens (Swap API v2), get prices, set limit orders (Trigger), run DCA/recurring buys, track portfolio, explore token metadata, and more. Use when user asks to swap on Solana, get SOL/SPL token prices, set limit orders, automate DCA, or access Jupiter APIs. Requires a free Jupiter API key from portal.jup.ag.
tags: [jupiter, solana, swap, dex, defi, prices, limit-orders, dca]
---

# Jupiter API

Jupiter is the #1 DEX aggregator on Solana — $2T+ volume, 500+ integrations. All operations use REST APIs via `curl`.

## Prerequisites

- `curl` and `jq` installed
- **Jupiter API key** — get a free key at https://portal.jup.ag → set `export JUPITER_API_KEY=<your-key>`
- A funded Solana wallet (for executing swaps/orders)
- For signing transactions: Solana CLI (`sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`) or your preferred wallet

**Base URLs:**

| API | Base URL |
|-----|----------|
| Swap (v2) | `https://api.jup.ag/swap/v2` |
| Price | `https://api.jup.ag/price/v3` |
| Token | `https://api.jup.ag/tokens/v2` |
| Trigger (limit orders) | `https://api.jup.ag/trigger/v2` |
| Recurring (DCA) | `https://api.jup.ag/recurring/v1` |
| Portfolio | `https://api.jup.ag/portfolio/v1` |

**Common token mints:**

| Token | Mint |
|-------|------|
| SOL (native) | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| JUP | `JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN` |

---

## Swap API v2 (Best Route Swap)

Swap v2 automatically finds the best route, handles MEV protection, and supports gasless transactions.

### Get a Swap Order

```bash
# Quote + unsigned transaction in one call
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/swap/v2/order?\
inputMint=So11111111111111111111111111111111111111112\
&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
&amount=100000000\
&taker=YOUR_WALLET_ADDRESS" | jq '{inAmount, outAmount, swapTransaction}'
```

`amount` is in lamports (1 SOL = 1,000,000,000 lamports) or token base units.

### Execute the Swap

```bash
# 1. Get order
ORDER=$(curl -s -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/swap/v2/order?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&taker=YOUR_WALLET")

# 2. Sign the swapTransaction with your wallet (e.g. Solana CLI)

# 3. Submit
curl -s -X POST "https://api.jup.ag/swap/v2/execute" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $JUPITER_API_KEY" \
  -d "{\"signedTransaction\": \"<base64-signed-tx>\", \"requestId\": $(echo $ORDER | jq '.requestId')}"
```

### Check Token Security & Holdings

```bash
# Token security search
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/swap/v2/search?query=BONK" | jq '.[] | {symbol, mint, organicScore}'

# Wallet holdings
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/swap/v2/balances/YOUR_WALLET" | jq '.tokens[] | {symbol, balance, usdValue}'
```

---

## Price API (v3)

```bash
# Single token price
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112" | jq '.data'

# Multiple tokens
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" | jq '.data'

# With buy/sell prices
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112&showExtraInfo=true" | jq '.data'
```

---

## Token API (v2)

```bash
# Token metadata by mint
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/tokens/v2/token/So11111111111111111111111111111111111111112" | jq '{symbol, name, decimals, organicScore}'

# Search tokens
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/tokens/v2/search?query=bonk&limit=5" | jq '.[] | {symbol, mint, organicScore}'

# List tradeable tokens (paginated)
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/tokens/v2/mints/tradable?limit=20" | jq '.[].address'
```

---

## Trigger API v2 (Limit Orders)

Place conditional orders that execute when price conditions are met.

```bash
# Create a limit order (sell 1 SOL for at least 200 USDC)
curl -s -X POST "https://api.jup.ag/trigger/v2/createOrder" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $JUPITER_API_KEY" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "maker": "YOUR_WALLET",
    "payer": "YOUR_WALLET",
    "makingAmount": "1000000000",
    "takingAmount": "200000000",
    "expiredAt": null
  }' | jq '{order, transaction}'

# List open orders for a wallet
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/trigger/v2/orders?wallet=YOUR_WALLET&status=open" | jq '.orders[] | {orderId, inputMint, outputMint, makingAmount, takingAmount}'

# Cancel an order
curl -s -X POST "https://api.jup.ag/trigger/v2/cancelOrder" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $JUPITER_API_KEY" \
  -d '{"maker": "YOUR_WALLET", "order": "ORDER_PUBLIC_KEY"}' | jq '.transaction'
```

> Sign and submit the returned `transaction` with your Solana wallet to finalize.

---

## Recurring API (DCA)

Dollar-cost average into any token on a schedule.

```bash
# Create a DCA order (buy $10 USDC of SOL every day for 30 days)
curl -s -X POST "https://api.jup.ag/recurring/v1/createOrder" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $JUPITER_API_KEY" \
  -d '{
    "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "outputMint": "So11111111111111111111111111111111111111112",
    "payer": "YOUR_WALLET",
    "params": {
      "time": {
        "inAmount": "10000000",
        "numberOfOrders": 30,
        "interval": 86400
      }
    }
  }' | jq '{order, transaction}'

# List active DCA orders
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/recurring/v1/orders?wallet=YOUR_WALLET&status=active" | jq '.orders[] | {orderId, inputMint, outputMint, status}'

# Cancel DCA
curl -s -X POST "https://api.jup.ag/recurring/v1/cancelOrder" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $JUPITER_API_KEY" \
  -d '{"payer": "YOUR_WALLET", "order": "ORDER_PUBLIC_KEY"}' | jq '.transaction'
```

---

## Portfolio API

```bash
# Full DeFi portfolio for a wallet (all positions across Jupiter protocols)
curl -H "x-api-key: $JUPITER_API_KEY" \
  "https://api.jup.ag/portfolio/v1/portfolio?wallet=YOUR_WALLET" | jq '{totalUsdValue, tokens, dca, trigger}'
```

---

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Bad request — invalid mint or params | Check mint addresses and field names |
| 401 | Unauthorized — missing or invalid API key | Check `JUPITER_API_KEY` and add `-H "x-api-key: $JUPITER_API_KEY"` |
| 404 | Order/token not found | Verify the order ID or mint exists |
| 429 | Rate limited | Wait 1s, retry with backoff |
| 5xx | Server error | Retry with exponential backoff |

---

## Funding a Solana Wallet with MoonPay

```bash
# Buy SOL for gas and trading
mp buy --token sol_solana --amount 0.5 --wallet <your-solana-address> --email <email>

# Buy USDC on Solana for DCA or limit orders
mp buy --token usdc_solana --amount 100 --wallet <your-solana-address> --email <email>

# Check balance
mp token balance list --wallet <your-solana-address> --chain solana
```

---

## Related Skills

- **moonpay-buy-crypto** — Fund your Solana wallet to trade on Jupiter
- **moonpay-check-wallet** — Check SOL/USDC balances before swapping
- **moonpay-swap-tokens** — Cross-chain swaps (non-Solana)
- **jupiter-lend** — Jupiter Lend protocol (deposit/borrow/repay)
