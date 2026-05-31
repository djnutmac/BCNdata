// TMB API Types

export interface TMBStop {
  codi_parada: string;
  nom_parada: string;
  latitud: number;
  longitud: number;
  codis_linies?: string[];
}

export interface TMBStopsResponse {
  data: {
    ibus: TMBStop[];
  };
}

export interface TMBArrival {
  temps_arribada: number; // Unix timestamp
  id_bus: number;
}

export interface TMBLineInfo {
  codi_linia: string;
  nom_linia: string;
  desti_trajecte: string;
  id_sentit: number; // 1 = Anada (Outbound), 2 = Tornada (Return)
  propers_busos: TMBArrival[];
}

export interface TMBStopForecast {
  timestamp: number;
  parades: {
    codi_parada: string;
    nom_parada: string;
    linies_trajectes: TMBLineInfo[];
  }[];
}

export interface TMBLine {
  codi_linia: string;
  nom_linia: string;
  descripcio?: string;
  origen?: string;
  desti?: string;
}

export interface TMBTransitResponse {
  features: {
    type: string;
    geometry: {
      type: string;
      coordinates: number[];
    };
    properties: {
      CODI_LINIA?: string;
      NOM_LINIA?: string;
      CODI_PARADA?: string;
      NOM_PARADA?: string;
      ID_SENTIT?: number;
      NOM_SENTIT?: string;
      NOM_DESTI?: string;
      [key: string]: unknown;
    };
  }[];
}

export interface TMBPlannerItinerary {
  duration: number;
  legs: TMBPlannerLeg[];
}

export interface TMBPlannerLeg {
  mode: string; // "WALK" | "BUS" | "SUBWAY" | "TRAM"
  from: {
    name: string;
    lat: number;
    lon: number;
    stopCode?: string;
  };
  to: {
    name: string;
    lat: number;
    lon: number;
    stopCode?: string;
  };
  distance: number;
  duration: number;
  route?: string;
  routeShortName?: string;
  headsign?: string;
  steps?: {
    lat: number;
    lon: number;
  }[];
}

export interface TMBPlannerResponse {
  plan: {
    itineraries: TMBPlannerItinerary[];
  };
}

export interface FavoriteStop {
  codi_parada: string;
  nom_parada: string;
  latitud: number;
  longitud: number;
  addedAt: number;
}

export interface FavoriteLine {
  codi_linia: string;
  nom_linia: string;
  addedAt: number;
}
