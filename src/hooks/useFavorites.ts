import { useState, useEffect, useCallback } from "react";
import type { FavoriteStop, FavoriteLine } from "../types";

const STOPS_KEY = "tmb_fav_stops";
const LINES_KEY = "tmb_fav_lines";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export function useFavorites() {
  const [favStops, setFavStops] = useState<FavoriteStop[]>(() =>
    loadFromStorage<FavoriteStop[]>(STOPS_KEY, [])
  );
  const [favLines, setFavLines] = useState<FavoriteLine[]>(() =>
    loadFromStorage<FavoriteLine[]>(LINES_KEY, [])
  );

  useEffect(() => {
    saveToStorage(STOPS_KEY, favStops);
  }, [favStops]);

  useEffect(() => {
    saveToStorage(LINES_KEY, favLines);
  }, [favLines]);

  const addStop = useCallback(
    (stop: Omit<FavoriteStop, "addedAt">) => {
      setFavStops((prev) => {
        if (prev.some((s) => s.codi_parada === stop.codi_parada)) return prev;
        return [...prev, { ...stop, addedAt: Date.now() }];
      });
    },
    []
  );

  const removeStop = useCallback((codi_parada: string) => {
    setFavStops((prev) =>
      prev.filter((s) => s.codi_parada !== codi_parada)
    );
  }, []);

  const isStopFav = useCallback(
    (codi_parada: string) =>
      favStops.some((s) => s.codi_parada === codi_parada),
    [favStops]
  );

  const addLine = useCallback(
    (line: Omit<FavoriteLine, "addedAt">) => {
      setFavLines((prev) => {
        if (prev.some((l) => l.codi_linia === line.codi_linia)) return prev;
        return [...prev, { ...line, addedAt: Date.now() }];
      });
    },
    []
  );

  const removeLine = useCallback((codi_linia: string) => {
    setFavLines((prev) =>
      prev.filter((l) => l.codi_linia !== codi_linia)
    );
  }, []);

  const isLineFav = useCallback(
    (codi_linia: string) =>
      favLines.some((l) => l.codi_linia === codi_linia),
    [favLines]
  );

  return {
    favStops,
    favLines,
    addStop,
    removeStop,
    isStopFav,
    addLine,
    removeLine,
    isLineFav,
  };
}
