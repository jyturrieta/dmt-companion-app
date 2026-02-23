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
  
  // 1. ENCONTRAR DINÁMICAMENTE LAS FILAS CLAVE
  // Buscamos la fila donde empiezan los nombres de los pilotos
  const rowIndexPilotos = rows.findIndex(row => 
    row.some(cell => cell && cell.includes("Drivers lap statistics"))
  );

  // Buscamos la fila donde están los encabezados (S1, S2, S3...) 
  // que suele estar justo debajo de la de los pilotos
  const rowIndexHeaders = rows.findIndex(row => 
    row.some(cell => cell === "S1") && row.some(cell => cell === "Laptime")
  );

  if (rowIndexPilotos === -1 || rowIndexHeaders === -1) {
    console.error("No se encontró la estructura de telemetría en el CSV");
    return;
  }

  const pilotRow = rows[rowIndexPilotos];
  const pilots: { name: string; startIndex: number }[] = [];

  // 2. DETECTAR PILOTOS Y SUS COLUMNAS
  pilotRow.forEach((cell, index) => {
    if (cell && cell.includes("Drivers lap statistics")) {
      const name = cell.replace("Drivers lap statistics", "").trim();
      pilots.push({ name, startIndex: index });
    }
  });

  console.log("Pilotos detectados dinámicamente:", pilots);

  // 3. RECORRER DATOS (Empezamos justo después de la fila de encabezados)
  for (let i = rowIndexHeaders + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // La primera columna de la fila de datos siempre es el número de vuelta
    const lapNumber = parseInt(row[0]);
    if (isNaN(lapNumber)) continue;

    pilots.forEach((pilot) => {
      const base = pilot.startIndex; 

      // Función auxiliar para limpiar números
      const parseNum = (val: string) => {
        if (!val) return 0;
        return parseFloat(val.replace(',', '.'));
      };

      const s1 = parseNum(row[base]);
      const s2 = parseNum(row[base + 1]);
      const s3 = parseNum(row[base + 2]);
      const laptime = parseNum(row[base + 3]);

      // Solo agregamos la vuelta si hay datos reales
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
          combustible: parseNum(row[base + 6]),
          ers_deployed: parseInt(row[base + 7]) || 0,
          top_speed: parseInt(row[base + 11]) || 0
          // Agrega aquí FL, C o KPIs si los necesitas en tu DB
        });
      }
    });
  }

  console.log("Proceso finalizado. Vueltas encontradas:", allLaps.length);
  resolve(allLaps);
},
      error: (err) => {
        reject(err);
      }
    }); 
  });
}
