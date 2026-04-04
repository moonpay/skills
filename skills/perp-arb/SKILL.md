---
name: perp-arb
description: >
  Use this skill when the user asks to scan for funding rate arbitrage, find perp-perp or spot-perp arb, check funding rates across exchanges, or run a funding rate scout across Hyperliquid, Pacifica, Lighter, or Aster.
tags: [perp, arbitrage, funding-rate, hyperliquid, pacifica, lighter, aster, trading]
---

# Perpetual Futures Funding Rate Arbitrage

Scan for funding rate edge across Hyperliquid, Pacifica, Lighter, and Aster, and execute delta-neutral arbitrage positions via the `perp` CLI.

## Prerequisites

- Install perp-cli: `npm install -g perp-cli`
- Run setup wizard: `perp setup` (configures private key + default exchange)
- Funded margin accounts on at least two exchanges (for delta-neutral arb)
- Verify: `perp account balance -e hyperliquid && perp account balance -e pacifica`

## Commands

```bash
# Scan funding rates across all exchanges
perp arb scan

# Scan with live continuous monitoring
perp arb scan --live

# Execute arb: long on exchange A, short on exchange B
perp arb exec <symbol> <longExch> <shortExch> <sizeUsd>

# Auto-run arb daemon (finds and enters opportunities automatically)
perp arb auto

# Check open arb positions and PnL
perp arb status

# Close an arb position on both legs
perp arb close <symbol>

# View arb history and performance
perp arb history

# Rebalance capital across exchanges for arb
perp arb rebalance

# Delta-neutral funding rate farming (spot long + perp short)
perp bot delta-neutral

# Quick-start arb bot
perp bot quick-arb
```

## Workflow

1. **Scan rates** — `perp arb scan` to see current funding spreads across all exchanges
2. **Identify edge** — look for annualized spread > 5% after fees (shown in scan output)
3. **Verify liquidity** — confirm both legs have sufficient depth for your size
4. **Execute** — `perp arb exec <symbol> <longExch> <shortExch> <sizeUsd>` enters both legs simultaneously
5. **Monitor** — `perp arb status` shows open positions with real PnL and funding earned
6. **Close** — `perp arb close <symbol>` exits both legs when spread narrows

## Examples

```bash
# Scan all funding rates live
perp arb scan --live

# Execute BTC arb: long on Lighter, short on Hyperliquid, $5000 size
perp arb exec BTC lighter hyperliquid 5000

# Check open arb positions
perp arb status

# Auto arb daemon
perp arb auto

# Delta-neutral bot (spot long + perp short for funding yield)
perp bot delta-neutral
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Insufficient margin on <exchange>` | Not enough collateral | `perp funds deposit -e <exchange>` |
| `Liquidity too thin` | Order book too shallow for size | Reduce size or use `perp arb exec` with smaller `sizeUsd` |
| `Rate flipped negative` | Funding rate changed direction | Close with `perp arb close <symbol>` |

## Related Skills

- [perp-trade](../perp-trade/) — execute individual trades for each arb leg
- [perp-portfolio](../perp-portfolio/) — monitor all open positions and net exposure
