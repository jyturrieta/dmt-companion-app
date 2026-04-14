"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const sessionUser = document.cookie.match(/(^|;)\s*user_session=([^;]+)/)
      if (sessionUser) setUsername(decodeURIComponent(sessionUser[2]))
    } catch (e) {
      setUsername(null)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return alert('Usuario no identificado')
    if (newPass.length < 6) return alert('La contraseña debe tener al menos 6 caracteres')
    if (newPass !== confirmPass) return alert('Las contraseñas no coinciden')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword: newPass })
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        alert('Error al actualizar contraseña: ' + (json.error || 'unknown'))
        setLoading(false)
        return
      }

      // Actualizar localStorage cookie role/name si es necesario
      try {
        const stored = localStorage.getItem('user_data')
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.nombre = parsed.nombre || parsed.nombre_completo || parsed.nombre
          localStorage.setItem('user_data', JSON.stringify(parsed))
        }
      } catch (e) {}

      alert('Contraseña actualizada correctamente')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert('Error al actualizar contraseña: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-black mb-4 text-white">Change your password</h2>
        <p className="text-sm text-slate-400 mb-6">You must set a new password before continuing.</p>

        <div className="space-y-3">
          <input type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white" />
          <input type="password" placeholder="Confirm password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white" />
        </div>

        <button disabled={loading} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold">
          {loading ? 'Updating...' : 'Set new password'}
        </button>
      </form>
    </div>
  )
}
