# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a repository of **Agent Skills** for crypto infrastructure. Skills are Markdown-based instruction files that AI agents (Claude Code, Claude API, MCP clients) load dynamically to perform specialized tasks via the MoonPay CLI (`mp`).

Skills are **not code** — they are instructional guides. All execution happens through the MoonPay CLI (`@moonpay/cli`). There is no build, test, or lint step.

## Repository Structure

- `skills/` — All skill definitions (each skill is a directory with `SKILL.md` and `LICENSE.txt`)
- `.claude-plugin/marketplace.json` — Plugin registry defining two groups: `moonpay-skills` (core) and `partner-skills` (third-party integrations)
- `spec/agent-skills-spec.md` — Links to the full Agent Skills Specification at https://agentskills.io/specification
- `template/SKILL.md` — Minimal template for creating new skills

## Skill Anatomy

Each skill is a directory under `skills/` containing a single **`SKILL.md`** file with YAML frontmatter:
```yaml
---
name: skill-name
description: When to use this skill and what it does
tags: [tag1, tag2]        # Optional
---
```
The body contains instructions for the agent: setup commands, workflows, configuration, and references to other skills. The repo-level `LICENSE` covers all skills.

## Adding a New Skill

1. Create `skills/{name}/SKILL.md` using the template in `template/SKILL.md`
2. Add the skill entry to `.claude-plugin/marketplace.json` under the appropriate plugin group
4. The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) defines the required checklist

## Skill Groups in marketplace.json

- **moonpay-skills** — Core MoonPay capabilities (auth, wallets, trading, fiat ramp, etc.)
- **partner-skills** — Third-party integrations (corbits, dune, shipp, yield)

## Key Conventions

- The `description` field in YAML frontmatter should be specific about **when Claude should trigger** the skill — this is how agents decide which skill to load
- Many skills reference each other (e.g., swap recommends check-wallet and discover-tokens) — maintain these cross-references when editing
- Skills instruct agents to use config files under `~/.config/` (e.g., `~/.config/moonpay/`, `~/.config/pump-fun-sniper/`)
- The MoonPay CLI binary is invoked as `mp` in skill instructions
