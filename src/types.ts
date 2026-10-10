export type League = {
  id: string;
  name: string;
};

export type CurrencyMeta = {
  id: string;
  name: string;
  image: string;
  category: string;
  detailsId: string;
};

export type Sparkline = {
  totalChange: number;
  data: number[];
};

export type ExchangeLine = {
  id: string;
  primaryValue: number;
  volumePrimaryValue: number;
  maxVolumeCurrency: string;
  maxVolumeRate: number;
  sparkline: Sparkline;
};

export type ExchangeOverview = {
  core: {
    items: CurrencyMeta[];
    rates: Record<string, number>;
    primary: string;
    secondary: string;
  };
  lines: ExchangeLine[];
  items: CurrencyMeta[];
};

export type CategoryId =
  | "Currency"
  | "Fragments"
  | "Abyss"
  | "UncutGems"
  | "LineageSupportGems"
  | "Essences"
  | "SoulCores"
  | "Idols"
  | "Runes"
  | "Ritual"
  | "Expedition"
  | "Delirium"
  | "Breach"
  | "Verisium";

export type MarketRow = {
  id: string;
  name: string;
  image: string;
  category: string;
  categoryId: CategoryId;
  divineValue: number;
  volumeDivine: number;
  sparkline: Sparkline;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "Currency", label: "Currency" },
  { id: "Fragments", label: "Fragments" },
  { id: "Ritual", label: "Ritual" },
  { id: "Essences", label: "Essences" },
  { id: "UncutGems", label: "Uncut Gems" },
  { id: "LineageSupportGems", label: "Lineage Gems" },
  { id: "SoulCores", label: "Soul Cores" },
  { id: "Runes", label: "Runes" },
  { id: "Idols", label: "Idols" },
  { id: "Abyss", label: "Abyss" },
  { id: "Delirium", label: "Delirium" },
  { id: "Breach", label: "Breach" },
  { id: "Expedition", label: "Expedition" },
  { id: "Verisium", label: "Verisium" },
];
