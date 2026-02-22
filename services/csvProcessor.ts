// src/services/csvProcessor.ts
import Papa from 'papaparse';

export interface LapData {
  sesion_id: string;
  piloto_nombre: string;
  numero_vuelta: number;
  s1: number;
  s2: number;
  s3: number;
  laptime: number;
  neumatico: string;
}

export const parseTelemetryCSV = (file: File, sesionId: string): Promise<LapData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as string[][];
        const allLaps: LapData[] = [];

        // 1. Identificar Pilotos: Están en la Fila 0, Columnas 1, 5, 9, etc.
        const headerRow = rows[0];
        const pilots: { name: string; colIndex: number }[] = [];
        
        for (let i = 1; i < headerRow.length; i += 4) {
          if (headerRow[i]) {
            pilots.push({ name: headerRow[i], colIndex: i });
          }
        }

        // 2. Recorrer filas de vueltas (empezando desde la fila 2 o 3 según tu CSV)
        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          const lapNumber = parseInt(row[0]);
          if (isNaN(lapNumber)) continue;

          pilots.forEach((pilot) => {
            const baseCol = pilot.colIndex;
            // Estructura: S1 (base), S2 (base+1), S3 (base+2), Laptime (base+3)
            const s1 = parseFloat(row[baseCol]?.replace(',', '.'));
            const s2 = parseFloat(row[baseCol + 1]?.replace(',', '.'));
            const s3 = parseFloat(row[baseCol + 2]?.replace(',', '.'));
            const laptime = parseFloat(row[baseCol + 3]?.replace(',', '.'));

            if (!isNaN(laptime)) {
              allLaps.push({
                sesion_id: sesionId,
                piloto_nombre: pilot.name,
                numero_vuelta: lapNumber,
                s1, s2, s3, laptime,
                neumatico: 'S' // Por ahora fijo, luego lo mapeamos
              });
            }
          });
        }
        resolve(allLaps);
      },
      error: (error) => reject(error)
    });
  });
};