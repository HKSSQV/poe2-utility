import { useEffect, useMemo, useState } from "react";
import { buildStashSearchQuery } from "./stashSearch";
import {
  filterModsByQuery,
  getModByRef,
  modRefKey,
  prefixOptions,
  suffixesForFilter,
  tabletTypeName,
  tabletTypes,
  type ModRef,
} from "./data";
import type { TabletMod } from "./types";
import type { TabletFilter } from "./recommended";
import { ControlGroup, Segmented, SearchOutputs } from "../components/SearchOutputs";
import { hasTradeStatForRef } from "./tradeStatMap";
import { buildTabletQuery, checkCombo, TABLET_ICONS, type SearchRarity } from "./tradeSearch";
import { useTradeLeague } from "./useTradeLeague";

type PickMode = "include" | "exclude";

function toggleRef(list: ModRef[], ref: ModRef): ModRef[] {
  const key = modRefKey(ref);
  if (list.some((item) => modRefKey(item) === key)) {
    return list.filter((item) => modRefKey(item) !== key);
  }
  return [...list, ref];
}

function ModPicker({
  mods,
  included,
  excluded,
  mode,
  onPick,
  showTypeLabel,
  emptyLabel,
}: {
  mods: TabletMod[];
  included: ModRef[];
  excluded: ModRef[];
  mode: PickMode;
  onPick: (ref: ModRef) => void;
  showTypeLabel?: boolean;
  emptyLabel?: string;
}) {
  const includedKeys = useMemo(() => new Set(included.map(modRefKey)), [included]);
  const excludedKeys = useMemo(() => new Set(excluded.map(modRefKey)), [excluded]);

  return (
    <div className="tablet-mod-panel">
      {!mods.length ? (
        <p className="tablet-mod-empty">{emptyLabel ?? "None"}</p>
      ) : (
        <ul className="tablet-mod-list">
          {mods.map((mod) => {
            const ref: ModRef = { slot: mod.type, id: mod.id };
            const key = modRefKey(ref);
            const added = includedKeys.has(key);
            const removed = excludedKeys.has(key);
            const active = mode === "include" ? added : removed;
            return (
              <li key={`${mode}-${key}`} className="tablet-mod-item">
                <button
                  type="button"
                  className={`tablet-mod-row ${active ? "selected" : ""} ${mode === "exclude" ? "exclude-pick" : ""}`}
                  onClick={() => onPick(ref)}
                >
                  <span className="tablet-mod-row-body">
                    <strong>
                      {added && <span className="tablet-state-badge added">Added</span>}
                      {removed && <span className="tablet-state-badge removed">Excluded</span>}
                      {showTypeLabel && mod.tablet_type_id == null && <span className="tablet-mod-type-tag">Common</span>}
                      {showTypeLabel && mod.tablet_type_id != null && (
                        <span className="tablet-mod-type-tag">
                          {TABLET_ICONS[mod.tablet_type_id] && (
                            <img src={TABLET_ICONS[mod.tablet_type_id]} alt="" width={14} height={14} loading="lazy" />
                          )}
                          {tabletTypeName(mod.tablet_type_id)}
                        </span>
                      )}
                      {mod.text}
                    </strong>
                    <small>{mod.pattern}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function patternsFromRefs(refs: ModRef[]): string[] {
  const seen = new Set<string>();
  const patterns: string[] = [];
  for (const ref of refs) {
    const pattern = getModByRef(ref)?.pattern;
    if (!pattern || seen.has(pattern)) continue;
    seen.add(pattern);
    patterns.push(pattern);
  }
  return patterns;
}

function ModPickArea({
  addMode,
  prefixMods,
  suffixMods,
  tabletFilter,
  included,
  excluded,
  onPickMod,
}: {
  addMode: boolean;
  prefixMods: TabletMod[];
  suffixMods: TabletMod[];
  tabletFilter: TabletFilter;
  included: ModRef[];
  excluded: ModRef[];
  onPickMod: (ref: ModRef) => void;
}) {
  const mode: PickMode = addMode ? "include" : "exclude";
  const typeName =
    typeof tabletFilter === "number" ? tabletTypes.find((t) => t.id === tabletFilter)?.name : null;
  const suffixTitle = typeName ? `Suffix · ${typeName}` : "Suffixes";

  return (
    <div className="tablet-pick-section">
      <div className="tablet-two-cols">
        <div className="tablet-col">
          <h4>Prefixes</h4>
          <ModPicker
            mods={prefixMods}
            included={included}
            excluded={excluded}
            mode={mode}
            onPick={onPickMod}
          />
        </div>
        <div className="tablet-col">
          <h4>{suffixTitle}</h4>
          <ModPicker
            mods={suffixMods}
            included={included}
            excluded={excluded}
            mode={mode}
            onPick={onPickMod}
            showTypeLabel={tabletFilter === "all"}
          />
        </div>
      </div>
    </div>
  );
}

const MODES: { id: "include" | "exclude"; label: string }[] = [
  { id: "include", label: "Include" },
  { id: "exclude", label: "Exclude" },
];

const RARITIES: { id: SearchRarity; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "magic", label: "Magic" },
  { id: "rare", label: "Rare" },
];

export function TabletRegexBuilder() {
  const [tabletFilter, setTabletFilter] = useState<TabletFilter>("all");
  const [includeTypePattern, setIncludeTypePattern] = useState(false);
  const [addMode, setAddMode] = useState(true);
  const [included, setIncluded] = useState<ModRef[]>([]);
  const [excluded, setExcluded] = useState<ModRef[]>([]);
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<SearchRarity>("any");
  const [minUses, setMinUses] = useState(10);

  const tabletType = typeof tabletFilter === "number" ? tabletTypes.find((item) => item.id === tabletFilter) : undefined;
  const league = useTradeLeague();

  useEffect(() => {
    if (tabletFilter === "all") {
      setIncludeTypePattern(false);
      return;
    }
    const keepSuffix = (ref: ModRef) => {
      if (ref.slot === "prefix") return true;
      const typeId = getModByRef(ref)?.tablet_type_id;
      return typeId == null || typeId === tabletFilter;
    };
    setIncluded((prev) => prev.filter(keepSuffix));
    setExcluded((prev) => prev.filter(keepSuffix));
  }, [tabletFilter]);

  const prefixFiltered = useMemo(
    () => filterModsByQuery(prefixOptions, query),
    [query],
  );

  const suffixFiltered = useMemo(
    () => filterModsByQuery(suffixesForFilter(tabletFilter), query),
    [query, tabletFilter],
  );

  const includePatterns = useMemo(() => patternsFromRefs(included), [included]);
  const typePattern = includeTypePattern ? tabletType?.pattern : undefined;

  const excludePatterns = useMemo(() => patternsFromRefs(excluded), [excluded]);

  const search = useMemo(
    () => buildStashSearchQuery(includePatterns, excludePatterns, typePattern),
    [includePatterns, excludePatterns, typePattern],
  );

  const tradeRefs = useMemo(() => included.filter(hasTradeStatForRef), [included]);
  const tradeQuery = useMemo(
    () => buildTabletQuery({ refs: tradeRefs, tabletTypeId: tabletType?.id, rarity, minUses }),
    [tradeRefs, tabletType?.id, rarity, minUses],
  );
  const combo = useMemo(() => checkCombo(tradeRefs), [tradeRefs]);

  const pickMod = (ref: ModRef) => {
    if (addMode) {
      setIncluded((prev) => toggleRef(prev, ref));
      setExcluded((prev) => prev.filter((item) => modRefKey(item) !== modRefKey(ref)));
    } else {
      setExcluded((prev) => toggleRef(prev, ref));
      setIncluded((prev) => prev.filter((item) => modRefKey(item) !== modRefKey(ref)));
    }
  };

  const clear = () => {
    setIncluded([]);
    setExcluded([]);
    setIncludeTypePattern(false);
  };

  return (
    <section className="table-wrap tablet-builder">
      <SearchOutputs
        regex={search.query}
        tradeQuery={tradeQuery}
        league={league}
        note={
          combo.impossible ? (
            <span className="warn">Trade: {combo.impossible}</span>
          ) : combo.rareOnly && rarity === "magic" ? (
            <span className="warn">Trade: Magic tablets only roll 1 prefix and 1 suffix, so this combination only appears on Rare items.</span>
          ) : null
        }
      />

      <div className="ctrl-panel">
        <ControlGroup label="Tablet Type" className="wide">
          <div className="chip-row">
            <button
              type="button"
              className={`chip ${tabletFilter === "all" ? "active" : ""}`}
              onClick={() => setTabletFilter("all")}
            >
              All
            </button>
            {tabletTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`chip ${tabletFilter === type.id ? "active" : ""}`}
                onClick={() => setTabletFilter(type.id)}
              >
                {TABLET_ICONS[type.id] && <img src={TABLET_ICONS[type.id]} alt="" width={20} height={20} />}
                {type.name}
              </button>
            ))}
          </div>
        </ControlGroup>
        <ControlGroup label="Stash Regex">
          <label className={`check${tabletFilter === "all" ? " disabled" : ""}`}>
            <input
              type="checkbox"
              checked={includeTypePattern}
              disabled={tabletFilter === "all"}
              onChange={(event) => setIncludeTypePattern(event.target.checked)}
            />
            Include tablet type in conditions{tabletType ? ` (${tabletType.pattern})` : ""}
          </label>
        </ControlGroup>
        <ControlGroup label="Trade Filters" bodyClassName="nowrap">
          <Segmented value={rarity} options={RARITIES} onChange={setRarity} />
          <label className="inline-num">
            Uses ≥
            <input
              type="number"
              min={0}
              value={minUses}
              onChange={(event) => setMinUses(Math.max(0, Math.floor(Number(event.target.value) || 0)))}
            />
          </label>
        </ControlGroup>
      </div>

      <div className="opt-bar">
        <h3>Modifiers</h3>
        <Segmented
          value={addMode ? "include" : "exclude"}
          options={MODES}
          onChange={(mode) => setAddMode(mode === "include")}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search modifiers"
          className="opt-search"
        />
        <button
          type="button"
          className="btn"
          disabled={!included.length && !excluded.length && !includeTypePattern}
          onClick={clear}
        >
          Clear
        </button>
      </div>

      <ModPickArea
        addMode={addMode}
        prefixMods={prefixFiltered}
        suffixMods={suffixFiltered}
        tabletFilter={tabletFilter}
        included={included}
        excluded={excluded}
        onPickMod={pickMod}
      />
    </section>
  );
}
