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
| **Bare UUID** or a `…/charge/<UUID>` URL | **`GET /v1/charge/{chargeToken}` first** — read `shopifyPaymentDetails`, `source`, `windowClosed`, `paylink.id`, `paylinkTxs` | see "Routing a charge" below — **do not pre-announce "Shopify-source" or any routing choice before this GET completes** |

#### Routing a charge

> **Do not announce a routing decision before you've fetched the Charge.** "This is a Shopify-source Charge → charge-resume" is the most common premature framing — and it's wrong for ~every non-Shopify charge (CoinMarketCap boost, generic API-issued charges, `paylink`-source charges, etc.). Route only after the GET, and narrate to the user in terms of what the metadata actually says.

**Step 1 — fetch the Charge** (no payment side-effect, just a read):

```bash
curl -s "https://api.hel.io/v1/charge/<chargeToken>"
```

**Step 2 — inspect three fields** to decide the route:

| Field | Possible values | What it tells you |
|---|---|---|
| `shopifyPaymentDetails` | object \| absent | The **only** field the charge-resume endpoint actually keys off. If absent, charge-resume returns 400 `CHARGE_NOT_SHOPIFY`. |
| `source` | `"api"` / `"paylink"` / `"x402"` (`ChargeSource` enum) | Where the Charge originated. `api` is typical for backend-issued charges (CoinMarketCap boost, billing systems, Solana Pay on Shopify). Narrate this back to the user. |
| `windowClosed` | `true` / `false` | Whether the original deposit window has expired. `true` means the issuing system has stopped waiting for this token to settle — see the orphan warning below. |

**Step 3 — pick the endpoint:**

| Charge looks like | Settle via |
|---|---|
| `shopifyPaymentDetails` populated, `windowClosed: false` | `POST /v1/x402/checkout/charge/<chargeToken>` (Solana-only) |
| `shopifyPaymentDetails` absent, `windowClosed: false`, has `paylink.id` | `POST /v1/x402/checkout/<paylink.id>` — settles the underlying paylink. **The PaylinkTx is not linked back to this Charge token** (see warning). |
| `windowClosed: true` (any source) | `POST /v1/x402/checkout/<paylink.id>` — but **the original Charge token will never be marked settled** (see warning). Confirm with the user before proceeding, or recommend the merchant re-issues a Charge with a fresh window. |
| `paylinkTxs` non-empty | Already settled — `GET /v1/charge/<chargeToken>` returns the linked transaction; do not pay again. |

