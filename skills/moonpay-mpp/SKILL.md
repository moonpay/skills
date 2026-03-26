---
name: moonpay-mpp
description: Make paid API requests to MPP-protected endpoints using Tempo stablecoins. Automatically handles payment with your local wallet.
tags: [payments, api, mpp]
---

# MPP paid API requests

## Goal

Make HTTP requests to MPP (Machine Payments Protocol) protected endpoints. The CLI automatically detects 402 Payment Required responses, pays via Tempo stablecoins using your local wallet, and retries the request with the payment credential.

MPP is the open standard for machine-to-machine payments via HTTP 402, co-developed by Tempo and Stripe. It's backwards-compatible with x402 but supports additional payment rails including Stripe cards, Tempo stablecoins, and Lightning.

## Command

```bash
mp mpp request \
  --method GET \
  --url <mpp-endpoint-url> \
  --wallet <wallet-name-or-address>
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--method` | Yes | HTTP method (GET, POST, PUT, PATCH, DELETE) |
| `--url` | Yes | HTTPS URL of the MPP-protected endpoint |
| `--body` | No | JSON request body (for POST, PUT, PATCH) |
| `--params` | No | Query parameters as JSON |
| `--wallet` | Yes | Wallet name or address to pay with |

## Example flow

1. User: "Fetch token data from Codex using MPP."
2. Run: `mp mpp request --method GET --url https://api.codex.io/graphql --wallet my-wallet --params '{"query": "..."}'`
3. The CLI handles the 402 payment flow automatically via Tempo.

## Notes

- Payments are made via **Tempo stablecoins** using your EVM wallet key.
- No chain selection needed — Tempo handles the payment rail automatically.
- Compatible with any MPP-protected endpoint (Codex, Stripe-powered services, etc.).
- If the endpoint doesn't return a 402, the request proceeds normally (no payment).
- Use **moonpay-auth** to set up a local wallet first.

## Related skills

- **moonpay-auth** — Create or import a local wallet.
- **moonpay-check-wallet** — Check your wallet balance before making paid requests.
- **moonpay-x402** — Make paid requests to x402-protected endpoints (crypto payments on Solana/Base).
- **moonpay-upgrade** — Upgrade your rate limit via x402 or MPP.
