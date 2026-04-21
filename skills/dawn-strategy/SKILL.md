---
name: dawn-strategy
description: Write and run local trading strategies. Covers the strategy code format, launching background runs, viewing logs, stopping, and revising strategies.
tags: [strategy, run, local]
metadata:
  openclaw:
    emoji: "🌅"
    homepage: https://dawn.ai
    requires:
      bins: [dawn]
    install:
      - kind: node
        package: "@dawnai/cli"
        bins: [dawn]
---

# Strategy — Write, Run, Stop, Revise

## Overview

Strategies are plain Python scripts that:
1. Import SDK tools from `dawnai.strategy.tools`
2. Define trading logic in a `run_once()` function
3. Loop on a time interval (e.g. every 5 minutes for 1 hour)

`dawn strategy launch strategy.py --name <name>` launches the script as a **background process**, prints a `run_id`, and returns immediately. Multiple strategies can run in parallel.

**`--name` is required** and should be unique per strategy. Reusing the same name + mode reuses the same strategy record (trade history preserved) — only do this when restarting or revising the same strategy. Never reuse a name for a different strategy.

---

## ALWAYS read SDK docs before writing strategy code

```bash
dawn tool docs directive     # Strategy coding rules — read this first
dawn tool docs overview      # Module overview and when to use each
dawn tool docs polymarket    # Polymarket tools with code patterns
dawn tool docs portfolio     # Portfolio, get_state/set_state, terminate_strategy
dawn tool docs web           # Browser search, URL extraction
```

---

## Strategy code template

```python
import sys
import time
from decimal import Decimal

from dawnai.strategy.tools import (
    get_polymarket_market_details,
    get_polymarket_prices,
    polymarket_buy_token,
    polymarket_sell_token,
    read_portfolio,
    get_state,
    set_state,
    terminate_strategy,
)

# ── Configuration ─────────────────────────────────────────────────────────────
MARKET_ID = "123456"
BUDGET_USD = Decimal("100")   # HARD LIMIT — strategy will NEVER spend more than this total
TAKE_PROFIT_PCT = Decimal("10")
STOP_LOSS_PCT = Decimal("-10")

HOURS = 1
INTERVAL_MINUTES = 5
ITERATIONS = int((HOURS * 60) / INTERVAL_MINUTES)

# ── Strategy logic ─────────────────────────────────────────────────────────────

def run_once() -> None:
    """Execute one iteration of the strategy."""
    print("Checking market conditions...")

    # Budget guard — ALWAYS check before buying
    total_invested = Decimal(str(get_state("total_invested") or "0"))
    remaining_budget = BUDGET_USD - total_invested
    print(f"Budget: ${total_invested} spent / ${BUDGET_USD} total (${remaining_budget} remaining)")

    # Get or cache the token ID
    yes_token_id: str | None = get_state("yes_token_id")
    if yes_token_id is None:
        market = get_polymarket_market_details(MARKET_ID)
        if market is None:
            print(f"[Error] Market {MARKET_ID} not found")
            return
        yes_token = next((t for t in (market.tokens or []) if t.outcome.lower() == "yes"), None)
        if yes_token is None:
            print(f"[Error] No Yes token found for market {MARKET_ID}")
            return
        yes_token_id = yes_token.id
        set_state("yes_token_id", yes_token_id)
        print(f"Cached Yes token: {yes_token_id}")

    # Read portfolio
    portfolio = read_portfolio()
    position = next(
        (p for p in portfolio.wallet.positions if p.token_id == yes_token_id),
        None,
    )

    if position is None or position.amount == Decimal("0"):
        if remaining_budget < Decimal("1"):
            print(f"Budget exhausted (${total_invested}/${BUDGET_USD}). Holding.")
            return
        buy_amount = min(BUDGET_USD, remaining_budget)
        print(f"No position found. Buying ${buy_amount} of Yes token...")
        result = polymarket_buy_token(yes_token_id, buy_amount)
        if not result.result.success:
            print(f"[Error] Buy failed: {result.error}")
            return
        usd_spent = Decimal(str(result.result.executed_amount)) * Decimal(str(result.result.executed_price))
        set_state("total_invested", str(total_invested + usd_spent))
        print(f"Bought {result.result.executed_amount} tokens at {result.result.executed_price} (${usd_spent:.2f} spent)")

    else:
        pnl_pct = position.pnl_percent
        print(f"Position: {position.amount} tokens | PnL: {pnl_pct:.1f}%")

        if pnl_pct >= TAKE_PROFIT_PCT or pnl_pct <= STOP_LOSS_PCT:
            action = "Take profit" if pnl_pct >= TAKE_PROFIT_PCT else "Stop loss"
            print(f"{action} triggered at {pnl_pct:.1f}%. Selling...")
            sell_result = polymarket_sell_token(yes_token_id, position.amount)
            if not sell_result.result.success:
                print(f"[Error] Sell failed: {sell_result.error}")
                return
            print(f"Sold {sell_result.result.executed_amount} tokens. Terminating.")
            terminate_strategy()
            sys.exit(0)
        else:
            print(f"Holding position (threshold not hit)")


# ── Main loop ──────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"Strategy starting: {ITERATIONS} iterations every {INTERVAL_MINUTES}m over {HOURS}h")
    print(f"Market: {MARKET_ID} | Budget: ${BUDGET_USD} (hard limit)")

    for i in range(ITERATIONS):
        print(f"\n=== Iteration {i + 1}/{ITERATIONS} ===")
        try:
            run_once()
        except KeyboardInterrupt:
            print("\nStrategy interrupted by user.")
            sys.exit(0)
        except Exception as e:
            print(f"[Error] Unexpected error in iteration {i + 1}: {e}")

        if i < ITERATIONS - 1:
            print(f"Sleeping {INTERVAL_MINUTES}m until next iteration...")
            time.sleep(INTERVAL_MINUTES * 60)

    print("\nStrategy completed all iterations.")
    terminate_strategy()


if __name__ == "__main__":
    main()
```

