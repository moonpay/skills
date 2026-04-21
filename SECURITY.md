# Security

No technology is perfect. We believe collaborating with skilled security researchers across the globe is crucial to identifying weaknesses in any technology.

If you believe you have found a security issue in MoonPay, we encourage you to notify us. We welcome working with you to resolve issues promptly.

## Disclosure Policy and Process

Please submit your finding through our [HackerOne disclosure program](https://hackerone.com/moonpay) as soon as possible after discovering a potential security issue.

1. Submit a report via HackerOne.
2. Once we assess your report, a member of our team will help triage the vulnerability.
3. Once a fix is ready, we will include it in an upcoming release.

When testing, please make a good faith effort to avoid:
- privacy violations
- data destruction
- service interruption or degradation

Only interact with accounts you own or accounts for which you have explicit permission from the account holder.

## Scope: What This Repository Is

This repository contains **Agent Skills** — markdown instruction files that AI agents load to perform tasks. Skills are not code, they are not a runtime, and they are not a security boundary. All execution happens through the MoonPay CLI (`mp`) and third-party CLIs, within the agent harness's permission and approval system (Claude Code, Cursor, etc.).

The agent harness — not the skill file — is responsible for:
- Prompt injection defense and instruction integrity
- Tool call approval and confirmation flows
- Sandboxing and permission boundaries
- Preventing agents from acting on injected instructions in untrusted data

## Exclusions

While researching, please follow the defined [program scope](https://hackerone.com/moonpay?type=team#program_highlights).
Failure to do so may result in rejection of the submission.

The following are out of scope:

### General
- Denial of service (DoS)
- Spamming
- Social engineering (including phishing) of MoonPay staff or contractors

### AI Agent and Skill-Specific Exclusions
- **Prompt injection and agent behavior manipulation** — Skills are consumed by agent harnesses that enforce their own trust boundaries. Reports that untrusted data could influence agent behavior, or that an agent could be tricked into overriding its instructions, are agent harness concerns.
- **Missing natural-language guardrails** — Natural-language instructions to an LLM are not security controls. Suggestions to add defensive phrasing to skill markdown do not mitigate prompt injection.
- **Cosmetic or display-layer injection** — Manipulation of terminal output, exported file formats, or rendered content via untrusted data. These are display-layer concerns outside this repository's scope.
- **Theoretical attack chains** — Attacks requiring multiple preconditions where the core dependency is the agent harness failing its own security controls (e.g., bypassing confirmation flows, ignoring approval gates).
- **Vulnerabilities in third-party tools or APIs** — Skills document how to use external tools; they do not own them. Report issues in third-party software to the respective vendor.
- **Best-practice recommendations without demonstrated impact** — Reports suggesting a more secure pattern without demonstrating concrete, exploitable impact are informational, not vulnerabilities.

## Safe Harbor

Any activities conducted in a manner consistent with this policy are considered authorized conduct, and we will not initiate legal action against you.

Thank you for helping keep MoonPay and our users safe.
