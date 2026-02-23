'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevaSesion() {
  const [tracks, setTracks] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [trackId, setTrackId] = useState('')
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
      .insert([{ nombre_evento: nombre, track_id: parseInt(trackId) }])
      .select()
      .single()

    if (error) {
        alert("Error al crear sesión")
        setLoading(false)
        return
    }

    router.push(`/cargar-csv?sesion_id=${data.id}`)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header con estilo de sensor */}
        <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">
              NEW <span className="text-red-600">SESSION</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-mono tracking-widest uppercase mt-1">
              Data Acquisition Setup
            </p>
          </div>
          <div className="h-2 w-12 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 w-1/3 animate-pulse"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Input Nombre */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
              Event Identity
            </label>
            <input 
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all font-medium"
              placeholder="e.g. MONZA GP - QUALIFYING P1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* Select Circuito */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
              Location / Circuit
            </label>
            <div className="relative">
              <select 
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white appearance-none focus:outline-none focus:border-red-600 transition-all cursor-pointer font-medium"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                required
              >
                <option value="" className="text-slate-500">Select circuit from database...</option>
                {tracks.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900">
                    {t.country.toUpperCase()} — {t.location}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Botón Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest italic overflow-hidden shadow-lg shadow-red-900/20"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'INITIALIZING...' : 'INITIALIZE TELEMETRY'}
              {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            </span>
            {/* Efecto de brillo al pasar el mouse */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </form>

        <div className="bg-slate-800/30 p-4 border-t border-slate-800 flex justify-center">
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
            Tip: Be specific with the event name to easily identify sessions later.
          </p>
        </div>
      </div>
    </div>
  )
}