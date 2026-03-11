# MoonPay Partner Skills

BD toolkit for generating `[partner]-moonpay-skill.md` files for integrated partners.

## Partners (Ready to Send)

| Partner | File | Primary Chain | MoonPay Integration |
|---------|------|---------------|---------------------|
| Shipp | `partners/shipp-moonpay-skill.md` | Polygon | Wallet for Polymarket trading with live sports data |
| Corbits | `partners/corbits-moonpay-skill.md` | Ethereum | EVM wallet for x402 USDC micropayments |
| Yield.xyz | `partners/yield-moonpay-skill.md` | Multi-chain | Signs unsigned yield transactions |
| Dune | `partners/dune-moonpay-skill.md` | Ethereum | Wallet creation + fund/monitor on-chain |

## Adding a New Partner

**If they send a skill file:**
1. Copy `configs/example-new-partner.json` → `configs/partnername.json`
2. Fill in the partner sections from their skill file
3. Run: `python generate.py configs/partnername.json`
4. Review output in `partners/partnername-moonpay-skill.md`

**If they send API docs:**
1. Same as above — extract: product description, auth method, key endpoints, one code example
2. Pick `PRIMARY_CHAIN` and `PRIMARY_TOKEN` based on what their product needs
3. Set `MOONPAY_WALLET_INTRO` to explain the specific integration (payments? signing? monitoring?)

## Template Placeholders Reference

| Key | What to fill in |
|-----|-----------------|
| `PARTNER_SLUG` | Filename prefix (e.g. `shipp`) |
| `PARTNER_NAME` | Display name |
| `PARTNER_TAGLINE` | One-line description |
| `PRIMARY_CHAIN` | `polygon`, `ethereum`, `solana`, etc. |
| `PRIMARY_TOKEN` | `USDC.e`, `USDC`, `ETH`, etc. |
| `MOONPAY_WALLET_INTRO` | Why they need MoonPay (the integration story) |
| `WALLET_LINK_HEADING` | Section title for linking wallet to partner |
| `WALLET_LINK_INSTRUCTIONS` | Commands to connect MoonPay wallet to partner |

## Common Integration Stories

- **Prediction market trading** (Shipp-style): Wallet for Polymarket → USDC.e on Polygon
- **Micropayments** (Corbits-style): EVM wallet for x402 → USDC on Ethereum
- **Unsigned tx signing** (Yield-style): Non-custodial → sign with `mp transaction send`
- **Analytics + act** (Dune-style): Monitor wallet on-chain → fund/move via mp CLI
