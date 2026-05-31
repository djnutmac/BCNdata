import { useState } from "react";
import { getItineraries } from "../services/tmbApi";
import type { TMBPlannerItinerary,
  TMBPlannerLeg,
} from "../types";

// Barcelona default locations
const DEFAULT_FROM = "41.3874,2.1686"; // Plaça Catalunya

export default function RouteTab() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itineraries, setItineraries] = useState<TMBPlannerItinerary[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Geolocation helper
  const useCurrentLocation = async (
    setter: (val: string) => void
  ) => {
    if (!navigator.geolocation) {
      setError("La geolocalització no està disponible");
      return;
    }
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        });
      });
      setter(`${pos.coords.latitude},${pos.coords.longitude}`);
    } catch {
      setError("No s'ha pogut obtenir la ubicació");
    }
  };

  const handleSearch = async () => {
    const fromTrimmed = from.trim() || DEFAULT_FROM;
    const toTrimmed = to.trim();
    if (!toTrimmed) {
      setError("Introdueix una destinació");
      return;
    }

    setLoading(true);
    setError(null);
    setItineraries([]);
    setExpandedIdx(null);

    try {
      let [fromLat, fromLon] = fromTrimmed.split(",").map(Number);
      let [toLat, toLon] = toTrimmed.split(",").map(Number);

      if (isNaN(fromLat) || isNaN(fromLon)) {
        // Try geocoding via a simple approach: assume it's coordinates
        setError(
          "Format d'origen incorrecte. Usa coordenades 'lat,lon' o la ubicació actual"
        );
        setLoading(false);
        return;
      }

      if (isNaN(toLat) || isNaN(toLon)) {
        setError(
          "Format de destinació incorrecte. Usa coordenades 'lat,lon'"
        );
        setLoading(false);
        return;
      }

      const data = await getItineraries(fromLat, fromLon, toLat, toLon);
      setItineraries(data?.plan?.itineraries || []);
    } catch {
      setError(
        "No s'ha pogut calcular la ruta. Comprova les coordenades."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.round(seconds / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}min`;
    }
    return `${mins} min`;
  };

  const getModeIcon = (mode: string): string => {
    switch (mode.toUpperCase()) {
      case "WALK":
        return "🚶";
      case "BUS":
        return "🚌";
      case "SUBWAY":
        return "🚇";
      case "TRAM":
        return "🚊";
      default:
        return "🚶";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#E60000] px-4 py-6 shrink-0">
        <h2 className="text-white font-bold text-lg uppercase tracking-wide mb-4">
          Planificar Ruta
        </h2>
        <div className="space-y-2">
          {/* From */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                🟢
              </span>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Origen: lat,lon"
                className="w-full pl-9 pr-20 py-3 rounded-xl text-gray-900 font-medium text-sm placeholder-gray-400 border-0 outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button
                onClick={() => useCurrentLocation(setFrom)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-gray-200 transition-colors uppercase"
                title="Usar ubicació actual"
              >
                GPS
              </button>
            </div>
          </div>
          {/* To */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                🔴
              </span>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destí: lat,lon"
                className="w-full pl-9 pr-4 py-3 rounded-xl text-gray-900 font-medium text-sm placeholder-gray-400 border-0 outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !to.trim()}
              className="px-5 py-3 bg-white text-[#E60000] font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase"
            >
              {loading ? "..." : "Ruta"}
            </button>
          </div>
        </div>
        <p className="text-red-100 text-[10px] mt-2 text-center">
          Format: latitud,longitud (ex: 41.3874,2.1686)
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-3 border-red-200 border-t-[#E60000] rounded-full" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && itineraries.length === 0 && to.trim() === "" && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <span className="text-5xl mb-3">🗺️</span>
            <p className="text-sm font-medium text-center">
              Introdueix les coordenades d'origen i destí
              <br />
              per planificar la teva ruta
            </p>
            <div className="mt-6 text-xs text-gray-300 space-y-1 text-center">
              <p>Coordenades d'exemple:</p>
              <p className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                Pl. Catalunya: 41.3874,2.1686
              </p>
              <p className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                Sagrada Família: 41.4036,2.1744
              </p>
              <p className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                Barceloneta: 41.3782,2.1895
              </p>
            </div>
          </div>
        )}

        {!loading && !error && itineraries.length === 0 && to.trim() !== "" && (
          <div className="text-center py-8 text-gray-400">
            <p>No s'han trobat rutes</p>
          </div>
        )}

        {itineraries.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-3 font-medium">
              {itineraries.length} RUTES TROBADES
            </p>
            <div className="space-y-3">
              {itineraries.slice(0, 5).map((itin, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-red-200 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedIdx(expandedIdx === idx ? null : idx)
                    }
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">
                          OPCIÓ {idx + 1}
                        </span>
                        <span className="bg-[#E60000] text-white font-bold px-2 py-0.5 rounded text-xs">
                          {formatDuration(itin.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {itin.legs.slice(0, 3).map((leg, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span>{getModeIcon(leg.mode)}</span>
                            {i < Math.min(itin.legs.length, 3) - 1 && (
                              <span className="text-gray-300">→</span>
                            )}
                          </span>
                        ))}
                        {itin.legs.length > 3 && (
                          <span className="text-gray-300">+{itin.legs.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-gray-400 transition-transform text-lg ${
                        expandedIdx === idx ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>

                  {expandedIdx === idx && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                      {itin.legs.map((leg, legIdx) => (
                        <LegDetail key={legIdx} leg={leg} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegDetail({ leg }: { leg: TMBPlannerLeg }) {
  const modeIcon = (() => {
    switch (leg.mode?.toUpperCase()) {
      case "WALK":
        return "🚶";
      case "BUS":
        return "🚌";
      case "SUBWAY":
        return "🚇";
      case "TRAM":
        return "🚊";
      default:
        return "🚶";
    }
  })();

  const modeName = (() => {
    switch (leg.mode?.toUpperCase()) {
      case "WALK":
        return "A PEU";
      case "BUS":
        return "AUTOBÚS";
      case "SUBWAY":
        return "METRO";
      case "TRAM":
        return "TRAMVIA";
      default:
        return leg.mode || "?";
    }
  })();

  const duration = Math.round((leg.duration || 0) / 60);
  const distance = leg.distance || 0;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="text-xl">{modeIcon}</span>
        <div className="w-0.5 flex-1 bg-gray-200 min-h-[20px]" />
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-xs uppercase text-gray-700">
            {modeName}
          </span>
          {leg.routeShortName && (
            <span className="bg-[#E60000] text-white font-bold px-2 py-0.5 rounded text-[10px]">
              {leg.routeShortName}
            </span>
          )}
          {leg.headsign && (
            <span className="text-[10px] text-gray-400 truncate">
              → {leg.headsign}
            </span>
          )}
        </div>
        <div className="flex gap-3 text-[11px] text-gray-500">
          <span>{duration} min</span>
          {distance > 0 && <span>{formatDist(distance)}</span>}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          <span className="truncate block">
            {leg.from?.name || "Inici"} → {leg.to?.name || "Fi"}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDist(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
