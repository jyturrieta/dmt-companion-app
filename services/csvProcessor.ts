// src/services/csvProcessor.ts
import Papa from "papaparse";

export const parseTelemetryCSV = (
  file: File,
  sesionId: string,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      // src/services/csvProcessor.ts
      // src/services/csvProcessor.ts
// src/services/csvProcessor.ts
complete: (results) => {
  const rows = results.data as string[][];
  const allLaps: any[] = [];
  
  // 1. Encontrar la fila de los nombres (Fila 8 en tu caso)
  const pilotRow = rows[8];
  const pilots: { name: string; startIndex: number }[] = [];

  // Buscamos todos los pilotos que dicen "Drivers lap statistics"
  pilotRow.forEach((cell, index) => {
    if (cell && cell.includes("Drivers lap statistics")) {
      const name = cell.replace("Drivers lap statistics", "").trim();
      pilots.push({ name, startIndex: index });
    }
  });

  console.log("Pilotos detectados por columnas:", pilots);

  // 2. Recorrer las filas de datos (A partir de la fila 10 que son los números)
  for (let i = 10; i < rows.length; i++) {
    const row = rows[i];
    const lapNumber = parseInt(row[0]);
    if (isNaN(lapNumber)) continue;

    // 3. Para cada piloto encontrado, extraer sus 12 columnas correspondientes
    pilots.forEach((pilot, pilotIndex) => {
      // El primer piloto empieza en col 1, el segundo en col 13, etc. (cada bloque mide 12)
      const base = pilot.startIndex; 

      const s1 = parseFloat(row[base]?.replace(',', '.'));
      const s2 = parseFloat(row[base + 1]?.replace(',', '.'));
      const s3 = parseFloat(row[base + 2]?.replace(',', '.'));
      const laptime = parseFloat(row[base + 3]?.replace(',', '.'));

      // Solo agregamos la vuelta si el piloto realmente corrió esa vuelta (S1 tiene valor)
      if (!isNaN(s1) && s1 > 0) {
        allLaps.push({
          sesion_id: sesionId,
          piloto_nombre: pilot.name,
          numero_vuelta: lapNumber,
          s1: s1,
          s2: s2,
          s3: s3,
          laptime: laptime || (s1 + s2 + s3),
          neumatico: row[base + 4] || '',
          desgaste: parseInt(row[base + 5]) || 0,
          combustible: parseFloat(row[base + 6]?.replace(',', '.')) || 0,
          ers_deployed: parseInt(row[base + 7]) || 0,
          fl: parseFloat(row[base + 8]?.replace(',', '.')) || 0,
          c: parseFloat(row[base + 9]?.replace(',', '.')) || 0,
          kpis: parseInt(row[base + 10]) || 0,
          top_speed: parseInt(row[base + 11]) || 0
        });
      }
    });
  }

  console.log("Total vueltas procesadas (Todos los pilotos):", allLaps.length);
  resolve(allLaps);
},
      error: (err) => {
        reject(err);
      }
    }); 
  });
}
