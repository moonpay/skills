---
name: thoughtproof-reasoning-check
description: Verify whether an AI agent's decision is well-reasoned before executing. Adversarial multi-model critique (Claude, Grok, DeepSeek) returns ALLOW or HOLD with confidence score. Use before any high-value swap, trade, or autonomous action.
tags: [verification, reasoning, agents, defi, security]
---

# ThoughtProof Reasoning Check

## Goal

Before executing a trade or autonomous action, verify that the agent's reasoning is sound. ThoughtProof runs adversarial multi-model critique and returns a signed verdict: ALLOW (reasoning is sound) or HOLD (material defects found).

## Prerequisites

- A funded wallet on Base (for x402 payment): `mp wallet create`

## Usage

Check reasoning quality before a trade:

```bash
curl -X POST https://api.thoughtproof.ai/v1/check \
  -H "Content-Type: application/json" \
  -d '{"claim": "Swap $2K USDC to ETH. ETH at $2180, 6% below 30d MA, RSI 34.", "stakeLevel": "medium", "domain": "financial"}'
```

First call returns 402 with x402 payment details (amount, recipient, asset on Base). Pay, then retry the same request to receive the verdict.

## Response

```json
{
  "verdict": "ALLOW",
  "confidence": 0.82,
  "objections": [],
  "durationMs": 55000
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
2. Check reasoning via curl to ThoughtProof API with the trade thesis
3. If `HOLD` or `DISSENT` -- warn user, show objections, do not proceed
4. If `ALLOW` with confidence > 0.60 -- execute the swap

## Related skills

- **moonpay-swap-tokens** -- Execute the swap after verification passes
