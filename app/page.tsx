'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Trash2, Search, Trophy, Calendar, ChevronRight, Activity, MapPin, Plus, Hash } from 'lucide-react'

const formatDate = (dateString: string) => {
  if (!dateString) return 'NO DATE';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
};

export default function Home() {
  const [sesiones, setSesiones] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSesiones()
  }, [])

  const fetchSesiones = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select(`
          *,
          tracks (name, location, country),
          tipo_sesion (nombre)
        `)
        .order('fecha', { ascending: false })

      if (error) {
        const { data: fallbackData } = await supabase
          .from('sesiones')
          .select('*')
          .order('fecha', { ascending: false })
        setSesiones(fallbackData || [])
      } else {
        setSesiones(data || [])
      }
    } catch (error) {
      console.error("Error crítico:", error)
    } finally {
      setLoading(false)
    }
  }

  const borrarSesion = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    if (confirm('⚠️ WARNING: All telemetry data for this session will be permanently erased. Proceed?')) {
      try {
        const { error } = await supabase.from('sesiones').delete().eq('id', id)
        if (error) throw error
        setSesiones(prev => prev.filter(s => s.id !== id))
      } catch (error) {
        alert("Error deleting session")
      }
    }
  }

  const sesionesFiltradas = sesiones.filter(s => {
    const searchTarget = `${s.nombre_evento} ${s.tracks?.name || s.nombre_circuito} ${s.tracks?.location}`.toLowerCase()
    return searchTarget.includes(busqueda.toLowerCase())
  })

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto p-6 md:p-12">
        
        {/* ENCABEZADO PRO */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-red-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase">Telemetry Control Unit</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter text-white leading-none">
              DMT<span className="text-red-600">.</span>COMPANION
            </h1>
            <p className="text-slate-500 font-medium tracking-tight max-w-md uppercase text-xs">
              Advanced race data processing for professional simulation and analysis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors w-4 h-4" />
              <input 
                type="text"
                placeholder="SEARCH..."
                className="w-full sm:w-80 bg-slate-900/80 border border-slate-800 rounded-lg py-4 pl-12 pr-4 focus:outline-none focus:border-red-600 transition-all font-mono text-xs tracking-widest placeholder:text-slate-700 uppercase"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <Link 
              href="/create" 
              className="bg-white hover:bg-red-600 text-black hover:text-white px-8 py-4 rounded-lg font-black transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 uppercase text-xs tracking-widest"
            >
              <Plus size={16} strokeWidth={3} />
              Inject Session
            </Link>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-red-600/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-red-500 font-mono text-xs font-black tracking-[0.3em] animate-pulse">DOWNLOADING DATA PACKETS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sesionesFiltradas.length > 0 ? (
              sesionesFiltradas.map((sesion) => (
                <Link key={sesion.id} href={`/dashboard/${sesion.id}`} className="group relative">
                  <div className="relative h-full bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden transition-all duration-500 hover:border-red-600/50 hover:bg-slate-900/60">
                    
                    {/* Tarjeta Visual Decor - Línea superior de color */}
                    <div className="h-1 w-full bg-gradient-to-right from-red-600 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8">
                        <div className="px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-md">
                          <span className="text-[9px] font-black text-red-500 tracking-[0.2em] uppercase">
                            {sesion.tipo_sesion?.nombre || 'Technical'}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => borrarSesion(e, sesion.id)}
                          className="p-2 text-slate-700 hover:text-red-500 transition-colors z-20"
                        >
                          <Trash2 size={14} className="group-hover:hidden" />
                          <Trash2 size={16} className="hidden group-hover:block" />
                        </button>
                      </div>

                      <h3 className="text-2xl font-black italic uppercase text-white mb-2 leading-none group-hover:text-red-500 transition-colors">
                        {sesion.nombre_evento || "Unnamed Session"}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-8">
                        <MapPin size={12} className="text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {sesion.tracks?.name || sesion.nombre_circuito || 'Global Circuit'} • {sesion.tracks?.location || 'Unk'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 border-t border-slate-800 pt-6 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Date</p>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar size={12} className="text-red-600" />
                            <p className="text-[10px] font-mono font-bold">{formatDate(sesion.fecha)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón Inferior Estilo F1 */}
                    <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg shadow-red-600/20">
                            <ChevronRight size={20} strokeWidth={3} />
                        </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-32 border-2 border-dashed border-slate-900 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-900/50 rounded-full mb-6">
                    <Trophy size={40} className="text-slate-800" />
                </div>
                <p className="text-slate-500 font-mono text-xs tracking-[0.2em] mb-4">
                  {busqueda ? `ZERO RECORDS FOUND FOR: ${busqueda.toUpperCase()}` : "GARAGE EMPTY - NO SESSIONS DETECTED"}
                </p>
                {!busqueda && (
                  <Link href="/create" className="text-red-500 text-xs font-black tracking-widest hover:text-white transition-colors uppercase border-b border-red-500 pb-1">
                    Initialize First Uplink →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* FOOTER DECORATION */}
        <div className="mt-20 flex justify-between items-center border-t border-slate-900 pt-8">
            <div className="flex gap-4">
                <div className="h-1 w-1 bg-slate-800" />
                <div className="h-1 w-1 bg-slate-800" />
                <div className="h-1 w-1 bg-slate-800" />
            </div>
            <p className="text-[8px] font-mono text-slate-700 tracking-[0.5em]">SYSTEM VERSION 2.0.4-STABLE</p>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #020617;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 10px;
        }
      `}</style>
    </main>
  )
}