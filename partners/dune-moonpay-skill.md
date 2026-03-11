# Dune: Blockchain Analytics for AI Agents

Dune CLI gives AI agents direct access to Dune Analytics — execute DuneSQL queries, discover on-chain datasets, and monitor credit usage from the command line. Pair with MoonPay to create and fund the wallets your agent monitors, and to move assets informed by your on-chain analysis.

## Core Features

- **DuneSQL Queries**: Run ad-hoc and saved queries against live on-chain data
- **Dataset Discovery**: Search 1,000s of decoded tables by keyword or contract address
- **Credit Monitoring**: Track API usage and consumption with `dune usage`
- **Multi-Platform**: macOS, Linux, Windows — auto-installs on first use
- **JSON Output**: Full machine-readable API responses for agent pipelines

---

## Authentication & Setup

### Get a Dune API Key

1. Sign up at https://dune.com
2. Go to **Settings → API Keys → Create new key**

```bash
export DUNE_API_KEY="your-api-key"

# Or save permanently
dune auth
```

**Key resolution order:** CLI flag → `$DUNE_API_KEY` env var → `~/.config/dune/config.yaml`

### CLI Auto-Install

Dune CLI installs automatically on first use:

```bash
dune query run-sql "SELECT 1"
```

---

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
| `dune auth` | Save API key interactively |

### Output Formats

```bash
# Machine-readable (recommended for agents)
dune query run-sql "SELECT * FROM ethereum.transactions LIMIT 10" -o json

# Human-readable summary
dune query run-sql "SELECT * FROM ethereum.transactions LIMIT 10" -o text
```

**Always use `-o json`** for agent pipelines — returns full API response objects.

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

# Monitor a MoonPay wallet's recent on-chain activity
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

**Discovery workflow:**

```bash
# Find tables for a DeFi protocol
dune dataset search "uniswap v3 swaps"

# Find decoded events for a specific contract
dune dataset search-by-contract 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984

# Check your credit usage
dune usage
```

---

## Wallet Management with MoonPay

Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and manage the wallets you analyze with Dune. Fund positions, move assets, and track everything on-chain — all from the same toolchain.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create a Wallet to Monitor

```bash
mp wallet create --name "dune-agent-wallet"
mp wallet retrieve --wallet "dune-agent-wallet"
# Note your Ethereum address for Dune queries
```

### Query Your MoonPay Wallet with Dune

```bash
WALLET=$(mp wallet retrieve --wallet "dune-agent-wallet" --json | jq -r '.addresses.ethereum')

dune query run-sql "
  SELECT block_time, hash, value/1e18 as eth, \"to\", \"from\"
  FROM ethereum.transactions
  WHERE lower(\"from\") = lower('$WALLET')
     OR lower(\"to\") = lower('$WALLET')
  ORDER BY block_time DESC
  LIMIT 50
" -o json
```

### Sign Messages & Transactions

```bash
# Sign a message
mp message sign --wallet "dune-agent-wallet" --chain ethereum --message "I own this wallet"

# Send a signed transaction
mp transaction send \
  --wallet "dune-agent-wallet" \
  --chain ethereum \
  --transaction <unsigned-tx>
```

### Hardware Wallet (High Security)

```bash
mp wallet add-ledger --name "dune-ledger"
```

---

## Funding Your Wallet with MoonPay

### Option 1: Buy ETH with Fiat

```bash
# ETH for Ethereum gas and transactions
mp buy --token eth_ethereum --amount 0.1 --wallet <your-eth-address> --email <email>
```

### Option 2: Bridge Tokens Cross-Chain

Move assets informed by your Dune analysis:

```bash
# ETH on Ethereum → Arbitrum
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.05 \
  --to-chain arbitrum \
  --to-token 0x0000000000000000000000000000000000000000

# USDC on Ethereum → USDC.e on Polygon
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

Bridge times: 5–20 seconds.

### Option 3: Bank Transfer (Large Positions)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 5000 --currency usd \
  --chain ethereum \
  --wallet <your-eth-address>
```

### Option 4: Deposit Link (Permissionless)

```bash
mp deposit create \
  --name "Dune Agent Wallet" \
  --wallet <your-eth-address> \
  --chain ethereum \
  --token USDC
```

### Check Balances

```bash
mp token balance list --wallet <your-eth-address> --chain ethereum
```

### Withdraw to Bank

```bash
mp virtual-account offramp create \
  --amount 1000 \
  --chain ethereum \
  --wallet <your-eth-address>
```

---

## Key Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| ETH (native gas) | Ethereum | `0x0000000000000000000000000000000000000000` |

---

## Getting Started Flow

1. Get Dune API key at https://dune.com → Settings → API Keys
2. Set key: `export DUNE_API_KEY="..."` or `dune auth`
3. Create a wallet to track: `mp wallet create --name "dune-agent-wallet"`
4. Fund wallet: `mp buy --token eth_ethereum --amount 0.1 --wallet <address>`
5. Query your wallet's on-chain history with Dune DuneSQL
6. Use `dune dataset search` to discover protocol-specific tables
7. Monitor credit usage: `dune usage`
8. Act on findings: bridge, swap, or transfer via `mp token bridge` / `mp token swap`

---

## Resources

- **Dune Analytics:** https://dune.com
- **API docs:** https://docs.dune.com
- **DuneSQL reference:** https://docs.dune.com/query-engine/Functions-and-operators
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli
- **Note:** Visualization creation and table size analysis are only available via Dune web UI or MCP server, not CLI
