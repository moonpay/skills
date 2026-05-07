---
id: references/wallets-overview.md
name: wallets
description: Integration guide for Alchemy Wallet APIs (formerly Smart Wallets) including Account Kit, account abstraction, bundler, gas manager, and paymaster. Use when building wallet onboarding flows, sponsoring gas, or integrating smart accounts into your application.
tags: []
related: []
updated: 2026-04-22
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Wallets

## Summary
High-level integration notes for Alchemy **Wallet APIs** (the product formerly branded as "Smart Wallets") and the smart-account tooling around them. This section is intentionally light: enough to integrate without diving into deep wallet infrastructure.

## References (Recommended Order)
1. [wallets-details.md](wallets-details.md) - When to use Alchemy wallet tooling.
2. [wallets-account-kit.md](wallets-account-kit.md) - Account Kit overview and entry points.
3. [wallets-smart-wallets.md](wallets-smart-wallets.md) - Smart wallet basics and AA alignment.
4. [wallets-bundler.md](wallets-bundler.md) - Bundler integration notes (AA flows).
5. [wallets-gas-manager.md](wallets-gas-manager.md) - Gas sponsorship and paymaster guidance.
6. [wallets-wallet-apis.md](wallets-wallet-apis.md) - Basic wallet API concepts.
7. [wallets-supported-chains.md](wallets-supported-chains.md) - Wallet-specific chain support notes.
8. [wallets-solana-notes.md](wallets-solana-notes.md) - Solana wallet considerations (high-level).

## Debugging
- The Transaction Lifecycle Dashboard integrates with **Tenderly** for debugging failed Wallet API transactions (PAYG/Enterprise tiers).
- **Debug** button: opens Tenderly debugger for onchain reverts (transactions with a hash).
- **Simulate** button: runs Tenderly simulation for offchain failures (`UserOperationExecutionError`, no tx hash).
- Use when diagnosing opaque reverts, `AA23` errors, or batched call failures.
- [Debug with Tenderly docs](https://www.alchemy.com/docs/wallets/transactions/debug-transactions/debug-with-tenderly)

## Cross-References
- `node-apis` skill for EVM connectivity.
- `solana` skill for Solana RPC and data.
- `alchemy-cli` skill for live agent work via the local CLI (preferred local fallback).
- `alchemy-mcp` skill for live agent work via the hosted MCP server (when CLI is not installed).
- `alchemy-agentic-gateway` skill for app code without an API key (x402 or MPP).

## Official Docs
- [Wallet APIs](https://www.alchemy.com/docs/wallets)
- [Wallet APIs Get Started](https://www.alchemy.com/docs/get-started)
- [Legacy session keys with Wallet APIs](https://www.alchemy.com/docs/wallets/smart-wallets/session-keys/legacy-session-keys) — migration guide for existing session-key setups.
