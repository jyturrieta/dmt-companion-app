// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Consultamos si el usuario existe y la contraseña coincide
    const { data: user, error: dbError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('password', password) // En prod usaríamos hashes, para local esto sirve
      .single()

    if (user) {
      // Guardamos el rol y el nombre en una cookie simple (o localStorage para empezar)
      document.cookie = `user_role=${user.rol}; path=/`
      document.cookie = `is_logged_in=true; path=/`
      router.push('/') // Redirigir al dashboard
      router.refresh()
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold text-red-500 mb-6 text-center">Damatta Racing</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">User</label>
            <input 
              type="text" 
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-red-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-red-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors">
            Entrar
          </button>
        </div>
      </form>
    </div>
  )
}