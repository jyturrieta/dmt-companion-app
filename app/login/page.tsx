'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 1. Buscamos al usuario por su username en tu tabla
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('password', password) // Nota: En producción esto debería ser comparando hashes
      .single()

    if (dbError || !usuario) {
      setError("Usuario o contraseña incorrectos")
      return
    }

    // 2. Guardamos la "sesión" manualmente en una Cookie para que el Middleware la vea
    // Usamos una cookie simple para este nivel de acceso
    document.cookie = `user_session=${usuario.username}; path=/; max-age=86400; SameSite=Lax`;
    
    // Opcional: Guardar rol o nombre en localStorage para la UI
    localStorage.setItem('user_data', JSON.stringify({
      nombre: usuario.nombre_completo,
      rol: usuario.rol
    }));

    router.push('/')
    router.refresh() // Forzar que el middleware se entere
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
            DAMATTA <span className="text-red-600">RACING</span>
          </h1>
          <p className="text-slate-500 text-xs font-mono mt-2 uppercase tracking-widest">Acesso Restrito</p>
        </div>
        
        {error && <p className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-xs mb-6 text-center font-bold uppercase tracking-tight">{error}</p>}
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="USERNAME" 
            className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600 transition-all font-mono"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-600 transition-all font-mono"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl mt-8 transition-all uppercase tracking-[0.2em] italic shadow-lg shadow-red-900/20">
          LOGIN
        </button>
      </form>
    </div>
  )
}