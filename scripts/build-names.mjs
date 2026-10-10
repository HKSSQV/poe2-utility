// build-names.mjs

const TYPES = [
  "Currency",
  "Fragments",
  "Ritual",
  "Essences",
  "UncutGems",
  "LineageSupportGems",
  "SoulCores",
  "Runes",
  "Idols",
  "Abyss",
  "Delirium",
  "Breach",
  "Expedition",
  "Verisium",
];

// Используем стандартные (английские) версии страниц без /kr/
const DB_PAGES = [
  "https://poe2db.tw/Economy",
  "https://poe2db.tw/Economy_Fragments",
  "https://poe2db.tw/Economy_Ritual",
  "https://poe2db.tw/Economy_Essences",
  "https://poe2db.tw/Economy_Breach",
  "https://poe2db.tw/Economy_Delirium",
  "https://poe2db.tw/Economy_Expedition",
  "https://poe2db.tw/Economy_Runes",
  "https://poe2db.tw/Economy_SoulCores",
  "https://poe2db.tw/Economy_Soul_Cores",
  "https://poe2db.tw/Economy_Idols",
  "https://poe2db.tw/Economy_Gems",
  "https://poe2db.tw/Economy_Uncut_Gems",
  "https://poe2db.tw/Economy_Lineage_Supports",
  "https://poe2db.tw/Economy_Abyss",
  "https://poe2db.tw/Economy_Verisium",
  "https://poe2db.tw/Currency_Exchange",
];

const SKIP_SLUGS = new Set([
  "economy",
  "economy_fragments",
  "economy_ritual",
  "economy_essences",
  "economy_breach",
  "economy_delirium",
  "economy_expedition",
  "economy_runes",
  "economy_soulcores",
  "economy_soul_cores",
  "economy_idols",
  "economy_gems",
  "economy_uncutgems",
  "economy_abyss",
  "currency_exchange",
  "currency",
]);

// Нормализация для английского языка (убрали диапазон корейских символов 가-힣)
function norm(value) {
  return String(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/json",
      "User-Agent": "poe2-utility-local/0.1 (local-dev)",
    },
  });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.text();
}

function addName(names, slug, label) {
  const clean = label.replace(/\s+Wiki$/u, "").trim();
  // Убрали проверку на [가-힣], теперь просто проверяем наличие текста
  if (!clean || SKIP_SLUGS.has(slug.toLowerCase())) return;
  names.set(norm(slug), clean);
  names.set(norm(slug.replaceAll("_", " ")), clean);
  names.set(norm(slug.replaceAll("_", "-")), clean);
}

function parseDbNames(html) {
  const names = new Map();
  
  // Парсим пары с Wiki (убран корейский префикс /kr/)
  const wikiPairs = html.matchAll(/>([^<>]{2,80})<\/a>\s*<a href="([^"#?]+)"[^>]*>Wiki<\/a>/gi);
  for (const match of wikiPairs) {
    addName(names, decodeURIComponent(match[2].replace(/^\//, "")), match[1]);
  }
  
  // Прямой парсинг ссылок
  const direct = html.matchAll(/href="([^"#?]+)"[^>]*>([^<]{2,80})</gi);
  for (const match of direct) {
    addName(names, decodeURIComponent(match[1]), match[2]);
  }
  return names;
}

async function main() {
  const dbNames = new Map();
  for (const url of DB_PAGES) {
    try {
      const html = await fetchText(url);
      const parsed = parseDbNames(html);
      for (const [key, value] of parsed) dbNames.set(key, value);
      console.log(`db ${url} +${parsed.size}`);
    } catch (error) {
      console.warn(String(error));
    }
  }

  const items = [];
  for (const type of TYPES) {
    const url = `https://poe.ninja/poe2/api/economy/exchange/current/overview?league=${encodeURIComponent("Forbidden Rites")}&type=${type}`;
    const data = JSON.parse(await fetchText(url));
    for (const item of [...(data.items ?? []), ...(data.core?.items ?? [])]) {
      items.push(item);
    }
  }

  const names = {};
  let hit = 0;
  const missed = [];
  const seen = new Set();
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    const keys = [item.id, item.detailsId, item.name, item.name?.replaceAll(" ", "_"), item.detailsId?.replaceAll("-", "_")];
    
    // Ищем английское название по нормализованным ключам
    const englishName = keys.map((key) => (key ? dbNames.get(norm(key)) : undefined)).find(Boolean);
    if (englishName) {
      names[item.id] = englishName;
      if (item.detailsId) names[item.detailsId] = englishName;
      names[norm(item.name)] = englishName;
      hit += 1;
    } else {
      missed.push(`${item.id} | ${item.name}`);
    }
  }

  const source = `// Generated from poe.ninja ids + poe2db.tw names (English).\nexport const NAMES: Record<string, string> = ${JSON.stringify(names, null, 2)};\n`;
  await import("node:fs/promises").then((fs) => fs.writeFile(new URL("../src/names.generated.ts", import.meta.url), source, "utf8"));
  console.log(`matched ${hit}/${seen.size}, missed ${missed.length}`);
  console.log(missed.slice(0, 40).join("\n"));
}

await main();
