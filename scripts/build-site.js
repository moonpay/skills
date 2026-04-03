#!/usr/bin/env node
/**
 * Reads all SKILL.md files + marketplace.json and generates skills-data.json
 * Run: node scripts/build-site.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MARKETPLACE = path.join(ROOT, ".claude-plugin", "marketplace.json");
const OUTPUT = path.join(ROOT, "docs", "skills-data.json");

// Simple YAML frontmatter parser (no deps)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split("\n").forEach(line => {
    const m = line.match(/^(\w+):\s*(.+)/);
    if (!m) return;
    let val = m[2].trim();
    // Parse arrays: [a, b, c]
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ""));
    }
    fm[m[1]] = val;
  });
  return fm;
}

// Icon mapping by keyword
function pickIcon(name, tags) {
  const s = `${name} ${(tags || []).join(" ")}`;
  const icons = [
    [/auth|login|setup/, "🔑"], [/wallet|check-wallet|portfolio/, "👛"],
    [/swap|bridge/, "🔄"], [/discover|research|search/, "🔍"],
    [/buy|purchase/, "💳"], [/deposit/, "📥"], [/explorer|block/, "🔗"],
    [/export|csv/, "📊"], [/virtual-account|fiat|bank/, "🏦"],
    [/hardware|ledger/, "🔒"], [/mcp|server/, "🧩"], [/upgrade/, "⚡"],
    [/x402|payment|micropay/, "💸"], [/feedback|support/, "💬"],
    [/mission|start/, "🚀"], [/prediction|market|bet/, "📈"],
    [/fund-poly|polymarket/, "🎯"], [/scout|arb/, "🦅"],
    [/automat|dca|cron/, "🤖"], [/alert|price-alert/, "🔔"],
    [/commerce|shop/, "🛒"], [/alpha/, "🏹"], [/funding|vc/, "💰"],
    [/deep.*research|brain/, "🧠"], [/trust|safety|secure/, "🛡️"],
    [/token-safety|honeypot/, "🔐"], [/sport/, "🏀"],
    [/thought|reason|verif/, "🧪"], [/analytic|dune|sql/, "📊"],
    [/lend|borrow/, "🏛️"], [/nft|metaplex/, "🎨"],
    [/messari/, "📡"], [/zerion/, "📱"], [/alchemy/, "⚗️"],
    [/jupiter/, "🪐"], [/allium|onchain/, "⛓️"],
    [/corbits|marketplace/, "🏪"], [/myriad/, "🎲"],
  ];
  for (const [re, icon] of icons) {
    if (re.test(s)) return icon;
  }
  return "📦";
}

// Main
const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE, "utf8"));
const plugins = [];

for (const plugin of marketplace.plugins) {
  const skillEntries = [];

  for (const skillPath of plugin.skills) {
    const dir = path.join(ROOT, skillPath.replace(/^\.\//, ""));
    const skillFile = path.join(dir, "SKILL.md");

    if (!fs.existsSync(skillFile)) {
      console.warn(`WARN: ${skillFile} not found, skipping`);
      continue;
    }

    const content = fs.readFileSync(skillFile, "utf8");
    const fm = parseFrontmatter(content);

    const name = fm.name || path.basename(dir);
    const description = fm.description || "";
    const tags = Array.isArray(fm.tags) ? fm.tags : [];

    skillEntries.push({
      name,
      description,
      tags,
      icon: pickIcon(name, tags),
      path: skillPath.replace(/^\.\//, ""),
    });
  }

  // Derive display name from plugin name
  const displayName = plugin.name
    .replace(/-skills$/, "")
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  plugins.push({
    name: displayName,
    pluginName: plugin.name,
    description: plugin.description,
    skills: skillEntries,
  });
}

const data = { plugins, generatedAt: new Date().toISOString() };
fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
console.log(`Generated ${OUTPUT} — ${plugins.reduce((a, p) => a + p.skills.length, 0)} skills across ${plugins.length} plugins`);
