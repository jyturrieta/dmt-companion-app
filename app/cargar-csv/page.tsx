'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { parseTelemetryCSV } from '@/services/csvProcessor'
import { supabase } from '@/lib/supabase'

export default function CargarCSV() {
  const searchParams = useSearchParams()
  const sesionId = searchParams.get('sesion_id')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !sesionId) return

    setLoading(true)
    try {
      // 1. Procesar el archivo localmente
      const laps = await parseTelemetryCSV(file, sesionId)
      
      // 2. Subir a Supabase en bloque (Bulk Insert)
      const { error } = await supabase.from('vueltas').insert(laps)

      if (error) throw error

      alert(`¡Éxito! Se cargaron ${laps.length} vueltas.`)
      router.push(`/dashboard/${sesionId}`) // Aún no existe, pero allá iremos
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Paso Final: Cargar Telemetría</h1>
      <p className="mb-8 text-slate-400">Sesión: {sesionId}</p>
      
      <div className="border-2 border-dashed border-slate-700 p-20 rounded-xl bg-slate-800">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          disabled={loading}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
        />
        {loading && <p className="mt-4 text-yellow-500 animate-pulse">Procesando y subiendo datos...</p>}
      </div>
    </div>
  )
}