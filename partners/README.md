# Partner Skills

BD toolkit for generating partner skill files that embed MoonPay CLI capabilities into third-party AI agent products.

## Current Partners

| Partner | Primary Chain | Integration |
|---------|---------------|-------------|
| Corbits | Ethereum | Paid API marketplace via x402 micropayments |
| Dune | Ethereum | On-chain analytics with wallet management |
| Shipp | Polygon | Sports data and Polymarket trading |
| Yield | Multi-chain | Yield opportunities with transaction signing |

## Adding a New Partner

1. Copy `configs/example-new-partner.json` to `configs/{partner-name}.json`
2. Fill in all placeholder values from the partner's API docs
3. Generate the markdown: `python generate.py configs/{partner-name}.json`
4. Output lands in `output/{partner-name}-moonpay-skill.md`
5. Create the skill: copy the relevant content into `../skills/{partner-name}/SKILL.md` with proper YAML frontmatter
6. Register in `../.claude-plugin/marketplace.json` under `partner-skills`
7. Open a PR

## Generating HTML

```bash
python export_html.py
```

Generates shareable HTML versions in `docs/`.
