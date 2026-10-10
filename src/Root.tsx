import { useEffect, useState } from "react";
import App from "./App";
import { TabletRegexPage } from "./tablet/TabletRegexPage";
import { GuidePage, type GuideTab } from "./guide/GuidePage";
import { WaystonePage } from "./waystone/WaystonePage";

type Page = "exchange" | "tablet" | "waystone" | "guide-ring" | "guide-jewel";

const HASH: Record<Page, string> = {
  exchange: "",
  tablet: "#tablet",
  waystone: "#waystone",
  "guide-ring": "#guide",
  "guide-jewel": "#guide-jewel",
};

const TITLES: Record<Page, string> = {
  exchange: "POE2 Currency Exchange",
  tablet: "POE2 Tablets",
  waystone: "POE2 Waystones",
  "guide-ring": "POE2 Crafting Guide · Full MF Ring",
  "guide-jewel": "POE2 Crafting Guide · 5-Mod Jewel",
};

const NAV: { title?: string; items: { page: Page; label: string }[] }[] = [
  {
    items: [
      { page: "exchange", label: "Currency" },
      { page: "tablet", label: "Tablets" },
      { page: "waystone", label: "Waystones" },
    ],
  },
  {
    title: "Crafting Guides",
    items: [
      { page: "guide-ring", label: "Full MF Ring" },
      { page: "guide-jewel", label: "5-Mod Jewel" },
    ],
  },
];

function readPage(): Page {
  const hash = window.location.hash;
  const found = (Object.keys(HASH) as Page[]).find((page) => HASH[page] && HASH[page] === hash);
  return found ?? "exchange";
}

export default function Root() {
  const [page, setPage] = useState<Page>(readPage);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setPage(readPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = TITLES[page];
  }, [page]);

  const go = (next: Page) => {
    const hash = HASH[next];
    if (hash) window.location.hash = hash;
    else history.replaceState(null, "", window.location.pathname + window.location.search);
    setPage(next);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const guideTab: GuideTab | null = page === "guide-ring" ? "ring" : page === "guide-jewel" ? "jewel" : null;

  return (
    <div className={`app-shell${menuOpen ? " menu-open" : ""}`}>
      <header className="app-topbar">
        <button type="button" className="app-menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <span />
          <span />
          <span />
        </button>
        <strong>POE2 Utilities</strong>
      </header>

      <aside className="app-sidebar" aria-label="Menu">
        <div className="app-brand">
          <strong>POE2 Utilities</strong>
          <span>Path of Exile 2 Toolkit</span>
        </div>
        <nav className="app-nav">
          {NAV.map((group, index) => (
            <div key={group.title ?? index} className="app-nav-group">
              {group.title && <p className="app-nav-title">{group.title}</p>}
              {group.items.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  className={page === item.page ? "active" : ""}
                  aria-current={page === item.page ? "page" : undefined}
                  onClick={() => go(item.page)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <button type="button" className="app-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />

      <main className="app-main">
        {page === "tablet" ? (
          <TabletRegexPage />
        ) : page === "waystone" ? (
          <WaystonePage />
        ) : guideTab ? (
          <GuidePage tab={guideTab} />
        ) : (
          <App />
        )}
      </main>
    </div>
  );
}
