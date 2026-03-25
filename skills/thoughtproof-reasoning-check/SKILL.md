---
name: thoughtproof-reasoning-check
description: Verify whether an AI agent's decision is well-reasoned before executing. Adversarial multi-model critique (Claude, Grok, DeepSeek) returns ALLOW, BLOCK, or UNCERTAIN with confidence score. Use before any high-value swap, trade, or autonomous action.
tags: [verification, reasoning, agents, defi, security]
---

# ThoughtProof Reasoning Check

## Goal

Before executing a trade or autonomous action, verify that the agent's reasoning is sound. ThoughtProof runs adversarial multi-model critique and returns a signed verdict: ALLOW, BLOCK, or UNCERTAIN.

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
| `ALLOW` | Reasoning passed verification | Proceed |
| `BLOCK` | Material reasoning defects or unacceptable risk | Do not execute |
| `UNCERTAIN` | Safe escalation state — insufficient clean evidence to justify ALLOW or BLOCK | Gather more context or require review |

## Pricing

ThoughtProof pricing is stake-based.

| Stake Level | Standard | Lite | Use case |
|-------------|----------|------|----------|
| `low` | $0.01 | $0.005 | Routine low-value actions |
| `medium` | $0.02 | $0.01 | Standard trades and service payments |
| `high` | $0.05 | — | Large or sensitive actions |
| `critical` | $0.10 | — | High-value or highly risky actions |

Notes:
- `lite` is only available for `low` and `medium` stake.
- `high` and `critical` always execute on the standard tier.
- Billing follows the executed tier, not the requested tier.

## Example workflow

### MoonPay + ThoughtProof: payment layer + verification layer

MoonPay handles the payment execution.
ThoughtProof verifies whether the decision to pay is well-reasoned before settlement.

Example:

1. User says: "Swap $5K USDC for ETH because CT is bullish."
2. Agent prepares the MoonPay swap request.
3. Before calling `moonpay-swap-tokens`, the agent sends the reasoning to ThoughtProof.
4. ThoughtProof returns:
   - `ALLOW` → proceed with swap
   - `BLOCK` → stop, surface objections
   - `UNCERTAIN` → escalate, ask for clarification or review
5. If verification passes, the MoonPay skill executes the swap.

**Example failure:**
- "Buy $50K of a token because influencers are bullish"
- ThoughtProof → `BLOCK`
- MoonPay execution never happens

**Example pass:**
- "Rebalance portfolio back to target allocation with defined slippage and stop-loss constraints"
- ThoughtProof → `ALLOW`
- MoonPay executes

This gives the agent stack two layers:
- **MoonPay** answers: *can* the transaction execute?
- **ThoughtProof** answers: *should* the transaction execute?

## Related skills

- **moonpay-swap-tokens** — Execute the swap after verification passes

  
