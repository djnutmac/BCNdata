import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { TMBStop } from "../types";
import { getAllStops } from "../services/tmbApi";
import StopInfoPanel from "./StopInfoPanel";

// Fix default marker icons in Leaflet with bundlers
import "leaflet/dist/leaflet.css";

// @ts-expect-error Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapTabProps {
  highlightStopCode?: string | null;
  onHighlightHandled?: () => void;
  isFav: (code: string) => boolean;
  onToggleFav: (stop: { codi_parada: string; nom_parada: string; latitud: number; longitud: number }) => void;
}

// Component to handle map view changes
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  return null;
}

export default function MapTab({
  highlightStopCode,
  onHighlightHandled,
  isFav,
  onToggleFav,
}: MapTabProps) {
  const [stops, setStops] = useState<TMBStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<TMBStop | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.3874, 2.1686]); // Barcelona center
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef<L.Map | null>(null);

  const loadStops = useCallback(async () => {
    try {
      const data = await getAllStops();
      const allStops = data?.data?.ibus || [];
      setStops(allStops);
      setLoading(false);
    } catch (e) {
      setError("No s'han pogut carregar les parades");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  // Handle highlight stop from search
  useEffect(() => {
    if (highlightStopCode && stops.length > 0) {
      const stop = stops.find(
        (s) => s.codi_parada === highlightStopCode
      );
      if (stop) {
        setMapCenter([stop.latitud, stop.longitud]);
        setMapZoom(17);
        setSelectedStop(stop);
      }
      onHighlightHandled?.();
    }
  }, [highlightStopCode, stops, onHighlightHandled]);

  const handleMarkerClick = (stop: TMBStop) => {
    setSelectedStop(stop);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="animate-spin h-10 w-10 border-3 border-red-200 border-t-[#E60000] rounded-full" />
        <p className="text-sm text-gray-500 font-medium">
          CARREGANT PARADES...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={loadStops}
          className="px-4 py-2 bg-[#E60000] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />

        {stops.map((stop) => (
          <Marker
            key={stop.codi_parada}
            position={[stop.latitud, stop.longitud]}
            eventHandlers={{
              click: () => handleMarkerClick(stop),
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-sm">{stop.nom_parada}</p>
                <p className="text-xs text-gray-500">Parada {stop.codi_parada}</p>
                <button
                  className="mt-2 text-xs bg-[#E60000] text-white px-3 py-1 rounded-md font-semibold hover:bg-red-700 transition-colors w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkerClick(stop);
                  }}
                >
                  VEURE DETALLS
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay: stop count */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5 text-xs font-semibold text-gray-700">
        {stops.length} PARADES
      </div>

      {/* Refresh button */}
      <button
        onClick={loadStops}
        className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white transition-colors"
      >
        🔄
      </button>

      {/* Selected stop panel */}
      {selectedStop && (
        <StopInfoPanel
          stopCode={selectedStop.codi_parada}
          stopName={selectedStop.nom_parada}
          lat={selectedStop.latitud}
          lon={selectedStop.longitud}
          isFav={isFav(selectedStop.codi_parada)}
          onToggleFav={() =>
            onToggleFav({
              codi_parada: selectedStop.codi_parada,
              nom_parada: selectedStop.nom_parada,
              latitud: selectedStop.latitud,
              longitud: selectedStop.longitud,
            })
          }
          onClose={() => setSelectedStop(null)}
        />
      )}
    </div>
  );
}
