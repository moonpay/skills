---
name: dune
description: >
  Blockchain analytics for AI agents via Dune CLI. Run DuneSQL queries against
  live on-chain data, discover decoded datasets, and monitor credit usage. Pair
  with MoonPay to query, fund, and act on wallets the agent monitors. Use when
  the user wants on-chain data, transaction history, DeFi analytics, or to
  query a wallet address against Ethereum/Polygon/Arbitrum data.
tags: [analytics, on-chain, sql, ethereum, defi]
---

# Dune — Blockchain Analytics for AI Agents

## Overview

Dune CLI gives AI agents direct access to Dune Analytics — execute DuneSQL queries, discover decoded on-chain datasets, and monitor credit usage. Pair with MoonPay to create and fund wallets, then query their on-chain history and act on findings with bridges, swaps, or transfers.

**Supported platforms:** macOS, Linux, Windows (auto-installs on first use)

## Prerequisites

```bash
# 1. Get a Dune API key
# Sign up at https://dune.com → Settings → API Keys → Create new key

# 2. Set your key (pick one)
export DUNE_API_KEY="your-api-key"   # env var
dune auth                             # interactive save to ~/.config/dune/config.yaml

# 3. Install MoonPay CLI
npm install -g @moonpay/cli
mp login
```

Key resolution order: `--api-key` flag → `$DUNE_API_KEY` → `~/.config/dune/config.yaml`

## Key Commands

| Command | Description |
|---------|-------------|
| `dune query run-sql "<sql>"` | Execute ad-hoc DuneSQL |
| `dune query run <query-id>` | Run a saved query |
| `dune query get <query-id>` | Fetch results of a previous run |
| `dune query create` | Create a new saved query |
| `dune query update <id>` | Update an existing query |
| `dune query archive <id>` | Archive a query |
| `dune dataset search <term>` | Discover datasets by keyword |
| `dune dataset search-by-contract <addr>` | Find decoded tables for a contract |
| `dune execution results` | Retrieve previous execution results |
| `dune usage` | Check credit consumption |

**Always use `-o json`** for agent pipelines — returns full machine-readable API response:

```bash
dune query run-sql "SELECT * FROM ethereum.transactions LIMIT 10" -o json
```

## Core Workflows

### Run an Ad-Hoc Query

```bash
dune query run-sql "
  SELECT block_time, hash, value/1e18 as eth_value, \"to\", \"from\"
  FROM ethereum.transactions
  ORDER BY block_time DESC
  LIMIT 20
" -o json
```

### Query a MoonPay Wallet's On-Chain History

```bash
# Get your wallet address
WALLET=$(mp wallet retrieve --wallet "dune-agent-wallet" --json | jq -r '.addresses.ethereum')

# Query all recent transactions for that wallet
dune query run-sql "
  SELECT block_time, hash, value/1e18 as eth, \"to\", \"from\"
  FROM ethereum.transactions
  WHERE lower(\"from\") = lower('$WALLET')
     OR lower(\"to\") = lower('$WALLET')
  ORDER BY block_time DESC
  LIMIT 50
" -o json
```

### Discover Datasets

```bash
# Find tables for a DeFi protocol
dune dataset search "uniswap v3 swaps"

# Find decoded events for a specific contract
dune dataset search-by-contract 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984

# Monitor credit usage
dune usage
```

### Python Integration

```python
import subprocess, json, os

def run_dune(sql: str) -> list:
    result = subprocess.run(
        ["dune", "query", "run-sql", sql, "-o", "json"],
        env={**os.environ, "DUNE_API_KEY": os.environ["DUNE_API_KEY"]},
        capture_output=True, text=True
    )
    return json.loads(result.stdout).get("rows", [])

# Monitor a wallet's recent activity
wallet = "<your-wallet-address>"
txs = run_dune(f"""
    SELECT block_time, hash, value / 1e18 as eth_value, "to", "from"
    FROM ethereum.transactions
    WHERE lower("from") = lower('{wallet}')
       OR lower("to") = lower('{wallet}')
    ORDER BY block_time DESC
    LIMIT 20
""")

for tx in txs:
    print(f"{tx['block_time']} | {tx['eth_value']:.4f} ETH | {tx['hash'][:12]}...")
```

## Wallet Setup with MoonPay

```bash
# Create a wallet to monitor and act on
mp wallet create --name "dune-agent-wallet"
mp wallet retrieve --wallet "dune-agent-wallet"
# Note your Ethereum address for Dune queries

# Sign messages
mp message sign --wallet "dune-agent-wallet" --chain ethereum --message "I own this wallet"

# Send a transaction (e.g. triggered by Dune analysis)
mp transaction send \
  --wallet "dune-agent-wallet" \
  --chain ethereum \
  --transaction <unsigned-tx>

# Hardware wallet for high-value positions
mp wallet add-ledger --name "dune-ledger"
```

## Funding Your Wallet

### Buy with Fiat

```bash
mp buy --token eth_ethereum --amount 0.1 --wallet <eth-address> --email <email>
```

### Bridge Cross-Chain (Follow the Data)

Move assets to where your Dune analysis reveals the opportunity:

```bash
# ETH → Arbitrum
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.05 \
  --to-chain arbitrum \
  --to-token 0x0000000000000000000000000000000000000000

# USDC → Polygon
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

Bridge times: 5–20 seconds.

### Bank Transfer (Large Positions)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 5000 --currency usd --chain ethereum --wallet <eth-address>
```

### Deposit Link (Permissionless)

```bash
mp deposit create \
  --name "Dune Agent Wallet" \
  --wallet <eth-address> \
  --chain ethereum --token USDC
```

### Check Balances / Withdraw

```bash
mp token balance list --wallet <eth-address> --chain ethereum
mp virtual-account offramp create --amount 1000 --chain ethereum --wallet <eth-address>
```

## End-to-End Workflow

1. Get Dune API key → https://dune.com → Settings → API Keys
2. `export DUNE_API_KEY="..."` or `dune auth`
3. `mp wallet create --name "dune-agent-wallet"`
4. `mp buy --token eth_ethereum --amount 0.1 --wallet <address> --email <email>`
5. Query wallet on-chain history: `dune query run-sql "... WHERE lower(\"from\") = lower('$WALLET')" -o json`
6. Discover protocol tables: `dune dataset search "<protocol>"`
7. Monitor credit usage: `dune usage`
8. Act on findings: `mp token bridge` / `mp token swap` / `mp transaction send`

## Notes

- Visualization creation and table size analysis are only available via the Dune web UI or MCP server, not the CLI
- Dune CLI auto-installs on first use — no manual install step needed

## Resources

- **Dune Analytics:** https://dune.com
- **API docs:** https://docs.dune.com
- **DuneSQL reference:** https://docs.dune.com/query-engine/Functions-and-operators
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Quick balance check before acting on Dune findings
- **moonpay-swap-tokens** — Swap tokens surfaced by on-chain analysis
- **moonpay-trading-automation** — Schedule recurring Dune queries + action triggers
- **yield** — Deposit into yield pools discovered via Dune DeFi analytics
