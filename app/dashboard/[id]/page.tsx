'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardSesion() {
  const { id } = useParams()
  const [vueltas, setVueltas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const formatLaptime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00.000";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);

  // PadStart asegura que siempre tengamos 2 dígitos en segundos y 3 en milésimos
  return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
};

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('vueltas')
        .select('*')
        .eq('sesion_id', id)
        .order('numero_vuelta', { ascending: true })

      if (data) setVueltas(data)
      setLoading(false)
    }
    fetchData()
  }, [id])

  // 1. Agrupar datos para el gráfico
    const chartData = Array.from(new Set(vueltas.map(v => v.numero_vuelta)))
    .map(numVuelta => {
        const dataPunto: any = { name: `V${numVuelta}` };
        vueltas.filter(v => v.numero_vuelta === numVuelta).forEach(v => {
        dataPunto[v.piloto_nombre] = v.laptime;
        });
        return dataPunto;
    });

    // 2. Obtener lista única de pilotos para generar las líneas del gráfico
    const pilotosUnicos = Array.from(new Set(vueltas.map(v => v.piloto_nombre)));
    const colores = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (loading) return <p className="p-10 text-center">Analizando telemetría...</p>

 return (
  <div className="p-8 bg-slate-900 min-h-screen text-slate-100">
    <h1 className="text-3xl font-bold mb-8 border-b border-slate-700 pb-4">
      Análisis de Telemetría <span className="text-red-500 text-sm font-mono">ID: {id}</span>
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLUMNA 1: Leaderboard (Vuelta Rápida por Piloto) */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🏆 Clasificación
        </h2>
        <div className="space-y-4">
          {pilotosUnicos.map((piloto, i) => {
            const mejorVuelta = Math.min(...vueltas.filter(v => v.piloto_nombre === piloto).map(v => v.laptime));
            return (
              <div key={piloto} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <span className="text-xs text-slate-400 block">P{i+1}</span>
                  <span className="font-bold">{piloto}</span>
                </div>
                <span className="font-mono text-yellow-400">{formatLaptime(mejorVuelta)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* COLUMNA 2 y 3: Gráfico de Evolución */}
      <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Evolución de Tiempos</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis 
  domain={['auto', 'auto']} 
  stroke="#94a3b8" 
  tickFormatter={(value) => formatLaptime(value)} // <-- Formatea el eje Y
/>
<Tooltip 
  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
  formatter={(value: number) => [formatLaptime(value), "Tiempo"]} // <-- Formatea el globo al pasar el mouse
/>
              <Legend />
              {pilotosUnicos.map((piloto, i) => (
                <Line 
                  key={piloto}
                  type="monotone"
                  dataKey={piloto}
                  stroke={colores[i % colores.length]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>

    {/* SECCIÓN INFERIOR: Tabla de detalles técnicos */}
    <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-green-400">Datos Técnicos por Vuelta</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="p-2">Piloto</th>
            <th className="p-2">V.</th>
            <th className="p-2">S1</th>
            <th className="p-2">S2</th>
            <th className="p-2">S3</th>
            <th className="p-2">Top Speed</th>
            <th className="p-2">Fuel</th>
            <th className="p-2">Tyre</th>
          </tr>
        </thead>
        <tbody>
          {vueltas.slice(0, 20).map((v, i) => (
            <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
              <td className="p-2 font-semibold">{v.piloto_nombre}</td>
              <td className="p-2">{v.numero_vuelta}</td>
              <td className="p-2 font-mono">{v.s1.toFixed(3)}</td>
              <td className="p-2 font-mono">{v.s2.toFixed(3)}</td>
              <td className="p-2 font-mono">{v.s3.toFixed(3)}</td>
              <td className="p-2 text-orange-400">{v.top_speed} km/h</td>
              <td className="p-2">{v.combustible}L</td>
              <td className="p-2 text-xs bg-slate-900 rounded inline-block mt-1 px-2">{v.neumatico}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}