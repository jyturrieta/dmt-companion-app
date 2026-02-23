'use client';
import { useEffect, useState, useMemo } from "react";
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
  ReferenceLine
} from "recharts";
import Link from "next/link";
import { ArrowLeft, Fuel, Activity, Timer, Zap, Gauge, Trophy, User } from "lucide-react";

const formatLaptime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00.000";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.round((seconds % 1) * 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
};

const colores = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

const tireConfig: Record<string, { color: string; label: string }> = {
  S: { color: "#ef4444", label: "S" },
  M: { color: "#eab308", label: "M" },
  H: { color: "#f8fafc", label: "H" },
  I: { color: "#22c55e", label: "I" },
  W: { color: "#3b82f6", label: "W" },
};

export default function DashboardSesion() {
  const { id } = useParams();
  const [vueltas, setVueltas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pilotosVisibles, setPilotosVisibles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("vueltas")
        .select("*")
        .eq("sesion_id", id)
        .order("numero_vuelta", { ascending: true });

      if (data) {
        setVueltas(data);
        const unicos = Array.from(new Set(data.map((v: any) => v.piloto_nombre)));
        setPilotosVisibles(unicos as string[]);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const pilotosUnicos = useMemo(() => 
    Array.from(new Set(vueltas.map(v => v.piloto_nombre))), 
  [vueltas]);

  // --- CÁLCULOS DE LÍDERES ---
  const stats = useMemo(() => {
    const competitivas = vueltas.filter(v => v.laptime > 40 && v.s1 > 5 && v.s2 > 5 && v.s3 > 5);
    if (competitivas.length === 0) return null;

    // Récord de Vuelta y Quién
    const bestLapData = [...competitivas].sort((a, b) => a.laptime - b.laptime)[0];
    
    // Top Speed y Quién
    const topSpeedData = [...vueltas].sort((a, b) => b.top_speed - a.top_speed)[0];

    const bestS1 = Math.min(...competitivas.map(v => v.s1));
    const bestS2 = Math.min(...competitivas.map(v => v.s2));
    const bestS3 = Math.min(...competitivas.map(v => v.s3));

    const personalBests: Record<string, number> = {};
    pilotosUnicos.forEach(piloto => {
      const laps = competitivas.filter(v => v.piloto_nombre === piloto);
      if (laps.length > 0) personalBests[piloto] = Math.min(...laps.map(v => v.laptime));
    });

    return { 
      bestLap: bestLapData.laptime, 
      bestLapHolder: bestLapData.piloto_nombre,
      topSpeed: topSpeedData.top_speed,
      topSpeedHolder: topSpeedData.piloto_nombre,
      bestS1, bestS2, bestS3, 
      idealLap: bestS1 + bestS2 + bestS3, 
      personalBests 
    };
  }, [vueltas, pilotosUnicos]);

  const chartData = useMemo(() => {
    const lapsNumbers = Array.from(new Set(vueltas.map(v => v.numero_vuelta)));
    return lapsNumbers.map(num => {
      const point: any = { name: `L${num}` };
      vueltas.filter(v => v.numero_vuelta === num).forEach(v => {
        point[v.piloto_nombre] = v.laptime;
      });
      return point;
    });
  }, [vueltas]);

  const togglePiloto = (nombre: string) => {
    setPilotosVisibles(prev => prev.includes(nombre) ? prev.filter(p => p !== nombre) : [...prev, nombre]);
  };

  if (loading) return <div className="p-20 text-center font-mono text-slate-500 uppercase tracking-widest">Initialising Telemetry Core...</div>;

  return (
    <div className="p-4 md:p-8 bg-slate-950 min-h-screen text-slate-100 italic-none">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-all text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">Session <span className="text-red-600">Analysis</span></h1>
        </div>
      </div>

      {/* KPI CARDS ACTUALIZADAS CON DUEÑOS DEL RÉCORD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-center uppercase">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <p className="text-[10px] font-mono text-slate-500 mb-1 tracking-widest">Session Best</p>
          <p className="text-2xl font-black text-purple-400 italic leading-tight">{formatLaptime(stats?.bestLap || 0)}</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 bg-slate-950 py-1 rounded-full border border-slate-800">
             <User size={10} className="text-purple-500"/> {stats?.bestLapHolder}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-500 mb-1 tracking-widest">Theoretical Ideal</p>
          <p className="text-2xl font-black text-yellow-500 italic leading-tight">{formatLaptime(stats?.idealLap || 0)}</p>
          
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-500 mb-1 tracking-widest">Max Speed</p>
          <p className="text-2xl font-black text-blue-400 italic leading-tight">{stats?.topSpeed} <span className="text-xs">KMH</span></p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 bg-slate-950 py-1 rounded-full border border-slate-800">
             <Gauge size={10} className="text-blue-500"/> {stats?.topSpeedHolder}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[10px] font-mono text-slate-500 mb-1 tracking-widest">Total Activity</p>
          <p className="text-2xl font-black text-emerald-400 italic leading-tight">{vueltas.length} <span className="text-xs">Laps</span></p>
          <div className="mt-2 text-[9px] font-bold text-slate-500 py-1 uppercase tracking-tighter">{pilotosUnicos.length} Drivers</div>
        </div>
      </div>

      {/* FILTROS LATERALES + GRÁFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Pilot Selection</p>
          <div className="flex flex-col gap-3">
            {pilotosUnicos.map((piloto, i) => (
              <button
                key={piloto}
                onClick={() => togglePiloto(piloto)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-start
                  ${pilotosVisibles.includes(piloto) ? "bg-slate-800 border-opacity-100" : "bg-slate-950 border-opacity-20 opacity-30"}`}
                style={{ borderColor: colores[i % colores.length] }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2 text-sm font-black text-white uppercase italic tracking-tighter">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colores[i % colores.length] }} />
                    {piloto}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 uppercase">
                  <Trophy size={10} className="text-yellow-600" /> Best: {formatLaptime(stats?.personalBests[piloto] || 0)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "12px" }} 
                formatter={(val: any) => [formatLaptime(val), "Time"]} 
              />
              {stats && <ReferenceLine y={stats.bestLap} stroke="#a855f7" strokeDasharray="5 5" />}
              {pilotosUnicos.filter(p => pilotosVisibles.includes(p)).map((piloto, i) => (
                <Line key={piloto} type="monotone" dataKey={piloto} stroke={colores[i % colores.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr className="text-slate-400 font-mono uppercase text-[9px] tracking-widest border-b border-slate-700">
                <th className="p-4">Driver</th>
                <th className="p-4 text-center">Lap</th>
                <th className="p-4 text-center">Tyre</th>
                <th className="p-4">s1</th>
                <th className="p-4">s2</th>
                <th className="p-4">s3</th>
                <th className="p-4">Laptime</th>
                <th className="p-4">Wear</th>
                <th className="p-4">Fuel</th>
                <th className="p-4 text-center">ERS</th>
                <th className="p-4 text-center">Top Speed</th>
              </tr>
            </thead>
            <tbody>
              {vueltas.filter(v => pilotosVisibles.includes(v.piloto_nombre)).map((v, i) => {
                const isOverallBest = v.laptime === stats?.bestLap;
                const isPersonalBest = v.laptime === stats?.personalBests[v.piloto_nombre];
                
                return (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-black italic uppercase text-slate-300">{v.piloto_nombre}</td>
                    <td className="p-4 text-center font-mono text-slate-500">#{v.numero_vuelta}</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black"
                          style={{ borderColor: tireConfig[v.neumatico]?.color || '#444', color: tireConfig[v.neumatico]?.color || '#444' }}>
                          {tireConfig[v.neumatico]?.label || '?'}
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 font-mono ${v.s1 === stats?.bestS1 ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>{v.s1.toFixed(3)}</td>
                    <td className={`p-4 font-mono ${v.s2 === stats?.bestS2 ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>{v.s2.toFixed(3)}</td>
                    <td className={`p-4 font-mono ${v.s3 === stats?.bestS3 ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>{v.s3.toFixed(3)}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 font-mono font-bold 
                        ${isOverallBest ? "text-purple-400" : isPersonalBest ? "text-emerald-400" : "text-slate-100"}`}>
                        {formatLaptime(v.laptime)}
                        {isOverallBest ? <Timer size={12} /> : isPersonalBest ? <Trophy size={12} /> : null}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Usage</span>
                          <span className={`text-xs font-black font-mono ${v.desgaste > 75 ? "text-red-500" : "text-emerald-500"}`}>{v.desgaste}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full border border-slate-800 overflow-hidden">
                          <div className={`h-full ${v.desgaste > 75 ? "bg-red-600" : "bg-emerald-500"}`} style={{ width: `${v.desgaste}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-1 text-slate-500"><Fuel size={10} /><span className="text-[9px] font-mono uppercase">Fuel</span></div>
                          <span className="text-xs font-black font-mono text-sky-400">{v.combustible} L</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full border border-slate-800 overflow-hidden">
                          <div className="h-full bg-sky-500" style={{ width: `${(v.combustible / 110) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono text-emerald-400">{v.ers_deployed} kJ</td>
                    <td className="p-4 text-center font-mono text-blue-400 uppercase">{v.top_speed} km/h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}