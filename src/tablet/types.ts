export type TabletType = {
  id: number;
  code: string;
  name: string;
  pattern: string;
  /** Trade item base name */
  tradeName: string;
  /** poe2db icon file name */
  icon: string;
};

export type TabletMod = {
  id: number;
  tablet_type_id: number | null;
  text: string;
  pattern: string;
  type: "prefix" | "suffix";
};

export type CombineMode = "and" | "or";

export type TabletPreset = {
  id: string;
  label: string;
  tabletTypeId: number;
  prefixIds: number[];
  suffixIds: number[];
  includeType: boolean;
  combineMode: CombineMode;
};

export type SavedRegex = {
  id: string;
  name: string;
  regex: string;
  savedAt: number;
};
