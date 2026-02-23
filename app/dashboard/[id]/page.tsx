"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { ArrowLeft, Fuel, Activity } from "lucide-react";

// --- 1. LAS FUNCIONES DE UTILIDAD (Fuera del componente) ---
const formatLaptime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00.000";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
};

const colores = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const tireConfig: Record<string, { color: string; label: string }> = {
  S: { color: "#ef4444", label: "S" }, // Rojo
  M: { color: "#eab308", label: "M" }, // Amarillo
  H: { color: "#f8fafc", label: "H" }, // Blanco
  I: { color: "#22c55e", label: "I" }, // Verde
  W: { color: "#3b82f6", label: "W" }, // Azul
};

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
        .from("vueltas")
        .select("*")
        .eq("sesion_id", id)
        .order("numero_vuelta", { ascending: true });

      if (data) {
        setVueltas(data);
        // Al cargar, activamos todos los pilotos por defecto
        const unicos = Array.from(
          new Set(data.map((v: any) => v.piloto_nombre)),
        );
        setPilotosVisibles(unicos);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // --- 4. LÓGICA DE PROCESAMIENTO (Antes del return) ---
  const pilotosUnicos = Array.from(
    new Set(vueltas.map((v) => v.piloto_nombre)),
  );

  // Preparamos los datos para el gráfico de Recharts
  const chartData = Array.from(
    new Set(vueltas.map((v) => v.numero_vuelta)),
  ).map((numVuelta) => {
    const dataPunto: any = { name: `V${numVuelta}` };
    vueltas
      .filter((v) => v.numero_vuelta === numVuelta)
      .forEach((v) => {
        dataPunto[v.piloto_nombre] = v.laptime;
      });
    return dataPunto;
  });

  const togglePiloto = (nombre: string) => {
    setPilotosVisibles((prev) =>
      prev.includes(nombre)
        ? prev.filter((p) => p !== nombre)
        : [...prev, nombre],
    );
  };

  // Obtenemos el tiempo mínimo de cada sector entre todas las vueltas de la sesión
  // Filtramos solo vueltas válidas (donde los 3 sectores sean mayores a 2 segundos)
  const vueltasValidas = vueltas.filter(
    (v) => v.s1 > 2 && v.s2 > 2 && v.s3 > 2 && v.laptime > 10,
  );
  const bestS1 =
    vueltasValidas.length > 0
      ? Math.min(...vueltasValidas.map((v) => v.s1))
      : null;
  const bestS2 =
    vueltasValidas.length > 0
      ? Math.min(...vueltasValidas.map((v) => v.s2))
      : null;
  const bestS3 =
    vueltasValidas.length > 0
      ? Math.min(...vueltasValidas.map((v) => v.s3))
      : null;
  const bestLap =
    vueltasValidas.length > 0
      ? Math.min(...vueltasValidas.map((v) => v.laptime))
      : null;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          Analizando telemetría...
        </p>
      </div>
    );

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-slate-100">
      {/* HEADER CON BOTÓN DE REGRESO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all text-slate-400 hover:text-white group"
          >
            <ArrowLeft
              size={24}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              SESSION <span className="text-red-600">ANALYSIS</span>
            </h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
              ID: {id}
            </p>
          </div>
        </div>

        {/* Aquí podrías poner botones de exportar o similares en el futuro */}
      </div>

      {/* BOTONERA DE FILTROS */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-8">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">
          Filtrar Pilotos
        </p>
        <div className="flex flex-wrap gap-2">
          {pilotosUnicos.map((piloto, i) => (
            <button
              key={piloto}
              onClick={() => togglePiloto(piloto)}
              className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 text-sm font-bold
                ${pilotosVisibles.includes(piloto) ? "bg-slate-700 border-opacity-100" : "bg-slate-900 border-opacity-20 opacity-40"}`}
              style={{ borderColor: colores[i % colores.length] }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colores[i % colores.length] }}
              />
              {piloto}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEADERBOARD (A la izquierda o arriba) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-yellow-500">
            Fastest Laps
          </h2>
          {pilotosUnicos.map((piloto) => {
            const vPiloto = vueltas.filter((v) => v.piloto_nombre === piloto);
            const mejorV = Math.min(...vPiloto.map((v) => v.laptime));
            return (
              <div
                key={piloto}
                className="flex justify-between py-2 border-b border-slate-700"
              >
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
                domain={["auto", "auto"]}
                tickFormatter={formatLaptime} // <-- Aquí aplicamos el formato al eje Y
                stroke="#94a3b8"
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                formatter={(value: any) => formatLaptime(value)} // <-- Aquí aplicamos el formato al tooltip
              />
              <Legend />
              {pilotosUnicos
                .filter((p) => pilotosVisibles.includes(p)) // <-- AQUÍ FILTRAMOS LAS LÍNEAS
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
              .filter((v) => pilotosVisibles.includes(v.piloto_nombre)) // <-- AQUÍ FILTRAMOS LA TABLA
              .map((v, i) => (
                <tr key={i} className="border-b border-slate-700">
                  <td className="p-3">{v.piloto_nombre}</td>
                  <td className="p-3">{v.numero_vuelta}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {tireConfig[v.neumatico] ? (
                        <div
                          className="w-7 h-7 rounded-full border-[3px] flex items-center justify-center text-[10px] font-black shadow-inner"
                          style={{
                            borderColor: tireConfig[v.neumatico].color,
                            color: tireConfig[v.neumatico].color,
                            backgroundColor: "rgba(0,0,0,0.3)",
                          }}
                        >
                          {tireConfig[v.neumatico].label}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
                          ?
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Ejemplo para Sector 1 */}
                  <td
                    className={`p-3 font-mono ${v.s1 === bestS1 ? "text-purple-400 font-bold" : "text-slate-400"}`}
                  >
                    {v.s1 > 0 ? v.s1.toFixed(3) : "-.---"}
                  </td>
                  <td
                    className={`p-3 font-mono font-bold ${v.s2 === bestS2 ? "text-purple-400" : "text-slate-400"}`}
                  >
                    {v.s2 > 0 ? v.s2.toFixed(3) : "-.---"}
                  </td>
                  <td
                    className={`p-3 font-mono font-bold ${v.s3 === bestS3 ? "text-purple-400" : "text-slate-400"}`}
                  >
                    {v.s3 > 0 ? v.s3.toFixed(3) : "-.---"}
                  </td>
                  <td className="p-3">
                    <div
                      className={`flex items-center gap-2 font-mono font-bold ${v.laptime === bestLap ? "text-purple-400" : "text-slate-100"}`}
                    >
                      {formatLaptime(v.laptime)}
                      {v.laptime === bestLap && (
                        <span className="bg-purple-500/20 text-purple-400 p-1 rounded">
                          <Activity size={12} className="stroke-[3px]" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Usage
                        </span>
                        <span
                          className={`text-xs font-black font-mono ${
                            v.desgaste > 75
                              ? "text-red-500 animate-pulse"
                              : v.desgaste > 45
                                ? "text-yellow-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {v.desgaste}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900/50 h-2 rounded-full border border-slate-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ease-out ${
                            v.desgaste > 75
                              ? "bg-gradient-to-r from-red-600 to-red-400"
                              : v.desgaste > 45
                                ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                                : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                          }`}
                          style={{ width: `${v.desgaste}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1.5 w-32">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1">
                          <Fuel size={10} className="text-slate-500" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            Fuel Level
                          </span>
                        </div>
                        <span
                          className={`text-xs font-black font-mono ${
                            v.combustible < 5
                              ? "text-orange-500"
                              : "text-sky-400"
                          }`}
                        >
                          {v.combustible} L
                        </span>
                      </div>

                      <div className="w-full bg-slate-900/50 h-2 rounded-full border border-slate-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ease-in-out ${
                            v.combustible < 5
                              ? "bg-gradient-to-r from-orange-600 to-red-500"
                              : "bg-gradient-to-r from-sky-600 to-indigo-500"
                          }`}
                          style={{ width: `${(v.combustible / 110) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{v.ers_deployed} kJ</td>
                  <td className="p-3">{v.top_speed} km/h</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
