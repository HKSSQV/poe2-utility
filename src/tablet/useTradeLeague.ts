import { useEffect, useState } from "react";
import { getLeagues } from "../api";

const STORAGE_LEAGUE = "poe2-exchange.league";
const FALLBACK = "Forbidden Rites";

/** League to use for trade search links — selected league from the exchange page, or current main league as fallback. */
export function useTradeLeague(): string {
  const [league, setLeague] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_LEAGUE) || FALLBACK;
    } catch {
      return FALLBACK;
    }
  });

  useEffect(() => {
    let alive = true;
    getLeagues()
      .then(({ data }) => {
        if (!alive) return;
        if (data.some((item) => item.name === league)) return;
        const main = data.find((item) => !/hardcore|^hc |ruthless|standard/i.test(item.name));
        if (main) setLeague(main.name);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
    // Check only once on mount.
  }, []);

  return league;
}
