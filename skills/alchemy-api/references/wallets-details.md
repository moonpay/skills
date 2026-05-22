---
id: references/wallets-details.md
name: 'Wallets Overview'
description: 'Alchemy Wallets tooling helps developers embed or integrate wallets with minimal infrastructure. This section is intentionally basic and focuses on integration touchpoints.'
tags:
  - alchemy
  - wallets
related:
  - wallets-account-kit.md
  - wallets-smart-wallets.md
  - wallets-bundler.md
  - wallets-gas-manager.md
updated: 2026-04-22
---
# Wallets Overview

> **Naming note:** Alchemy rebranded "Smart Wallets" to **Wallet APIs**. Both terms may still appear in older material; prefer "Wallet APIs" going forward.

## Summary
Alchemy Wallet APIs help developers embed or integrate wallets with minimal infrastructure. This section is intentionally basic and focuses on integration touchpoints.

## Primary Use Cases
- User onboarding with embedded wallets.
- Account abstraction (smart wallets).
- Gas sponsorship and transaction bundling.

## When To Use / Not Use
- Use when you want an end-to-end, batteries-included wallet stack (signer → smart account → bundler → paymaster).
- Avoid if you already have a wallet provider and only need RPC/data.

## Related Files
- `wallets-account-kit.md`
- `wallets-smart-wallets.md`
- `wallets-bundler.md`
- `wallets-gas-manager.md`

## Official Docs
- [Wallet APIs](https://www.alchemy.com/docs/wallets)
