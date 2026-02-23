'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { parseTelemetryCSV } from '@/services/csvProcessor'
import { supabase } from '@/lib/supabase'

export default function CargarCSV() {
  const searchParams = useSearchParams()
  const sesionId = searchParams.get('sesion_id')
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | any) => {
    // Soporta tanto el input tradicional como el drag & drop
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if (!file || !sesionId) return

    setLoading(true)
    try {
      const laps = await parseTelemetryCSV(file, sesionId)
      const { error } = await supabase.from('vueltas').insert(laps)

      if (error) throw error

      // Redirección con un pequeño delay para que el usuario vea el éxito
      router.push(`/dashboard/${sesionId}`)
    } catch (err: any) {
      alert("Error: " + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        
        {/* Encabezado de Proceso */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-slate-800"></div>
          <div className="text-center">
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.3em] block mb-2">Phase 02</span>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
              UPLOAD YOUR TELEMETRY FILE
            </h1>
          </div>
          <div className="flex-1 h-[1px] bg-slate-800"></div>
        </div>

        {/* Contenedor de Carga */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e); }}
          className={`
            relative group transition-all duration-500 rounded-3xl border-2 border-dashed
            ${loading ? 'border-red-600/50 bg-slate-900/50' : 
              isDragging ? 'border-red-500 bg-red-500/5 scale-[1.02]' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}
            p-12 md:p-20 text-center overflow-hidden
          `}
        >
          {/* Animación de fondo cuando carga */}
          {loading && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent animate-pulse"></div>
              <div className="h-[2px] w-full bg-red-600/50 absolute top-0 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-scan"></div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            {/* Icono dinámico */}
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500
              ${loading ? 'bg-red-600 animate-bounce' : 'bg-slate-800 group-hover:bg-slate-700 group-hover:rotate-6'}
            `}>
              {loading ? (
                <svg className="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-10 h-10 text-slate-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Processing Data Packets</h2>
                <div className="flex items-center justify-center gap-2">
                   <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                   <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Encrypting telemetry to Supabase...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Drop your Team Telemetry 25 - CSV here</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Drag and drop your telemetry file or click the button below to browse.
                </p>
                
                <label className="inline-block cursor-pointer">
                  <input 
                    type="file" accept=".csv" onChange={handleFileUpload} disabled={loading}
                    className="hidden"
                  />
                  <span className="mt-4 bg-white text-black hover:bg-red-600 hover:text-white transition-all font-black text-xs py-3 px-8 rounded-full uppercase tracking-widest inline-block shadow-xl">
                    Select File
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600 uppercase">Session Link:</span>
            <span className="text-[10px] font-mono text-red-500/80">{sesionId}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-600 uppercase">
            Format: Team Telemetry 25 - CSV
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}