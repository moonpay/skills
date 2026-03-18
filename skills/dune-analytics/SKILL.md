---
name: dune-analytics
description: >
  Blockchain analytics via Dune CLI — run DuneSQL queries against live on-chain data, discover decoded contract tables, search datasets by keyword or contract address, and monitor credit usage. Pair with MoonPay to create and fund the wallets you analyze, and move assets informed by your findings.
tags: [blockchain, analytics, dune, on-chain, data, defi, sql]
---

# Dune Analytics

Query live on-chain data with the Dune CLI — a command-line interface for [Dune Analytics](https://dune.com). Run DuneSQL, discover datasets, and monitor credit usage. Pair with MoonPay to manage the wallets you analyze.

## Setup

### Get a Dune API Key

1. Sign up at https://dune.com
2. Go to **Settings → API Keys → Create new key**

```bash
# Set for current session
export DUNE_API_KEY="your-api-key"

# Or save permanently (prompted from stdin)
dune auth
```

**Key priority order:** `--api-key` flag → `$DUNE_API_KEY` env var → `~/.config/dune/config.yaml`

The Dune CLI auto-installs on first use — just run any `dune` command.

---

## Key Commands

| Command | Description |
|---------|-------------|
| `dune query run-sql --sql "<sql>"` | Execute raw DuneSQL directly |
| `dune query run <id>` | Execute a saved query |
| `dune query get <id>` | Fetch a saved query's SQL and metadata |
| `dune query create` | Create a new saved query |
| `dune query update <id>` | Update an existing query |
| `dune query archive <id>` | Archive a saved query |
| `dune execution results <id>` | Fetch results of a previous execution |
| `dune dataset search --query "<term>"` | Discover datasets by keyword |
| `dune dataset search-by-contract --contract-address <addr>` | Find decoded tables for a contract |
| `dune docs search --query "<term>"` | Search Dune documentation |
| `dune usage` | Check credit consumption |
| `dune auth` | Save API key to config |

> **Always use `-o json`** — JSON output contains more detail than `text` and is unambiguous to parse.

---

## Common Workflows

### Ad-hoc SQL

```bash
dune query run-sql --sql "
  SELECT block_time, hash, value / 1e18 AS eth_value, \"to\", \"from\"
  FROM ethereum.transactions
  WHERE lower(\"from\") = lower('0xYOUR_WALLET')
     OR lower(\"to\")   = lower('0xYOUR_WALLET')
  ORDER BY block_time DESC
  LIMIT 20
" -o json
```

### Discover Tables, Then Query

```bash
# Find relevant tables with column schemas
dune dataset search --query "uniswap v3 swaps" --categories decoded --include-schema -o json

# Query the discovered table
dune query run-sql --sql "SELECT * FROM uniswap_v3_ethereum.evt_Swap LIMIT 10" -o json
```

### Find Tables for a Specific Contract

```bash
dune dataset search-by-contract \
  --contract-address 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 \
  --include-schema -o json
```

### Save a Reusable Parameterized Query

```bash
# Create with parameters
dune query create \
  --name "Wallet Activity" \
  --sql "SELECT block_time, hash, value/1e18 AS eth
         FROM ethereum.transactions
         WHERE lower(\"from\") = lower('{{wallet}}')
         ORDER BY block_time DESC LIMIT {{row_limit}}" -o json

# Run with parameter values
dune query run <returned-id> --param wallet=0xABC... --param row_limit=50 -o json
```

### Long-Running Query (Submit and Poll)

```bash
# Submit without waiting
dune query run 12345 --no-wait --performance large -o json
# → {"execution_id": "01ABC...", "state": "QUERY_STATE_PENDING"}

# Fetch results later
dune execution results 01ABC... -o json
```

**Execution states:** `PENDING` → `EXECUTING` → `COMPLETED` / `FAILED` / `CANCELLED`

---

## Wallet Management with MoonPay

Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and fund the wallets you analyze with Dune.

### Create a Wallet to Monitor

```bash
mp wallet create --name "dune-agent-wallet"
mp wallet retrieve --wallet "dune-agent-wallet"
# Note your Ethereum address for Dune queries
```

### Query Your MoonPay Wallet with Dune

```bash
WALLET=$(mp wallet retrieve --wallet "dune-agent-wallet" --json | jq -r '.addresses.ethereum')

dune query run-sql --sql "
  SELECT block_time, hash, value/1e18 AS eth, \"to\", \"from\"
  FROM ethereum.transactions
  WHERE lower(\"from\") = lower('$WALLET')
     OR lower(\"to\") = lower('$WALLET')
  ORDER BY block_time DESC LIMIT 50
" -o json
```

### Fund the Wallet

```bash
# Buy ETH for gas
mp buy --token eth_ethereum --amount 0.1 --wallet <your-eth-address> --email <email>

# Bridge to where the yields are
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# Check balance
mp token balance list --wallet <your-eth-address> --chain ethereum
```

---

## Limitations

The following are only available via the Dune MCP server or web UI — **not** via the CLI:

- Visualization creation (charts, counters, tables)
- Listing all indexed blockchains with table counts
- Table size analysis

---

## Security

- Never pass `--api-key` on the command line when others may see terminal history — prefer `dune auth` or `$DUNE_API_KEY`
- Confirm with the user before running write commands (`query create`, `query update`, `query archive`)

---

## Resources

- **Dune Analytics:** https://dune.com
- **API docs:** https://docs.dune.com
- **DuneSQL reference:** https://docs.dune.com/query-engine/Functions-and-operators
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli
