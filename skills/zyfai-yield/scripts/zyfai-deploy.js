#!/usr/bin/env node
// Deploy Zyfai subaccount and enable session key for automated yield
// Usage: node zyfai-deploy.js <privateKey> <chainId> [strategy]
// chainId: 8453 (Base), 42161 (Arbitrum), 9745 (Plasma)
// strategy: conservative (default) | aggressive
const { ZyfaiSDK } = require("@zyfai/sdk");
const { HDNodeWallet, ethers } = require("ethers");

const [,, privateKey, chainId = "8453", strategy = "conservative"] = process.argv;
if (!privateKey) { console.error("Usage: node zyfai-deploy.js <privateKey> <chainId> [strategy]"); process.exit(1); }

const chainIdNum = parseInt(chainId);
const wallet = new ethers.Wallet(privateKey);
const address = wallet.address;
console.log("Address:", address, "| Chain:", chainIdNum, "| Strategy:", strategy);

(async () => {
  const sdk = new ZyfaiSDK({ apiKey: process.env.ZYFAI_API_KEY });
  await sdk.connectAccount(privateKey, chainIdNum);
  const info = await sdk.getSmartWalletAddress(address, chainIdNum);
  if (!info.isDeployed) {
    console.log("Deploying subaccount...");
    await sdk.deploySafe(address, chainIdNum, strategy);
    console.log("Deployed.");
  } else {
    console.log("Subaccount already deployed:", info.address);
  }
  console.log("Enabling session key...");
  await sdk.createSessionKey(address, chainIdNum);
  console.log("Done. Subaccount ready for yield optimization.");
  await sdk.disconnectAccount();
})().catch(e => { console.error(e.message); process.exit(1); });
