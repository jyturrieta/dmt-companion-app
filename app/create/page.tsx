'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevaSesion() {
  const [tracks, setTracks] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [trackId, setTrackId] = useState('')
  // Usamos el ID de la FK. Por defecto 1 (asumiendo que 1 es Qualy)
  const [tipoId, setTipoId] = useState(1) 
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getTracks = async () => {
      const { data } = await supabase.from('tracks').select('*').order('name')
      if (data) setTracks(data)
    }
    getTracks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase
      .from('sesiones')
      .insert([{ 
        nombre_evento: nombre, 
        track_id: parseInt(trackId),
        tipo_sesion_id: tipoId // Enviamos el ID numérico para la FK
      }])
      .select()
      .single()

    if (error) {
        console.error("Detalle del error:", error)
        alert("Error al crear sesión: " + error.message)
        setLoading(false)
        return
    }

    router.push(`/cargar-csv?sesion_id=${data.id}`)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-slate-800/50 p-6 border-b border-slate-800">
          <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">
            NEW <span className="text-red-600">SESSION</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Selector de Tipo (Botones que cambian el ID numérico) */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
              Session Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoId(1)} // ID para Qualy
                className={`py-3 rounded-xl font-black italic tracking-widest transition-all border ${
                  tipoId === 1 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                QUALIFYING
              </button>
              <button
                type="button"
                onClick={() => setTipoId(2)} // ID para Race
                className={`py-3 rounded-xl font-black italic tracking-widest transition-all border ${
                  tipoId === 2 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                RACE
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
              Event Identity
            </label>
            <input 
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-600 transition-all font-medium"
              placeholder="e.g. SPA GP - PRACTICE"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
              Location / Circuit
            </label>
            <select 
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:border-red-600 transition-all cursor-pointer font-medium"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              required
            >
              <option value="">Select circuit...</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.country.toUpperCase()} — {t.location}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest italic shadow-lg shadow-red-900/20"
          >
            {loading ? 'INITIALIZING...' : 'INITIALIZE TELEMETRY'}
          </button>
        </form>
      </div>
    </div>
  )
}