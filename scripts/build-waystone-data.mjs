// Waystone data generator: poe2db.tw Waystone options table (https://poe2db.tw/Waystones) → src/waystone/waystoneData.json
// Usage: node scripts/build-waystone-data.mjs
// - Combines identical options that only differ by tier and merges their range values.
// - pattern: Stash Ctrl+F regex. The shortest substring that avoids matching other option lines (including extra effects) and base item properties.
// - stat: Trade site data/stats explicit stat number (matched via first line text).
import fs from "fs";

const UA = "OAuth poe2-utility/0.1 (+https://github.com/GitDevWorld/poe2-utility)";
const OUT = "src/waystone/waystoneData.json";

const html = await (await fetch("https://poe2db.tw/Waystones", { headers: { "User-Agent": "Mozilla/5.0" } })).text();
const stats = await (await fetch("https://poe.kakaogames.com/api/trade2/data/stats", { headers: { "User-Agent": UA } })).json();

const start = html.indexOf('id="WaystonesMods"');
if (start < 0) throw new Error("Could not find Waystones options table");
const table = html.slice(start, html.indexOf("</tbody>", start));

const clean = (s) =>
  s
    .replace(/<span class="ndash">—<\/span>/g, "–")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const rows = [...table.matchAll(/<tr><td>(\d+)<\/td><td>(Prefix|Suffix)<\/td><td>([\s\S]*?)<\/td><\/tr>/g)]
  .map(([, level, affix, desc]) => ({
    level: Number(level),
    type: affix === "Prefix" ? "prefix" : "suffix",
    lines: desc.split(/<br\s*\/?>/).map(clean).filter(Boolean),
  }))
  .filter((row) => row.lines.length);

// Template string converting numbers to '#' to identify matching option groups
const template = (line) => line.replace(/\((-?\d+(?:\.\d+)?)–(-?\d+(?:\.\d+)?)\)|-?\d+(?:\.\d+)?/g, "#");

const groups = new Map();
for (const row of rows) {
  const key = `${row.type}|${template(row.lines[0])}`;
  const group = groups.get(key) ?? { type: row.type, rows: [] };
  group.rows.push(row);
  groups.set(key, group);
}

// Merges numeric ranges across tiers into "(min–max)" format
function mergedText(lines) {
  const parts = lines[0].split(/(\((?:\d+(?:\.\d+)?)–(?:\d+(?:\.\d+)?)\)|\d+(?:\.\d+)?)/);
  let slot = 0;
  return parts
    .map((part, i) => {
      if (i % 2 === 0) return part;
      const values = lines.flatMap((line) => {
        const nums = [...line.matchAll(/\((\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)\)|(\d+(?:\.\d+)?)/g)][slot];
        return nums ? [nums[1] ?? nums[3], nums[2] ?? nums[3]].map(Number) : [];
      });
      slot += 1;
      const lo = Math.min(...values);
      const hi = Math.max(...values);
      return lo === hi ? String(lo) : `(${lo}–${hi})`;
    })
    .join("");
}

