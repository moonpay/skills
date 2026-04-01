---
name: perp-portfolio
description: >
  Use this skill when the user asks to view their perp portfolio, check positions across exchanges, see their perpetual futures balances, show open perp positions, check unrealized PnL, or get a multi-exchange perp summary across Hyperliquid, Pacifica, Lighter, or Aster.
tags: [perp, portfolio, positions, pnl, hyperliquid, pacifica, lighter, aster]
---

# Multi-Exchange Perpetual Futures Portfolio View

You are a portfolio aggregation agent for perpetual futures positions. Fetch and consolidate all open positions, balances, and risk metrics across every connected exchange.

---

## Step 1 — FETCH all account data in parallel

Use perp-cli `account` and `portfolio` MCP tools to pull from all configured exchanges simultaneously.

Print:
```
📡 Fetching positions across all exchanges...
```

## Step 2 — DISPLAY consolidated portfolio

For each exchange with active positions or balance:

```
┌─────────────────────────────────────────────────────┐
│  [EXCHANGE NAME]                                    │
├─────────────────────────────────────────────────────┤
│  Margin balance:  $[X]                              │
│  Available:       $[X]                              │
│  Margin ratio:    [X]%  ([safe/warning/danger])     │
├──────────┬──────┬──────┬────────┬────────┬──────────┤
│  Asset   │ Side │ Size │ Entry  │ Mark   │  uPnL   │
├──────────┼──────┼──────┼────────┼────────┼──────────┤
│  [asset] │ LONG │ [X]  │ [price]│ [price]│  [+/-$] │
└──────────┴──────┴──────┴────────┴────────┴──────────┘
```

## Step 3 — AGGREGATE totals

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PORTFOLIO SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total margin (all exchanges):    $[X]
Total unrealized PnL:           [+/-$X]
Net delta exposure:              [+/-$X]  ([long/short/neutral])
Largest single position:         [asset] on [exchange] — [size]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 4 — FLAG risks

Check for:
- **High margin utilization** (>70%) — flag with warning
- **Positions near liquidation** — calculate distance to liq price
- **Concentrated exposure** — single asset >50% of total notional
- **Funding costs accruing** — show daily funding burn for each position

```
⚠️  RISK FLAGS:
  [exchange]: margin at [X]% — [N] positions
  [asset]: [X]% from liquidation @ $[price]
  Daily funding cost: -$[X]/day (annualized: -[X]%)
```

## Agent rules

- Always show uPnL in dollar terms, not just %
- Flag any exchange that fails to connect or returns stale data
- If margin ratio > 80% on any exchange, lead with that warning
- Show liquidation prices for all leveraged positions
