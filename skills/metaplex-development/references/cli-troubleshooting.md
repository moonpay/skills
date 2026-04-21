# Metaplex CLI — Localnet Limitations & Troubleshooting

## Localnet Limitations

When running on localhost/localnet, several CLI features are unavailable or require workarounds:

- **Storage uploads (Irys) do not work on localhost.** Any command that uploads to Irys will fail.
- **Commands using `--image` without `--uri` will fail** because they attempt to upload to Irys under the hood. This affects `mplx toolbox token create`, `mplx core asset create --files`, and `mplx tm create --image`.
- **For localnet, always use `--uri`** with any URL (even a placeholder) for create commands: `mplx core asset create --name "Test" --uri "https://example.com/meta.json"`
- **For fungible tokens on localnet**, use the SPL Token CLI and then attach metadata:
  ```bash
  spl-token create-token
  # Note the mint address, then:
  mplx toolbox token add-metadata <MINT> --name <NAME> --symbol <SYM> --uri <URI>
  ```
- **`mplx core asset update` and `mplx tm update`** also require Irys if re-uploading metadata (e.g., updating `--image`). On localnet, only update fields that do not trigger an upload (e.g., `--name`, `--uri` with a pre-existing URL).
- **`mplx toolbox token mint` and `mplx toolbox token transfer`** may fail if the mpl-toolbox program is not deployed on your localnet. Use `spl-token mint` and `spl-token transfer` as fallbacks.

## Troubleshooting

| Error | Solution |
|-------|----------|
| `InvalidTokenStandard` | Check asset's actual token standard |
| `InvalidAuthority` | Verify update/mint authority matches signer |
| `CollectionNotVerified` | Call `verifyCollectionV1` (TM collections need verification) |
| `PluginNotFound` | Add plugin first or check type name spelling |
| `InsufficientFunds` | Fund wallet with more SOL |
| `Invalid data enum variant` | Check plugin JSON format (array, correct types) |
| Upload fails / timeout | Check `mplx toolbox storage balance`, fund if needed |
