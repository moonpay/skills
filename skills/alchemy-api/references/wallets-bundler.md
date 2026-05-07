---
id: references/wallets-bundler.md
name: 'Bundler'
description: 'A bundler aggregates and submits account abstraction user operations. Use this when integrating smart accounts (Wallet APIs). Supports EntryPoint v0.6, v0.7, and v0.8.'
tags:
  - alchemy
  - wallets
related:
  - wallets-smart-wallets.md
  - wallets-gas-manager.md
updated: 2026-04-22
---
# Bundler

## Summary
A bundler aggregates and submits account abstraction user operations. Use this when integrating smart accounts via Alchemy Wallet APIs. Powered by Rundler, Alchemy's production-grade ERC-4337 bundler.

## Supported EntryPoint Versions
- **v0.6** — original ERC-4337 EntryPoint
- **v0.7** — updated gas model and validation logic
- **v0.8** — latest version with additional optimizations

When configuring the bundler, ensure you target the correct EntryPoint version for your smart account implementation.

## Primary Use Cases
- AA transaction submission via standard ERC-4337 JSON-RPC endpoints.
- UserOperation lifecycle handling (submit, track, drop-and-replace).

## Integration Notes
- Ensure correct chain configuration and EntryPoint version.
- Monitor bundler latency and failures.
- Use `eth_getUserOperationByHash` to poll UserOp status; if still null after timeout, drop and replace with higher fees.
- For `Replacement Underpriced` errors, increase both `maxFeePerGas` and `maxPriorityFeePerGas` by at least 10%.
- Bundler APIs are available in `@account-kit/infra`. For higher-level abstractions, use Wallet APIs or aa-sdk.

## Related Files
- `wallets-smart-wallets.md`
- `wallets-gas-manager.md`

## Official Docs
- [Bundler Overview](https://www.alchemy.com/docs/wallets/transactions/low-level-infra/bundler/overview)
- [Bundler FAQs](https://www.alchemy.com/docs/wallets/reference/bundler-faqs)
