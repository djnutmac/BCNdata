import { useState } from "react";
import { searchStopByCode } from "../services/tmbApi";

interface SearchTabProps {
  onNavigateToStop: (stopCode: string) => void;
}

export default function SearchTab({ onNavigateToStop }: SearchTabProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchStopByCode(trimmed);
      if (data && data.parades && data.parades.length > 0) {
        setResult({
          code: data.parades[0].codi_parada,
          name: data.parades[0].nom_parada,
        });
      } else {
        setError("Parada no trobada");
      }
    } catch {
      setError("Error en la cerca. Comprova el número de parada.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="bg-[#E60000] px-4 py-6 shrink-0">
        <h2 className="text-white font-bold text-lg uppercase tracking-wide mb-4">
          Cercar Parada
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Núm. de parada (ex: 2775)"
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 font-medium text-sm placeholder-gray-400 border-0 outline-none focus:ring-2 focus:ring-white/50 transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-white text-[#E60000] font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase"
          >
            {loading ? "..." : "Cercar"}
          </button>
        </div>
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
            <p className="mt-1 text-red-500">
              Introdueix un número de parada vàlid (ex: 108, 2775, 3258)
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚏</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight">
                  {result.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  PARADA {result.code}
                </p>
                <button
                  onClick={() => onNavigateToStop(result.code)}
                  className="mt-3 w-full bg-[#E60000] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors uppercase tracking-wide"
                >
                  Veure al Mapa
                </button>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm font-medium text-center">
              Introdueix el número de parada
              <br />
              per veure la informació en temps real
            </p>
            <div className="mt-6 text-xs text-gray-300 space-y-1 text-center">
              <p>Exemples:</p>
              <p className="font-mono bg-gray-50 px-2 py-0.5 rounded">108 - Pl. Espanya</p>
              <p className="font-mono bg-gray-50 px-2 py-0.5 rounded">2775 - Pg. de Gràcia</p>
              <p className="font-mono bg-gray-50 px-2 py-0.5 rounded">3258 - Av. Diagonal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