> **Orphan-PaylinkTx warning.** Paying the underlying paylink (any time you're not on the charge-resume endpoint) creates a fresh on-chain payment for the same product/amount, but the new `PaylinkTx` is **not** linked back to the original Charge token. If the issuing system (CMC, a billing flow, etc.) is waiting on **that specific token** to flip to paid, it will continue to see it as unpaid. Surface this to the user before spending. Use `GET /v1/charge/<chargeToken>` after payment to confirm — `paylinkTxs` on the original Charge will still be empty.

> **`paylink.id` is the field name** in the `GET /v1/charge/<chargeToken>` response (e.g. `"paylink":{"id":"69fc6d95...","template":"PAYLINK_V2",...}`), not `paylink._id`.

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

#### Charge resume — only after the GET confirms `shopifyPaymentDetails`

Use this **only** after `GET /v1/charge/<chargeToken>` returns a Charge with `shopifyPaymentDetails` populated **and** `windowClosed: false` **and** `paylinkTxs` empty. For every other case (no `shopifyPaymentDetails`, closed window, already settled), route to `POST /v1/x402/checkout/{paylinkId}` instead (see "Routing a charge" above) — and surface the orphan-PaylinkTx warning.

When a Shopify buyer selects Solana Pay at checkout, Shopify POSTs `/payment` to the MoonPay Commerce backend, which creates an **in-flight Charge** with a `chargeToken` (UUID) and a price derived from the cart. An agent settles that existing Charge — instead of creating a parallel one — by hitting:

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/charge/<chargeToken>?payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain solana
```

- The amount is **derived from the Charge** (`Charge.usdcAmount`) — do **not** append `?amount=` for charge-resume requests.
- Currently **Solana-only**; EVM (Base / Polygon / Arbitrum / BSC) is on the roadmap.
- On HTTP 200, settlement is fire-and-forget: the server creates the `PaylinkTx`, links it to the Charge, and triggers Shopify's `paymentSessionResolveMutation` to flip the order to paid in the merchant admin. The `txSignature` is **not** returned in the 200 body — confirm it via `GET /v1/charge/{chargeToken}` (see "Verifying payment status" below).

#### Charge → paylink fallback (non-Shopify charges, including `windowClosed`)

If `GET /v1/charge/<chargeToken>` returns a Charge **without** `shopifyPaymentDetails` (typical when `source` is `api`, `paylink`, or `x402`), or with `windowClosed: true`, read the paylink ID from `paylink.id` in the response and settle as a normal paylink payment:

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/<paylink.id>?amount=<Charge.usdcAmount>&payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet <wallet-name> \
  --chain <chain>
```

- For dynamic-price paylinks, pass `Charge.usdcAmount` through as `?amount=<minimalUnits>` so the user pays the same amount the original Charge requested.
- **Always remind the user** that this creates a fresh PaylinkTx and does **not** retire the original `chargeToken`. If a third-party system (CMC, billing, Shopify, etc.) was watching that specific token, it will still see it as unpaid. Recommend the merchant re-issue a Charge with an open window if downstream reconciliation matters.

**Worked example — API-source Charge with closed window** (e.g. CoinMarketCap token boost):

```text
GET /v1/charge/6d0a1c57-... →
  source: "api"
  windowClosed: true
  shopifyPaymentDetails: <absent>
  paylink: { id: "69fc6d95...", template: "PAYLINK_V2", ... }
  usdcAmount: "3100000"
  paylinkTxs: []
```

Routing decision: not Shopify-source (no `shopifyPaymentDetails`) AND window is closed → **paylink endpoint with orphan warning**:

```bash
mp x402 request \
  --method POST \
  --url "https://api.hel.io/v1/x402/checkout/69fc6d95...?amount=3100000&payerAddress=<YOUR_WALLET_ADDRESS>" \
  --wallet moonfi-xzhang \
  --chain solana
```

After settlement, `GET /v1/charge/6d0a1c57-...` will still show `paylinkTxs: []` — the original Charge token remains orphaned. The freshly-created PaylinkTx lives on the paylink, not on this Charge.

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
| **404** | `CHARGE_NOT_FOUND` (charge-resume) | The `chargeToken` does not match an in-flight Charge — confirm via `GET /v1/charge/{chargeToken}`; if that 404s too, re-trigger the upstream checkout |
| **400** | `CHARGE_NOT_SHOPIFY` (charge-resume) | The Charge isn't Shopify-source (likely `source: 'api'` or `'paylink'`). **Don't retry the charge-resume endpoint** — fetch the Charge via `GET /v1/charge/{chargeToken}`, read `paylink.id`, and settle via `POST /v1/x402/checkout/{paylinkId}` instead. Surface the orphan-PaylinkTx warning before paying. |
| **409** | Settlement in progress | A payment for this tx is already being settled; do not re-submit |
| **409** | `CHARGE_ALREADY_SETTLED` (charge-resume) | The Charge is already paid — confirm via `GET /v1/charge/{chargeToken}` and surface the existing tx |
| **410** | `CHARGE_EXPIRED` (charge-resume) | The Charge expired before settlement — re-trigger the Shopify checkout |
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

Recommended polling: poll once immediately after the 200, then every 5–10s for up to ~120s. Stop polling as soon as the Charge shows a paid/settled state with a transaction signature attached. Surface the settlement tx hash to the user only after this confirmation — do **not** rely on the HTTP 200 alone for the charge-resume flow.

> **If you fell back to the paylink endpoint** (because the Charge wasn't Shopify-source, or the window was closed), `paylinkTxs[]` on this specific Charge will stay **empty** even after a successful on-chain payment — the new `PaylinkTx` is attached to the paylink, not back to the original Charge token. State this plainly to the user: the on-chain transfer landed, but the original Charge token is orphaned and the issuing system will continue to see it as unpaid until they re-issue or manually reconcile.

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
