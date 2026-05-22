---
id: references/wallets-gas-manager.md
name: 'Gas Manager'
description: 'Gas Manager (paymaster) enables gas sponsorship and cost control for smart wallet flows, including ERC-20 token gas payments and BSO (Bundler Sponsorship) policies.'
tags:
  - alchemy
  - wallets
related:
  - wallets-smart-wallets.md
  - wallets-bundler.md
updated: 2026-04-22
---
# Gas Manager

## Summary
Gas Manager (paymaster) enables gas sponsorship and cost control for smart wallet flows.

## Primary Use Cases
- Gasless user onboarding.
- Sponsoring specific methods or contracts.
- ERC-20 token gas payments (pay gas with any supported token).
- BSO (Bundler Sponsorship) policies for EIP-7702 undelegation.

## BSO Chain Support
Bundler Sponsored Operations (BSOs) are a bundler feature and are supported on **every chain that has both bundler and gas sponsorship support**, with the exception of **MegaETH** (coming soon). Always confirm against the live [Wallet APIs supported chains](https://www.alchemy.com/docs/wallets/supported-chains) matrix before launch.

## Integration Notes
- Define strict sponsorship policies.
- Monitor for abuse and enforce caps.

## ERC-20 Token Gas Payment — Revert Risk
When using **post-operation** mode for ERC-20 gas payments:
- If a token approval is batched with your calls and any call reverts, the approval is also reverted. The paymaster cannot collect the token payment, and **you (the policy owner) pay the gas cost** without receiving token compensation.
- If a sufficient allowance already exists (e.g., from threshold mode), the paymaster collects payment even if the batch reverts.
- **Use post-operation** when operations are unlikely to revert (works with all ERC-20 tokens).
- **Use pre-operation** when operations may revert — the token transfer happens before execution so the paymaster is always compensated.

## Related Files
- `wallets-smart-wallets.md`
- `wallets-bundler.md`

## Official Docs
- [Gas Manager Admin API](https://www.alchemy.com/docs/wallets/low-level-infra/gas-manager/policy-management/api-endpoints)
- [Pay Gas With Any Token](https://www.alchemy.com/docs/wallets/transactions/pay-gas-with-any-token)
