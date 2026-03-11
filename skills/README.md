# MoonPay Partner Skills

Agent skills for MoonPay-integrated partners. Each skill embeds MoonPay wallet infrastructure — create, fund, bridge, sign, and offramp — directly into the partner's product.

## Skills

| Skill | Description |
|-------|-------------|
| [shipp](./shipp/) | Live sports data → trade prediction markets with a MoonPay-funded wallet |
| [corbits](./corbits/) | Paid API marketplace — MoonPay EVM wallet powers x402 USDC micropayments |
| [yield](./yield/) | Multi-chain yield optimization — MoonPay signs unsigned yield transactions |
| [dune](./dune/) | Blockchain analytics — create and monitor MoonPay wallets on-chain |

## Adding a New Partner Skill

Follow the [Anthropic skills spec](https://github.com/anthropics/skills):

```
skills/
  partner-name/
    SKILL.md        ← required: frontmatter (name, description) + content
```

**Frontmatter format:**

```yaml
---
name: partner-name
description: When should Claude use this skill? Be specific about triggers.
---
```

## Install a Skill

```bash
npx clawhub@latest install <skill-name>
```
