---
name: perp-portfolio
description: >
  Use this skill when the user asks to view their perp portfolio, check positions across exchanges, see their perpetual futures balances, show open perp positions, check unrealized PnL, or get a multi-exchange perp summary across Hyperliquid, Pacifica, Lighter, or Aster.
tags: [perp, portfolio, positions, pnl, hyperliquid, pacifica, lighter, aster]
---

# Multi-Exchange Perpetual Futures Portfolio

View balances, open positions, PnL, and risk metrics across all configured perp exchanges via the `perp` CLI.

## Prerequisites

- Install perp-cli: `npm install -g perp-cli`
- Run setup wizard: `perp setup` (configures private key + default exchange)
- Verify: `perp account balance`

## Commands

```bash
# Cross-exchange portfolio overview (all exchanges)
perp portfolio

# Portfolio for specific exchanges only
perp portfolio --exchange hyperliquid,pacifica

# Account balance on one exchange
perp account balance [-e <exchange>]

# Open positions
perp account positions [-e <exchange>]

# PnL summary (realized + unrealized + funding)
perp account pnl [-e <exchange>]

# Open orders
perp account orders [-e <exchange>]

# Funding payment history
perp account funding-history [-e <exchange>]

# Live status dashboard: balances, positions, top arb opportunities
perp status

# Live PnL monitoring (real-time updates)
perp trade pnl-track
```

## Workflow

1. **Overview** — run `perp portfolio` for a full cross-exchange summary
2. **Drill into an exchange** — `perp account positions -e hyperliquid` for detailed positions
3. **Check PnL** — `perp account pnl` for realized + unrealized breakdown
4. **Monitor risk** — look for high margin utilization (>70%) and positions near liquidation in the output
5. **Live view** — `perp status` for a unified real-time dashboard

## Examples

```bash
# Full portfolio view across all exchanges
perp portfolio

# Hyperliquid positions only
perp account positions -e hyperliquid

# PnL breakdown
perp account pnl

# Funding payment history
perp account funding-history

# Live unified dashboard
perp status

# Real-time PnL tracking
perp trade pnl-track
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `No accounts configured` | Setup not run | Run `perp setup` |
| `Connection failed for <exchange>` | RPC/API issue | Check internet and retry; exchange may be down |
| `No positions found` | No open trades | Expected — account is flat |

## Related Skills

- [perp-trade](../perp-trade/) — open, close, and manage positions
- [perp-arb](../perp-arb/) — scan and execute funding rate arbitrage
