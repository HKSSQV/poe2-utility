// Tablet data generator: ported from poe2db.tw tablet options (https://poe2db.tw/Tablet) → tabletData.json / tabletTradeMap.json
// Usage: node scripts/build-tablet-data.mjs
// - pattern: Stash Ctrl+F regex. Chosen to avoid matching other modifier texts that can appear on the same tablet.
// - stat: Trade site data/stats explicit stat number. Cases with two numbers per text were verified via actual market listings.
import fs from "fs";
const ROOT = "src/tablet/";

const tabletTypes = [
  { id: 1, code: "irradiated", name: "Irradiated", pattern: "radiat", tradeName: "Irradiated Tablet", icon: "PrecursorTabletGeneric" },
  { id: 7, code: "temple", name: "Temple", pattern: "temple", tradeName: "Temple Tablet", icon: "PrecursorTabletIncursion" },
  { id: 2, code: "breach", name: "Breach", pattern: "breach", tradeName: "Breach Tablet", icon: "PrecursorTabletBreach" },
  { id: 3, code: "expedition", name: "Expedition", pattern: "expedition", tradeName: "Expedition Tablet", icon: "PrecursorTabletExpedition" },
  { id: 4, code: "delirium", name: "Delirium", pattern: "delirium", tradeName: "Delirium Tablet", icon: "PrecursorTabletDelirium" },
  { id: 5, code: "ritual", name: "Ritual", pattern: "ritual", tradeName: "Ritual Tablet", icon: "PrecursorTabletRitual" },
  { id: 6, code: "overseer", name: "Overseer", pattern: "overseer", tradeName: "Overseer Tablet", icon: "PrecursorTabletBoss" },
  { id: 13, code: "abyss", name: "Abyss", pattern: "abyss", tradeName: "Abyss Tablet", icon: "PrecursorTabletAbyss" },
];

