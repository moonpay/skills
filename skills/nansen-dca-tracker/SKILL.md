---
name: nansen-dca-tracker
description: "What tokens are whales dollar-cost averaging into? Jupiter DCA strategies by smart money and target token fundamentals."
metadata:
  openclaw:
    requires:
      env:
        - NANSEN_API_KEY
      bins:
        - nansen
    primaryEnv: NANSEN_API_KEY
    install:
      - kind: node
        package: nansen-cli
        bins: [nansen]
allowed-tools: Bash(nansen:*)
---

# DCA Watch

**Answers:** "What tokens are whales dollar-cost averaging into on Solana?"

## Prerequisites

- Nansen CLI installed: `npm i -g nansen-cli`
- API key set: `export NANSEN_API_KEY=<your-key>` (get one at https://app.nansen.ai)

## Workflow

1. Fetch the latest smart money DCA strategies on Solana:

```bash
nansen research smart-money dcas --limit 20
# → trader_address, trader_address_label, input/output_token_symbol, deposit_value_usd, dca_status, dca_created_at
```

2. For each top DCA target, check token fundamentals:

```bash
TARGET=<output_token_address>

nansen research token info --token $TARGET --chain solana
# → name, symbol, price, market_cap, token_details

nansen research token flow-intelligence --token $TARGET --chain solana
# → net_flow_usd per label: smart_trader, whale, exchange, fresh_wallets
```

3. To see all DCA strategies targeting a specific token:

```bash
nansen research token jup-dca --token $TARGET
```

## Interpretation

DCAs show long-term conviction — SM DCA targets with positive `smart_trader_net_flow` = high-confidence accumulation signal.
