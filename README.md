<p align="center">
  <img src=".github/banner.png" alt="MoonPay Agents" />
</p>

# MoonPay Skills

[Agent Skills](https://agentskills.io) for crypto infrastructure — wallet management, token trading, cross-chain bridges, fiat on/off ramp, prediction markets, and more.

Skills are instructional folders that AI agents load dynamically to perform specialized tasks. Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and markdown instructions.

## Installation

### Any Agent (Recommended)

```bash
npx skills add moonpay/skills
```

This uses the [Skills CLI](https://github.com/vercel-labs/skills) to install skills via symlink. Works with Claude Code, Cursor, Windsurf, Codex, and [40+ other agents](https://github.com/vercel-labs/skills#supported-agents). Skills stay up to date — run `npx skills update` to pull the latest.

Install specific skills:

```bash
npx skills add moonpay/skills --skill moonpay-swap-tokens
```

Install globally (available across all projects):

```bash
npx skills add moonpay/skills --global
```

### Claude Code — Plugin Marketplace

```
/plugin marketplace add moonpay/skills
/plugin install moonpay-skills
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
| [moonpay-scout](skills/moonpay-scout/) | Cross-platform prediction market arbitrage scanner |
| [moonpay-trading-automation](skills/moonpay-trading-automation/) | DCA, limit orders, and stop losses via cron |
| [moonpay-price-alerts](skills/moonpay-price-alerts/) | Desktop notifications when tokens hit target prices |
| [moonpay-commerce](skills/moonpay-commerce/) | Browse Shopify stores and checkout with crypto |

### Research & Analytics

| Skill | Description |
|-------|-------------|
| [messari-x402](skills/messari-x402/) | Access Messari's full API via x402 micropayments |
| [messari-token-research](skills/messari-token-research/) | Token research workflow via Messari |
| [messari-alpha-scout](skills/messari-alpha-scout/) | Alpha scouting — trending narratives and momentum |
| [messari-funding-intel](skills/messari-funding-intel/) | VC funding rounds and M&A intelligence |
| [messari-deep-research](skills/messari-deep-research/) | Long-form AI research reports |

### Partner Skills

| Skill | Description |
|-------|-------------|
| [corbits-marketplace](skills/corbits-marketplace/) | Paid API marketplace with x402 micropayments |
| [myriad-prediction-markets](skills/myriad-prediction-markets/) | BNB Chain prediction market trading |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full skill quality rubric and submission guide. Only A+ skills are merged.

Quick start:

1. Fork this repo and create a branch
2. Create `skills/{partner}-{name}/SKILL.md` using the [template](template/SKILL.md)
3. Add your skill to `.claude-plugin/marketplace.json` in its own plugin block
4. Open a PR — every CLI command in your skill must be real and verifiable

## Resources

- [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`npm i -g @moonpay/cli`)
- [MoonPay for Agents](https://agents.moonpay.com)
- [Skills CLI](https://github.com/vercel-labs/skills) (`npx skills add moonpay/skills`)