// [id, type, tablet_type_id, text, pattern, stat]
const P = "prefix", S = "suffix";
const mods = [
  // Common prefixes
  [1, P, null, "Item Rarity in Maps increased by (8–12)%", "rarity", "2306002879"],
  [2, P, null, "Monster Pack Size in Maps increased by (5–7)%", "pack size", "2017682521"],
  [3, P, null, "Maps contain (30–40)% increased Magic Monsters", "magic monsters", "3873704640"],
  [4, P, null, "Maps contain (25–35)% increased Rare Monsters", "rare monsters", "3793155082"],
  [100, P, null, "Monster Rarity in Maps increased by (15–20)%", "monster rarity", "4142653832"],
  [5, P, null, "Gold found in Maps increased by (25–35)%", "gold", "1276056105"],
  [6, P, null, "Experience gain in Maps increased by (12–18)%", "experience", "57434274"],
  [71, P, null, "Monster Efficiency increased by (10–15)% fan", "^monster", "2065500219"],
  [101, P, null, "Maps contain (2–3) additional Rare Chests", "rare chest", "231864447"],
  [102, P, null, "Maps contain 1 additional Circle of Summoning", "circle of summoning", "2839545956"],
  [103, P, null, "Maps contain 1 additional Essence (Hidden effect: increases waystone quantity)", "essence", "395808938"],
  [104, P, null, "Maps contain 1 additional Azmeri Wisp (Hidden effect: increases waystone quantity)", "wisp", "358129101"],
  [105, P, null, "Maps are inhabited by 1 additional Rogue Exile (Hidden effect: increases waystone quantity)", "rogue exile", "3550168289"],
  // Common suffixes
  [66, S, null, "Waystone Drop Quantity from Maps increased by (30–40)%", "waystone", "2777224821"],
  [10, S, null, "Probability for Shrines to appear in Maps increased by (70–100)%", "shrine", "689816330"],
  [11, S, null, "Probability for Strongboxes to appear in Maps increased by (70–100)%", "strongbox", "4279535856"],
  [12, S, null, "Probability for Essences to appear in Maps increased by (70–100)%", "essence", "1825943485"],
  [106, S, null, "Probability for Azmeri Wisps to appear in Maps increased by (70–100)%", "wisp", "3815617979"],
  [107, S, null, "Probability for Rogue Exiles to appear in Maps increased by (70–100)%", "rogue exile", "1352729973"],
  [108, S, null, "Probability for Circles of Summoning to appear in Maps increased by (70–100)%", "circle of summoning", "267210597"],
  [109, S, null, "Maps contain 1 additional Shrine (Hidden effect: increases waystone quantity, reduces pack size)", "shrine.*additional", "1468737867"],
  [110, S, null, "Maps contain 1 additional Strongbox (Hidden effect: increases waystone quantity, reduces pack size)", "strongbox.*additional", "3240183538"],
  [81, S, null, "Maps contain (1–2) additional random modifiers", "random modifier", "588512487"],
  [82, S, null, "Unique Monsters have 1 additional modifier", "unique monster", "3371085671"],
  // Temple
  [111, S, 7, "Monster Pack Size near Vaal Beacons in Maps increased by (10–30)%", "vaal beacon", "890040946"],
  [112, S, 7, "1 additional Monster Pack near Vaal Beacons in Maps", "vaal beacon.*additional", "3294218801"],
  [113, S, 7, "(30–60)% chance for an additional Monster Pack near Vaal Beacons in Maps", "vaal beacon.*chance", "1359775981"],
  [114, S, 7, "Probability for Vaal Beacons to summon additional monsters in Maps increased by (25–50)%", "vaal beacon.*summon", "632698321"],
  [115, S, 7, "(5–10)% chance to find 1 additional Crystal from Vaal Beacons in Maps", "crystal", "1940774881"],
  [116, S, 7, "(10–25)% chance for a Vaal Beacon Unique Monster to appear in Maps", "vaal beacon.*unique", "3937291366"],
  [117, S, 7, "Probability for Vaal Beacon chests to be Rare in Maps increased by (30–60)%", "vaal beacon.*rare", "2514439422"],
  // Breach
  [118, S, 2, "Quantity of Insect Hive Blood found in Maps increased by (30–60)%", "insect hive", "2778285247"],
  [119, S, 2, "Quantity of Fruit of Life found in Maps increased by (30–60)%", "fruit of life", "472809816"],
  [120, S, 2, "(10–30)% chance for Fruit of Life to drop 1 level higher in Maps", "fruit of life.*level", "2889272422"],
  [121, S, 2, "Probability for Xesh't, High Commander to appear in Breaches in Maps increased by (20–50)%", "xesh", "2433436306"],
  [122, S, 2, "Stabilizing an Unstable Breach in Maps spawns (1–2) additional Rare Monsters", "unstable breach", "3762913035"],
  [123, S, 2, "Rare Breach Monster Efficiency in Maps increased by (5–20)%", "breach monster", "2895378479"],
  [23, S, 2, "Breach Pack Size in Maps increased by (5–15)%", "breach pack size", "1210760818"],
  // Expedition
  [124, S, 3, "Expedition Explosive Area of Effect in Maps increased by (5–10)%", "explosive", "3039133122"],
  [34, S, 3, "Quantity of Expedition Logbooks dropped by Runic Monsters increased by (15–25)%", "logbook", "1083387327"],
  [37, S, 3, "Quantity of Runic Monster markers in Maps increased by (15–25)%", "runic monster", "1640965354"],
  [125, S, 3, "Verisium found dropped by Verisium Ruins monsters increased by (15–25)%", "verisium", "3520418269"],
  [126, S, 3, "First excavated Runic Monsters in Maps (1–2) are Rare", "excavated.*rare", "3963944561"],
  [127, S, 3, "(1–2) additional Verisium Sentinels appear in Expeditions in Maps", "verisium sentinel", "1109460697"],
  [128, S, 3, "Expedition Monster Rarity in Maps increased by (15–25)%", "expedition monster", "2905096233"],
  [129, S, 3, "(1–2) additional Ice-Covered Bosses appear in Expeditions in Maps", "ice-covered", "1183698646"],
  [130, S, 3, "(1–2) Buried Strongboxes appear in Expeditions in Maps", "buried strongbox", "181823691"],
  [131, S, 3, "(1–2) additional Vaal Relics appear in Expeditions in Maps", "vaal relic", "2852112245"],
  [132, S, 3, "Expeditions have +(30–40)% excess chance for 1 additional Verisium Ruin", "excess chance", "3653794255"],
  [133, S, 3, "Expeditions have +(30–40)% excess chance to duplicate Runic Monsters", "duplicate runic", "779964546"],
  [134, S, 3, "Verisium Ruins have +(25–35)% increased chance to add additional rune modifiers", "rune modifiers", "3871299443"],
  // Delirium
  [38, S, 4, "Stack count of Simulacrum Splinters found in Maps increased by (15–30)%", "simulacrum", "3836551197"],
  [40, S, 4, "Delirium Fog lasts an additional (6–12) seconds before fading in Maps", "fog lasts", "3226351972"],
  [41, S, 4, "Delirium Fog fades (20–30)% slower in Maps", "fades", "3350944114"],
  [135, S, 4, "Delirium applied to players by Delirium Fog in Maps increased by (15–30)%", "applied to players", "1769611692"],
  [43, S, 4, "Delirium Monster Pack Size in Maps increased by (15–30)%", "delirium monster", "3465791711"],
  [44, S, 4, "Mirrors of Delirium generated in Delirium Fog in Maps increased by (15–30)%", "mirror of delirium", "551040294"],
  [45, S, 4, "Killing Rare Monsters pauses the Delirium Mirror timer for (3–5) seconds in Maps", "timer", "2323782229"],
  [46, S, 4, "Unique Boss appearance probability for Delirium encounters in Maps amplified by (15–30)%", "unique boss", "3962960008"],
  [136, S, 4, "Mirror Shards generated in Delirium Fog in Maps increased by (12–26)%", "mirror shards", "900933517"],
  // Ritual
  [8, S, 5, "Tribute Score granted by monsters sacrificed at Ritual Altars in Maps increased by (18–30)%", "tribute", "159726667"],
  [49, S, 5, "Tribute Score cost to reroll Favours at Ritual Altars in Maps reduced by (20–30)%", "reroll favours", "2282052746"],
  [50, S, 5, "Tribute Score cost to defer Favours at Ritual Altars in Maps reduced by (20–30)%", "defer favours", "1345835998"],
  [51, S, 5, "Time for deferred Favours to reappear at Ritual Altars in Maps accelerated by (25–40)%", "reappear", "28208665"],
  [52, S, 5, "Ritual Altars in Maps allow (1–3) additional Favour rerolls", "additional rerolls", "120737942"],
  [53, S, 5, "Rerolled Favours at Ritual Altars in Maps have a (3–6)% chance to cost no Tribute Score", "cost no tribute", "937291386"],
  [54, S, 5, "Revived monsters at Ritual Altars in Maps have a (35–70)% increased chance to be Magic", "revived.*magic", "1031644647"],
  [55, S, 5, "Revived monsters at Ritual Altars in Maps have a (25–40)% increased chance to be Rare", "revived.*rare", "3979184174"],
  [56, S, 5, "Ritual Favours have a (35–70)% increased chance to be Omens", "omen", "4219853180"],
  // Overseer
  [57, S, 6, "Maps contain (1–2) additional Strongboxes", "strongbox", "3040603554"],
  [58, S, 6, "Maps contain (1–2) additional Shrines", "shrine", "3042527515"],
  [59, S, 6, "Maps contain (1–2) additional Essences", "essence", "2162684861"],
  [70, S, 6, "Maps contain (1–2) additional Azmeri Wisps", "wisp", "775597083"],
  [60, S, 6, "Waystone Drop Quantity from Map Bosses increased by (18–30)%", "boss.*waystone", "1457896329"],
  [61, S, 6, "Experience from Map Bosses amplified by (40–80)%", "boss.*experience", "3860150265"],
  [62, S, 6, "Item Rarity from Map Bosses increased by (35–60)%", "boss.*rarity", "4255069232"],
  [63, S, 6, "Item Quantity from Map Bosses increased by (13–20)%", "boss.*quantity", "3119172063"],
  // Abyss
  [72, S, 13, "Monsters generated from Abysses in Maps increased by (20–30)%", "abyss generated", "944630113"],
  [73, S, 13, "(2–3) additional Rare Monsters generated in Abysses in Maps", "abyss.*additional rare", "243380454"],
  [137, S, 13, "Abyss Monster Efficiency increased by (8–12)% per closed pit, up to 100%", "closed pit", "664606484"],
  [75, S, 13, "Probability for Abysses to lead to Abyssal Depths in Maps increased by (10–20)%", "abyssal depths", "2722831300"],
  [76, S, 13, "Maps contain 1 additional Abyss", "abyss 1 additional", "1070816711"],
  [77, S, 13, "Abyss pits have double the chance to provide rewards in Maps", "double the chance", "4256531808"],
  [78, S, 13, "Maps have a (20–40)% chance to contain 4 additional Abysses", "4 additional abysses", "2890355696"],
  [79, S, 13, "Probability for Abyss monsters to possess Abyss modifiers in Maps increased by (20–30)%", "abyss modifiers", "2789248444"],
  [80, S, 13, "Probability for Corrupted Currency to appear from Abysses in Maps increased by (20–30)%", "corrupted currency", "1710200734"],
];

