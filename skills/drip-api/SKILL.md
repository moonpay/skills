---
name: drip-api
description: Research Drip's premium financial newsletters and podcasts by searching topics, browsing sources, resolving named publications, newsletters, authors, podcast shows, Substack URLs, and direct article links, listing recent posts, presenting purchasable article options, fetching paid article summaries, and synthesizing or comparing selected paid articles. Also supports fetching structured stock picks for a given UTC day when users ask for stock recommendations, ticker-level long/short ideas, or analyst calls. Use for questions about finance commentary, analyst views, market themes, company or sector writeups, podcast/newsletter source discovery, stock picks, and paid Drip content. Paid post and stock-picks routes are gated by x402/MPP micropayments.
tags: [substack, newsletter, newsletters, blog, article, articles, podcast, media, finance, financial-analysis, investing, investment-research, trading, markets, stocks, equities, stock-picks, research, micropayments]
homepage: https://dripstack.xyz
metadata:
  version: 1.3
---

# Drip API

## When to use

Use this skill to:

- Search premium financial newsletters or podcasts by topic.
- Browse the Drip publication catalog.
- Resolve a named publication, author, podcast show, newsletter, or Substack URL.
- List recent posts from a specific publication.
- Handle a direct article link for reading or summarization.
- Fetch structured stock picks, analyst calls, and ticker-level recommendations for a given UTC day.
- Purchase, compare, or synthesize selected paid articles.

When this skill is active, use Drip as the exclusive source. Do not use web search, news search, external browsing, or model knowledge to answer unless the user explicitly asks to go outside Drip. If Drip has thin or no results, say so and ask whether to broaden beyond Drip.

## Prerequisites

- A funded wallet for paid Drip routes.

## Base URL

Use `https://dripstack.xyz` by default. The OpenAPI spec is at `https://dripstack.xyz/openapi.json`.

When the user asks to use local, dev, or localhost, replace the base URL with the requested local origin, such as `http://localhost:3000`.

Trust the live `402` payment challenge over OpenAPI discovery amounts.

## Core Routes

- `GET /api/v1/search?q={query}&limit=10`: search indexed posts by topic. `q` is required. `limit` is 1-30 and defaults to 10.
- `GET /api/v1/publications/search?q={query}`: resolve a named publication by slug, title, author, or site URL. Returns up to 3 matches with `publicationSlug`, `title`, `author`, and `siteUrl`.
- `GET /api/v1/publications`: list indexed publications. Use only when the user asks to browse the catalog or asks what publications are available.
- `GET /api/v1/publications/{publicationSlug}?limit=5`: get publication metadata and recent post summaries. `posts[]` includes `slug`, `title`, `subtitle`, `publishedAt`, and `priceCents`.
- `GET /api/v1/publications/{publicationSlug}/{postSlug}` (paid): fetch post metadata and `synthesizedSummary` after x402/MPP payment.
- `GET /api/v1/stock-picks` (paid): fetch structured stock-picker calls for one UTC effective calendar day. Defaults to the latest day with picks; pass `date=YYYY-MM-DD` for a specific day.

Only use the routes listed above for normal agent workflows. Use `/api/v1/stock-picks` only when the user asks for stock picks, recommendations, analyst calls, or ticker-level investment ideas; use search/publication routes for article discovery and synthesis.

`GET /api/v1/search` returns ranked article candidates in `items[]`. Each item can include `publicationSlug`, `slug`, `title`, `subtitle`, `publishedAt`, `snippet`, `whyMatched`, and relevance fields. Show only the title, publication slug, and date to the user. Keep `publicationSlug` and `slug` internally for paid fetches.

## Slug Rules

Publication slugs are normalized hosts. Remove leading `www.` for non-Substack custom domains.

- `https://bytesbeyondborders.substack.com` -> `bytesbeyondborders.substack.com`
- `https://www.reallygoodbusinessideas.com` -> `reallygoodbusinessideas.com`

Use `publicationSlug` and post `slug` exactly as returned by the API.

## Decision Tree

This skill is primarily a guided search and purchase flow. Most requests start in one of two lanes:

