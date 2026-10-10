import { getModByRef, tabletTypeName, tabletTypes, type ModRef } from "./data";
import { tradeStatIdForRef } from "./tradeStatMap";

/** Tablet icons by type (poe2db game asset URLs) */
export const TABLET_ICONS: Record<number, string> = Object.fromEntries(
  tabletTypes.map((t) => [t.id, `https://cdn.poe2db.tw/image/Art/2DItems/Currency/PrecursorTablets/${t.icon}.webp`]),
);

/** Tablet base type names for official trade search */
const TABLET_BASE_EN: Record<number, string> = Object.fromEntries(
  tabletTypes.map((t) => [t.id, t.tradeName]),
);

export type SearchRarity = "any" | "magic" | "rare";

export type TabletSearchInput = {
  refs: ModRef[];
  tabletTypeId?: number;
  rarity: SearchRarity;
  /** Minimum remaining uses */
  minUses?: number;
};

/** Determine tablet type: explicit user choice, or implicit if all selected suffixes belong to the same type. */
export function resolveTabletTypeId(refs: ModRef[], tabletTypeId?: number): number | undefined {
  if (tabletTypeId != null) return tabletTypeId;
  const suffixTypes = new Set(
    refs.map((ref) => getModByRef(ref)?.tablet_type_id).filter((id): id is number => id != null),
  );
  return suffixTypes.size === 1 ? [...suffixTypes][0] : undefined;
}

/** Build trade API search query from selected modifiers (AND condition for all selected stats). */
export function buildTabletQuery({ refs, tabletTypeId, rarity, minUses }: TabletSearchInput) {
  const statIds = [...new Set(refs.map(tradeStatIdForRef).filter((id): id is string => Boolean(id)))];
  const typeId = resolveTabletTypeId(refs, tabletTypeId);

  const typeFilters: Record<string, unknown> = { category: { option: "map.tablet" } };
  if (rarity !== "any") typeFilters.rarity = { option: rarity };

  const query: Record<string, unknown> = {
    status: { option: "securable" },
    filters: { type_filters: { filters: typeFilters } },
  };
  if (typeId != null && TABLET_BASE_EN[typeId]) query.type = TABLET_BASE_EN[typeId];
  const filters: Record<string, unknown>[] = statIds.map((id) => ({ id }));
  if (minUses != null && minUses > 0) {
    filters.push({ id: "pseudo.pseudo_number_of_uses_remaining", value: { min: minUses } });
  }
  if (filters.length) query.stats = [{ type: "and", filters }];
  return query;
}

export function tradeSearchUrl(league: string, query: Record<string, unknown>): string {
  const base = `https://www.pathofexile.com/trade2/search/poe2/${encodeURIComponent(league)}`;
  return `${base}?q=${encodeURIComponent(JSON.stringify({ query, sort: { price: "asc" } }))}`;
}

/** Encode query object into trade filter code format (JSON -> gzip -> base64url) */
export async function encodeFilterCode(query: Record<string, unknown>): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(query));
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  const gz = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const b of gz) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type ComboCheck = {
  /** Combination that cannot roll together on a single tablet */
  impossible?: string;
  /** Combination only possible on Rare tablets (Magic tablets can only have 1 prefix and 1 suffix) */
  rareOnly?: boolean;
};

/** Validate if the selected combination of modifiers can co-exist on a single tablet. */
export function checkCombo(refs: ModRef[]): ComboCheck {
  const mods = refs.map(getModByRef).filter((mod): mod is NonNullable<typeof mod> => Boolean(mod));
  const suffixTypes = [...new Set(mods.map((mod) => mod.tablet_type_id).filter((id): id is number => id != null))];
  const prefixes = mods.filter((mod) => mod.type === "prefix").length;
  const suffixes = mods.filter((mod) => mod.type === "suffix").length;
  return {
    impossible:
      suffixTypes.length > 1
        ? `Suffixes specific to ${suffixTypes.map(tabletTypeName).join(" and ")} tablets cannot roll together on the same tablet.`
        : undefined,
    rareOnly: prefixes > 1 || suffixes > 1,
  };
}
