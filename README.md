# MoonPay Skills

[Agent Skills](https://agentskills.io) for crypto infrastructure — wallet management, token trading, cross-chain bridges, fiat on/off ramp, prediction markets, and more.

Skills are instructional folders that AI agents load dynamically to perform specialized tasks. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and markdown instructions.

## Installation

### Claude Code — Plugin Marketplace

```
/plugin marketplace add moonpay/skills
/plugin install moonpay-skills
```

### Claude Code — Manual

Copy any skill directory into your project:

```
.claude/skills/moonpay-swap-tokens/SKILL.md
```

Or into your personal skills for use across all projects:

```
~/.claude/skills/moonpay-swap-tokens/SKILL.md
```

### Claude.ai

1. Go to **Settings > Features > Skills**
2. Click **+** and select **Upload a skill**
3. Upload a ZIP of the skill directory

### Claude API

```python
skill = client.beta.skills.create(
    display_title="MoonPay Swap Tokens",
    files=files_from_dir("skills/moonpay-swap-tokens"),
    betas=["skills-2025-10-02"],
)
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


## Contributing

We welcome contributions! Whether you're a partner integrating with MoonPay or a community member, here's how to add a skill:

1. Fork this repo and create a branch.

2. Create `skills/{partner}-{name}/SKILL.md` using the [template](template/SKILL.md). Use your company/project name as a prefix (e.g., `corbits-marketplace`, `dune-analytics`). Your skill should:
   - Have a clear `name` and `description` in the YAML frontmatter
   - Describe **when** an AI agent should use this skill
   - Reference MoonPay CLI commands (`mp`) for any wallet, trading, or payment functionality

3. Add your skill to the `moonpay-skills` plugin in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

4. Open a PR with:
   - A brief description of what the skill does
   - Example usage showing the end-to-end workflow

See existing skills under `skills/` and the [PR template](.github/PULL_REQUEST_TEMPLATE.md) for reference. All contributions are covered by the repo [LICENSE](LICENSE).

## Resources

- [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`npm i -g @moonpay/cli`)
- [MoonPay for Agents](https://agents.moonpay.com)
