# Contributing Skills

## How to Submit a Skill

1. Create `skills/{partner}-{name}/SKILL.md` using the template in `template/SKILL.md`
2. Add the skill entry to `.claude-plugin/marketplace.json`
3. Open a PR using the template at `.github/PULL_REQUEST_TEMPLATE.md`

## Skill Quality Rubric

Every PR is reviewed against this rubric. **Only A+ skills are merged.** Fix all issues and resubmit — we'd rather have 10 excellent skills than 100 mediocre ones.

### A+ (Merge)

- [ ] **Naming**: Follows `skills/{partner}-{name}/` convention exactly
- [ ] **Frontmatter**: `name`, `description`, and `tags` present. Description is specific about **when** an agent should trigger this skill — not a generic tagline
- [ ] **marketplace.json**: Skill added in the correct plugin block. Partner skills go in a **separate** plugin block, not inside `moonpay-skills`
- [ ] **No code**: Skills are instructional guides. No Python scripts, no TypeScript SDK code, no `subprocess.run`. All execution happens through CLIs
- [ ] **Real commands only**: Every CLI command and API endpoint in the skill must be verifiable and functional. Hallucinated or fabricated commands are an automatic rejection
- [ ] **Prerequisites section**: Lists all setup requirements (CLI installs, auth, funded wallets, API keys)
- [ ] **Clear workflow**: Step-by-step instructions an agent can follow without ambiguity
- [ ] **Cross-references**: Links to related skills where appropriate (e.g., `moonpay-auth` for login, `moonpay-check-wallet` for balances). Don't duplicate content from existing skills — reference them
- [ ] **No phantom references**: Don't reference skills that don't exist in the repo
- [ ] **Clean diff**: No unrelated changes (cosmetic edits to other files, whitespace changes, etc.)
- [ ] **Security**: No raw private key handling without warnings. No instructions that expose secrets to third parties without explicit guidance

### B (Close, but not mergeable)

Missing 1-2 items from the A+ list. Typically: naming convention violation, marketplace.json misplacement, or minor missing sections. Fixable in one revision.

### C (Needs work)

Structural issues: missing prerequisites, references to nonexistent skills, duplicative content that should cross-reference existing skills, or unverified API endpoints. Needs a focused revision.

### D (Significant rework needed)

Fundamental violations: code in a no-code repo, hallucinated CLI commands, or security issues. The concept may be good but the execution doesn't meet the bar. Needs a rewrite.

### F (Reject)

Built on fabricated tools or APIs that don't exist. A skill that instructs agents to use nonexistent commands is worse than no skill at all.

## marketplace.json Structure

MoonPay first-party skills go in the `moonpay-skills` plugin block. Partner skills should add a **new plugin block**:

```json
{
  "plugins": [
    {
      "name": "moonpay-skills",
      "description": "...",
      "skills": ["./skills/moonpay-auth", "..."]
    },
    {
      "name": "partner-name",
      "description": "Description of the partner's skills",
      "source": "./",
      "strict": false,
      "skills": ["./skills/partner-skill-name"]
    }
  ]
}
```

## Common Mistakes

1. **Bare skill names** — `skills/dune/` instead of `skills/dune-analytics/`. Always use `{partner}-{name}`.
2. **Dumping partner skills into `moonpay-skills`** — Partner skills get their own plugin block.
3. **Embedding code** — No Python, TypeScript, or any other code. Use CLI commands and API calls only.
4. **Copying wallet/funding instructions** — Don't duplicate what `moonpay-buy-crypto`, `moonpay-check-wallet`, and `moonpay-swap-tokens` already cover. Cross-reference them.
5. **Referencing skills that don't exist** — Check the repo before adding Related Skills links.
6. **Unverifiable commands** — If you reference a CLI tool, it must be a real, installable package. Include the install command in Prerequisites.
