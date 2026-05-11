---
name: unbrowse-web-api
description: >
  Reverse-engineer and call hidden website APIs directly — no browser needed.
  Use when the user wants to extract data from any website, automate a web
  workflow, or call a site's internal API without scraping. ~100x faster and
  ~80% cheaper than headless browser automation.
tags: [web, api, scraping, automation, browser, extraction]
metadata:
  openclaw:
    homepage: https://github.com/unbrowse-ai/unbrowse
    requires:
      bins: [bun]
    install:
      - kind: shell
        cmd: "npx unbrowse setup"
allowed-tools: Bash(curl:*)
---

# Unbrowse — Reverse-Engineer Website APIs

Unbrowse captures browser network traffic to extract a site's real API endpoints, then calls them directly — no Playwright, no Puppeteer, no DOM parsing. Results come back in 50–200ms instead of 5–30s.

## Prerequisites

- **Bun runtime**: `curl -fsSL https://bun.sh/install | bash`
- **Setup** (one-time): `npx unbrowse setup`
- **Start the local server** before any command:

```bash
export UNBROWSE_TOS_ACCEPTED=1
cd ~/.unbrowse && bun src/index.ts &
# Confirm running:
curl -s http://localhost:6969/health | jq .
```

Set a shorthand for convenience:

```bash
export UNBROWSE="http://localhost:6969"
```

## Core Workflow

### 1. Resolve an intent (recommended entry point)

The single-call workflow: Unbrowse searches the skill marketplace, captures the site if needed, extracts the API, and returns results — all in one request.

```bash
curl -s -X POST "$UNBROWSE/v1/intent/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "<what you want to do, in plain English>",
    "params": {},
    "context": {"url": "https://example.com"}
  }' | jq .
```

Examples:
```bash
# Get trending tokens on DexScreener
curl -s -X POST "$UNBROWSE/v1/intent/resolve" \
  -H "Content-Type: application/json" \
  -d '{"intent": "get trending tokens", "context": {"url": "https://dexscreener.com"}}' | jq .

# Get a wallet's token holdings on Solscan
curl -s -X POST "$UNBROWSE/v1/intent/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "get token holdings for wallet",
    "params": {"wallet": "<address>"},
    "context": {"url": "https://solscan.io"}
  }' | jq .
```

### 2. Search the marketplace (reuse existing skills)

Skip capture entirely if someone else already extracted the API:

```bash
# Search by intent
curl -s -X POST "$UNBROWSE/v1/search" \
  -H "Content-Type: application/json" \
  -d '{"intent": "<what you want>", "k": 5}' | jq .

# Search by domain
curl -s -X POST "$UNBROWSE/v1/search/domain" \
  -H "Content-Type: application/json" \
  -d '{"domain": "dexscreener.com", "k": 5}' | jq .
```

### 3. Execute a specific skill

Once you have a `skill_id` from search or resolve:

```bash
# Preview first (dry run — no network calls to the target site)
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {}, "dry_run": true}' | jq .

# Execute for real
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {"<param>": "<value>"}}' | jq .

# Project fields — only return what you need
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "params": {},
    "projection": {"include": ["price", "volume", "symbol"]}
  }' | jq .
```

### 4. Verify a skill is still working

Sites change their APIs. Check before relying on a skill:

```bash
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/verify" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

## Authentication (Gated Sites)

For sites requiring login:

```bash
# Interactive login — opens browser, vaults cookies automatically
curl -s -X POST "$UNBROWSE/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/login"}' | jq .

# Yolo mode — reuse your existing Chrome session (ask user first)
curl -s -X POST "$UNBROWSE/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "yolo": true}' | jq .
```

Credentials are AES-256-CBC encrypted and stored in `~/.unbrowse/config.json`. Never leave your machine.

## Mutations (Write Operations)

**Always dry-run first** for any action that changes state (POST, PUT, DELETE):

```bash
# Step 1 — preview
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {"action": "submit"}, "dry_run": true}' | jq .

# Step 2 — confirm with user, then execute
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/execute" \
  -H "Content-Type: application/json" \
  -d '{"params": {"action": "submit"}, "confirm_unsafe": true}' | jq .
```

**Never use `confirm_unsafe: true` without showing the user the dry-run output first.**

## Feedback (Improves Marketplace)

After a successful execution, submit feedback so the skill's reliability score improves for everyone:

```bash
curl -s -X POST "$UNBROWSE/v1/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "target_type": "skill",
    "target_id": "<skill_id>",
    "outcome": "success",
    "rating": 5
  }' | jq .
```

## Inspect & Debug

```bash
# List all endpoints a skill exposes
curl -s "$UNBROWSE/v1/skills/<skill_id>" | jq '.available_endpoints'

# Get schema for a specific endpoint
curl -s "$UNBROWSE/v1/skills/<skill_id>/endpoints/<endpoint_id>/schema" | jq .

# Report a broken skill
curl -s -X POST "$UNBROWSE/v1/skills/<skill_id>/issues" \
  -H "Content-Type: application/json" \
  -d '{"description": "Returns 403 since site updated their API"}' | jq .

# Platform stats
curl -s "$UNBROWSE/v1/stats/summary" | jq .
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused on :6969` | Server not running | Run `cd ~/.unbrowse && UNBROWSE_TOS_ACCEPTED=1 bun src/index.ts &` |
| `No skills found` | Site not in marketplace yet | Use `/v1/intent/resolve` to trigger capture |
| `Skill verification failed` | Site changed its API | Run `/v1/skills/:id/verify` and re-capture with `/v1/intent/resolve` |
| `Auth required` | Gated content | Use `/v1/auth/login` first |
| `dry_run required` | Unsafe mutation attempted | Add `"dry_run": true`, review, then retry with `"confirm_unsafe": true` |

## Related Skills

- **moonpay-x402** — Pay for x402-protected Unbrowse skill marketplace listings
- **moonpay-discover-tokens** — Token research (complements Unbrowse for site-specific data)
- **allium-onchain-data** — On-chain data if a site's API proves unstable