1. For a general question or topic, use `/api/v1/search?q={query}&limit=10`, then show article options and ask what the user wants to purchase. This includes broad market questions, thematic research, "what are people saying about X?", "what are analysts saying about X?", and requests for the best/recent articles on a topic. If no query is provided, ask for one before searching.
2. For a specific author, publication, podcast show, or newsletter, use `/api/v1/publications/search?q={query}` unless the normalized slug is obvious. If one match is clearly right, call `/api/v1/publications/{publicationSlug}?limit=5` and show recent post choices. If multiple plausible matches return, ask the user which publication they mean.

Handle these special cases:

- For a browse catalog request, call `/api/v1/publications`, show a concise catalog, and ask which publication to explore.
- For a direct article URL or exact post, resolve `publicationSlug` and `postSlug`, then follow the direct-article payment guardrail below.

## Guided Flows

### General Questions

For normal finance questions, search first and present article choices. Do not answer the question directly from search metadata.

1. If the user gave a query, call `/api/v1/search?q={query}&limit=10`.
2. Show up to 10 article options using only title, publication slug, and date.
3. Ask which article or articles the user wants to purchase.
4. After the user selects, fetch the paid article summaries and answer from those fetched summaries.

Examples that should use this flow:

- "What are analysts saying about the SpaceX IPO?"
- "What stocks are financial analysts watching most closely this week?"
- "Are AI stocks in a bubble?"
- "What are recent finance writers saying about capex risk?"

### Stock picks

Use `GET /api/v1/stock-picks` when the user wants structured stock-picker calls across Drip sources.

This endpoint returns picks for one effective UTC calendar day, not a rolling range. By default it resolves the latest day that has picks. Pass `date=YYYY-MM-DD` for a specific day, or `period=latest` as an explicit alias for the default. Do not send `date` and `period` together. Optional `limit` is 1-500 and defaults to 200.

`dateUsed` identifies the single day returned. `startDate` and `endDate` are the same as `dateUsed` for this single-day response. The effective day is based on article `publishedAt`; rows missing `publishedAt` may fall back to extraction time internally. Returned items omit extraction time, so treat `publishedAt` as source article context only and omit date context when it is null.

Each item can include `ticker`, `tickerExchange`, `instrumentType`, `action`, `direction`, `authorConviction`, `convictionLabel`, `activePick`, `evidenceQuote`, `rationaleSnippet`, `articleTitle`, `articleUrl`, `author`, `publishedAt`, `publicationSlug`, and `postSlug`. Use `publicationSlug` and `postSlug` only if the user later asks to fetch the source article summary.

Use an x402 or MPP payment-aware client. Plain requests return `402` only when picks exist. The route returns `404` when no picks exist for the requested or resolved day — do not pay on `404`; tell the user no picks are available for that day or try a different date if they asked for one. Runtime price is based on distinct attributed source articles returned, and settlement records sales for those source articles.

Examples that should use this flow:

- "What stocks are analysts recommending today?"
- "Show me the latest stock picks from Drip newsletters."
- "Give me stock picks for 2026-05-30."
- "Any new long ideas from paid finance writers?"

### Specific Publication

When the user names a publication or author, resolve it with `/api/v1/publications/search?q={query}` unless the slug is obvious. Then show 3-5 recent posts from `/api/v1/publications/{publicationSlug}?limit=5` and ask which post or posts to purchase.

### Catalog Browsing

Only call `/api/v1/publications` when the user explicitly asks to browse the catalog, see available publications, or choose from newsletters.

## Search And Selection

Search results are a purchase menu, not evidence. Do not answer substantive questions from search metadata alone. For a normal question, search first, show options, and stop for the user's selection. Only answer after paid article summaries are fetched.

When showing search results, display only:

```text
1. {title} ({publicationSlug}, {YYYY-MM-DD})
```

If `publishedAt` is missing, omit the date:

```text
1. {title} ({publicationSlug})
```

Do not show article slugs, subtitles, snippets, relevance scores, match reasons, or other internal metadata in user-facing search menus. Keep `publicationSlug` and `slug` internally for paid fetches.

| Field | User-visible? | Use |
| --- | --- | --- |
| `title` | Yes | Render as `{title} ({publicationSlug}, {YYYY-MM-DD})` when date is present |
| `publicationSlug` | Yes | Render inside parentheses after the title |
| `publishedAt` | Yes, when present | Render as date-only `YYYY-MM-DD` after `publicationSlug` |
| `slug` | No | Keep internally for purchase URL |
| `subtitle`, `snippet`, `whyMatched`, scores | No | Keep internal or ignore |

