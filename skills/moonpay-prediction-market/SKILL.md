---
name: moonpay-prediction-market
description: Trade on prediction markets (Polymarket, Kalshi). Search markets, buy/sell positions, track PnL, and view trade history.
tags: [trading, prediction-market, polymarket, kalshi]
---

# Prediction markets

## Goal

Search prediction markets, buy and sell outcome shares, track positions and PnL.

Supports two providers:
- **Polymarket** — runs on Polygon (USDC.e). Requires an EVM wallet.
- **Kalshi** — runs on Solana (USDC). Requires a Solana wallet.

## Prerequisites

1. Authenticate: `mp login --email <email>` then `mp verify --email <email> --code <code>`
2. Have a local wallet: `mp wallet list` (create with `mp wallet create --name "main"` if needed)
3. Register your wallet with the provider (one-time setup):

```bash
# For Polymarket (use your EVM/Polygon address)
mp prediction-market user create --provider polymarket --wallet <evm-address>

# For Kalshi (use your Solana address)
mp prediction-market user create --provider kalshi --wallet <solana-address>
```

4. Fund the wallet — Polymarket needs USDC.e on Polygon, Kalshi needs USDC on Solana. See the **moonpay-fund-polymarket** or **moonpay-buy-crypto** skills.

## Browse and research markets

```bash
# Search markets by keyword
mp prediction-market market search --provider polymarket --query "bitcoin" --limit 10

# Get trending markets (sorted by 24h volume, min $150K)
mp prediction-market market trending list --provider polymarket --limit 10

# Browse market categories/tags
mp prediction-market market tag list --provider polymarket

# Filter markets by tag
mp prediction-market market search --provider polymarket --query "*" --tagIds "crypto,politics"

# Get full event details (all markets, outcomes, prices)
mp prediction-market market event retrieve --provider polymarket --slug <event-slug>

# Check current price for an outcome token
mp prediction-market market price retrieve --provider polymarket --tokenId <token-id>

# View price history for an outcome
mp prediction-market market price-history list --provider polymarket --tokenId <token-id> --interval 1w
```

## Buy and sell positions

```bash
# Buy shares of an outcome
mp prediction-market position buy \
  --wallet main \
  --provider polymarket \
  --tokenId <outcome-token-id> \
  --price 0.65 \
  --size 100

# Sell shares
mp prediction-market position sell \
  --wallet main \
  --provider polymarket \
  --tokenId <outcome-token-id> \
  --price 0.70 \
  --size 50
```

**Key concepts:**
- `tokenId` comes from `outcomeTokens[].tokenId` in market search results
- `price` is 0-1 (e.g., 0.65 = 65 cents per share, implies 65% probability)
- `size` is the number of shares
- Cost = price x size (e.g., 0.65 x 100 = $65 USDC)
- If the outcome resolves YES, each share pays $1. Profit = (1 - price) x size

## Track positions and performance

```bash
# View open positions
mp prediction-market position list --provider polymarket --wallet <address>

# View closed positions
mp prediction-market position list --provider polymarket --wallet <address> --status closed

# Get PnL summary
mp prediction-market pnl retrieve --provider polymarket --wallet <address>

# View trade history
mp prediction-market trade list --provider polymarket --wallet <address>

# View all activity (trades, splits, merges, redemptions)
mp prediction-market activity list --provider polymarket --wallet <address>
```

## Workflow

1. **Discover**: Search or browse trending markets.
2. **Research**: Get event details, check prices, review price history.
3. **Trade**: Buy shares on outcomes you believe are mispriced.
4. **Monitor**: Track positions and PnL.
5. **Exit**: Sell positions when your thesis changes, or wait for resolution.

## Example: trade a market

```bash
# 1. Find a market
mp prediction-market market search --provider polymarket --query "bitcoin 100k"

# 2. Get event details (note the outcomeTokens)
mp prediction-market market event retrieve --provider polymarket --slug <slug-from-search>

# 3. Check price history
mp prediction-market market price-history list --provider polymarket --tokenId <yes-token-id> --interval 1w

# 4. Buy 50 "Yes" shares at 40 cents
mp prediction-market position buy --wallet main --provider polymarket --tokenId <yes-token-id> --price 0.40 --size 50

# 5. Check your position
mp prediction-market position list --provider polymarket --wallet <address>

# 6. Sell later at a higher price
mp prediction-market position sell --wallet main --provider polymarket --tokenId <yes-token-id> --price 0.60 --size 50
```

## Price history intervals

| Interval | Description |
|----------|-------------|
| `1hr` | Last hour |
| `1d` | Last day |
| `1w` | Last week |
| `1m` | Last month |
| `max` | All time |

## Tips

- Use `mp -f json prediction-market ...` for programmatic output
- Markets with higher volume and liquidity have tighter spreads
- Check `acceptingOrders` — closed markets cannot be traded
- `negRisk` markets use a different settlement framework — the CLI handles this automatically
- Polymarket uses USDC.e on Polygon; Kalshi uses USDC on Solana

## Related skills

- **moonpay-fund-polymarket** — Fund your Polymarket wallet with USDC.e and POL
- **moonpay-check-wallet** — Check Polygon/Solana balances
- **moonpay-swap-tokens** — Bridge tokens to Polygon
- **moonpay-trading-automation** — Automate trading strategies
