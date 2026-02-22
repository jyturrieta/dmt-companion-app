'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevaSesion() {
  const [tracks, setTracks] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [trackId, setTrackId] = useState('')
  const router = useRouter()

  // Traer los circuitos de la base de datos
  useEffect(() => {
    const getTracks = async () => {
      const { data } = await supabase.from('tracks').select('*').order('name')
      if (data) setTracks(data)
    }
    getTracks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Insertar la sesión en Supabase
    const { data, error } = await supabase
      .from('sesiones')
      .insert([{ nombre_evento: nombre, track_id: parseInt(trackId) }])
      .select()
      .single()

    if (error) {
        alert("Error al crear sesión")
        return
    }

    // Ir a la página de carga de CSV pasando el ID de la sesión recién creada
    router.push(`/cargar-csv?sesion_id=${data.id}`)
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Evento</label>
          <input 
            className="w-full p-2 border rounded bg-slate-800 text-white"
            placeholder="Ej: GP de España - Qualy"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Circuito</label>
          <select 
            className="w-full p-2 border rounded bg-slate-800 text-white"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            required
          >
            <option value="">Selecciona un circuito...</option>
            {tracks.map(t => (
              <option key={t.id} value={t.id}>{t.country} - {t.location}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-red-600 p-2 rounded font-bold">
          Continuar a Carga de Datos
        </button>
      </form>
    </div>
  )
}