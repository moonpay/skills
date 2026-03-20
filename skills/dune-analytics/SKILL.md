---
name: dune-analytics
description: >
  Blockchain analytics via Dune REST API — execute DuneSQL queries against live on-chain data, discover decoded contract tables, and monitor credit usage. Use when the user asks about on-chain data, wallet activity, DEX trades, token transfers, smart contract events, or says "query Dune", "run a Dune query", or "search Dune datasets". Pairs with MoonPay to analyze wallets you create and fund.
tags: [blockchain, analytics, dune, on-chain, data, defi, sql]
---

# Dune Analytics

Query live on-chain data via the [Dune REST API](https://docs.dune.com/api-reference/overview/introduction). Pair with MoonPay to create and fund the wallets you analyze.

## Setup

### Get a Dune API Key

1. Sign up at https://dune.com
2. Go to **Settings → API Keys → Create new key**

```bash
export DUNE_API_KEY="your-api-key"
```

**Base URL:** `https://api.dune.com/api/v1`  
**Auth header:** `X-Dune-API-Key: $DUNE_API_KEY`

---

## Key Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Execute a saved query | POST | `/query/{query_id}/execute` |
| Get execution status + results | GET | `/execution/{execution_id}/results` |
| Execute raw SQL directly | POST | `/sql/execute` |
| Cancel execution | POST | `/execution/{execution_id}/cancel` |
| Get query definition | GET | `/query/{query_id}` |

---

## Common Workflows

### Run a Saved Query

```bash
# 1. Execute
EXEC=$(curl -s -X POST "https://api.dune.com/api/v1/query/3237661/execute" \
  -H "X-Dune-API-Key: $DUNE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"performance": "medium"}')

EXEC_ID=$(echo $EXEC | jq -r '.execution_id')
echo "execution_id: $EXEC_ID"

# 2. Poll until complete
while true; do
  STATUS=$(curl -s "https://api.dune.com/api/v1/execution/$EXEC_ID/results" \
    -H "X-Dune-API-Key: $DUNE_API_KEY")
  STATE=$(echo $STATUS | jq -r '.state')
  echo "State: $STATE"
  if [[ "$STATE" == "QUERY_STATE_COMPLETED" || "$STATE" == "QUERY_STATE_FAILED" ]]; then
    echo $STATUS | jq '.result.rows[:5]'
    break
  fi
  sleep 3
done
```

### Execute Raw DuneSQL

```bash
curl -s -X POST "https://api.dune.com/api/v1/sql/execute" \
  -H "X-Dune-API-Key: $DUNE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT block_time, hash, value/1e18 AS eth FROM ethereum.transactions WHERE lower(\"from\") = lower('0xYOUR_WALLET') ORDER BY block_time DESC LIMIT 20",
    "performance": "medium"
  }' | jq '.execution_id'
```

### Query with Parameters

```bash
curl -s -X POST "https://api.dune.com/api/v1/query/3237661/execute" \
  -H "X-Dune-API-Key: $DUNE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query_parameters": {
      "wallet": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "days": 30
    },
    "performance": "medium"
  }' | jq '.execution_id'
```

---

## Wallet Management with MoonPay

Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and fund the wallets you analyze with Dune.

### Create a Wallet to Monitor

```bash
mp wallet create --name "dune-agent-wallet"
mp wallet retrieve --wallet "dune-agent-wallet"
# Note your Ethereum address for Dune queries
```

### Query Your MoonPay Wallet On-Chain

```bash
WALLET=$(mp wallet retrieve --wallet "dune-agent-wallet" --json | jq -r '.addresses.ethereum')

EXEC_ID=$(curl -s -X POST "https://api.dune.com/api/v1/sql/execute" \
  -H "X-Dune-API-Key: $DUNE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\
    \"sql\": \"SELECT block_time, hash, value/1e18 AS eth, \\\"to\\\" FROM ethereum.transactions WHERE lower(\\\"from\\\") = lower('$WALLET') ORDER BY block_time DESC LIMIT 20\",\
    \"performance\": \"medium\"\
  }" | jq -r '.execution_id')

curl -s "https://api.dune.com/api/v1/execution/$EXEC_ID/results" \
  -H "X-Dune-API-Key: $DUNE_API_KEY" | jq '.result.rows'
```

### Fund the Wallet

```bash
# Buy ETH for gas
mp buy --token eth_ethereum --amount 0.1 --wallet <your-eth-address> --email <email>

# Check balances
mp token balance list --wallet <your-eth-address> --chain ethereum

# Bridge to follow yields
mp token bridge \
  --from-wallet dune-agent-wallet --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

---

## Execution States

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
- Confirm with the user before running write operations (creating/updating saved queries)

---

## Resources

- **API docs:** https://docs.dune.com/api-reference/overview/introduction
- **DuneSQL reference:** https://docs.dune.com/query-engine/Functions-and-operators
- **Dune Analytics:** https://dune.com
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Check wallet balances before analyzing on-chain
- **moonpay-swap-tokens** — Act on findings by swapping tokens
- **moonpay-bridge-tokens** — Move assets cross-chain informed by your analysis
