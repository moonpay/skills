---
name: futurecast-neuraliquid
description: Use when a user wants to evaluate NeuraLiquid for a crypto watchlist, buy a day of directional observations with a MoonPay wallet on Base, or read an existing NeuraLiquid pass.
tags: [research, watchlists, x402, base]
---

# NeuraLiquid watchlist feed

A single pass covers 24 hours of reads for 5 USDC on Base, starting at finalized payment confirmation. A watchlist can filter observations by token, discard entries older than its alert window and deduplicate on token, UTC time and direction (long or short). The feed runs in dryrun and can be empty.

## Prerequisites

Offer inspection requires only curl. The commands below use jq to select fields. For a purchase, use an authenticated MoonPay CLI with x402 support and a local Base wallet funded with USDC. The commands use the spending controls in `@moonpay/cli@1.101.4`, installed with `npm install -g @moonpay/cli@1.101.4 --include=optional`. Wallet setup and balance checks are in [moonpay-auth](../moonpay-auth/) and [moonpay-check-wallet](../moonpay-check-wallet/).

## Inspect the offer

Use a plain GET. This sends no payment authorization. A healthy offer returns HTTP 402 with the price, recipient and network. Keep the original URL for checkout. If the user supplies a referral code, append its `?ref=CODE` to this exact endpoint for both requests.

```bash
offer_url='https://futurecast.ml85.xyz/api/v1/x402/signals/patterns'
curl -q -sS "$offer_url" | jq '{terms: .resource.description, accepts}'
```

Check for one exact offer on `eip155:8453`, for 5,000,000 atomic units of Base USDC, payable to `0xb779aF773aCfe6306070bf0b2faBBE2AB0b100F6`. If terms differ or the offer is unavailable, stop before signing. An evaluation request ends here.

## Buy once with a MoonPay wallet

First check for a saved pass at the usual or operator-specified location and for any unresolved prior checkout. If a prior payment has an unknown outcome and its receipt is missing, reconcile it with the wallet owner before proceeding. For a MoonPay receipt, go directly to reading it below. For a pass bought with the FutureCast client, use its existing access file and the resume command in the [quickstart](https://futurecast.ml85.xyz/quickstart). Run the purchase only when the owner authorizes 5 USDC for this pass. Use the approved wallet name in place of `main`. Save the response privately because it contains the bearer token. The spend limit below applies only to Base USDC for this command.

```bash
pass_dir="${XDG_STATE_HOME:-$HOME/.local/state}/neuraliquid"
install -d -m 700 "$pass_dir"
(
  umask 077
  set -C
  X402_MAX_PAYMENT_ATOMIC=0 \
  X402_MAX_PAYMENT='{"eip155:8453:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913":"5000000"}' \
    mp --json x402 request --method GET --url "$offer_url" --wallet main --chain base > "$pass_dir/pass.json"
)
```

The shell refuses to overwrite an existing pass file. HTTP 202 means payment was submitted and is waiting for finality. Keep the response and wait for `Retry-After` before reading. If the checkout response was lost or the file is empty, reconcile with the wallet owner before authorizing any further payment. Keep the original file for that investigation.

## Read the pass

For a saved pass in a new shell, set `pass_dir` as above. Read the same endpoint using the saved bearer token. This command works for both pending and confirmed passes. It displays the feed or pending status and keeps credentials out of the output.

```bash
(
  set -e -o pipefail
  pass_header=$(jq -er '.data.access_token | strings | select(test("^[a-f0-9]{64}$")) | "Authorization: Bearer " + .' "$pass_dir/pass.json")
  printf '%s\n' "$pass_header" |
    curl -q -sS --header @- 'https://futurecast.ml85.xyz/api/v1/x402/signals/patterns' |
    jq '{status, expires_in, signals: .data.signals, detail}'
)
```

Poll pending payments at the advertised interval. Once confirmed, space feed reads at least 30 seconds apart. A source outage during an active pass can return HTTP 503. Retry with the same bearer token. HTTP 410 ends the pass. A new purchase requires fresh authorization and a new receipt file.

## Optional referrals

A buyer can register the paying wallet after its first confirmed purchase. A selected launch partner can register an invited wallet before buying a pass. At the current price, a qualifying direct sale earns 1.65 USDC (33%) after the buyer's transfer is finalized. Use the wallet registration flow when the operator asks for a personal link. Keep wallet keys and private rewards credentials local, and disclose the commission when sharing the link. [Partner applications and instructions](https://futurecast.ml85.xyz/partners) · [API quickstart](https://futurecast.ml85.xyz/quickstart)
