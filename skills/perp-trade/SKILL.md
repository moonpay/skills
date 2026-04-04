---
name: perp-trade
description: >
  Use this skill when the user wants to open, close, or manage a perpetual futures position, set up a TWAP, DCA, grid, or trailing-stop bot, or place a perp order on Hyperliquid, Pacifica, Lighter, or Aster.
tags: [perp, trade, order, twap, dca, grid, bot, hyperliquid, pacifica, lighter, aster]
---

# Perpetual Futures Trade Execution

Execute trades, manage positions, and run automated bots across Hyperliquid, Pacifica, Lighter, and Aster via the `perp` CLI.

## Prerequisites

- Install perp-cli: `npm install -g perp-cli`
- Run setup wizard: `perp setup` (configures private key + default exchange)
- Funded margin account on target exchange (deposit USDC via `perp funds deposit`)
- Verify setup: `perp account balance`

## Commands

```bash
# Account overview
perp account balance [-e <exchange>]
perp account positions [-e <exchange>]

# Pre-flight check before any trade
perp trade check <symbol> <side> <size>

# Market order
perp trade market <symbol> <buy|sell> <size> [-e <exchange>] [--leverage <N>]

# Shorthand
perp trade buy <symbol> <size>
perp trade sell <symbol> <size>

# Limit order
perp trade limit <symbol> <buy|sell> <price> <size>

# TWAP
perp trade twap <symbol> <buy|sell> <size> <duration>

# Stop / TP-SL
perp trade stop <symbol> <buy|sell> <size> <stopPrice>
perp trade tpsl <symbol> <buy|sell>

# Close position
perp trade close <symbol>
perp trade close-all

# Bots
perp bot quick-dca <symbol> <buy|sell> <amount> <interval>
perp bot grid <symbol>
perp bot trailing-stop <symbol>
perp bot quick-grid <symbol>

# Monitor live PnL
perp trade pnl-track
```

## Workflow

1. **Check account balance** — `perp account balance -e <exchange>`
2. **Run pre-flight check** — `perp trade check <symbol> <side> <size>` to validate margin, liquidation price, and slippage before executing
3. **Place order** — use `perp trade market` for immediate fills, `perp trade limit` for price targets, or `perp trade twap` for large orders
4. **Confirm position** — `perp account positions` to verify fill
5. **Set risk controls** — `perp trade tpsl <symbol> <side>` for take-profit/stop-loss

## Examples

```bash
# Check before buying
perp trade check BTC buy 1000 -e hyperliquid

# Market buy $1000 BTC on Hyperliquid at 5x leverage
perp trade buy BTC 1000 -e hyperliquid --leverage 5

# TWAP sell $10k ETH over 5 minutes on Pacifica
perp trade twap ETH sell 10000 5m -e pacifica

# Close BTC position
perp trade close BTC -e hyperliquid

# Start a DCA bot: buy $100 ETH every 60 seconds
perp bot quick-dca ETH buy 100 60

# Grid bot on SOL
perp bot quick-grid SOL -e hyperliquid
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Insufficient margin` | Account balance too low | `perp funds deposit` to add funds |
| `Leverage too high` | Exchange limit exceeded | Lower leverage with `perp trade leverage <symbol> <N>` |
| `Symbol not found` | Wrong ticker or exchange | Check `perp market --help` for available markets |

## Related Skills

- [perp-portfolio](../perp-portfolio/) — view positions and PnL across all exchanges
- [perp-arb](../perp-arb/) — scan and execute funding rate arbitrage
- [moonpay-check-wallet](../moonpay-check-wallet/) — check wallet balances before funding
