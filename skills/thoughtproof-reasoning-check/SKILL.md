---
name: thoughtproof-reasoning-check
description: Verify whether an AI agent's decision is well-reasoned before executing. Adversarial multi-model critique (Claude, Grok, DeepSeek) returns ALLOW or HOLD with confidence score. Use before any high-value swap, trade, or autonomous action.
tags: [verification, reasoning, agents, defi, security]
---

# ThoughtProof Reasoning Check

## Goal

Before executing a trade or autonomous action, verify that the agent's reasoning is sound. ThoughtProof runs adversarial multi-model critique and returns a signed verdict: ALLOW (reasoning is sound) or HOLD (material defects found).

## Prerequisites

- MoonPay CLI installed: `npm install -g @moonpay/cli`
- A funded wallet on Base (for x402 payment): `mp wallet create`

## x402 Paid API ($0.008-$1.00 USDC on Base)

Via SDK:
```bash
npm install thoughtproof-sdk
```

```javascript
const { check } = require('thoughtproof-sdk');
const result = await check({
  claim: "Swap $2K USDC to ETH. ETH at $2180, RSI 34.",
  stakeLevel: "medium",
  domain: "financial"
});
```

## Response

```json
{
  "verdict": "ALLOW",
  "confidence": 0.82,
  "objections": [],
  "durationMs": 55000
}
```

If payment is required first:
```json
{
  "verdict": "HOLD",
  "confidence": 0,
  "paymentRequired": {
    "amountUsdc": "0.05",
    "network": "base",
    "recipientWallet": "0xAB9f84864662f980614bD1453dB9950Ef2b82E83"
  }
}
```

## Decision logic

| Verdict | Meaning | Action |
|---------|---------|--------|
| `ALLOW` | Reasoning is sound | Execute the trade |
| `HOLD` | Material defects found | Do not execute, review reasoning |
| `UNCERTAIN` | Insufficient evidence | Gather more context |
| `DISSENT` | Models strongly disagree | Require human review |

## Pricing (stake-proportional)

| Stake Level | Cost | Use case |
|-------------|------|----------|
| `low` | $0.008-$0.02 | Routine swaps under $2K |
| `medium` | $0.02-$0.05 | Standard trades $2K-$10K |
| `high` | $0.05-$0.15 | Large trades $10K-$25K |
| `critical` | $0.15-$1.00 | High-value trades over $25K |

## Example workflow

1. User says: "Swap $5K USDC for ETH"
2. Check reasoning: POST to ThoughtProof with the trade thesis
3. If `HOLD` or `DISSENT` → warn user, show objections, do not proceed
4. If `ALLOW` with confidence > 0.60 → execute the swap

## Related skills

- **maiat-trust-check** — Behavioral trust score from 29,000+ indexed agents. Run this first — it answers "is this agent reliable based on past behavior?" ThoughtProof then answers "is this specific decision sound?"
- **maiat-token-safety** — Honeypot and rug pull detection before any token interaction
- **moonpay-swap-tokens** — Execute the swap after all verification passes

## Recommended stack

For maximum safety before any high-value trade:

```
1. maiat-trust-check     → Is the agent trustworthy? (behavioral history)
2. maiat-token-safety    → Is the token safe? (rug/honeypot)
3. thoughtproof-reasoning-check → Is the decision sound? (reasoning quality)
4. moonpay-swap-tokens   → Execute with confidence
```

Maiat and ThoughtProof are complementary — Maiat checks the agent's reputation over time, ThoughtProof checks whether this specific decision is well-reasoned right now. Both are needed for full coverage.
