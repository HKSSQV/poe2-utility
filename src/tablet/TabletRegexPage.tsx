import { TabletRegexBuilder } from "./TabletRegexBuilder";

export function TabletRegexPage() {
  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Path of Exile 2 · Stash Search · Trade</p>
          <h1>Tablets</h1>
        </div>
      </header>

      <TabletRegexBuilder />
    </div>
  );
}
