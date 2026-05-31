import type { FavoriteStop, FavoriteLine } from "../types";

interface FavoritesTabProps {
  favStops: FavoriteStop[];
  favLines: FavoriteLine[];
  onRemoveStop: (code: string) => void;
  onRemoveLine: (code: string) => void;
  onNavigateToStop: (code: string) => void;
  onSelectLine: (code: string) => void;
}

export default function FavoritesTab({
  favStops,
  favLines,
  onRemoveStop,
  onRemoveLine,
  onNavigateToStop,
  onSelectLine,
}: FavoritesTabProps) {
  const hasStops = favStops.length > 0;
  const hasLines = favLines.length > 0;
  const isEmpty = !hasStops && !hasLines;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#E60000] px-4 py-6 shrink-0">
        <h2 className="text-white font-bold text-lg uppercase tracking-wide">
          Preferits ♥
        </h2>
        <p className="text-red-100 text-xs mt-1">
          {favStops.length + favLines.length} elements guardats
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="text-5xl mb-3">⭐</span>
            <p className="text-sm font-medium text-center">
              No tens preferits guardats
            </p>
            <p className="text-xs text-gray-300 mt-1 text-center">
              Afegeix parades o línies des del mapa
              <br />o la pestanya de línies
            </p>
          </div>
        )}

        {/* Favorite Stops */}
        {hasStops && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#E60000] rounded-full inline-block" />
              PARADES ({favStops.length})
            </h3>
            <div className="space-y-2">
              {favStops.map((stop) => (
                <div
                  key={stop.codi_parada}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-red-200 transition-colors"
                >
                  <span className="text-xl">🚏</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {stop.nom_parada}
                    </p>
                    <p className="text-xs text-gray-400">
                      PARADA {stop.codi_parada}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToStop(stop.codi_parada)}
                    className="shrink-0 px-3 py-1.5 bg-red-50 text-[#E60000] rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    MAPA
                  </button>
                  <button
                    onClick={() => onRemoveStop(stop.codi_parada)}
                    className="shrink-0 text-gray-300 hover:text-red-500 text-lg px-1 transition-colors"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Lines */}
        {hasLines && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#E60000] rounded-full inline-block" />
              LÍNIES ({favLines.length})
            </h3>
            <div className="space-y-2">
              {favLines.map((line) => (
                <div
                  key={line.codi_linia}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-red-200 transition-colors"
                >
                  <span className="bg-[#E60000] text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">
                    {line.nom_linia}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">
                      Línia {line.codi_linia}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectLine(line.codi_linia)}
                    className="shrink-0 px-3 py-1.5 bg-red-50 text-[#E60000] rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    INFO
                  </button>
                  <button
                    onClick={() => onRemoveLine(line.codi_linia)}
                    className="shrink-0 text-gray-300 hover:text-red-500 text-lg px-1 transition-colors"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