---

## Launch

```bash
# Paper mode (default) — $1,000 simulated budget, trades tracked in DB
dawn strategy launch strategy.py --name "btc-election-2026"

# Live mode — real trades using your selected wallet
dawn strategy launch strategy.py --name "btc-election-2026" --live
```

**Before launching, always tell the user the budget:**
> "This strategy has a budget of **$X**. It will never spend more than this amount total."

Live mode requires a wallet: `dawn wallet use <address-or-name>`

### Budget enforcement

`BUDGET_USD` in the strategy code is the **only** spending cap — there is no server-side limit.

Required pattern (include in every strategy):

```python
BUDGET_USD = Decimal("100")

def run_once():
    total_invested = Decimal(str(get_state("total_invested") or "0"))
    remaining_budget = BUDGET_USD - total_invested
    if remaining_budget <= Decimal("1"):
        print(f"Budget exhausted. Holding.")
        return

    buy_amount = min(desired_buy_amount, remaining_budget)
    result = polymarket_buy_token(token_id, buy_amount)
    if result.result.success:
        usd_spent = Decimal(str(result.result.executed_amount)) * Decimal(str(result.result.executed_price))
        set_state("total_invested", str(total_invested + usd_spent))
```

---

## Manage runs

```bash
# List all runs (run_id, name, mode, status, pid)
dawn strategy list

# View full logs
dawn strategy logs <run_id>

# View last N lines
dawn strategy logs <run_id> --tail 50

# Stop a running strategy (sends SIGTERM)
dawn strategy stop <run_id>

# Positions for a specific run (from internal DB)
dawn strategy positions <run_id>

# Real-time live portfolio (from wallet via swaps.xyz — no run_id needed)
dawn portfolio current
```

### Stopping

1. Find the run: `dawn strategy list` — confirm it shows `running`
2. Stop it: `dawn strategy stop <run_id>`
3. Verify: `dawn strategy list` — confirm status is `stopped`

