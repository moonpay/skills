---
id: references/wallets-smart-wallets.md
name: 'Smart Wallets'
description: 'Smart wallets (account abstraction) enable programmable accounts with features like session keys, batched transactions, and gas sponsorship.'
tags:
  - alchemy
  - wallets
related:
  - wallets-bundler.md
  - wallets-gas-manager.md
updated: 2026-04-22
---
# Smart Wallets

> **Naming note:** Alchemy's product branding has moved from "Smart Wallets" to **Wallet APIs**. This file describes the general *concept* of smart contract accounts / account abstraction — the underlying primitive exposed by Alchemy's Wallet APIs. For the product surface, see `wallets-wallet-apis.md`.

## Summary
Smart wallets (account abstraction) are programmable accounts with features like session keys, batched transactions, and gas sponsorship. Alchemy exposes these capabilities through the **Wallet APIs** product.

## Primary Use Cases
- Gasless onboarding.
- Transaction batching and automation.
- Safer UX via spend limits or session keys.

## Integration Notes
- Smart wallets typically require a bundler and paymaster.
- Pair with `wallets-bundler.md` and `wallets-gas-manager.md`.

## Gotchas & Edge Cases
- Account deployment costs can vary by chain.
- Some dapps require EOA-only signatures; handle fallbacks.

## Related Files
- `wallets-bundler.md`
- `wallets-gas-manager.md`

## Official Docs
- [Wallet APIs](https://www.alchemy.com/docs/wallets)
- [Intro to Account Kit](https://www.alchemy.com/docs/wallets/concepts/intro-to-account-kit)
