# Shipp: Real-Time Sports & Events Data for AI Agents

Shipp is a real-time data connector that gives AI agents live, authoritative sports data — schedules, scores, and events as they happen. Use Shipp to power prediction market strategies, then execute trades with MoonPay-managed wallets.

## Core Features

- **Live Sports Data**: NBA, NFL, NCAA Football, MLB, Soccer (more coming)
- **Connection-Based Queries**: Write once in plain English, poll for updates
- **Prediction Market Ready**: Pipe live scores directly into Polymarket/Kalshi trading logic
- **Upcoming**: News, financials, travel, and weather feeds

---

## Authentication & Setup

### Get an API Key

Register at https://platform.shipp.ai to receive your Shipp API key.

```bash
export SHIPP_API_KEY="sk_..."
```

### Install Shipp CLI

```bash
curl -fsSL https://shipp.ai/install.sh | bash
```

Quick start:

```bash
shipp account create
shipp connections create
shipp connections run
```

---

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/connections/create` | POST | Create a reusable query using plain-English `filter_instructions` |
| `/api/v1/connections/{id}` | POST | Run connection and retrieve event data |
| `/api/v1/connections` | GET | List all saved connections (free) |
| `/api/v1/sports/{sport}/schedule` | GET | Upcoming/recent games (±7 days) |

**Authentication:** Pass API key via header or query param:

```bash
# Header
curl https://api.shipp.ai/api/v1/connections \
  -H "Authorization: Bearer $SHIPP_API_KEY"

# Query param
curl "https://api.shipp.ai/api/v1/connections?api_key=$SHIPP_API_KEY"
```

**Supported sports:** `nba`, `nfl`, `ncaaf`, `mlb`, `soccer`

---

## Usage Example

```python
import requests, os, time

SHIPP_KEY = os.environ["SHIPP_API_KEY"]
BASE = "https://api.shipp.ai"

# 1. Create a connection once — store connection_id
conn = requests.post(f"{BASE}/api/v1/connections/create",
    headers={"Authorization": f"Bearer {SHIPP_KEY}"},
    json={"filter_instructions": "NBA games with final scores from the last 24 hours"}
).json()
connection_id = conn["connection_id"]

# 2. Poll for live updates
last_event_id = None
while True:
    params = {"limit": 20}
    if last_event_id:
        params["since_event_id"] = last_event_id

    events = requests.post(f"{BASE}/api/v1/connections/{connection_id}",
        headers={"Authorization": f"Bearer {SHIPP_KEY}"},
        json=params
    ).json()

    for event in events.get("data", []):
        home = event.get("home_name")
        away = event.get("away_name")
        home_pts = event.get("home_points")
        away_pts = event.get("away_points")
        print(f"{home} {home_pts} — {away} {away_pts}")
        last_event_id = event.get("event_id", last_event_id)

    time.sleep(15)  # poll every 15s
```

**Pair with prediction markets:** When a Shipp event signals a near-final score, auto-execute a Polymarket position using your MoonPay-funded wallet.

---

## Wallet Management with MoonPay

Shipp provides the data signal. MoonPay provides the wallet for acting on it. Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and manage the wallet your agent uses to trade on Polymarket with Shipp data.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create a Wallet

```bash
mp wallet create --name "shipp-sports-agent"
mp wallet list
mp wallet retrieve --wallet "shipp-sports-agent"
```

Keys are AES-256-GCM encrypted locally — never leave the machine. Your Polygon address is what you'll register on Polymarket.

### Link to Polymarket

Export your private key and use it as your Polymarket external wallet:

```bash
mp wallet export --wallet "shipp-sports-agent"
```

```python
import os
os.environ["WALLET_PRIVATE_KEY"] = "0x..."  # from mp wallet export

from polymarket_sdk import PolymarketClient
client = PolymarketClient()
client.link_wallet()
```

### Sign Messages & Transactions

```bash
# Sign a message (EIP-191)
mp message sign --wallet "shipp-sports-agent" --chain polygon --message "I own this wallet"

# Sign and send a transaction
mp transaction send --wallet "shipp-sports-agent" --chain polygon --transaction <unsigned-tx>
```

### Hardware Wallet (High Security)

```bash
mp wallet add-ledger --name "shipp-sports-ledger"
```

---

## Funding Your Wallet with MoonPay

Polymarket trading requires **USDC.e on Polygon**.

### Option 1: Buy USDC.e with Fiat

No existing crypto needed:

```bash
mp buy --token usdc_polygon --amount 100 --wallet <your-polygon-address> --email <email>
```

Need POL for gas? (~$2–5 covers hundreds of transactions):

```bash
mp buy --token pol_polygon --amount 5 --wallet <your-polygon-address> --email <email>
```

### Option 2: Bridge Existing Crypto

```bash
# USDC on Ethereum → USDC.e on Polygon
mp token bridge \
  --from-wallet shipp-sports-agent --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 100 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

Bridge times: 5–20 seconds.

### Option 3: Bank Transfer (Large Amounts)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 1000 --currency usd \
  --chain polygon \
  --wallet <your-polygon-address>
```

### Option 4: Deposit Link (Permissionless)

Anyone can fund your agent from any chain — auto-converts to USDC.e on Polygon:

```bash
mp deposit create \
  --name "Shipp Sports Agent Fund" \
  --wallet <your-polygon-address> \
  --chain polygon \
  --token USDC.e
```

### Check Balance

```bash
mp token balance list --wallet <your-polygon-address> --chain polygon
```

### Withdraw Winnings to Bank

```bash
mp virtual-account offramp create \
  --amount 500 \
  --chain polygon \
  --wallet <your-polygon-address>
```

---

## Key Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| POL (native gas) | Polygon | `0x0000000000000000000000000000000000000000` |

---

## Getting Started Flow

1. Get Shipp API key from https://platform.shipp.ai
2. Create trading wallet: `mp wallet create --name "shipp-sports-agent"`
3. Fund with USDC.e: `mp buy --token usdc_polygon --amount 100 --wallet <address>`
4. Buy gas: `mp buy --token pol_polygon --amount 5 --wallet <address>`
5. Create a Shipp connection for your target sport/market
6. Poll Shipp every 15–30s for live game events
7. On signal (final score, lead change, key event): execute Polymarket trade
8. Withdraw winnings: `mp virtual-account offramp create`

---

## Resources

- **Shipp API docs:** https://docs.shipp.ai
- **Platform & API keys:** https://platform.shipp.ai
- **Platform guides (Claude Code, Lovable, etc.):** https://docs.shipp.ai/platform-guides
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli
- **Error codes:** 400 bad request, 401 auth, 402 billing, 429 rate-limited, 5xx server error
