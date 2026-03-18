---
name: partner-skill-name
description: >
  Describe what this skill does and when an AI agent should use it.
  Be specific — this field determines whether Claude loads this skill.
tags: [tag1, tag2]
---

# Skill Name

## Overview

What this skill does and why an agent would use it.

## Prerequisites

- MoonPay CLI installed (`npm i -g @moonpay/cli`)
- Authenticated (`mp login` → `mp verify`)
- Any other setup needed (e.g., funded wallet, API keys)

## Commands

List the key `mp` commands this skill uses:

```bash
mp <command> [options]
```

## Workflow

Step-by-step instructions for the agent to follow.

1. Step one
2. Step two
3. Step three

## Examples

```bash
# Example end-to-end usage
```

## Related Skills

- [moonpay-auth](../moonpay-auth/) — if authentication is needed
- [moonpay-check-wallet](../moonpay-check-wallet/) — if wallet balance checks are needed
