'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// --- 1. LAS FUNCIONES DE UTILIDAD (Fuera del componente) ---
const formatLaptime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00.000";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
};

const colores = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function DashboardSesion() {
  const { id } = useParams();
  
  // --- 2. LOS ESTADOS (States) ---
  const [vueltas, setVueltas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pilotosVisibles, setPilotosVisibles] = useState<string[]>([]); // Filtro de pilotos

  // --- 3. CARGA DE DATOS (useEffect) ---
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('vueltas')
        .select('*')
        .eq('sesion_id', id)
        .order('numero_vuelta', { ascending: true });

      if (data) {
        setVueltas(data);
        // Al cargar, activamos todos los pilotos por defecto
        const unicos = Array.from(new Set(data.map((v: any) => v.piloto_nombre)));
        setPilotosVisibles(unicos);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // --- 4. LÓGICA DE PROCESAMIENTO (Antes del return) ---
  const pilotosUnicos = Array.from(new Set(vueltas.map(v => v.piloto_nombre)));

  // Preparamos los datos para el gráfico de Recharts
  const chartData = Array.from(new Set(vueltas.map(v => v.numero_vuelta)))
    .map(numVuelta => {
      const dataPunto: any = { name: `V${numVuelta}` };
      vueltas.filter(v => v.numero_vuelta === numVuelta).forEach(v => {
        dataPunto[v.piloto_nombre] = v.laptime;
      });
      return dataPunto;
    });

  const togglePiloto = (nombre: string) => {
    setPilotosVisibles(prev => 
      prev.includes(nombre) ? prev.filter(p => p !== nombre) : [...prev, nombre]
    );
  };

  if (loading) return <p className="p-10 text-center">Analizando telemetría...</p>;

  // --- 5. EL RENDER (Lo que se ve) ---
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-slate-100">
      
      {/* BOTONERA DE FILTROS (Arriba del gráfico) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {pilotosUnicos.map((piloto, i) => (
          <button
            key={piloto}
            onClick={() => togglePiloto(piloto)}
            className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 text-sm font-bold
              ${pilotosVisibles.includes(piloto) ? 'bg-slate-700 border-opacity-100' : 'bg-slate-900 border-opacity-20 opacity-50'}`}
            style={{ borderColor: colores[i % colores.length] }}
          >
            {piloto}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEADERBOARD (A la izquierda o arriba) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">Fastest Laps</h2>
          {pilotosUnicos.map(piloto => {
            const vPiloto = vueltas.filter(v => v.piloto_nombre === piloto);
            const mejorV = Math.min(...vPiloto.map(v => v.laptime));
            return (
              <div key={piloto} className="flex justify-between py-2 border-b border-slate-700">
                <span>{piloto}</span>
                <span className="font-mono">{formatLaptime(mejorV)}</span>
              </div>
            );
          })}
        </div>

        {/* GRÁFICO (A la derecha o abajo) */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis 
                domain={['auto', 'auto']} 
                tickFormatter={formatLaptime} // <-- Aquí aplicamos el formato al eje Y
                stroke="#94a3b8" 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                formatter={(val: number) => [formatLaptime(val), "Tiempo"]} // <-- Formato en el popup
              />
              <Legend />
              {pilotosUnicos
                .filter(p => pilotosVisibles.includes(p)) // <-- AQUÍ FILTRAMOS LAS LÍNEAS
                .map((piloto, i) => (
                  <Line 
                    key={piloto} 
                    type="monotone" 
                    dataKey={piloto} 
                    stroke={colores[i % colores.length]} 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* TABLA DE DETALLES (Al final) */}
      <div className="mt-8">
         <h2 className="text-xl font-bold mb-4">Detalle por Vuelta</h2>
         <table className="w-full text-left bg-slate-800 rounded-xl overflow-hidden">
            <thead>
               <tr className="bg-slate-700 text-slate-300">
                  <th className="p-3">Piloto</th>
                  <th className="p-3">Vuelta</th>
                  <th className="p-3">Neumático</th>
                  <th className="p-3">s1</th>
                  <th className="p-3">s2</th>
                  <th className="p-3">s3</th>
                  <th className="p-3">Laptime</th>
                  <th className="p-3">Desgaste</th>
                  <th className="p-3">Combustible</th>
                  <th className="p-3">ERS Deploy</th>
                  <th className="p-3">Top Speed</th>
               </tr>
            </thead>
            <tbody>
               {vueltas
                 .filter(v => pilotosVisibles.includes(v.piloto_nombre)) // <-- AQUÍ FILTRAMOS LA TABLA
                 .map((v, i) => (
                  <tr key={i} className="border-b border-slate-700">
                     <td className="p-3">{v.piloto_nombre}</td>
                     <td className="p-3">{v.numero_vuelta}</td>
                        <td className="p-3">{v.neumatico}</td>
                        <td className="p-3 font-mono">{v.s1}</td>
                        <td className="p-3 font-mono">{v.s2}</td>
                        <td className="p-3 font-mono">{v.s3}</td>
                     <td className="p-3 font-mono ">{formatLaptime(v.laptime)}</td>
                        <td className="p-3">{v.desgaste}%</td>
                        <td className="p-3">{v.combustible} L</td>
                        <td className="p-3">{v.ers_deployed}</td>
                     <td className="p-3">{v.top_speed} km/h</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}