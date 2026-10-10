// Tablet data check: (1) Check if stash search patterns overlap with other option texts (2) Check if trade site stats actually return results.
// Usage: node scripts/check-tablet-data.mjs [--trade]
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("src/tablet/tabletData.json", "utf8"));
const tradeMap = JSON.parse(readFileSync("src/tablet/tabletTradeMap.json", "utf8"));
const mods = [...data.prefixOptions, ...data.suffixOptions];
const typeName = Object.fromEntries(data.tabletTypes.map((t) => [t.id, t.name]));

// Replaces range "(8–12)" with a single number like in-game display.
// Removes hidden effect descriptions "(Hidden effect: …)" which don't appear in-game.
const shown = (text) =>
  text.replace(/\s*\(Hidden effect[^)]*\)/g, "").replace(/\((\d+(?:\.\d+)?)[–—-](\d+(?:\.\d+)?)\)/g, "$2");

console.log("== Pattern Check");
let patternIssues = 0;
for (const mod of mods) {
  let re;
  try {
    re = new RegExp(mod.pattern, "i");
  } catch (err) {
    console.log(`[Invalid Pattern] ${mod.type}:${mod.id} ${mod.pattern} — ${err.message}`);
    patternIssues += 1;
    continue;
  }
  if (!re.test(shown(mod.text))) {
    console.log(`[Pattern does not match own text] ${mod.type}:${mod.id} "${mod.pattern}" / ${mod.text}`);
    patternIssues += 1;
  }
  const hits = mods.filter((other) => other !== mod && re.test(shown(other.text)));
  // Identical texts existing across different tablet types are considered the same option.
  const real = hits.filter((other) => shown(other.text) !== shown(mod.text));
  if (real.length) {
    patternIssues += 1;
    console.log(
      `[Pattern matches other options] ${mod.type}:${mod.id} "${mod.pattern}" (${mod.text})\n` +
        real.map((o) => `    → ${o.type}:${o.id} ${typeName[o.tablet_type_id] ?? "Common"} ${o.text}`).join("\n"),
    );
  }
  for (const t of data.tabletTypes) {
    if (re.test(`${t.tradeName}`)) {
      patternIssues += 1;
      console.log(`[Pattern matches tablet name] ${mod.type}:${mod.id} "${mod.pattern}" → ${t.tradeName}`);
    }
  }
}
console.log(`Pattern issues found: ${patternIssues}`);

if (process.argv.includes("--trade")) {
  console.log("\n== Trade Search Check (Kakao, Instant Buyout)");
  const UA = "OAuth poe2-utility/0.1 (+https://github.com/GitDevWorld/poe2-utility)";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let tradeIssues = 0;
  let checked = 0;
  // Allows checking specific subsets using ONLY="prefix:1,suffix:10"
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
  for (const mod of mods) {
    const key = `${mod.type}:${mod.id}`;
    if (only && !only.has(key)) continue;
    checked += 1;
    const statId = tradeMap.tradeStatByRef[key];
    if (!statId) {
      tradeIssues += 1;
      console.log(`[Missing stat] ${key} ${mod.text}`);
      continue;
    }
    const type = data.tabletTypes.find((t) => t.id === mod.tablet_type_id)?.tradeName;
    const query = {
      status: { option: "securable" },
      stats: [{ type: "and", filters: [{ id: statId }] }],
      filters: { type_filters: { filters: { category: { option: "map.tablet" } } } },
    };
    if (type) query.type = type;
    const res = await fetch(`https://poe.kakaogames.com/api/trade2/search/poe2/${encodeURIComponent(process.env.LEAGUE ?? "Forbidden Rites")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({ query, sort: { price: "asc" } }),
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after") ?? 60);
      console.log(`  (Rate limit — waiting ${wait}s)`);
      await sleep((wait + 2) * 1000);
    }
    const body = await res.json().catch(() => ({ error: { message: `HTTP ${res.status} (Not JSON)` } }));
    const total = body.error ? `Error ${body.error.message}` : body.total;
    if (body.error || !body.total) {
      tradeIssues += 1;
      console.log(`[No search results] ${key} ${type ?? "All"} ${mod.text} → ${total}`);
    }
    await sleep(11_000);
  }
  console.log(`Trade issues: ${tradeIssues} / ${checked} checked`);
}
