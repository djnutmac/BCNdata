import { useState, useEffect, useCallback, useMemo } from "react";
import type { TMBLine, TMBTransitResponse } from "../types";
import { getTransitLines, getLineStops } from "../services/tmbApi";

interface LinesTabProps {
  isLineFav: (code: string) => boolean;
  onToggleLineFav: (line: TMBLine) => void;
  onNavigateToStop: (code: string) => void;
  preselectedLine?: string | null;
  onPreselectedHandled?: () => void;
}

export default function LinesTab({
  isLineFav,
  onToggleLineFav,
  onNavigateToStop,
  preselectedLine,
  onPreselectedHandled,
}: LinesTabProps) {
  const [lines, setLines] = useState<TMBLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLine, setSelectedLine] = useState<TMBLine | null>(null);
  const [lineStops, setLineStops] = useState<{
    anada: TMBTransitResponse | null;
    tornada: TMBTransitResponse | null;
  }>({ anada: null, tornada: null });
  const [loadingStops, setLoadingStops] = useState(false);

  const loadLines = useCallback(async () => {
    try {
      const data = await getTransitLines();
      setLines(data);
      setLoading(false);
    } catch {
      setError("No s'han pogut carregar les línies");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLines();
  }, [loadLines]);

  const handleSelectLine = useCallback(async (line: TMBLine) => {
    setSelectedLine(line);
    setLoadingStops(true);
    try {
      const [anada, tornada] = await Promise.all([
        getLineStops(line.codi_linia, 1),
        getLineStops(line.codi_linia, 2),
      ]);
      setLineStops({ anada, tornada });
    } catch {
      try {
        const anada = await getLineStops(line.codi_linia, 1);
        setLineStops({ anada, tornada: null });
      } catch {
        try {
          const tornada = await getLineStops(line.codi_linia, 2);
          setLineStops({ anada: null, tornada });
        } catch {
          setLineStops({ anada: null, tornada: null });
        }
      }
    } finally {
      setLoadingStops(false);
    }
  }, []);

  // Handle preselected line from favorites
  useEffect(() => {
    if (preselectedLine && lines.length > 0) {
      const line = lines.find((l) => l.codi_linia === preselectedLine);
      if (line) {
        handleSelectLine(line);
      }
      onPreselectedHandled?.();
    }
  }, [preselectedLine, lines, onPreselectedHandled, handleSelectLine]);

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return lines;
    const q = searchQuery.toLowerCase().trim();
    return lines.filter(
      (l) =>
        l.codi_linia.toLowerCase().includes(q) ||
        l.nom_linia.toLowerCase().includes(q)
    );
  }, [lines, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="animate-spin h-10 w-10 border-3 border-red-200 border-t-[#E60000] rounded-full" />
        <p className="text-sm text-gray-500 font-medium">
          CARREGANT LÍNIES...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={loadLines}
          className="px-4 py-2 bg-[#E60000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#E60000] px-4 py-6 shrink-0">
        <h2 className="text-white font-bold text-lg uppercase tracking-wide mb-4">
          Línies d'Autobús
        </h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filtrar línies (ex: H12, V19, D40...)"
          className="w-full px-4 py-3 rounded-xl text-gray-900 font-medium text-sm placeholder-gray-400 border-0 outline-none focus:ring-2 focus:ring-white/50 transition-all"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedLine ? (
          /* List of lines */
          <div className="p-3">
            {filteredLines.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">
                No s'han trobat línies
              </p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredLines.map((line) => (
                <button
                  key={line.codi_linia}
                  onClick={() => handleSelectLine(line)}
                  className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-[#E60000] hover:shadow-sm transition-all group"
                >
                  <span className="inline-block bg-[#E60000] text-white font-bold px-2.5 py-1 rounded-lg text-sm group-hover:scale-105 transition-transform">
                    {line.nom_linia || line.codi_linia}
                  </span>
                  {isLineFav(line.codi_linia) && (
                    <span className="block text-xs mt-1 text-red-400">♥</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Line details with directions */
          <div>
            {/* Back + Line header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
              <button
                onClick={() => {
                  setSelectedLine(null);
                  setLineStops({ anada: null, tornada: null });
                }}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ←
              </button>
              <div className="flex-1 flex items-center gap-3">
                <span className="bg-[#E60000] text-white font-bold px-3 py-1.5 rounded-lg text-sm">
                  {selectedLine.nom_linia || selectedLine.codi_linia}
                </span>
                <span className="text-sm text-gray-600 font-medium truncate">
                  {selectedLine.nom_linia !== selectedLine.codi_linia
                    ? selectedLine.codi_linia
                    : ""}
                </span>
              </div>
              <button
                onClick={() =>
                  onToggleLineFav({
                    codi_linia: selectedLine.codi_linia,
                    nom_linia: selectedLine.nom_linia,
                  })
                }
                className={`text-xl px-2 ${
                  isLineFav(selectedLine.codi_linia)
                    ? "text-red-500"
                    : "text-gray-300 hover:text-red-400"
                }`}
              >
                {isLineFav(selectedLine.codi_linia) ? "♥" : "♡"}
              </button>
            </div>

            {loadingStops ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-3 border-red-200 border-t-[#E60000] rounded-full" />
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Direction 1: Anada */}
                {lineStops.anada && (
                  <DirectionStops
                    direction="ANADA"
                    data={lineStops.anada}
                    color="bg-blue-600"
                    onNavigateToStop={onNavigateToStop}
                  />
                )}
                {/* Direction 2: Tornada */}
                {lineStops.tornada && (
                  <DirectionStops
                    direction="TORNADA"
                    data={lineStops.tornada}
                    color="bg-green-600"
                    onNavigateToStop={onNavigateToStop}
                  />
                )}
                {!lineStops.anada && !lineStops.tornada && (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No s'han trobat parades per aquesta línia
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DirectionStops({
  direction,
  data,
  color,
  onNavigateToStop,
}: {
  direction: string;
  data: TMBTransitResponse;
  color: string;
  onNavigateToStop: (code: string) => void;
}) {
  const stops = data.features || [];

  // Try to get the destination name from the last stop
  const lastStop = stops[stops.length - 1];
  const destiName =
    lastStop?.properties?.NOM_DESTI ||
    lastStop?.properties?.NOM_PARADA ||
    "Final de línia";

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className={`${color} text-white px-4 py-3`}>
        <p className="font-bold text-sm uppercase tracking-wide">{direction}</p>
        <p className="text-xs opacity-90 mt-0.5 truncate">
          → {destiName}
        </p>
        <p className="text-xs opacity-70 mt-0.5">
          {stops.length} parades
        </p>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {stops.map((feature, idx) => {
          const code = feature.properties.CODI_PARADA || "";
          const name = feature.properties.NOM_PARADA || "";
          return (
            <button
              key={`${code}-${idx}`}
              onClick={() => onNavigateToStop(code)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <span className="text-xs text-gray-300 font-mono w-6">
                {idx + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                {name}
              </span>
              <span className="text-xs text-gray-400 font-mono shrink-0">
                {code}
              </span>
              <span className="text-gray-300 text-xs">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