const statEntries = stats.result.find((g) => g.id === "explicit").entries;
const statByTemplate = new Map();
for (const entry of statEntries) {
  const key = entry.text.replace(/\+?#/g, "#").replace(/\s+/g, " ");
  if (!statByTemplate.has(key)) statByTemplate.set(key, entry.id);
}
const findStat = (line) => {
  const key = template(line).replace(/\+#/g, "#");
  return statByTemplate.get(key) ?? statByTemplate.get(key.replace(/#%/g, "#%"));
};

// Custom overrides for cases that cannot be automatically inferred (key: template line with #)
const OVERRIDES = {
  // Target specific monster damage increase
  "Monsters deal #% increased Damage": { pattern: "deal.#%.increased" },
  // Negative range formatting override
  "+#% to Maximum Player Resistances": { text: "-(3–10)% to Maximum Player Resistances" },
  // Cooldown recovery speed reduction explicit stat mapping
  "#% reduced Cooldown Recovery Rate of Player Skills": { stat: "explicit.stat_941368244" },
};

// Base item lines visible on Waystone items that patterns MUST NOT match against
const BASE_LINES = [
  "Waystone (Tier 15)",
  "Waystone Tier: 15",
  "Item Quantity: +50%",
  "Item Rarity: +50%",
  "Monster Pack Size: +50%",
  "Waystone Drop Chance: +50%",
  "Revives Remaining: 3",
  "Corrupted",
];

const mods = [...groups.values()].map((group, index) => {
  const first = group.rows.map((row) => row.lines[0]);
  const override = OVERRIDES[template(first[0])] ?? {};
  
  // Extra effect lines merged across tiers
  const extraCount = Math.max(...group.rows.map((row) => row.lines.length)) - 1;
  const extras = Array.from({ length: extraCount }, (_, k) =>
    mergedText(group.rows.map((row) => row.lines[k + 1]).filter(Boolean)),
  );
  return {
    id: index + 1,
    type: group.type,
    text: override.text ?? mergedText(first),
    extras,
    stat: override.stat ?? findStat(first[0]),
    patternOverride: override.pattern,
    allLines: group.rows.flatMap((row) => row.lines),
  };
});

const shown = (line) => line.replace(/\(([\d.]+)–([\d.]+)\)/g, "$2");
function pickPattern(mod) {
  if (mod.patternOverride) return mod.patternOverride;
  const others = [
    ...mods.filter((m) => m !== mod).flatMap((m) => m.allLines.map(shown)),
    ...BASE_LINES,
  ];
  
  // Generate candidate regex from text segments excluding numbers/punctuation
  const text = shown(mod.allLines[0]);
  const segments = text.split(/[\d%+().,]+/).map((s) => s.trim()).filter((s) => s.length >= 2);
  for (let len = 2; len <= 8; len += 1) {
    for (const seg of segments) {
      for (let i = 0; i + len <= seg.length; i += 1) {
        const raw = seg.slice(i, i + len);
        if (raw.startsWith(" ") || raw.endsWith(" ")) continue;
        const pattern = raw.replace(/ /g, ".");
        const re = new RegExp(pattern, "i");
        if (!re.test(text)) continue;
        if (others.some((line) => re.test(line))) continue;
        return pattern;
      }
    }
  }
  return null;
}

const out = [];
for (const mod of mods) {
  const pattern = pickPattern(mod);
  if (!pattern) console.warn("Missing pattern:", mod.type, mod.text);
  if (!mod.stat) console.warn("Missing trade site stat:", mod.type, mod.text);
  out.push({
    id: mod.id,
    type: mod.type,
    text: mod.text,
    extras: mod.extras,
    pattern: pattern ?? "",
    stat: mod.stat ?? null,
  });
}

for (const mod of out) {
  if (!mod.pattern) continue;
  const re = new RegExp(mod.pattern, "i");
  const self = mods.find((m) => m.id === mod.id);
  if (!re.test(shown(self.allLines[0]))) console.warn("Pattern did not match own text:", mod.pattern, mod.text);
  const clash = mods.filter((m) => m.id !== mod.id && m.allLines.some((line) => re.test(shown(line))));
  if (clash.length) console.warn("Pattern collision:", mod.pattern, mod.text, "→", clash.map((m) => m.allLines[0]));
}

fs.mkdirSync("src/waystone", { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      source: `poe2db.tw/Waystones + trade data/stats (${new Date().toISOString().slice(0, 10)} verified)`,
      tiers: Array.from({ length: 16 }, (_, i) => i + 1),
      prefixOptions: out.filter((m) => m.type === "prefix"),
      suffixOptions: out.filter((m) => m.type === "suffix"),
    },
    null,
    2,
  ) + "\n",
);
console.log(`rows ${rows.length} → mods ${out.length} (prefix ${out.filter((m) => m.type === "prefix").length}, suffix ${out.filter((m) => m.type === "suffix").length})`);
for (const m of out) console.log(m.type === "prefix" ? "P" : "S", m.pattern.padEnd(12), m.stat ? "✓" : "✗", m.text);
