import { useEffect, useMemo, useState } from "react";
import { findRow, getLeagues, getMarket } from "./api";
import { CurrencyIcon } from "./CurrencyIcon";
import { CurrencyPicker } from "./CurrencyPicker";
import { formatRate, formatVolume, timeAgo } from "./format";
import { CATEGORIES, type CategoryId, type League, type MarketRow } from "./types";

const STORAGE_LEAGUE = "poe2-exchange.league";
const STORAGE_HAVE = "poe2-exchange.have";
const STORAGE_WANT = "poe2-exchange.want";
const STORAGE_WATCH = "poe2-exchange.watch";
const STORAGE_CATS = "poe2-exchange.categories";
const ALL_CATEGORY_IDS = CATEGORIES.map((item) => item.id);
const REFRESH_MS = 5 * 60 * 1000;

function readWatch(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_WATCH) ?? "[]") as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCategories(): CategoryId[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_CATS) ?? "null") as CategoryId[] | null;
    if (!Array.isArray(parsed)) return [...ALL_CATEGORY_IDS];
    const kept = parsed.filter((id) => ALL_CATEGORY_IDS.includes(id));
    return kept.length ? kept : [...ALL_CATEGORY_IDS];
  } catch {
    return [...ALL_CATEGORY_IDS];
  }
}

function Spark({ data, change }: { data: number[]; change: number }) {
  if (!data.length) return <span className="muted">—</span>;
  const width = 72;
  const height = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const tone = change >= 0 ? "up" : "down";
  return (
    <span className={`spark ${tone}`}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
        <polyline fill="none" stroke="currentColor" strokeWidth="1.6" points={points} />
      </svg>
      <span>
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </span>
  );
}

