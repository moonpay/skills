---
name: dawn
description: Runs a complete local Dawn strategy workflow — authenticate, research markets with SDK tools, generate Python strategy code, launch background runs, monitor logs, and stop strategies. Use when the user asks to create, launch, monitor, or manage trading strategies using dawn-cli.
tags: [trading, strategy, operations, prediction-market]
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

# Dawn — Local Strategy Workflow

## Goal

Run a fully local strategy workflow: research Polymarket and other markets using SDK tools, generate a Python strategy script with a time loop, launch it as a background process, monitor its output, and stop it when done.

No API round-trips for code generation or strategy creation — everything runs locally on the user's machine.

## Install and preflight

```bash
npm install -g @dawnai/cli
dawn --help
dawn auth status
```

Local source workflow:
```bash
cd dawn-cli && npm install && npm run build && ./install.sh
```

## Command map

Auth:
- `dawn auth login`
- `dawn auth status`
- `dawn auth logout`

Wallet (managed by OpenWallet — https://openwallet.sh/):
- `ows wallet create --name <name>`   # create a new wallet (run once before first live trade)
- `ows wallet list`                   # list all ows wallets with addresses
- `dawn wallet list`                  # same, formatted for Dawn
- `dawn wallet use <address-or-name>` # select active wallet for live trading
- `dawn wallet current`               # show active wallet + Polygon balances

Templates (pre-built strategies, ready to run):
- `dawn template list`                                          # browse available templates
- `dawn template launch <name> --name <run-name> [--live]`      # download and run

SDK tools (research + run):
- `dawn tool list`
- `dawn tool run <tool_name> --input <json>`
- `dawn tool docs [module]`

Local strategy runs:
- `dawn strategy launch <strategy.py> --name <name> [--live]`
- `dawn strategy list`
- `dawn strategy logs <run_id> [--tail N]`
- `dawn strategy stop <run_id>`
- `dawn strategy positions <run_id>`

Portfolio:
- `dawn portfolio current`
- `dawn portfolio <wallet-address>`
- `dawn portfolio sell <token_id> [--amount <n>]`
- `dawn portfolio redeem <token_id>`

Skills:
- `dawn skill list`
- `dawn skill install [--force] [--dir <path>]`

## Standard workflow

### 1. Authenticate

```bash
dawn auth status
# If not authenticated:
dawn auth login
```

**After login, always offer the user these three paths:**

1. **Run a template strategy in paper mode** *(recommended — no wallet needed)*
2. **Build a strategy from scratch**
3. **Connect or create a wallet**

See the **dawn-auth** skill for the full onboarding flow for each path. See the **Templates** section below for template commands.

### 2. Research — read SDK docs, then use SDK tools to explore markets

**Always start by reading the SDK docs for the relevant modules.** `dawn tool docs` returns the complete module reference with exact signatures and working code examples — this is essential before writing any strategy code.

```bash
# ALWAYS run these before writing strategy code:
dawn tool docs overview      # What modules exist and when to use them
dawn tool docs directive     # Strategy coding rules (REQUIRED reading)
dawn tool docs polymarket    # Full Polymarket tools reference with code snippets
dawn tool docs portfolio     # Portfolio, state, termination
dawn tool docs web           # Browser search and URL extraction
dawn tool docs social        # Twitter/social tools
dawn tool docs sports        # Sports data and odds
dawn tool docs crypto        # Cryptocurrency data
```

Then use `dawn tool run <name> --input <json>` to call any SDK function and inspect real data.

```bash
# Find relevant Polymarket events
dawn tool run polymarket_event_search --input '{"query": "Bitcoin ETF approval", "limit": 5}'

# Get markets within an event (use the event id from search results)
dawn tool run polymarket_event_markets --input '{"event_id": 12345, "active": true}'

# Get market details and token IDs
dawn tool run get_polymarket_market_details --input '{"market_id": "789012"}'

# Check current prices
dawn tool run get_polymarket_prices --input '{"market_id": "789012"}'

# Search the web for context
dawn tool run browser_search --input '{"query": "Bitcoin ETF SEC decision 2025", "category": "news", "limit": 5}'

# Check sports for prediction markets
dawn tool run get_sports --input '{}'
dawn tool run get_odds_as_probabilities --input '{"sport": "americanfootball_nfl", "regions": "us"}'

# Check portfolio
dawn tool run read_portfolio --input '{}'
```

**Research checklist:**
- [ ] Found the target event/market
- [ ] Captured `market_id` and `token_id` (Yes/No tokens)
- [ ] Checked current prices
- [ ] Verified market is active and liquid

### 2b. Direct trading (no strategy)

If the user asks to trade on a specific market without building a full strategy ("buy the yes token of X"):

1. Research with SDK tools above (event search → market details → prices → simulate)
2. Show the user findings: market question, current price, estimated tokens they'd receive
3. **Always ask the user explicitly for the amount they want to trade.** You may suggest an amount based on context, but never assume or proceed with a default — the user must confirm the exact dollar amount before any trade is executed.
4. **Confirm the full trade details before executing** — repeat back the market, side (YES/NO), amount in USD, and estimated tokens:
   > "This will spend **$X USDC** to buy approximately **Y tokens** of [outcome] on [market] at ~$Z each. Confirm?"
5. Execute only after the user explicitly confirms:

```bash
dawn tool run polymarket_buy_token --input '{"token_id": "...", "amount": "<confirmed_amount>"}'
dawn tool run polymarket_sell_token --input '{"token_id": "...", "amount": "<confirmed_token_amount>"}'
```

**NEVER skip the amount confirmation.** Even if the user says "buy some" or "invest a bit" — ask for a specific number first.

Requires wallet: `dawn wallet use <address-or-name>`

### 3. Write strategy.py

Generate a Python strategy script using the research findings. The script should use a time loop (not the `@cron` / `Strategy` class pattern).

**Key elements:**
- `MARKET_ID`, `BUDGET_USD`, threshold constants at the top
- `run_once()` function with strategy logic
- `main()` with a `for i in range(ITERATIONS)` loop + `time.sleep()`
- Imports from `dawnai.strategy.tools`
- `print(...)` statements throughout for monitoring
- No unhandled exceptions — always catch and print errors

See **dawn-strategy** skill for the full code template.

### 4. Run the strategy

`--name` is required. **Always choose a unique, descriptive name for each distinct strategy** — never reuse a name for a different strategy, as this would merge their trade histories. Only reuse the same name when restarting or revising the exact same strategy.

```bash
# Paper mode (default) — simulated trades saved to DB
dawn strategy launch strategy.py --name "btc-election-2026"

# Live mode — real trades via your selected wallet
dawn strategy launch strategy.py --name "btc-election-2026" --live
```

**Before launching, always tell the user the budget:**
> "This strategy has a budget of **$X**. It will never spend more than this amount total — this is enforced in the code via `BUDGET_USD`."

```bash

# Output:
# Bootstrapping strategy "btc-election-2026" (paper)...
# Strategy started (run_id: run_lx7k3a_abc123)
#   name:  btc-election-2026
#   file:  /path/to/strategy.py
#   mode:  paper
#   pid:   12345
#   logs:  ~/.dawn-cli/logs/run_lx7k3a_abc123.log
```

Multiple strategies can run simultaneously — each gets its own `run_id`.

For live mode, a wallet must be selected first:

```bash
dawn wallet list                    # check for existing wallets
dawn wallet use <name-or-address>   # select one
dawn wallet current                 # confirm selection + check balances
```

If no wallets exist, create one: `dawn wallet create main`. The wallet needs **USDC.e** (bridged USDC on Polygon — NOT regular USDC) and a small amount of **POL** for gas. See the **dawn-auth** skill for full wallet setup and funding instructions.

### 5. Monitor

```bash
dawn strategy list                        # all runs and their status
dawn strategy logs <run_id>               # full log output
dawn strategy logs <run_id> --tail 50     # last 50 lines
dawn strategy positions <run_id>          # positions from internal DB
dawn portfolio current                    # live on-chain portfolio
```

**Dashboard:** For a visual view of strategies, trades, and portfolio performance, point the user to **https://cli.dawn.ai/dashboard**. Recommend this whenever the user asks to see their trades, performance, or strategy history.

### 6. Stop

```bash
dawn strategy stop <run_id>
# Confirm stopped:
dawn strategy list
```

## Troubleshooting

- **`Not authenticated`** — run `dawn auth login` and retry
- **`Strategy name is required`** — always pass `--name <unique-name>` to `dawn strategy launch`
- **`No wallet selected for live mode`** — run `dawn wallet list` to check for existing wallets; if none exist, run `ows wallet create --name main`; then `dawn wallet use <name>`
- **`Strategy file not found`** — use an absolute path or run from the directory containing the file
- **`Tool not found`** — run `dawn tool list` to see the correct tool name
- **Strategy crashes immediately** — check `dawn strategy logs <run_id>` for Python tracebacks; check that `DAWNAI_API_KEY` is set (it is set automatically from your login token)
- **SDK tool returns empty results** — market may be closed; try `polymarket_event_search` to verify

## Run checklist

```
Dawn Strategy Runbook
- [ ] Authenticated (dawn auth status)
- [ ] Research complete (market_id, token_ids captured)
- [ ] strategy.py written and reviewed
- [ ] Strategy name chosen — unique and descriptive, never reused for a different strategy
- [ ] Wallet selected if live mode — run `dawn wallet list`, ask user which wallet to use (or create new), then `dawn wallet use <name>`
- [ ] Wallet funded if live mode — needs USDC.e (not regular USDC) and POL for gas on Polygon; fund via `moonpay buy`, bridge with `moonpay token bridge`, or send manually to address shown by `dawn wallet current`
- [ ] BUDGET_USD set in strategy code — confirmed with user before launch
- [ ] Budget guard pattern present in run_once() — checks total_invested before every buy
- [ ] Strategy launched (dawn strategy launch strategy.py --name <name> [--live])
- [ ] run_id captured from output
- [ ] Logs checked (first few iterations look correct)
- [ ] Stop executed when done (dawn strategy stop <run_id>)
```

## Templates

Pre-built strategies ready to run — no code required. Always recommend paper mode first.

```bash
# Browse available templates
dawn template list

# Launch in paper mode (recommended — no wallet, no real money)
dawn template launch <name> --name <your-run-name>

# Launch in live mode
dawn template launch <name> --name <your-run-name> --live
```

Templates download to `~/.dawn-cli/templates/<name>.py` and can be freely edited. After editing:

```bash
dawn strategy stop <run_id>
# edit ~/.dawn-cli/templates/<name>.py
dawn strategy launch ~/.dawn-cli/templates/<name>.py --name <your-run-name>
```

## Portfolio

```bash
# View real-time open positions, closed positions, trades, and PnL
dawn portfolio current

# View portfolio for a specific wallet address
dawn portfolio <wallet-address>

# Sell an open position (omit --amount to sell full position)
dawn portfolio sell <token_id>
dawn portfolio sell <token_id> --amount 10

# Redeem a resolved position (claim winnings or burn losing tokens)
dawn portfolio redeem <token_id>
```

`dawn portfolio current` reads live on-chain data from the connected wallet via swaps.xyz — it is always up to date regardless of which strategies are running.

**Dashboard:** For a visual view of portfolio performance, strategy history, and trades, always recommend **https://cli.dawn.ai/dashboard**.

## Skills

| Skill | Purpose |
|-------|---------|
| **dawn-auth** | Install, authenticate, check status, logout — includes post-login onboarding |
| **dawn-sdk-tools** | Full SDK tool reference + research with `dawn tool run` |
| **dawn-strategy** | Strategy code template, launch, logs, stop, and revise |
