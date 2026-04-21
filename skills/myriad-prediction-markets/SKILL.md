---
name: myriad-prediction-markets
description: >
  AI trading agent for Myriad prediction markets on BNB Chain. Discover live
  markets, execute buy/sell trades, monitor portfolio exposure, claim winnings,
  and run as an MCP server for multi-agent workflows. Use when the user wants
  to trade prediction markets on BNB Chain, find market opportunities by
  keyword, or automate a trading + claims loop.
tags: [prediction-markets, trading, bnb-chain, mcp, defi]
---

# Myriad — AI Prediction Market Trading Agent

## Overview

Myriad CLI gives AI agents a full trading loop on Myriad prediction markets running on BNB Chain: discover markets, make decisions, execute trades, and claim winnings. Supports MCP server mode for multi-agent orchestration.

**Chain:** BNB Chain (chainId=56)
**Settlement token:** USDT / USD1
**Default slippage:** 0.05 (trades), 0.005 (swaps)

## Installation

```bash
npm i -g @myriadmarkets/cli
```

## Setup

```bash
# 1. Create and fund a MoonPay wallet (see Wallet section below)
# 2. Configure Myriad with your private key
myriad wallet setup        # interactive — encrypts key to file + OS keychain
# OR
export MYRIAD_PRIVATE_KEY="0x..."   # env var

# 3. Deposit funds
myriad wallet deposit
```

Config resolves in order: CLI flags → env vars / `.env` → `~/.config/myriad/config.json` → built-in defaults.

## Key Commands

### Markets

```bash
# List open markets sorted by volume
myriad markets list --state open --order volume --sort desc

# Filter by keyword
myriad markets list --keyword "bitcoin" --state open --limit 10

# JSON output for agent pipelines
myriad markets list --state open --json
```

### Trading

```bash
# Buy a position (dry-run first)
myriad trade buy --market-id 164 --outcome-id 0 --value 25 --dry-run
myriad trade buy --market-id 164 --outcome-id 0 --value 25

# Sell a position
myriad trade sell --market-id 164 --outcome-id 0 --value 25 --dry-run
myriad trade sell --market-id 164 --outcome-id 0 --value 25
```

**Always use `--dry-run` before write operations** — preview the transaction without execution.

### Portfolio & Wallet

```bash
# View open positions and exposure
myriad portfolio

# Check balances
myriad wallet balances

# Swap tokens (auto-runs when USDT balance is insufficient)
myriad swap
```

### Claims

```bash
# Sweep all resolved winning positions
myriad claim all
```

### MCP Server

```bash
# Run as MCP server for Claude Code / multi-agent orchestration
myriad mcp
```

MCP config for Claude Code (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "myriad": {
      "command": "myriad",
      "args": ["mcp"]
    }
  }
}
```

### Skills (Claude / OpenClaw)

```bash
# Install Myriad skills into Claude Code
myriad skills install --target claude
```

## Key Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview transaction without executing |
| `--json` | Machine-readable output for agent pipelines |
| `--keyword <term>` | Filter markets by topic |
| `--state <state>` | Filter by market status: `open`, `resolved`, etc. |
| `--order <field>` | Sort field (e.g. `volume`) |
| `--sort <dir>` | `asc` or `desc` |
| `--limit <n>` | Cap result count |

## Agent Patterns

### Event-Driven Trader
Spot a news catalyst → scan markets → stage trade:

```bash
myriad markets list --keyword "fed rate" --state open --json
# → review markets and odds
myriad trade buy --market-id <id> --outcome-id <id> --value 50 --dry-run
# → confirm looks right
myriad trade buy --market-id <id> --outcome-id <id> --value 50
```

### Portfolio Monitor
Check exposure before each trading cycle:

```bash
myriad portfolio
myriad wallet balances
```

### Winnings Sweeper
Automate claims on resolved markets:

```bash
myriad claim all
```

### Multi-Agent Desk
Run scout + execution agents via MCP:

```bash
myriad mcp   # Claude Code connects via MCP tools
```

## Wallet Management with MoonPay

Myriad trades on BNB Chain and settles in USDT. Use MoonPay to create a BNB Chain wallet, fund it, and export the key for Myriad.

```bash
npm install -g @moonpay/cli
mp login

# Create a dedicated trading wallet
mp wallet create --name "myriad-agent"
mp wallet retrieve --wallet "myriad-agent"   # note your BNB Chain address
```

### Fund with USDT on BNB Chain

```bash
# Buy USDT directly on BNB Chain
mp buy --token usdt_bsc --amount 100 --wallet <bnb-address> --email <email>

# Or bridge USDT from another chain
mp token bridge \
  --from-wallet myriad-agent --from-chain ethereum \
  --from-token 0xdac17f958d2ee523a2206206994597c13d831ec7 \
  --from-amount 100 \
  --to-chain bsc \
  --to-token 0x55d398326f99059ff775485246999027b3197955
```

### Export Key for Myriad

```bash
# ⚠️ Your private key gives full access to your wallet.
# Never share it, commit it to version control, or reuse it across services.
mp wallet export --wallet "myriad-agent"
# Copy EVM private key → use in myriad wallet setup or MYRIAD_PRIVATE_KEY
```

### Check Balance

```bash
mp token balance list --wallet <bnb-address> --chain bsc
```

### Withdraw Winnings to Bank

```bash
mp virtual-account offramp create \
  --amount 200 --chain bsc --wallet <bnb-address>
```

## End-to-End Workflow

1. `npm i -g @myriadmarkets/cli`
2. `mp wallet create --name "myriad-agent"`
3. `mp buy --token usdt_bsc --amount 100 --wallet <address> --email <email>`
4. `mp wallet export --wallet "myriad-agent"` → copy private key
5. `myriad wallet setup` → paste key (stored encrypted)
6. `myriad markets list --state open --order volume --sort desc`
7. `myriad trade buy --market-id <id> --outcome-id <id> --value 25 --dry-run`
8. `myriad trade buy --market-id <id> --outcome-id <id> --value 25`
9. `myriad claim all` — sweep resolved positions
10. `mp virtual-account offramp create` — withdraw winnings

## Resources

- **npm:** https://www.npmjs.com/package/@myriadmarkets/cli
- **API base:** https://api-v2.myriadprotocol.com/
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-prediction-market** — Polymarket and Kalshi trading (alternative platforms)
- **moonpay-check-wallet** — Verify BNB Chain balances before trading
- **moonpay-swap-tokens** — Swap tokens to USDT for Myriad trades
