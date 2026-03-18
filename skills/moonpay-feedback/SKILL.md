---
name: moonpay-feedback
description: Submit feedback, bug reports, or feature requests for the MoonPay CLI. Use when the user encounters issues, wants to suggest improvements, or has general feedback.
tags: [support]
---

# Submit feedback

## Goal

Let users submit bug reports, feature requests, or general feedback directly from the CLI. Requires authentication so we can follow up.

## Command

```bash
mp feedback create \
  --type <bug|feature|general> \
  --message "<feedback message>"
```

## Types

- `bug` — Something is broken or not working as expected
- `feature` — A new capability or improvement the user wants
- `general` — Any other feedback

## Example flows

### Bug report
1. User: "The token swap command keeps failing with a timeout error."
2. Run: `mp feedback create --type bug --message "token swap times out when swapping SOL to USDC on Solana — getting timeout error after 30s"`

### Feature request
1. User: "I wish I could set up recurring buys."
2. Run: `mp feedback create --type feature --message "Add native recurring buy support — e.g. buy $50 of SOL every week automatically"`

### General feedback
1. User: "The CLI is great but the output is hard to read."
2. Run: `mp feedback create --type general --message "CLI output formatting could be more readable — consider adding color or table views"`

## Notes

- User must be logged in (`mp login`) before submitting feedback.
- Include as much detail as possible in the message — error messages, commands that failed, expected vs actual behavior.
- If the user reports a bug, try to reproduce it first and include the error output in the feedback message.

## Related skills

- **moonpay-auth** — Ensure user is logged in before submitting feedback.