**Notes:**
- Stopping sends `SIGTERM` — the Python script receives `KeyboardInterrupt` if it handles signals
- Stopping does **not** liquidate open positions — to auto-liquidate on exit, include `terminate_strategy(should_liquidate=True)` in the strategy code's exit path
- Log files remain at `~/.dawn-cli/logs/<run_id>.log` after stopping

**Troubleshooting stops:**
- **`Run not found`** — use `dawn strategy list` to find the correct `run_id`
- **Run already stopped** — the strategy may have finished naturally or hit `terminate_strategy()`
- **Still shows `running` after stop** — wait a moment and re-check

---

## Revise a strategy

Revision = edit `strategy.py`, stop the old run, re-launch with the same name.

```bash
# 1. Find the current run (if needed)
dawn strategy list

# 2. Stop it
dawn strategy stop <run_id>

# 3. Edit strategy.py — update constants, logic, thresholds, imports

# 4. Re-launch with the same name (continues trade history under same record)
dawn strategy launch strategy.py --name "btc-election-2026"

# 5. Monitor the new run
dawn strategy logs <new_run_id> --tail 20
```

### Common revisions

**Change timing:**
```python
HOURS = 4
INTERVAL_MINUTES = 15
ITERATIONS = int((HOURS * 60) / INTERVAL_MINUTES)
```

**Adjust thresholds:**
```python
TAKE_PROFIT_PCT = Decimal("20")
STOP_LOSS_PCT = Decimal("-5")
```

**Switch market:**
```python
MARKET_ID = "654321"
# Also clear cached state — remove get_state("yes_token_id") or let it re-cache
```

**Add a signal source:**
```python
from dawnai.strategy.tools import browser_search, classify_text

def check_sentiment() -> str:
    results = browser_search(query="Bitcoin ETF news today", category="news", limit=5)
    headlines = " ".join(r.title for r in results.results[:3])
    result = classify_text(
        text=headlines,
        categories=["bullish", "bearish", "neutral"],
        question="What is the overall sentiment for Bitcoin?"
    )
    return result.category
```

**Research a new market before revising:**
```bash
dawn tool run polymarket_event_search --input '{"query": "new topic", "limit": 5}'
dawn tool run get_polymarket_market_details --input '{"market_id": "654321"}'
```

**Notes:**
- `get_state`/`set_state` persists across runs — cached token IDs from a prior run remain valid unless the market changed
- Each `dawn strategy launch` gets a new `run_id`; old logs remain at `~/.dawn-cli/logs/<old_run_id>.log`
- **Never reuse a name for a different strategy** — this merges unrelated trade histories

---

## Code guidelines

**Add print statements** — they're your only visibility into a background process:
```python
def run_once():
    print("Step 1: Reading portfolio...")
    portfolio = read_portfolio()
    print(f"  Balance: ${portfolio.wallet.current_balance}")
```

**Never raise exceptions** — catch errors and continue:
```python
try:
    result = polymarket_buy_token(token_id, amount)
    if not result.result.success:
        print(f"[Error] Buy failed: {result.error}")
        return
except Exception as e:
    print(f"[Error] Trade error: {e}")
    return
```

**Cache token IDs** to avoid redundant API calls:
```python
token_id = get_state("yes_token_id")
if token_id is None:
    market = get_polymarket_market_details(MARKET_ID)
    token_id = next(t.id for t in market.tokens if t.outcome.lower() == "yes")
    set_state("yes_token_id", token_id)
```

**Timing reference:**

| Goal | HOURS | INTERVAL_MINUTES | ITERATIONS |
|------|-------|-----------------|------------|
| 1 hour, every 5 min | 1 | 5 | 12 |
| 24 hours, every 30 min | 24 | 30 | 48 |
| 4 hours, every 15 min | 4 | 15 | 16 |

---

## Related skills

- **dawn-sdk-tools** — Full SDK tool reference and research commands
- **dawn-auth** — Authentication setup
