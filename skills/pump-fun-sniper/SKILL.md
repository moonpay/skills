---
name: pump-fun-sniper
description: Snipe new Solana memecoin launches on pump.fun — listen for new tokens via PumpPortal WebSocket, evaluate early trading signals, and buy/sell using mp CLI.
tags: [trading, automation, solana]
license: Complete terms in LICENSE.txt
---

# pump.fun sniper

## Goal

Listen for brand-new token launches on pump.fun in real time, evaluate early trading signals, and snipe promising tokens using `mp token swap`.

## Prerequisites

- Authenticated: `mp user retrieve`
- Funded Solana wallet: `mp token balance list --wallet <name> --chain solana`
- Node.js installed (for the WebSocket listener)
- `ws` npm package

## Architecture

```
PumpPortal WebSocket ──→ listener (stdout) ──→ agent evaluates ──→ mp token swap
```

The agent writes a Node.js script that connects to PumpPortal's public WebSocket, collects early trading data for each new token, and outputs structured signals. The agent reads those signals, decides whether to buy, and uses `mp` for all execution.

## PumpPortal WebSocket

Endpoint: `wss://pumpportal.fun/api/data`

Subscribe to new token launches:
```json
{"method": "subscribeNewToken"}
```

Subscribe to trades for a specific token:
```json
{"method": "subscribeTokenTrade", "keys": ["<mint-address>"]}
```

### Events

**Token creation** (`txType: "create"`): `mint`, `name`, `symbol`, `traderPublicKey` (creator), `solAmount` (creator's initial buy), `marketCapSol`

**Trade** (`txType: "buy"` or `"sell"`): `mint`, `traderPublicKey`, `solAmount`, `marketCapSol`

## Listener design

The listener should:
1. Subscribe to new token events
2. For each new token, subscribe to its trades
3. Accumulate trading activity for an evaluation window (10 seconds works well)
4. After the window, emit a signal with aggregated metrics
5. For tokens the agent has bought, keep streaming trades so the agent can monitor P&L in real time

The listener prints JSON lines to stdout — one `signal` per evaluated token, and ongoing `trade` events for held positions. The agent reads stdout to make decisions.

## Signal evaluation

After the evaluation window, assess these metrics:

| Metric | How to compute | Good | Bad |
|--------|---------------|------|-----|
| Unique wallets | Distinct `traderPublicKey` values | >= 8 | < 5 |
| Buy ratio | buys / total trades | >= 0.6 | < 0.5 |
| Net SOL flow | total SOL in (buys) - total SOL out (sells) | > 0.3 | negative |
| SSR (sell/buy SOL ratio) | totalSolOut / totalSolIn | < 0.2 | > 0.4 |
| Total trades | count of all buys + sells | >= 12 | < 5 |
| Market cap | latest `marketCapSol` | 30-250 SOL | > 500 |
| Creator initial buy | `solAmount` from create event | < 3 SOL | > 5 |

A strong signal meets all the "good" thresholds. Most tokens will fail — that's expected.

Optionally run `mp -f compact token check --token <mint> --chain solana` for a safety check before buying.

## Buying

```bash
mp token swap \
  --wallet <wallet-name> \
  --chain solana \
  --from-token So11111111111111111111111111111111111111111 \
  --from-amount <sol-amount> \
  --to-token <mint-address>
```

Start with 0.01 SOL per trade until comfortable with signal quality.

## Monitoring held positions

After buying, keep the listener streaming trades for that token. Use the incoming trades to track:

- **Current mcap** vs entry mcap = unrealized P&L
- **Peak mcap** = highest mcap seen since entry (for trailing stop)
- **Flow direction** = are recent trades mostly buys or sells?
- **Stall detection** = has mcap stopped making new highs?

## Exit rules

| Rule | Condition | Action |
|------|-----------|--------|
| Stop loss | mcap drops 35% from entry | Sell |
| Trailing stop | mcap drops 30% from peak | Sell |
| Stall | gained 15%+ but no new high for 30s | Sell (take profit) |
| Time limit | held 5 min with < 10% gain | Sell |

The stall exit is the most reliable profit-taker — tokens that pump and flatline rarely pump again.

## Selling

```bash
# Get balance
BALANCE=$(mp -f compact token balance list --wallet <name> --chain solana \
  | jq -r --arg mint "<mint>" '.items[] | select(.address == $mint) | .balance.amount')

# Sell all
mp token swap \
  --wallet <name> --chain solana \
  --from-token <mint-address> --from-amount "$BALANCE" \
  --to-token So11111111111111111111111111111111111111111
```

## Logging

Log trades to `~/.config/pump-fun-sniper/trades.jsonl` with action, mint, name, SOL amount, mcap, P&L %, hold time, and exit reason.

## Paper trading

Skip `mp token swap` calls and just log simulated trades. Compare entry mcap to mcap at simulated exit to track paper P&L.

## Configuration

Everything in this skill is a starting point — the user can (and should) tune it. Store config in `~/.config/pump-fun-sniper/config.json` and have the listener and agent read from it.

### Tunable parameters

| Parameter | Default | What it controls |
|-----------|---------|-----------------|
| `evalWindowSec` | 10 | How long to watch a token before deciding. Lower = faster but noisier |
| `minWallets` | 8 | Minimum unique wallets to consider a token |
| `minBuyRatio` | 0.6 | Minimum buy/total trade ratio |
| `minNetFlow` | 0.3 | Minimum net SOL flowing in |
| `maxSSR` | 0.2 | Maximum sell/buy SOL ratio |
| `minTrades` | 12 | Minimum total trades |
| `maxMcap` | 250 | Skip tokens that already pumped |
| `maxCreatorBuy` | 3 | Skip tokens where creator loaded up |
| `buyAmount` | 0.01 | SOL per trade |
| `stopLoss` | -0.35 | Exit if mcap drops this % from entry |
| `trailingStop` | -0.30 | Exit if mcap drops this % from peak |
| `stallGain` | 0.15 | Minimum gain before stall detection activates |
| `stallTimeout` | 30 | Seconds without a new high to trigger stall exit |
| `maxHoldSec` | 300 | Maximum hold time before forced exit |

### Extending

The user might ask to:

- **Tighten filters** (fewer trades, higher quality) — raise `minWallets`, `minBuyRatio`, lower `maxSSR`
- **Loosen filters** (more trades, lower hit rate) — lower thresholds across the board
- **Scale up** — increase `buyAmount` after validating in paper mode
- **Add new signals** — e.g. wallet concentration (one wallet doing most of the buying is a red flag), trade velocity (trades per second), or creator history (repeat launchers are often rugs)
- **Adjust exit timing** — shorter `stallTimeout` takes profit faster but may sell too early, longer holds through dips but risks giving back gains

When the user asks to tune, review recent trade logs (`trades.jsonl`) to see which exits are winning/losing and adjust accordingly.

## Tips

- Most pump.fun tokens go to zero. Only risk what you can afford to lose.
- Start in paper trading mode to validate signals before going live.
- The 10-second evaluation window balances signal quality vs speed. Shorter = faster but noisier.
- PumpPortal's WebSocket is free and needs no API key.
- `mp -f compact` outputs single-line JSON, ideal for `jq` parsing.

## Related skills

- **moonpay-swap-tokens** — Swap command details
- **moonpay-discover-tokens** — Token research and risk checks
- **moonpay-check-wallet** — Check balances
- **moonpay-trading-automation** — Scheduled strategies (DCA, limit orders)
