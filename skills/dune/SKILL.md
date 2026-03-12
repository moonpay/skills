---
name: dune
description: Use this skill when the user wants to query blockchain data with SQL, discover on-chain datasets, analyze wallet activity, or monitor DeFi positions. Covers running DuneSQL queries, searching decoded contract tables, and pairing on-chain analysis with MoonPay wallet management to act on findings. Use when the user mentions Dune, DuneSQL, on-chain analytics, blockchain data, or querying transaction history.
license: Complete terms in LICENSE.txt
---

# Dune: Blockchain Analytics for AI Agents

Dune CLI gives AI agents direct access to Dune Analytics — execute DuneSQL queries, discover on-chain datasets, and monitor credit usage. Pair with MoonPay to create and fund the wallets your agent monitors, and move assets informed by your on-chain analysis.

## Core Features

- **DuneSQL Queries**: Ad-hoc and saved queries against live on-chain data
- **Dataset Discovery**: Search 1,000s of decoded tables by keyword or contract address
- **Credit Monitoring**: Track API usage with `dune usage`
- **JSON Output**: Full machine-readable responses for agent pipelines

---

## Authentication & Setup

```bash
export DUNE_API_KEY="your-api-key"

# Or save permanently
dune auth
```

Get your key at https://dune.com → Settings → API Keys.

**Key resolution order:** CLI flag → `$DUNE_API_KEY` → `~/.config/dune/config.yaml`

---

## Key Commands

| Command | Description |
|---------|-------------|
| `dune query run-sql "<sql>"` | Execute ad-hoc DuneSQL |
| `dune query run <id>` | Run a saved query |
| `dune query get <id>` | Fetch previous results |
| `dune dataset search <term>` | Discover datasets by keyword |
| `dune dataset search-by-contract <addr>` | Find decoded tables for a contract |
| `dune usage` | Check credit consumption |

Always use `-o json` for agent pipelines:

```bash
dune query run-sql "SELECT * FROM ethereum.transactions LIMIT 10" -o json
```

---

## Usage Example

```python
import subprocess, json, os

def run_dune(sql: str) -> list:
    result = subprocess.run(
        ["dune", "query", "run-sql", sql, "-o", "json"],
        env={**os.environ, "DUNE_API_KEY": os.environ["DUNE_API_KEY"]},
        capture_output=True, text=True
    )
    return json.loads(result.stdout).get("rows", [])

# Monitor a MoonPay wallet's on-chain activity
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

```bash
# Find tables for a protocol
dune dataset search "uniswap v3 swaps"

# Find decoded events for a contract
dune dataset search-by-contract 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984

# Check credit usage
dune usage
```

---

## Wallet Management with MoonPay

Use the MoonPay CLI (`mp`) to create and manage the wallets you analyze with Dune. Fund positions and move assets — all from the same toolchain.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create a Wallet to Monitor

```bash
mp wallet create --name "dune-agent-wallet"
mp wallet retrieve --wallet "dune-agent-wallet"
```

### Query Your MoonPay Wallet with Dune

```bash
WALLET=$(mp wallet retrieve --wallet "dune-agent-wallet" --json | jq -r '.addresses.ethereum')

dune query run-sql "
  SELECT block_time, hash, value/1e18 as eth, \"to\", \"from\"
  FROM ethereum.transactions
  WHERE lower(\"from\") = lower('$WALLET')
     OR lower(\"to\") = lower('$WALLET')
  ORDER BY block_time DESC LIMIT 50
" -o json
```

### Send Transactions

```bash
mp transaction send --wallet "dune-agent-wallet" --chain ethereum --transaction <unsigned-tx>
```

---

## Funding Your Wallet with MoonPay

```bash
# Buy ETH for gas
mp buy --token eth_ethereum --amount 0.1 --wallet <your-eth-address> --email <email>

# Bridge to where your analysis points
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.05 \
  --to-chain arbitrum \
  --to-token 0x0000000000000000000000000000000000000000

# Check balance
mp token balance list --wallet <your-eth-address> --chain ethereum

# Withdraw to bank
mp virtual-account offramp create --amount 1000 --chain ethereum --wallet <address>
```

---

## Getting Started Flow

1. Get Dune API key at https://dune.com → Settings → API Keys
2. Set: `export DUNE_API_KEY="..."` or `dune auth`
3. Create wallet: `mp wallet create --name "dune-agent-wallet"`
4. Fund: `mp buy --token eth_ethereum --amount 0.1 --wallet <address>`
5. Query wallet activity with DuneSQL
6. Use `dune dataset search` to find protocol tables
7. Act on findings: `mp token bridge` or `mp token swap`

---

## Resources

- **Dune Analytics:** https://dune.com
- **API docs:** https://docs.dune.com
- **DuneSQL reference:** https://docs.dune.com/query-engine/Functions-and-operators
- **Note:** Visualization creation is only available via Dune web UI or MCP server, not CLI
