---
name: dune
description: >
  Blockchain analytics via the Dune CLI — execute DuneSQL queries against live on-chain data, discover decoded contract tables, and monitor credit usage. Use when the user asks about on-chain data, wallet activity, DEX trades, token transfers, smart contract events, or says "query Dune", "run a Dune query", or "search Dune datasets". Pairs with MoonPay to analyze wallets you create and fund.
tags: [blockchain, analytics, dune, on-chain, data, defi, sql]
---

# Dune

Query live on-chain data with the [Dune CLI](https://github.com/duneanalytics/cli) ([overview](https://docs.dune.com/api-reference/agents/cli-and-skills)). Pair with MoonPay to create and fund the wallets you analyze.

## Setup

### Install the Dune CLI

```bash
curl -sSfL https://github.com/duneanalytics/cli/raw/main/install.sh | bash
```

The installer adds the `dune` binary to your PATH. See the [Dune CLI & Skills](https://docs.dune.com/api-reference/agents/cli-and-skills) page for the alternate `dune.com` install URL and optional Agent Skill install.

### Get a Dune API Key

1. Sign up at https://dune.com
2. Go to **Settings → API Keys → Create new key** (or **APIs and Connectors → API Keys**)

### Authenticate

```bash
# Interactive — saves to ~/.config/dune/config.yaml
dune auth

# Or non-interactive
dune auth --api-key <your-api-key>

# Or per session / scripts
export DUNE_API_KEY="<your-api-key>"
```

The `--api-key` flag is available on all commands if you need to override the stored key.

Use `-o json` (or `--output json`) on any command except `auth` for machine-parseable output.

---

## Key CLI Commands

| Area | Command | Purpose |
|------|---------|---------|
| Queries | `dune query run <query-id> [--param key=value] [--performance medium\|large]` | Run a saved query (waits for completion by default) |
| Queries | `dune query run-sql --sql "<sql>" [--performance medium\|large]` | Run ad-hoc DuneSQL |
| Queries | `dune query get <query-id>` | Inspect a saved query |
| Executions | `dune execution results <execution-id>` | Fetch results for an execution (e.g. after `--no-wait`) |
| Datasets | `dune dataset search [--query ...]` | Search the dataset catalog |
| Datasets | `dune dataset search-by-contract --contract-address <addr>` | Find decoded tables for a contract |
| Account | `dune usage [--start-date ...] [--end-date ...]` | Credit / usage |
| Docs | `dune docs search --query "<text>"` | Search Dune documentation (no API key required) |

Run `dune --help` and `dune <command> --help` for full flags (`--limit`, `--timeout`, `--no-wait`, etc.).

---

## Common Workflows

### Run a Saved Query

By default, `dune query run` waits for the execution to finish and prints results.

```bash
dune query run 3237661 --performance medium -o json
```

Optional: start async, then poll results (use the `execution_id` from the JSON):

```bash
dune query run 3237661 --performance medium --no-wait -o json

dune execution results "<execution_id>" -o json
```

### Execute Raw DuneSQL

```bash
dune query run-sql \
  --sql "SELECT block_time, hash, value/1e18 AS eth FROM ethereum.transactions WHERE lower(\"from\") = lower('0xYOUR_WALLET') ORDER BY block_time DESC LIMIT 20" \
  --performance medium \
  -o json
```

### Query with Parameters

Pass each saved-query parameter as `key=value` (repeat `--param` as needed):

```bash
dune query run 3237661 \
  --param wallet=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 \
  --param days=30 \
  --performance medium \
  -o json
```

---

## Wallet Management with MoonPay

Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and fund the wallets you analyze with Dune.

### Create a Wallet to Monitor

```bash
mp wallet create --name "dune-wallet"
mp wallet retrieve --wallet "dune-wallet"
# Note your Ethereum address for Dune queries
```

### Query Your MoonPay Wallet On-Chain

```bash
WALLET=$(mp wallet retrieve --wallet "dune-wallet" --json | jq -r '.addresses.ethereum')

dune query run-sql \
  --sql "SELECT block_time, hash, value/1e18 AS eth, \"to\" FROM ethereum.transactions WHERE lower(\"from\") = lower('${WALLET}') ORDER BY block_time DESC LIMIT 20" \
  --performance medium \
  -o json
```

### Fund the Wallet

```bash
# Buy ETH for gas
mp buy --token eth_ethereum --amount 0.1 --wallet <your-eth-address> --email <email>

# Check balances
mp token balance list --wallet <your-eth-address> --chain ethereum

# Bridge to follow yields
mp token bridge \
  --from-wallet dune-wallet --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

---

## Execution States

When you use `-o json` or inspect async executions, states match the Dune API:

| State | Meaning |
|-------|---------|
| `QUERY_STATE_PENDING` | Queued |
| `QUERY_STATE_EXECUTING` | Running |
| `QUERY_STATE_COMPLETED` | Results ready |
| `QUERY_STATE_FAILED` | Check error message |
| `QUERY_STATE_CANCELLED` | Cancelled |

---

## Security

- Never expose `DUNE_API_KEY` in logs or responses — redact before showing output
- Treat `~/.config/dune/config.yaml` like a secret on disk
- Confirm with the user before running write operations (creating/updating saved queries via `dune query create` / `dune query update`)

---

## Resources

- **Dune CLI (GitHub):** https://github.com/duneanalytics/cli
- **Dune CLI & Skills:** https://docs.dune.com/api-reference/agents/cli-and-skills
- **REST API reference (underlying service):** https://docs.dune.com/api-reference/overview/introduction
- **DuneSQL reference:** https://docs.dune.com/query-engine/Functions-and-operators
- **Dune:** https://dune.com
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Check wallet balances before analyzing on-chain
- **moonpay-swap-tokens** — Act on findings by swapping tokens
- **moonpay-bridge-tokens** — Move assets cross-chain informed by your analysis
