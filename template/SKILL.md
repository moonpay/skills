---
name: partner-skill-name
description: >
  Describe what this skill does and when an AI agent should use it.
  Be specific — this field determines whether Claude loads this skill.
  Bad: "Analytics tool for blockchain data"
  Good: "Use when the user asks to analyze on-chain token metrics, wallet PnL, or DEX volume using Dune Analytics queries"
tags: [tag1, tag2]
---

# Skill Name

## Overview

What this skill does and why an agent would use it. Keep it to 2-3 sentences.

## Prerequisites

- MoonPay CLI installed (`npm i -g @moonpay/cli`)
- Authenticated (`mp login` → `mp verify`)
- Partner CLI installed (if applicable): `npm i -g <partner-cli>`
- Any other setup needed (e.g., funded wallet, API keys)

## Commands

List the key CLI commands this skill uses. These must be **real, verifiable commands** from installed CLIs — not fabricated.

```bash
# MoonPay CLI commands
mp <command> [options]

# Partner CLI commands (if applicable)
partner-cli <command> [options]
```

## Workflow

Step-by-step instructions for the agent to follow. Each step should be unambiguous and executable.

1. Step one — what to do and what command to run
2. Step two — what to do with the output
3. Step three — how to complete the task

## Examples

```bash
# Show a complete end-to-end workflow with real commands and expected output
```

## Error Handling

Common errors and how the agent should respond:

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Missing or expired auth | Run `mp login` → `mp verify` |

## Related Skills

Link to skills that exist in this repo. Do not reference skills that haven't been merged.

- [moonpay-auth](../moonpay-auth/) — authentication
- [moonpay-check-wallet](../moonpay-check-wallet/) — wallet balance checks
