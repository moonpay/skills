# MoonPay Skills

[Agent Skills](https://agentskills.io) for crypto infrastructure — wallet management, token trading, cross-chain bridges, fiat on/off ramp, prediction markets, and more.

Skills are instructional folders that AI agents load dynamically to perform specialized tasks. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and markdown instructions.

## Using Skills

### Claude Code

```bash
# Install a single skill
npx clawhub@latest install moonpay-skills/moonpay-swap-tokens

# Install the full bundle
npx clawhub@latest install moonpay-skills
```

### MCP Server

The MoonPay CLI can also run as an MCP server, exposing all tools to any MCP-compatible client:

```bash
npm i -g @moonpay/cli
mp mcp
```

See the [moonpay-mcp](skills/moonpay-mcp/SKILL.md) skill for setup details.

## Skills

### Core Skills

| Skill | Description |
|-------|-------------|
| [moonpay-auth](skills/moonpay-auth/) | CLI setup, authentication, and wallet management |
| [moonpay-check-wallet](skills/moonpay-check-wallet/) | Check balances, holdings, and portfolio breakdown |
| [moonpay-swap-tokens](skills/moonpay-swap-tokens/) | Swap tokens on the same chain or bridge across chains |
| [moonpay-discover-tokens](skills/moonpay-discover-tokens/) | Search tokens, check prices, get trading briefs |
| [moonpay-buy-crypto](skills/moonpay-buy-crypto/) | Buy crypto with fiat via MoonPay checkout |
| [moonpay-deposit](skills/moonpay-deposit/) | Create deposit links that accept crypto from any chain |
| [moonpay-block-explorer](skills/moonpay-block-explorer/) | Open transactions, wallets, and tokens in block explorers |
| [moonpay-export-data](skills/moonpay-export-data/) | Export portfolio and transaction history to CSV/JSON |
| [moonpay-virtual-account](skills/moonpay-virtual-account/) | Fiat on-ramp and off-ramp via virtual accounts |
| [moonpay-hardware-wallet](skills/moonpay-hardware-wallet/) | Connect a Ledger hardware wallet |
| [moonpay-mcp](skills/moonpay-mcp/) | Set up MoonPay as an MCP server |
| [moonpay-upgrade](skills/moonpay-upgrade/) | Increase API rate limits via x402 payment |
| [moonpay-x402](skills/moonpay-x402/) | Make paid API requests to x402-protected endpoints |
| [moonpay-feedback](skills/moonpay-feedback/) | Submit feedback, bug reports, or feature requests |
| [moonpay-missions](skills/moonpay-missions/) | Guided walkthrough of all MoonPay CLI capabilities |

### Trading & Markets

| Skill | Description |
|-------|-------------|
| [moonpay-prediction-market](skills/moonpay-prediction-market/) | Trade on Polymarket and Kalshi |
| [moonpay-fund-polymarket](skills/moonpay-fund-polymarket/) | Fund a Polymarket wallet with USDC.e on Polygon |
| [moonpay-trading-automation](skills/moonpay-trading-automation/) | DCA, limit orders, and stop losses via cron |
| [moonpay-price-alerts](skills/moonpay-price-alerts/) | Desktop notifications when tokens hit target prices |
| [moonpay-commerce](skills/moonpay-commerce/) | Browse Shopify stores and checkout with crypto |

### Partner Skills

Skills that integrate MoonPay wallet and payment capabilities with third-party platforms.

| Skill | Description |
|-------|-------------|
| [corbits](skills/corbits/) | Paid API marketplace with x402 USDC micropayments |
| [dune](skills/dune/) | On-chain analytics with wallet management |
| [shipp](skills/shipp/) | Sports data and Polymarket trading |
| [yield](skills/yield/) | Multi-chain yield opportunities |

## Adding a New Skill

### 1. Create the skill directory

```
skills/
└── your-skill-name/
    └── SKILL.md
```

### 2. Write SKILL.md

Every skill must have a `SKILL.md` with YAML frontmatter:

```yaml
---
name: your-skill-name
description: >
  What this skill does and when to use it.
  Be specific about trigger conditions.
tags: [relevant, tags]
---

# Your Skill

Instructions, commands, workflows, and examples.
```

See [template/SKILL.md](template/SKILL.md) for a minimal starting point.

### 3. Skill writing guidelines

- **Description**: Be explicit about when the skill should trigger. Include phrases like "Use when the user mentions X" or "TRIGGER when Y".
- **Keep SKILL.md concise**: Under 500 lines. Put large reference docs in a `references/` subdirectory.
- **Progressive disclosure**: Metadata (always loaded) → SKILL.md body (loaded on trigger) → bundled resources (loaded on demand).
- **Commands**: Include exact CLI commands with examples.
- **Related skills**: Link to other skills that complement this one.

### 4. Register the skill

Add the skill name to the appropriate plugin in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

### 5. Open a PR

Create a pull request with your new skill. Include:
- The skill directory with `SKILL.md`
- Updated `marketplace.json`
- A brief description of what the skill does and example usage

## Partner Skills

For adding partner integration skills, see [partners/README.md](partners/README.md). Partner skills follow the same format but are generated from templates to ensure consistency.

## Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`npm i -g @moonpay/cli`)
- [MoonPay for Agents](https://agents.moonpay.com)