const toMod = ([id, type, tablet_type_id, text, pattern]) => ({ id, tablet_type_id, text, pattern, type });
const data = {
  tabletTypes: tabletTypes.map(({ id, code, name, pattern, tradeName, icon }) => ({ id, code, name, pattern, tradeName, icon })),
  prefixOptions: mods.filter((m) => m[1] === P).map(toMod),
  suffixOptions: mods.filter((m) => m[1] === S).map(toMod),
};
const tradeMap = {
  source: "poe2db.tw tablet options + trade data/stats (verified 2026-10-02)",
  tabletTypeTrade: Object.fromEntries(tabletTypes.map((t) => [String(t.id), t.tradeName])),
  tradeStatByRef: Object.fromEntries(mods.map(([id, type, , , , stat]) => [`${type}:${id}`, `explicit.stat_${stat}`])),
};
fs.writeFileSync(ROOT + "tabletData.json", JSON.stringify(data, null, 2) + "\n");
fs.writeFileSync(ROOT + "tabletTradeMap.json", JSON.stringify(tradeMap, null, 2) + "\n");

const keys = mods.map((m) => `${m[1]}:${m[0]}`);
if (new Set(keys).size !== keys.length) throw new Error("Duplicate option ID");

// Pattern check: warn if matching other option texts that can appear on the same tablet
const text = (m) => m[3].replace(/ \(Hidden effect.*\)$/, "").replace(/–/g, "-");
for (const m of mods) {
  const re = new RegExp(m[4].replace("^", "(^|· )"), "i");
  const clash = mods.filter((o) => o !== m && re.test(text(o)) && (m[2] == null || o[2] == null || o[2] === m[2]));
  const sameText = clash.filter((o) => o[4] === m[4]);
  if (clash.length > sameText.length) console.warn(`Pattern overlap ${m[1]}:${m[0]} /${m[4]}/ →`, clash.map((o) => o[3]));
}

// Check trade site stat existence
try {
  const res = await fetch("https://poe.kakaogames.com/api/trade2/data/stats", { headers: { "User-Agent": "poe2-utility" } });
  const body = await res.json();
  const ids = new Set(body.result.flatMap((g) => g.entries.map((e) => e.id)));
  for (const m of mods) if (!ids.has(`explicit.stat_${m[5]}`)) console.warn("Stat missing on trade site:", m);
} catch (err) {
  console.warn("Skipped trade site stat check:", err.message);
}
console.log("wrote", data.tabletTypes.length, "types", data.prefixOptions.length, "prefixes", data.suffixOptions.length, "suffixes");
