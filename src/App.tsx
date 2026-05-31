import { useState, useCallback } from "react";
import MapTab from "./components/MapTab";
import SearchTab from "./components/SearchTab";
import LinesTab from "./components/LinesTab";
import FavoritesTab from "./components/FavoritesTab";
import RouteTab from "./components/RouteTab";
import { useFavorites } from "./hooks/useFavorites";
import type { TMBLine } from "./types";

type TabId = "map" | "search" | "lines" | "favorites" | "route";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "map", label: "MAPA", icon: "📍" },
  { id: "search", label: "CERCA", icon: "🔍" },
  { id: "lines", label: "LÍNIES", icon: "🚌" },
  { id: "favorites", label: "PREFERITS", icon: "⭐" },
  { id: "route", label: "RUTA", icon: "🗺️" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [highlightStopCode, setHighlightStopCode] = useState<string | null>(
    null
  );
  const [preselectedLine, setPreselectedLine] = useState<string | null>(null);
  const {
    favStops,
    favLines,
    addStop,
    removeStop,
    isStopFav,
    addLine,
    removeLine,
    isLineFav,
  } = useFavorites();

  const handleNavigateToStop = useCallback(
    (stopCode: string) => {
      setHighlightStopCode(stopCode);
      setActiveTab("map");
    },
    []
  );

  const handleHighlightHandled = useCallback(() => {
    setHighlightStopCode(null);
  }, []);

  const handleToggleFav = useCallback(
    (stop: {
      codi_parada: string;
      nom_parada: string;
      latitud: number;
      longitud: number;
    }) => {
      if (isStopFav(stop.codi_parada)) {
        removeStop(stop.codi_parada);
      } else {
        addStop(stop);
      }
    },
    [isStopFav, addStop, removeStop]
  );

  const handleToggleLineFav = useCallback(
    (line: TMBLine) => {
      if (isLineFav(line.codi_linia)) {
        removeLine(line.codi_linia);
      } else {
        addLine(line);
      }
    },
    [isLineFav, addLine, removeLine]
  );

  const handleSelectLine = useCallback(
    (code: string) => {
      setPreselectedLine(code);
      setActiveTab("lines");
    },
    []
  );

  return (
    <div className="h-dvh w-full flex flex-col bg-gray-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Map Tab (always mounted for performance) */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            activeTab === "map"
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <MapTab
            highlightStopCode={highlightStopCode}
            onHighlightHandled={handleHighlightHandled}
            isFav={isStopFav}
            onToggleFav={handleToggleFav}
          />
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="absolute inset-0 overflow-hidden bg-gray-50">
            <SearchTab onNavigateToStop={handleNavigateToStop} />
          </div>
        )}

        {/* Lines Tab */}
        {activeTab === "lines" && (
          <div className="absolute inset-0 overflow-hidden bg-gray-50">
            <LinesTab
              isLineFav={isLineFav}
              onToggleLineFav={handleToggleLineFav}
              onNavigateToStop={handleNavigateToStop}
              preselectedLine={preselectedLine}
              onPreselectedHandled={() => setPreselectedLine(null)}
            />
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="absolute inset-0 overflow-hidden bg-gray-50">
            <FavoritesTab
              favStops={favStops}
              favLines={favLines}
              onRemoveStop={removeStop}
              onRemoveLine={removeLine}
              onNavigateToStop={handleNavigateToStop}
              onSelectLine={handleSelectLine}
            />
          </div>
        )}

        {/* Route Tab */}
        {activeTab === "route" && (
          <div className="absolute inset-0 overflow-hidden bg-gray-50">
            <RouteTab />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 shrink-0 safe-area-bottom">
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                  isActive
                    ? "text-[#E60000]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="text-lg leading-none mb-0.5">
                  {tab.icon}
                </span>
                <span
                  className={`text-[9px] font-bold tracking-wider ${
                    isActive ? "" : ""
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-6 h-0.5 bg-[#E60000] rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
