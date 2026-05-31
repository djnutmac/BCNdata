import { useState, useEffect } from "react";
import type { TMBStopForecast } from "../types";
import { getStopForecast, getMinutesUntil, getDirectionLabel } from "../services/tmbApi";

interface StopInfoPanelProps {
  stopCode: string;
  stopName: string;
  lat: number;
  lon: number;
  isFav: boolean;
  onToggleFav: () => void;
  onClose: () => void;
  onNavigateToStop?: (code: string) => void;
}

export default function StopInfoPanel({
  stopCode,
  stopName,
  isFav,
  onToggleFav,
  onClose,
}: StopInfoPanelProps) {
  const [forecast, setForecast] = useState<TMBStopForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStopForecast(stopCode);
      setForecast(data);
      setLastUpdate(new Date());
    } catch (e) {
      setError("No s'ha pogut carregar la informació");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
    const interval = setInterval(loadForecast, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [stopCode]);

  const parade = forecast?.parades?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="pointer-events-auto w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-[#E60000] text-white px-5 py-4 flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold leading-tight uppercase tracking-wide truncate">
              {stopName}
            </h2>
            <p className="text-sm text-red-100 mt-0.5 font-medium">
              PARADA {stopCode}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={onToggleFav}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title={isFav ? "Eliminar de preferits" : "Afegir a preferits"}
            >
              {isFav ? "♥" : "♡"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading && !forecast && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-3 border-red-200 border-t-[#E60000] rounded-full" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              <p className="font-semibold">{error}</p>
              <button
                onClick={loadForecast}
                className="mt-2 text-red-600 underline font-medium"
              >
                Reintentar
              </button>
            </div>
          )}

          {parade && !loading && (
            <div className="space-y-4">
              {lastUpdate && (
                <p className="text-xs text-gray-400 text-right">
                  Actualitzat: {lastUpdate.toLocaleTimeString("ca-ES")}
                </p>
              )}

              {parade.linies_trajectes.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-4xl mb-2">🚌</p>
                  <p className="font-medium">No hi ha busos en aquest moment</p>
                </div>
              )}

              {parade.linies_trajectes.map((lt, idx) => (
                <div
                  key={`${lt.codi_linia}-${lt.id_sentit}-${idx}`}
                  className="border border-gray-200 rounded-xl p-4 hover:border-red-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="inline-block bg-[#E60000] text-white font-bold px-3 py-1 rounded-lg text-sm">
                        {lt.nom_linia || lt.codi_linia}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
                        {getDirectionLabel(lt.id_sentit)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium truncate max-w-[180px]">
                        → {lt.desti_trajecte || "—"}
                      </p>
                    </div>
                  </div>

                  {lt.propers_busos.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                      Sense previsió disponible
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {lt.propers_busos.slice(0, 4).map((bus, i) => {
                        const mins = getMinutesUntil(bus.temps_arribada);
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                              mins <= 2
                                ? "bg-red-100 text-red-700"
                                : mins <= 7
                                ? "bg-orange-50 text-orange-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            <span className="text-lg">
                              {mins <= 2 ? "🔴" : mins <= 7 ? "🟡" : "🟢"}
                            </span>
                            <span>
                              {mins === 0
                                ? "ARRIBANT"
                                : `${mins} min`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={loadForecast}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                🔄 Actualitzar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