export default function App() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [league, setLeague] = useState(() => localStorage.getItem(STORAGE_LEAGUE) ?? "");
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterId, setFilterId] = useState("");
  const [enabledCats, setEnabledCats] = useState<CategoryId[]>(readCategories);
  const [haveId, setHaveId] = useState(() => localStorage.getItem(STORAGE_HAVE) ?? "divine");
  const [wantId, setWantId] = useState(() => localStorage.getItem(STORAGE_WANT) ?? "exalted");
  const [amount, setAmount] = useState("1");
  const [now, setNow] = useState(Date.now());
  const [refreshToken, setRefreshToken] = useState(0);
  const [sortKey, setSortKey] = useState<"divineValue" | "volumeDivine" | "name">("divineValue");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [watchIds, setWatchIds] = useState<string[]>(readWatch);
  const [watchOnly, setWatchOnly] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getLeagues()
      .then((result) => {
        if (cancelled) return;
        setLeagues(result.data);
        setLeague((current) => current || result.data[0]?.id || "");
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load league list.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!league) return;
    localStorage.setItem(STORAGE_LEAGUE, league);
    let cancelled = false;

    const load = async (force = false) => {
      setLoading(true);
      setError("");
      try {
        const market = await getMarket(league, force);
        if (cancelled) return;
        setRows(market.rows);
        setFetchedAt(market.fetchedAt);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load market prices.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load(refreshToken > 0);
    const timer = window.setInterval(() => void load(true), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [league, refreshToken]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HAVE, haveId);
    localStorage.setItem(STORAGE_WANT, wantId);
  }, [haveId, wantId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_WATCH, JSON.stringify(watchIds));
  }, [watchIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CATS, JSON.stringify(enabledCats));
  }, [enabledCats]);

  const have = findRow(rows, haveId);
  const want = findRow(rows, wantId);
  const divine = findRow(rows, "divine");
  const exalted = findRow(rows, "exalted");
  const chaos = findRow(rows, "chaos");

  const amountNumber = Number(amount.replace(/,/g, ""));
  const converted =
    have && want && Number.isFinite(amountNumber)
      ? (amountNumber * have.divineValue) / want.divineValue
      : null;

  const filtered = useMemo(() => {
    const watched = new Set(watchIds);
    return rows
      .filter((row) => enabledCats.includes(row.categoryId))
      .filter((row) => !watchOnly || watched.has(`${row.categoryId}:${row.id}`))
      .filter((row) => !filterId || row.id === filterId)
      .sort((a, b) => {
        const direction = sortDir === "asc" ? 1 : -1;
        if (sortKey === "name") return a.name.localeCompare(b.name, "en") * direction;
        return (a[sortKey] - b[sortKey]) * direction;
      });
  }, [rows, filterId, enabledCats, sortKey, sortDir, watchIds, watchOnly]);

  const currencyOptions = useMemo(() => {
    const unique = new Map<string, MarketRow>();
    for (const row of rows) {
      if (!unique.has(row.id)) unique.set(row.id, row);
    }
    return [...unique.values()].sort((a, b) => b.divineValue - a.divineValue);
  }, [rows]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  };

  const allCatsOn = enabledCats.length === ALL_CATEGORY_IDS.length;

  const toggleCategory = (id: CategoryId) => {
    setEnabledCats((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleWatch = (row: MarketRow) => {
    const key = `${row.categoryId}:${row.id}`;
    setWatchIds((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const quoteValue = (row: MarketRow, quote?: MarketRow) =>
    quote ? row.divineValue / quote.divineValue : null;

  const sortMark = (key: typeof sortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
  };

  const emptyMessage =
    enabledCats.length === 0
      ? "Please select at least one category."
      : watchOnly
        ? "No currencies selected. Check items to watch them, then click here again to return to the full list."
        : "No results found.";

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Path of Exile 2 · Live Rates</p>
          <h1>Real-Time Currency Exchange</h1>
          <p className="lede">
            Compare all currency values against Exalted, Chaos, and Divine Orbs in one place. Market data is fetched from poe.ninja with a 5-minute cache.
          </p>
        </div>
        <div className="toolbar">
          <label>
            League
            <select value={league} onChange={(event) => setLeague(event.target.value)}>
              {leagues.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="ghost" onClick={() => setRefreshToken((value) => value + 1)}>
            {loading ? "Loading…" : `Refresh · ${fetchedAt ? timeAgo(fetchedAt) : "Ready"}`}
          </button>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <section className="calculator">
        <div className="calc-head">
          <h2>Exchange Calculator</h2>
          <p>Select what you have and what you want to calculate exchange rates instantly.</p>
        </div>
        <div className="calc-grid">
          <CurrencyPicker label="You Have" value={haveId} options={currencyOptions} onChange={setHaveId} />
          <label>
            Amount
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="swap"
            onClick={() => {
              setHaveId(wantId);
              setWantId(haveId);
            }}
          >
            ⇄
          </button>
          <CurrencyPicker label="You Want" value={wantId} options={currencyOptions} onChange={setWantId} />
          <div className="calc-result">
            <span>Estimated Receive</span>
            <div className="calc-result-card">
              <CurrencyIcon row={want} size={28} />
              <div>
                <strong>{converted == null ? "—" : formatRate(converted)}</strong>
                <small>{want?.name ?? "Select currency"}</small>
              </div>
            </div>
          </div>
        </div>
        {have && want && (
          <p className="calc-note">
            Current Rate: {have.name} : {want.name} = 1 : {formatRate(have.divineValue / want.divineValue)}
            {" · "}
            Inverse: 1 : {formatRate(want.divineValue / have.divineValue)}
          </p>
        )}
      </section>

      <section className="table-wrap">
        <div className="table-head">
          <div>
            <h2>Market Prices</h2>
            <p>
              Values converted to Exalted, Chaos, and Divine Orbs. {now && fetchedAt ? `Updated ${timeAgo(fetchedAt)}` : ""}
              {` · ${filtered.length} items`}
            </p>
          </div>
          <div className="filters">
            <CurrencyPicker
              label="Search Currency"
              value={filterId}
              options={currencyOptions}
              onChange={setFilterId}
              placeholder="All Currencies"
              allowClear
              clearLabel="All Currencies"
            />
            <select
              value={`${sortKey}:${sortDir}`}
              onChange={(event) => {
                const [key, dir] = event.target.value.split(":") as [typeof sortKey, typeof sortDir];
                setSortKey(key);
                setSortDir(dir);
              }}
            >
              <option value="divineValue:desc">Highest Value</option>
              <option value="divineValue:asc">Lowest Value</option>
              <option value="name:asc">Name</option>
              <option value="volumeDivine:desc">Highest Volume</option>
            </select>
            <button
              type="button"
              className={`ghost ${watchOnly ? "active" : ""}`}
              onClick={() => setWatchOnly((current) => !current)}
            >
              {watchOnly ? `Watching (${watchIds.length})` : "Watchlist"}
            </button>
          </div>
        </div>

        <div className="cat-filters">
          <label>
            <input
              type="checkbox"
              checked={allCatsOn}
              onChange={() => setEnabledCats(allCatsOn ? [] : [...ALL_CATEGORY_IDS])}
            />
            All
          </label>
          {CATEGORIES.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                checked={enabledCats.includes(item.id)}
                onChange={() => toggleCategory(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="check-col" />
                <th>
                  <button type="button" onClick={() => toggleSort("name")}>
                    Currency{sortMark("name")}
                  </button>
                </th>
                <th>Category</th>
                <th>
                  <button type="button" onClick={() => toggleSort("divineValue")}>
                    <span className="quote-head">
                      <CurrencyIcon row={exalted} size={18} />
                      Exalted{sortMark("divineValue")}
                    </span>
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort("divineValue")}>
                    <span className="quote-head">
                      <CurrencyIcon row={chaos} size={18} />
                      Chaos
                    </span>
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort("divineValue")}>
                    <span className="quote-head">
                      <CurrencyIcon row={divine} size={18} />
                      Divine
                    </span>
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort("volumeDivine")}>
                    Volume{sortMark("volumeDivine")}
                  </button>
                </th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const key = `${row.categoryId}:${row.id}`;
                const watched = watchIds.includes(key);
                return (
                  <tr
                    key={key}
                    className={row.id === haveId || row.id === wantId || watched ? "picked" : ""}
                    onClick={() => {
                      if (haveId === row.id) return;
                      setWantId(row.id);
                    }}
                  >
                    <td className="check-col">
                      <input
                        type="checkbox"
                        checked={watched}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleWatch(row)}
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                    <td>
                      <div className="name-cell">
                        <CurrencyIcon row={row} size={28} />
                        <div>
                          <strong>{row.name}</strong>
                          <span>{row.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{CATEGORIES.find((item) => item.id === row.categoryId)?.label ?? row.category}</td>
                    <td className="num-cell">{formatRate(quoteValue(row, exalted) ?? Number.NaN)}</td>
                    <td className="num-cell">{formatRate(quoteValue(row, chaos) ?? Number.NaN)}</td>
                    <td className="num-cell">{formatRate(quoteValue(row, divine) ?? Number.NaN)}</td>
                    <td>{formatVolume(row.volumeDivine)}</td>
                    <td>
                      <Spark data={row.sparkline.data} change={row.sparkline.totalChange} />
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
