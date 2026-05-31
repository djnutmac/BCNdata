import type {
  TMBStopsResponse,
  TMBStopForecast,
  TMBTransitResponse,
  TMBLine,
  TMBPlannerResponse,
} from "../types";

const APP_ID = "16619440";
const APP_KEY = "e596d48164d007881b182b84bb3099bb";
const BASE_URL = "https://api.tmb.cat/v1";

// Multiple CORS proxies to try in order
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

function url(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${BASE_URL}${path}${separator}app_id=${APP_ID}&app_key=${APP_KEY}`;
}

async function tryFetch(directUrl: string): Promise<Response | null> {
  try {
    const res = await fetch(directUrl, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) return res;
  } catch {
    // CORS or network error
  }
  return null;
}

async function fetchTMB<T>(path: string): Promise<T> {
  const directUrl = url(path);

  // Try direct first
  const directRes = await tryFetch(directUrl);
  if (directRes) return (await directRes.json()) as T;

  // Try each CORS proxy
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(directUrl);
      const res = await fetch(proxyUrl);
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    "No s'ha pogut connectar amb l'API de TMB. Prova de nou més tard."
  );
}

// Get all bus stops
export async function getAllStops(): Promise<TMBStopsResponse> {
  return fetchTMB<TMBStopsResponse>("/ibus/stops/");
}

// Get real-time forecast for a specific stop
export async function getStopForecast(
  stopCode: string
): Promise<TMBStopForecast> {
  return fetchTMB<TMBStopForecast>(
    `/itransit/bus/parades/${stopCode}`
  );
}

// Get all bus lines with their routes
export async function getTransitLines(): Promise<TMBLine[]> {
  try {
    const data = await fetchTMB<TMBTransitResponse>(
      "/transit/linies/bus?type=json"
    );
    const seen = new Map<string, TMBLine>();
    for (const feature of data.features) {
      const code = feature.properties.CODI_LINIA || "";
      const name = feature.properties.NOM_LINIA || "";
      if (code && !seen.has(code)) {
        seen.set(code, { codi_linia: code, nom_linia: name });
      }
    }
    return Array.from(seen.values()).sort((a, b) => {
      // Sort: numbers first, then letters
      const aNum = parseInt(a.codi_linia);
      const bNum = parseInt(b.codi_linia);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      return a.codi_linia.localeCompare(b.codi_linia);
    });
  } catch {
    // Fallback: try to get lines from stops data
    const stopsData = await getAllStops();
    const lineMap = new Map<string, TMBLine>();
    for (const stop of stopsData.data?.ibus || []) {
      for (const code of stop.codis_linies || []) {
        if (!lineMap.has(code)) {
          lineMap.set(code, { codi_linia: code, nom_linia: code });
        }
      }
    }
    return Array.from(lineMap.values()).sort((a, b) => {
      const aNum = parseInt(a.codi_linia);
      const bNum = parseInt(b.codi_linia);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      return a.codi_linia.localeCompare(b.codi_linia);
    });
  }
}

// Get stops for a specific line and direction
export async function getLineStops(
  lineCode: string,
  direction?: number
): Promise<TMBTransitResponse> {
  let path = `/transit/parades/bus?type=json&codi_linia=${lineCode}`;
  if (direction !== undefined) {
    path += `&id_sentit=${direction}`;
  }
  return fetchTMB<TMBTransitResponse>(path);
}

// Get planner itinerary
export async function getItineraries(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<TMBPlannerResponse> {
  const path = `/planner/plan?fromPlace=${fromLat},${fromLon}&toPlace=${toLat},${toLon}&mode=WALK,BUS,TRANSIT&locale=ca`;
  return fetchTMB<TMBPlannerResponse>(path);
}

// Search stop by code
export async function searchStopByCode(
  code: string
): Promise<TMBStopForecast | null> {
  try {
    return await getStopForecast(code);
  } catch {
    return null;
  }
}

// Format minutes from timestamp
export function getMinutesUntil(timestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, Math.floor((timestamp - now) / 60));
}

// Direction label
export function getDirectionLabel(idSentit: number): string {
  return idSentit === 1 ? "ANADA" : "TORNADA";
}
