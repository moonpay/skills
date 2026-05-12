---
name: moonpay-commerce
description: Browse Solana Pay-enabled Shopify stores, manage a cart, and checkout with crypto — or pay any MoonPay Commerce (Helio) paylink, deposit, or charge directly via the x402 protocol with USDC across Base, Ethereum, Polygon, Arbitrum, BSC, and Solana. Use when the user supplies any hel.io URL (paylink at https://api.hel.io/v1/x402/..., charge at https://moonpay.hel.io/charge/<uuid>, https://app.hel.io/charge/<uuid>, or https://api.hel.io/v1/charge/<uuid>), supplies a bare UUID with the word "charge", or asks to buy/tip/subscribe/pay-charge via MoonPay Commerce. **Load this skill before calling moonpay or pay tools whenever the user is paying anything Helio-related — the routing rules below decide which endpoint to hit.**
tags: [commerce, shopping, payments, x402, agent-payments]
---

# Shop with crypto

## Goal

Browse Solana Pay-enabled Shopify stores, add items to a cart, and pay with crypto. The entire flow runs from the CLI — no browser needed.

## Commands

### List stores

```bash
mp commerce store list
```

### Search products

```bash
mp commerce product search --store <store> --query <search-term>
```

### Get product details

```bash
mp commerce product retrieve --store <store> --productId <product-id>
```

### Add item to cart

```bash
mp commerce cart add \
  --store <store> \
  --variantId <variant-id> \
  --quantity <number> \
  --cartId <cart-id>  # omit to create a new cart
```

### View cart

```bash
mp commerce cart retrieve --store <store> --cartId <cart-id>
```

### Remove item from cart

```bash
mp commerce cart remove --store <store> --cartId <cart-id> --lineId <line-id>
```

### Checkout and pay

```bash
mp commerce checkout \
  --wallet <wallet-name> \
  --store <store> \
  --cartId <cart-id> \
  --chain solana \
  --email <buyer-email> \
  --firstName <first> \
  --lastName <last> \
  --address <street-address> \
  --city <city> \
  --postalCode <zip> \
  --country <country-name>
```

## Example flow

1. Browse stores: `mp commerce store list`
2. Search: `mp commerce product search --store ryder.id --query "ryder"`
3. Add to cart: `mp commerce cart add --store ryder.id --variantId "gid://shopify/ProductVariant/51751218774319" --quantity 1`
4. Check cart: `mp commerce cart retrieve --store ryder.id --cartId <id-from-step-3>`
5. Checkout: `mp commerce checkout --wallet main --store ryder.id --cartId <id> --chain solana --email buyer@example.com --firstName John --lastName Doe --address "123 Main St" --city Amsterdam --postalCode 1011 --country Netherlands`

## How it works

1. Stores expose a Shopify MCP endpoint for browsing and cart management
2. `cart add` creates or updates a cart (no auth needed, cart ID is the handle)
3. `checkout` calls the API to start a Helio payment, signs the transaction locally, and submits
4. Helio pays gas — the buyer only pays the item price in USDC
5. Returns a transaction signature and order confirmation URL

## Tips

- Run `cart add` multiple times to add different items — pass the `--cartId` from the first call
- Use `product search` to find variant IDs — each variant has a Shopify GID
- The `--country` flag takes full country names (e.g. "United States", "Netherlands")
- Checkout takes 30-90 seconds — the API automates the Shopify checkout flow
- The Shopify storefront checkout currently supports Solana only. The MoonPay Commerce x402 paylink flow below supports Base, Ethereum, Polygon, Arbitrum, BSC, and Solana.

## MoonPay Commerce

Pay for products on [MoonPay Commerce](https://www.moonpay.com/en-gb/newsroom/moonpay-commerce) using the [x402](https://www.x402.org/) protocol. The agent settles the payment on-chain automatically when a user asks to buy, tip, or subscribe via a MoonPay Commerce paylink.

### When to use

- The user supplies a MoonPay Commerce paylink URL (`https://api.hel.io/v1/x402/checkout/<id>` or a merchant product URL resolving to one)
- The user asks to buy, tip, pay, or subscribe to a product powered by MoonPay Commerce
- An agent is operating autonomously and encounters an `https://api.hel.io` x402 endpoint
- The user asks to pay for a **charge** — typically a URL like `https://moonpay.hel.io/charge/<UUID>`, `https://app.hel.io/charge/<UUID>`, or just a bare UUID such as `6d0a1c57-3544-42e2-aa44-b654077c7529`. A UUID by itself is a `chargeToken`, **not** a `paylinkId` and **not** a `depositId`.

### Identifier routing cheat-sheet

A bare UUID is **never** the right input for `/checkout/{paylinkId}`, `/deposit/{depositId}`, or `/v1/paylink/{id}/public` — all of those expect short merchant-issued IDs and will 404 on a UUID.

| What the user supplies | First step | Settle endpoint |
|---|---|---|
| Paylink URL or short slug (e.g. `app.hel.io/pay/<slug>`) | optional `GET /v1/paylink/{paylinkId}/public` | `POST /v1/x402/checkout/{paylinkId}` |
| Deposit ID from a merchant | — | `POST /v1/x402/deposit/{depositId}` |
| **Bare UUID** or a `…/charge/<UUID>` URL | **`GET /v1/charge/{chargeToken}` first** — read `paylinkTxs`, `windowClosed`, `paylink.id` | see "Routing a charge" below — charge-resume is the default for any non-expired, non-settled Charge **regardless of `source`** |

#### Routing a charge

> **The intent is always: settle the original Charge token so `GET /v1/charge/<token>` flips to paid.** `POST /v1/x402/checkout/charge/<chargeToken>` is the only path that does this — it creates the `PaylinkTx` *and* links it back to the Charge (`paylinkTxs` becomes non-empty, `paylinkTx` becomes non-null). It works for every `source` — `shopify`, `api` (e.g. CoinMarketCap boost), `paylink`, `x402`. There is no longer a "Shopify-only" restriction on this endpoint.

**Step 1 — fetch the Charge** (no payment side-effect, just a read):

```bash
curl -s "https://api.hel.io/v1/charge/<chargeToken>"
```

**Step 2 — decision rules, in order:**

1. **`paylinkTxs` non-empty** → Charge is already settled. Do not pay again. Surface the linked transaction from the GET response.
2. **`windowClosed: true`** → Charge expired. **Stop.** Tell the user the original window has closed and ask the merchant to re-issue a Charge with a fresh window. Do **not** auto-route to the paylink endpoint — that orphans the payment (see "Paylink-direct as last resort"). Only proceed with paylink-direct if the user has explicitly consented to an orphan payment after being told the merchant cannot re-issue.
3. **Otherwise** → `POST /v1/x402/checkout/charge/<chargeToken>` (currently Solana-only; EVM on the roadmap). Settles the Charge in place — works for any `source`.

> **No auto-fallback on charge-resume failure.** If `POST /v1/x402/checkout/charge/<chargeToken>` fails — for **any** reason (`CHARGE_EXPIRED`, `CHARGE_ALREADY_SETTLED`, `CHARGE_NOT_FOUND`, 5xx, on-chain revert, etc.) — **do not silently retry against `/v1/x402/checkout/<paylink.id>`.** Settling the paylink mints a *fresh* on-chain payment that is not linked to the original `chargeToken`: the original stays unpaid (issuing system still sees it unsettled), and you've spent the user's funds on an orphan transaction. Stop, report the failure to the user, and only consider "Paylink-direct as last resort" with explicit user consent.

> **`paylink.id` is the field name** in the `GET /v1/charge/<chargeToken>` response (e.g. `"paylink":{"id":"69fc6d95...","template":"PAYLINK_V2",...}`), not `paylink._id`. You only need it for the explicit orphan escape hatch below.

### Protocol overview

x402 is a machine-native payment protocol built on HTTP 402. The flow is:

```
1. Agent sends POST to the resource URL (with ?payerAddress=<wallet>)
2. Server responds HTTP 402 + PAYMENT-REQUIRED header (network, amount, payTo)
3. Agent signs the payment authorization and retries with PAYMENT-SIGNATURE header
4. Server verifies on-chain, settles, returns HTTP 200 + PAYMENT-RESPONSE header
```

Both `mp x402 request` (MoonPay CLI) and any x402-compatible client library handle steps 2–4 automatically.

### API endpoints

**Base URL:** `https://api.hel.io`

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/x402/checkout/{paylinkId}` | One-time checkout payment |
| `POST` | `/v1/x402/deposit/{depositId}` | Recurring / balance-based deposit payment |
| `POST` | `/v1/x402/checkout/charge/{chargeToken}` | Settle an in-flight Shopify-source Charge (created when the buyer selected Solana Pay at the Shopify checkout) |
| `GET` | `/v1/paylink/{id}/public` | Fetch public product metadata (requires `Origin` header) |
| `GET` | `/v1/charge/{chargeToken}` | Fetch Charge state — use after settlement to confirm payment status |
| `GET` | `/v1/health` | Health check — returns `{"status":"ok"}` |

### Prerequisites

- **MoonPay CLI (`mp`)** installed and authenticated (`mp wallet list` should show your wallet)
- Payer wallet funded with USDC on the target chain
- A MoonPay Commerce paylink URL from the merchant (e.g. from https://app.hel.io)

Check your balance before paying:

```bash
mp token balance list --wallet <wallet-name> --chain <chain>
```

Supported chains: `base`, `ethereum`, `polygon`, `arbitrum`, `bsc`, `solana`.

### Product discovery

MoonPay Commerce has no bulk catalog API — merchants supply paylink URLs directly. Before paying, fetch the paylink metadata to display product details and confirm the amount:

```bash
curl -s "https://api.hel.io/v1/paylink/<paylinkId>/public" \
  -H "Origin: https://app.hel.io"
```

Returns: product name, description, price (in minimal USDC units), and supported blockchains. Use this to present a confirmation summary to the user before executing any payment.

If the user only has a merchant product URL (not a raw paylink URL), resolve it to a paylink ID first — the paylink ID is typically the last path segment of the checkout URL.

### Critical: `payerAddress` requirement

**MoonPay Commerce requires a `?payerAddress=<wallet>` query parameter on every request.**

The server pre-allocates a per-payer deposit wallet on the initial 402 request, so it must know the payer's address before it can respond. Standard x402 clients do not send this automatically — you must append it manually.

Always append `?payerAddress=<wallet>` to the URL:

```bash
# Get the EVM address for your wallet first
mp wallet list

# Then include it in the URL
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/<paylinkId>?payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain <chain>
```

Without this, the server returns HTTP 400 with message `"x-payer-address header or ?payerAddress= query param required"`.

### Payment flow

#### Checkout (one-time payments)

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/<paylinkId>?payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain <chain>
```

**Fixed-price paylinks** — the merchant has set a price; no `?amount=` needed.

**Dynamic-price paylinks** — append `?amount=<minimalUnits>&payerAddress=<address>`. Default to **$3 (`amount=3000000`)** for first-time or illustrative runs unless the user specifies otherwise.

#### Deposit (recurring / balance-based payments)

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/deposit/<depositId>?payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain <chain>
```

#### Charge resume — the default path for any Charge

Use this whenever the Charge is not expired (`windowClosed: false`) and not already settled (`paylinkTxs` empty), **regardless of `source`**. It works for Shopify Solana Pay, API-issued charges (CoinMarketCap token boost, billing systems, x402-issued charges), and `paylink`-source charges alike. The endpoint creates the `PaylinkTx` and links it back to the Charge so `GET /v1/charge/<token>` flips to a paid state.

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/charge/<chargeToken>?payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain solana
```

- The amount is **derived from the Charge** (`Charge.usdcAmount`) — do **not** append `?amount=` for charge-resume requests.
- Currently **Solana-only**; EVM (Base / Polygon / Arbitrum / BSC) is on the roadmap.
- On HTTP 200, settlement is fire-and-forget: the server creates the `PaylinkTx` and links it to the Charge. For Shopify-source charges it also triggers Shopify's `paymentSessionResolveMutation` to flip the order to paid in the merchant admin. The `txSignature` is **not** returned in the 200 body — confirm it via `GET /v1/charge/{chargeToken}` (see "Verifying payment status" below).
- **On failure, stop — do not auto-fall-back.** Any non-200 response (`CHARGE_EXPIRED`, `CHARGE_ALREADY_SETTLED`, `CHARGE_NOT_FOUND`, 5xx, on-chain revert) means the original Charge has not been settled. Silently retrying against `/v1/x402/checkout/<paylink.id>` does **not** rescue the original Charge — it mints a separate, orphan transaction while the original `chargeToken` stays unpaid. Report the error and only consider "Paylink-direct as last resort" below with explicit user consent.

**Worked example — API-source Charge with an open window** (e.g. CoinMarketCap token boost):

```text
GET /v1/charge/b2b41023-... →
  source: "api"
  windowClosed: false
  shopifyPaymentDetails: <absent>
  paylink: { id: "69fc6d95...", template: "PAYLINK_V2", ... }
  usdcAmount: "3100000"
  paylinkTxs: []
```

Routing decision: not expired, not settled → **charge-resume**. Source does not matter.

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/charge/b2b41023-...?payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet moonfi-xzhang \
  --chain solana
```

After the 200, poll the Charge:

```bash
curl -s "https://api.hel.io/v1/charge/b2b41023-..." | jq '{paylinkTx, paylinkTxs}'
```

Expected result within ~10s — `paylinkTxs` populated and `paylinkTx` (singular) non-null. That is the canonical "paid" signal that the issuing system (CMC, billing, etc.) polls for.

#### Paylink-direct as last resort (orphan payment)

> **Do not enter this path automatically.** It exists only as an explicit escape hatch when (a) charge-resume failed with an irrecoverable error (typically `CHARGE_EXPIRED`), (b) the merchant has confirmed they cannot re-issue the Charge, and (c) the user has been told the consequences and explicitly consented to an orphan payment.

If those three conditions are met, read the paylink ID from `paylink.id` in the GET response and pay the underlying paylink:

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/<paylink.id>?amount=<Charge.usdcAmount>&payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain <chain>
```

- For dynamic-price paylinks, pass `Charge.usdcAmount` through as `?amount=<minimalUnits>` so the user pays the same amount the original Charge requested.
- **Orphan-PaylinkTx consequence.** This creates a fresh on-chain payment for the same product/amount, but the new `PaylinkTx` is **not** linked back to the original Charge token. `GET /v1/charge/<chargeToken>` will continue to show `paylinkTxs: []` and `paylinkTx: null` even after a successful on-chain transfer. Any issuing system watching that specific token (CMC, billing, Shopify) will continue to see the Charge as unpaid — the merchant must reconcile manually.
- Always state the orphan consequence to the user **before** spending and require explicit confirmation. Default response when in doubt is "stop and ask the merchant to re-issue", not "pay the paylink anyway".

#### Before running any `mp x402 request`

Restate the **amount, chain, and recipient** to the user and wait for explicit confirmation. This spends real funds.

> _"About to send **$10.00 USDC on Base** to `<product name>` (paylink `<id>`). Proceed?"_

#### After a successful payment

Summarize: settlement tx hash, amount sent, chain, recipient.

> _"Paid $10.00 USDC on Base (settle tx `0x…`). Wallet balance: $X → $X-10."_

### 402 response structure

When no valid `PAYMENT-SIGNATURE` header is present, the server returns HTTP 402. The `PAYMENT-REQUIRED` header contains Base64-encoded JSON:

```json
{
  "x402Version": 1,
  "resource": {
    "url": "/v1/x402/checkout/<id>",
    "description": "<product name>",
    "mimeType": "application/json"
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "<CAIP-2 id, e.g. eip155:8453 or solana:5eykt4...>",
      "asset": "<token contract or mint address>",
      "amount": "<total in minimal units — already includes fees + gas>",
      "payTo": "<deposit wallet address>",
      "maxTimeoutSeconds": 60,
      "extra": {
        "name": "<token name, e.g. USD Coin>",
        "version": "<EIP-712 version, e.g. 2>"
      }
    }
  ]
}
```

Key points:
- **`amount` is the total cost** — fees and gas are already included. No additional calculation needed.
- **`payTo` is a per-payer deposit wallet**, not the merchant's address directly. Funds sweep to the merchant asynchronously after settlement.
- Each entry in `accepts[]` represents one supported chain. The `mp` CLI selects based on `--chain`.

### Supported chains

| Chain | CAIP-2 | Notes |
|---|---|---|
| Base | `eip155:8453` | Lowest gas; recommended default |
| Ethereum | `eip155:1` | Higher gas; use when required |
| Polygon | `eip155:137` | Low gas |
| Arbitrum | `eip155:42161` | Low gas |
| BSC | `eip155:56` | Low gas |
| Solana | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Fastest settlement (~5–10s) |

When the 402 response includes multiple chains, prefer lower-gas chains (Base, Polygon, Arbitrum) unless the user's wallet is funded on a specific chain. Solana is fastest if the user has SOL-based USDC.

If a chain's gas cost spikes beyond its threshold, the server excludes it from `accepts[]`. If **all** chains are excluded, the server returns HTTP 400 instead of 402 — retry later.

### Error handling

| HTTP | Error / Condition | Agent Action |
|---|---|---|
| **402** | No payment signature | Decode `PAYMENT-REQUIRED`, sign, retry with `PAYMENT-SIGNATURE` |
| **400** | `PAYLINK_INACTIVE` | Inform user — paylink is disabled; do not retry |
| **400** | `PAYLINK_DELETED` | Inform user — paylink is deleted; do not retry |
| **400** | `X402_UNSUPPORTED_FEATURES` | Paylink requires customer detail fields; x402 not supported for this paylink |
| **400** | `FEE_MARGIN_INSUFFICIENT` | Gas cost exceeds fee margin on all chains; retry later when gas settles |
| **400** | `FEE_RATE_EXCEEDS_PRICE` | Fee rate exceeds payment price; inform user |
| **400** | Empty `accepts[]` | All chains circuit-broken; retry later |
| **400** | Missing `payerAddress` | Append `?payerAddress=<wallet>` to the request URL |
| **400** | Invalid payer address | Validate format: base58 for Solana, `0x…` hex for EVM |
| **400** | Invalid `amount` param | Must be a positive integer string (minimal units) |
| **403** | `PAYLINK_SANCTIONED` | Abort — access restricted; do not retry |
| **403** | Payer mismatch | Signed payer address doesn't match provisioned identity; verify wallet |
| **404** | Paylink not found | Verify the paylink ID or URL is correct |
| **404** | `CHARGE_NOT_FOUND` (charge-resume) | The `chargeToken` does not match an in-flight Charge — confirm via `GET /v1/charge/{chargeToken}`; if that 404s too, re-trigger the upstream checkout. **Stop. Do not auto-fall-back to the paylink endpoint.** |
| **409** | Settlement in progress | A payment for this tx is already being settled; do not re-submit |
| **409** | `CHARGE_ALREADY_SETTLED` (charge-resume) | The Charge is already paid — confirm via `GET /v1/charge/{chargeToken}` and surface the existing tx. **Do not** pay the paylink "again to be safe" — that would double-charge. |
| **410** | `CHARGE_EXPIRED` (charge-resume) | The Charge expired before settlement. **Stop. Ask the merchant to re-issue a Charge with a fresh window.** Do NOT auto-fall-back to the paylink endpoint — that orphans the payment. The user may explicitly invoke "Paylink-direct as last resort" only if the merchant cannot re-issue and they consent to an orphan transaction. |
| **429** | Rate limited | Back off — 10 requests per 60 seconds per IP |

### Settlement behavior

Settlement is asynchronous. The HTTP 200 is returned as soon as the payment signature is verified. The on-chain sweep from the deposit wallet to the merchant happens in the background (typically 30–120s).

The `PAYMENT-RESPONSE` header in the 200 response contains the settlement transaction hash — this is the proof of payment to show the user.

For the **charge-resume** flow (`POST /v1/x402/checkout/charge/{chargeToken}`), settle is fire-and-forget and the 200 body does not carry the on-chain signature. Always confirm payment status by polling `GET /v1/charge/{chargeToken}` after the 200 (see below).

### Verifying payment status

At the end of every x402 payment, confirm the Charge has reached a terminal paid state by calling:

```bash
curl -s "https://api.hel.io/v1/charge/<chargeToken>"
```

Use this to:

- Confirm the `PaylinkTx` was created and linked to the Charge — check `paylinkTxs[]` (non-empty) on the Charge.
- Read the on-chain `txSignature` for the charge-resume flow (where it isn't returned in the 200 body).
- Detect settlement failures the 200 response can't surface (e.g. background sweep reverted, Shopify resolve failed).

The canonical success signal for any charge-resume flow is `paylinkTxs` non-empty (equivalently, `paylinkTx` non-null) on `GET /v1/charge/<token>`. This is the field issuing systems (CMC, billing, Shopify) actually poll. Reporting "paid" before that flips is premature.

Recommended polling: poll once immediately after the 200, then every 5–10s for up to ~120s. Stop polling as soon as the Charge shows a paid/settled state with a transaction signature attached. Surface the settlement tx hash to the user only after this confirmation — do **not** rely on the HTTP 200 alone for the charge-resume flow.

> If you took the "Paylink-direct as last resort" path, `paylinkTxs[]` on this specific Charge stays **empty** even after a successful on-chain payment — see that section for the orphan consequence to surface to the user.

### Example: paying a paylink

User says: _"Pay for the DEX Screener Token Boost at `https://api.hel.io/v1/x402/checkout/abc123` — use $10."_

**Step 1 — Discover product details:**

```bash
curl -s "https://api.hel.io/v1/paylink/abc123/public" \
  -H "Origin: https://app.hel.io"
```

**Step 2 — Get wallet address:**

```bash
mp wallet list
```

**Step 3 — Confirm with user:**

> _"About to send **$10.00 USDC on Base** for DEX Screener Token Boost (paylink `abc123`), signed from wallet `<name>`. Proceed?"_

**Step 4 — Execute payment:**

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/abc123?amount=10000000&payerAddress=0xYOUR_ADDRESS" \
  --wallet <wallet-name> \
  --chain base
```

**Step 5 — Summarize:**

> _"Paid $10.00 USDC on Base (settle tx `0x…`). Wallet balance: $X → $X-10."_

### Pre-payment checklist

Before executing any payment, verify:

- [ ] Wallet has sufficient USDC balance on the target chain (`mp token balance list`)
- [ ] The paylink ID is valid (confirmed via `GET /v1/paylink/{id}/public`)
- [ ] `?payerAddress=<wallet>` is included in the URL
- [ ] Amount is correct — in minimal units (6 decimals), matches the product price
- [ ] User has explicitly confirmed: product name, amount, chain, and wallet
- [ ] After settlement, payment status is confirmed via `GET /v1/charge/{chargeToken}` (mandatory for charge-resume; recommended for all flows)

### Custom client integration

Any x402-compatible HTTP client works with MoonPay Commerce endpoints. The client must:

1. Send an initial `POST` to the checkout/deposit/charge endpoint with `?payerAddress=<address>`
2. Parse the `PAYMENT-REQUIRED` response header (Base64-encoded JSON) to extract: network, amount, payTo address, asset
3. Sign and submit the on-chain payment transaction (EIP-3009 `transferWithAuthorization` for EVM; SPL token transfer for Solana)
4. Retry the same `POST` with the signed proof in the `PAYMENT-SIGNATURE` header
5. Read `PAYMENT-RESPONSE` header from the 200 response for the settlement tx hash (paylink/deposit flows only)
6. Poll `GET /v1/charge/{chargeToken}` to confirm the Charge reached a paid/settled state and to retrieve the on-chain `txSignature` (mandatory for the charge-resume flow; recommended for all flows)

```
POST https://api.hel.io/v1/x402/checkout/{paylinkId}?payerAddress={address}
→ 402 PAYMENT-REQUIRED header: { accepts: [{ network, amount, payTo, asset }] }

[sign on-chain transfer to payTo for the given amount]

POST https://api.hel.io/v1/x402/checkout/{paylinkId}?payerAddress={address}
  PAYMENT-SIGNATURE: <signed payload>
→ 200 PAYMENT-RESPONSE header: { txHash, payer, network }
```

### Security considerations

- **Never auto-execute payments** — always confirm amount, chain, and recipient with the user before spending.
- **Verify the paylink** — fetch `GET /v1/paylink/{id}/public` before paying to confirm the product and merchant are legitimate.
- **Check wallet balance first** — insufficient balance causes a failed transaction; check with `mp token balance list` before initiating.
- **Use HTTPS only** — all API requests must use `https://api.hel.io`. The `mp` CLI enforces this; custom clients should too.
- **Protect wallet credentials** — never log or expose private keys or signing material.

### Troubleshooting

#### "x-payer-address header or ?payerAddress= query param required" (400)
The `payerAddress` query parameter is missing. Append `?payerAddress=<wallet>` to the URL — this is required by MoonPay Commerce (non-standard x402 behavior).

#### "Payment verification failed" / on-chain revert
The payer wallet has no USDC on the network the server allocated the deposit wallet for. Check your balance: `mp token balance list --wallet <name> --chain <chain>`. The `accepts[].network` in the 402 response tells you which chain to fund.

#### "Paylink not found" (404)
Verify the paylink ID is correct.

#### CORS / `Origin` header required
Some endpoints require an `Origin` header. If using `curl` directly (not `mp`), add `-H 'Origin: https://app.hel.io'`.

#### All chains 400 instead of 402
Gas spiked across all supported chains. The circuit breaker excluded them all from `accepts[]`. Wait for gas to settle and retry — typically resolves within minutes.

#### 409 Conflict — settlement in progress
A previous submission for this transaction is still being processed. Do not re-submit. Wait 30–60s for it to resolve; the payment was likely already accepted.

## Related skills

- **moonpay-auth** — Set up a local wallet for signing
- **moonpay-check-wallet** — Check USDC balance before checkout
- **moonpay-swap-tokens** — Swap tokens to get USDC for payment
- **moonpay-x402** — General x402 paid endpoints (non-Commerce)
