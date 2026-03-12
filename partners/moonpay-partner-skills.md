# MoonPay Partner Skills

We're collaborating with partners to embed MoonPay's financial infrastructure directly into their products. Any AI agent using these platforms automatically gets wallet creation, crypto funding, cross-chain bridging, and fiat offramp — without leaving the product.

---

## Integrated Partners

### [Shipp](https://shipp.ai) — Real-Time Sports Data
Live sports scores and events for AI agents. Use Shipp data to trigger prediction market trades, executed via a MoonPay-funded wallet on Polymarket.

**MoonPay role:** Wallet + USDC.e funding for Polymarket trading

---

### [Corbits](https://corbits.dev) — Paid API Marketplace
Discover and call premium APIs with automatic USDC micropayments via the x402 protocol. MoonPay wallet is the payment wallet — same key, no transfer needed.

**MoonPay role:** EVM wallet for x402 USDC micropayments

---

### [Yield.xyz](https://agent.yield.xyz) — Multi-Chain Yield Optimization
2,600+ yield opportunities across 75+ blockchains, fully non-custodial. Yield.xyz builds unsigned transactions; MoonPay signs and broadcasts them.

**MoonPay role:** Signs unsigned yield transactions, funds deposits cross-chain

---

### [Dune](https://dune.com) — Blockchain Analytics
DuneSQL queries against live on-chain data. Use Dune to monitor your MoonPay-managed wallets and act on findings with bridges, swaps, and transfers.

**MoonPay role:** Wallet creation + on-chain monitoring + asset movement

---

## For Partners: 10-Minute Integration

1. Receive your `[partner]-moonpay-skill.md` file from MoonPay
2. Drop it in your repo root as `SKILL.md` — or publish to [ClawHub](https://clawhub.ai)
3. Your users now have full MoonPay CLI capabilities inside your product

```bash
# Your users install it
npx clawhub@latest install [partner]-moonpay
```

That's it. No SDK, no API key exchange, no engineering sprint.

---

## What Users Get

| Capability | Command |
|-----------|---------|
| Create self-custody wallet | `mp wallet create` |
| Buy crypto with fiat | `mp buy` |
| Bridge tokens cross-chain | `mp token bridge` |
| Sign & send transactions | `mp transaction send` |
| Cash out to bank | `mp virtual-account offramp` |

---

*Interested in integrating? Reach out and we'll have your skill file ready same day.*