For publication post lists, show 3-5 recent titles with date-only `YYYY-MM-DD` when available, then ask which post or posts the user wants to purchase.

If the user says "buy the top N", "use the best N", "synthesize the top N", or similar after a result menu, treat that as explicit selection of the top N currently displayed search results.

## Payment Guardrails

Paid post routes return `402`. Use an x402 or MPP payment-aware client, not plain `curl`, for paid fetches. If plain HTTP returns `402`, retry with the payment-aware client instead of treating it as a final failure.

Do not purchase paid posts until the user explicitly selects article options, says to buy the top/best N currently displayed results, shares a direct article and clearly asks to read/buy it, or asks for synthesis/comparison across selected results.

For direct article URLs or exact post slugs, probe the paid endpoint first if needed to inspect the live `402` challenge and price. Treat that probe as price discovery, not purchase. When asking for confirmation, state the article title and live price. Only retry with payment after user confirmation unless the user has already clearly asked to read, buy, summarize, or use that article.

Unpaid paid-post responses can include:

- MPP: `WWW-Authenticate: Payment ...`; retry with `Authorization: Payment <credential>`.
- x402 v2: `PAYMENT-REQUIRED`; retry with `PAYMENT-SIGNATURE`.

Successful paid post responses may include `paymentInfo` with `amountUsd`, `protocol`, and optional `spendSource`.

On `503` with code `summary_not_ready`, tell the user the summary is not ready and ask them to retry shortly. If some selected articles succeed and others fail, synthesize only from successful fetches and name the failed fetches.

## Paid Article Output

For one fetched article, return a rich curated summary based on `synthesizedSummary`: synthesis, notable claims, caveats, implications, and source context.

For multiple fetched articles, compare the relevant claims, mechanisms, tensions, caveats, and implications across sources. Do not reuse the same template every turn.

Only emit raw/full content when the user explicitly asks for it.

Append one source line per fetched article:

```text
Source: {Title} — {Publication}, {date if available} — {URL if available}
```

## Voice

Speak naturally. Do not mention this skill, internal flow names, tool decisions, or what instructions are being followed. Keep prompts short and show only what the user needs to make the next choice.

## Invariants

- Use Drip as the exclusive source unless the user explicitly asks to go outside Drip.
- Prefer the OpenAPI document before guessing route shapes.
- Trust the live `402` payment challenge over OpenAPI discovery amounts.
- Use publication and post slugs exactly as returned by the API.
- For topic discovery, call `/api/v1/search?q={query}&limit=10` and offer the returned articles as purchase options.
- Only call `/api/v1/publications` when the user asks to browse the catalog, asks what publications are available, or chooses from newsletters.
- Do not answer substantive questions from search metadata alone.
- Purchase only articles the user has explicitly chosen or clearly requested for synthesis.
- Multiple paid fetches are allowed when the user selects multiple articles or asks for a synthesis/comparison across selected results.
- Search result options shown to the user must be formatted as `Title (publicationSlug, YYYY-MM-DD)` when a date exists, otherwise `Title (publicationSlug)`.
- If Drip has thin or no results, say so and ask whether to broaden beyond Drip.

## Examples

```bash
# Search indexed articles across premium financial newsletters
curl "https://dripstack.xyz/api/v1/search?q=AI%20capex%20risk&limit=10"

# Resolve a named publication without loading the full catalog
curl "https://dripstack.xyz/api/v1/publications/search?q=semianalysis"

# Show recent posts for a publication
curl "https://dripstack.xyz/api/v1/publications/newsletter.doomberg.com?limit=5"

# Paid post - requires x402/MPP client after user selection
# GET https://dripstack.xyz/api/v1/publications/newsletter.doomberg.com/awkward-truths

# Stock picks - requires x402/MPP client when picks exist
# Latest day with picks
# GET https://dripstack.xyz/api/v1/stock-picks
# Specific UTC effective day
# GET https://dripstack.xyz/api/v1/stock-picks?date=2026-05-30

```

## Related Skills

- [moonpay-auth](../moonpay-auth/) — set up MoonPay login and wallets when payment setup is needed.
- [moonpay-check-wallet](../moonpay-check-wallet/) — check wallet balances before paid requests.
- [moonpay-x402](../moonpay-x402/) — make x402-protected paid API requests.
