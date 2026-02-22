export interface Track {
  id: number;
  name: string;
  location: string;
  country: string;
  length_km: number;
  type: 'Race Circuit' | 'Street Circuit' | 'Hybrid';
}

export interface Sesion {
  id: string;
  nombre_evento: string;
  fecha: string;
  track_id: number;
}