'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Trash2, Search, Trophy, Calendar, ChevronRight, Activity, MapPin } from 'lucide-react'

// Función auxiliar para formatear la fecha
const formatDate = (dateString: string) => {
  if (!dateString) return 'Fecha no disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
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
    // 1. Intentamos el Join. 
    // IMPORTANTE: Verifica que la tabla se llame 'tracks' (en minúscula) 
    // y que en la tabla 'sesiones' exista una columna que sea Foreign Key hacia 'tracks'.
    const { data, error } = await supabase
      .from('sesiones')
      .select(`
        *,
        tracks (
          name,
          location,
          country
        )
      `)
      .order('fecha', { ascending: false })

    if (error) {
      console.error("Error en Join:", error.message)
      
      // 2. MODO RESCATE: Si el Join falla, traemos solo sesiones
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('sesiones')
        .select('*')
        .order('fecha', { ascending: false })
      
      if (fallbackError) throw fallbackError
      setSesiones(fallbackData || [])
    } else {
      setSesiones(data || [])
    }
  } catch (error) {
    console.error("Error crítico cargando datos:", error)
  } finally {
    setLoading(false)
  }
}
  const borrarSesion = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    if (confirm('⚠️ ¿Estás seguro? Se borrarán todos los datos de telemetría de esta sesión.')) {
      try {
        const { error } = await supabase.from('sesiones').delete().eq('id', id)
        if (error) throw error
        setSesiones(prev => prev.filter(s => s.id !== id))
      } catch (error) {
        alert("Error al borrar la sesión")
        console.error(error)
      }
    }
  }

  // AJUSTE: El filtrado ahora busca también en el nombre de la pista relacionada
  const sesionesFiltradas = sesiones.filter(s => {
    const nombreTrack = (s.tracks?.nombre || s.nombre_circuito || "").toLowerCase()
    return nombreTrack.includes(busqueda.toLowerCase())
  })

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-12 bg-red-600 rounded-full"></div>
              <span className="text-red-500 font-mono text-xs font-bold tracking-[0.3em] uppercase">Race Analysis</span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white">
              TELEMETRY <span className="text-red-600">HUB</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors w-4 h-4" />
              <input 
  type="text"
  placeholder="Buscar por circuito o ciudad..." // <-- Placeholder más descriptivo
  className="w-full sm:w-64 bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 transition-all placeholder:text-slate-600"
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
/>
            </div>
            
            <Link 
              href="/create" 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 active:scale-95"
            >
              NUEVA SESIÓN
            </Link>
          </div>
        </div>

        {/* LISTADO DE TARJETAS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-mono text-sm">SINCRONIZANDO CON PIT LANE...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sesionesFiltradas.length > 0 ? (
              sesionesFiltradas.map((sesion) => (
                <Link key={sesion.id} href={`/dashboard/${sesion.id}`} className="group relative">
                  <div className="h-full bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 transition-all duration-300 hover:bg-slate-800 hover:border-red-600/50 hover:-translate-y-2 flex flex-col justify-between">
                    
                    <button 
                      onClick={(e) => borrarSesion(e, sesion.id)}
                      className="absolute top-6 right-6 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all z-20"
                      title="Eliminar sesión"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Activity size={16} className="text-red-600" />
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          {sesion.tipo_sesion || 'Sesión Técnica'}
                        </span>
                      </div>

                      <h3 className="text-3xl font-black italic uppercase text-white mb-6 leading-tight">
                        {sesion.nombre_evento || "Evento de Carrera"}
                      </h3>

                      {/* AQUÍ AGREGAMOS LA PISTA Y LA FECHA */}
                      <div className="space-y-2 mb-8">
                        <div className="flex items-center gap-2 text-red-400">
                          <MapPin size={14} />
                          <span className="text-sm font-bold uppercase tracking-wider">
                            {sesion.tracks?.location}, {sesion.tracks?.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-sm font-medium">{formatDate(sesion.fecha)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="text-xs font-bold text-slate-300 uppercase">Analizar Telemetría</span>
                      </div>
                      <div className="p-2 bg-red-600/10 rounded-full text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full border-2 border-dashed border-slate-800 rounded-[3rem] p-20 text-center">
                <p className="text-slate-500 text-xl font-medium mb-4">
                  {busqueda ? `No se encontraron resultados para "${busqueda}"` : "Tu garaje está vacío"}
                </p>
                {!busqueda && (
                  <Link href="/create" className="text-red-500 font-bold hover:underline">
                    Sube tu primer CSV para empezar el análisis →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
