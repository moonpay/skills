# Agent Registry CLI Reference

Commands for registering agent identities and delegating execution via the `mplx` CLI.

> **Prerequisites**: CLI must be configured (RPC, keypair, funded wallet). If not yet verified this session, see `./cli-initial-setup.md`.
> **Docs**: https://metaplex.com/docs/agents

---

## Commands

### Register Agent Identity

Binds an on-chain identity record to an MPL Core asset. Creates a PDA, attaches an `AgentIdentity` plugin with lifecycle hooks for Transfer, Update, and Execute.

```bash
# Interactive wizard (creates new asset + walks through registration document)
mplx agents register --new --wizard

# New asset with inline flags
mplx agents register --new --name "My Agent" --description "An autonomous agent" \
  --image "./avatar.png"

# New asset with services and trust models
mplx agents register --new --name "My Agent" --description "An autonomous agent" \
  --image "./avatar.png" \
  --services '[{"name":"MCP","endpoint":"https://example.com/mcp","version":"2025-06-18"}]' \
  --supported-trust '["reputation","crypto-economic"]'

# Existing asset — build document from flags
mplx agents register <ASSET> --name "My Agent" --description "An autonomous agent" \
  --image "./avatar.png"

# Existing asset — upload a local registration document
mplx agents register <ASSET> --from-file "./agent-doc.json"

# Existing asset with collection authority
mplx agents register <ASSET> --collection <COLLECTION> --name "My Agent" \
  --description "An autonomous agent" --image "./avatar.png"

# Save the generated document locally (in addition to uploading)
mplx agents register --new --name "My Agent" --description "..." --image "./avatar.png" \
  --save-document "./agent-doc.json"
```

| Flag | Description |
|------|-------------|
| `--new` | Create a new Core asset and register it |
| `--owner` | Owner public key for the new asset (defaults to signer, only with `--new`) |
| `--collection` | Collection address the asset belongs to |
| `--wizard` | Interactive wizard to build the registration document |
| `--from-file <path>` | Path to a local agent registration JSON file to upload |
| `--name` | Agent name for building the registration document |
| `--description` | Agent description |
| `--image` | Agent image file path (uploaded) or existing URI |
| `--active` | Set agent as active (default: true) |
| `--services` | Service endpoints as JSON array (e.g. `'[{"name":"MCP","endpoint":"https://..."}]'`) |
| `--supported-trust` | Trust models as JSON array (e.g. `'["reputation","tee-attestation"]'`) |
| `--save-document` | Save the generated document JSON to a local file |

> `--wizard`, `--from-file`, and `--name` are mutually exclusive — use one approach to provide the registration document.

### Fetch Agent Identity

Reads the on-chain agent identity PDA and displays registration info, lifecycle hooks, and the agent's wallet.

```bash
mplx agents fetch <ASSET>
```

Returns: `registered`, `asset`, `owner`, `identityPda`, `wallet` (Asset Signer PDA), `registrationUri`, `lifecycleChecks`.

### Register Executive Profile

Creates a one-time on-chain executive profile for the current wallet. Required before any delegation.

```bash
mplx agents executive register
```

> Each wallet can only have one executive profile. Calling this again will fail.

### Delegate Execution

Links a registered agent to an executive profile, allowing the executive to sign transactions on behalf of the agent.

```bash
mplx agents executive delegate <ASSET> --executive <EXECUTIVE_WALLET>
```

| Flag | Description |
|------|-------------|
| `--executive` | The executive's wallet address (profile PDA derived automatically) |

> Only the asset owner can delegate. The agent must be registered and the executive must have a profile.

---

## Typical Workflows

### Register a New Agent (Quick)

```bash
# One command — creates asset, uploads image + doc, registers identity
mplx agents register --new --name "My Agent" \
  --description "An autonomous trading agent on Solana" \
  --image "./avatar.png"
```

### Register + Delegate Execution

```bash
# 1. Register agent
mplx agents register --new --name "My Agent" \
  --description "An autonomous agent" --image "./avatar.png"
# Note the asset address from output

# 2. Register executive profile (one-time, on the executive's machine)
mplx agents executive register

# 3. Delegate execution (on the owner's machine)
mplx agents executive delegate <ASSET> --executive <EXECUTIVE_WALLET>
```

### Verify an Agent

```bash
mplx agents fetch <ASSET>
```

---

## Agent Registration Document

The `--name`/`--from-file`/`--wizard` flags produce an [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) JSON document uploaded to Arweave. See `./sdk-agent.md` for the full field reference.

Service types: `web`, `A2A`, `MCP`, `OASF`, `DID`, `email`, or custom.
Trust models: `reputation`, `crypto-economic`, `tee-attestation`.
