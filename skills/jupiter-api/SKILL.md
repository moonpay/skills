---
name: jupiter-api
description: >
  Jupiter DEX aggregator on Solana — swap tokens (Ultra Swap), get prices, set limit orders (Trigger), run DCA/recurring buys, track portfolio, explore token metadata, and more. Use when user asks to swap on Solana, get SOL/SPL token prices, set limit orders, automate DCA, or access Jupiter APIs. No API key required for most endpoints.
tags: [jupiter, solana, swap, dex, defi, prices, limit-orders, dca]
---

# Jupiter API

Jupiter is the #1 DEX aggregator on Solana — $2T+ volume, 500+ integrations. All operations use REST APIs via `curl`. No API key required for most endpoints.

## Prerequisites

- `curl` and `jq` installed
- A funded Solana wallet (for executing swaps/orders)
- For signing transactions: Solana CLI (`sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`) or your preferred wallet

**Base URLs:**

| API | Base URL |
|-----|----------|
| Ultra Swap | `https://api.jup.ag/ultra/v1` |
| Price | `https://api.jup.ag/price/v2` |
| Token | `https://api.jup.ag/tokens/v1` |
| Trigger (limit orders) | `https://api.jup.ag/trigger/v1` |
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

## Ultra Swap (Best Route Swap)

Ultra Swap automatically finds the best route, handles MEV protection, and supports gasless transactions.

### Get a Swap Order

```bash
# Quote + unsigned transaction in one call
curl "https://api.jup.ag/ultra/v1/order?\
inputMint=So11111111111111111111111111111111111111112\
&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\
&amount=100000000\
&taker=YOUR_WALLET_ADDRESS" | jq '{inAmount, outAmount, swapTransaction}'
```

`amount` is in lamports (1 SOL = 1,000,000,000 lamports) or token base units.

### Execute the Swap

```bash
# 1. Get order
ORDER=$(curl -s "https://api.jup.ag/ultra/v1/order?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&taker=YOUR_WALLET")

# 2. Sign the swapTransaction with your wallet (e.g. Solana CLI)
# solana sign-offchain-message or use your wallet's signing flow

# 3. Submit
curl -X POST "https://api.jup.ag/ultra/v1/execute" \
  -H "Content-Type: application/json" \
  -d "{\"signedTransaction\": \"<base64-signed-tx>\", \"requestId\": $(echo $ORDER | jq '.requestId')}"
```

### Check Token Security & Holdings

```bash
# Token security alerts for an asset
curl "https://api.jup.ag/ultra/v1/search?query=BONK" | jq '.[] | {symbol, mint, organicScore}'

# Wallet holdings
curl "https://api.jup.ag/ultra/v1/balances/YOUR_WALLET" | jq '.tokens[] | {symbol, balance, usdValue}'
```

---

## Price API

```bash
# Single token price
curl "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112" | jq '.data'

# Multiple tokens
curl "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" | jq '.data'

# With buy/sell prices
curl "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112&showExtraInfo=true" | jq '.data'
```

---

## Token API

```bash
# Token metadata by mint
curl "https://api.jup.ag/tokens/v1/token/So11111111111111111111111111111111111111112" | jq '{symbol, name, decimals, organicScore}'

# Search tokens
curl "https://api.jup.ag/tokens/v1/search?query=bonk&limit=5" | jq '.[] | {symbol, mint, organicScore}'

# List tradeable tokens (paginated)
curl "https://api.jup.ag/tokens/v1/mints/tradable?limit=20" | jq '.[].address'
```

---

## Trigger API (Limit Orders)

Place conditional orders that execute when price conditions are met.

```bash
# Create a limit order (buy 1 SOL worth of USDC when SOL >= $200)
curl -X POST "https://api.jup.ag/trigger/v1/createOrder" \
  -H "Content-Type: application/json" \
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
curl "https://api.jup.ag/trigger/v1/orders?wallet=YOUR_WALLET&status=open" | jq '.orders[] | {orderId, inputMint, outputMint, makingAmount, takingAmount}'

# Cancel an order
curl -X POST "https://api.jup.ag/trigger/v1/cancelOrder" \
  -H "Content-Type: application/json" \
  -d '{"maker": "YOUR_WALLET", "order": "ORDER_PUBLIC_KEY"}' | jq '.transaction'
```

> Sign and submit the returned `transaction` with your Solana wallet to finalize.

---

## Recurring API (DCA)

Dollar-cost average into any token on a schedule.

```bash
# Create a DCA order (buy $10 USDC of SOL every day for 30 days)
curl -X POST "https://api.jup.ag/recurring/v1/createOrder" \
  -H "Content-Type: application/json" \
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
curl "https://api.jup.ag/recurring/v1/orders?wallet=YOUR_WALLET&status=active" | jq '.orders[] | {orderId, inputMint, outputMint, status}'

# Cancel DCA
curl -X POST "https://api.jup.ag/recurring/v1/cancelOrder" \
  -H "Content-Type: application/json" \
  -d '{"payer": "YOUR_WALLET", "order": "ORDER_PUBLIC_KEY"}' | jq '.transaction'
```

---

## Portfolio API

```bash
# Full DeFi portfolio for a wallet (all positions across Jupiter protocols)
curl "https://api.jup.ag/portfolio/v1/portfolio?wallet=YOUR_WALLET" | jq '{totalUsdValue, tokens, dca, trigger}'
```

---

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Bad request — invalid mint or params | Check mint addresses and field names |
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
