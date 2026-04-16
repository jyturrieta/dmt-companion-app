"use client"
import { useState } from 'react'

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')

  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('')
  const [role, setRole] = useState('PILOTO')

  const [users, setUsers] = useState<any[]>([])
  const [message, setMessage] = useState<string | null>(null)

  async function createUser(e: any) {
    e.preventDefault()
    setMessage(null)
    const resp = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, nombre_completo: nombre, rol: role })
    })
    const j = await resp.json()
    if (j.error) setMessage(String(j.error))
    else setMessage(`Created. Temporary password: ${j.password}`)
  }

  async function fetchUsers() {
    setMessage(null)
    const resp = await fetch('/api/admin/list-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const j = await resp.json()
    if (j.error) setMessage(String(j.error))
    else setUsers(j.users || [])
  }

  async function delUser(u: string) {
    if (!confirm(`Delete ${u}?`)) return
    const resp = await fetch('/api/admin/delete-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u }) })
    const j = await resp.json()
    if (j.error) setMessage(String(j.error))
    else setMessage('Deleted')
    fetchUsers()
  }

  async function resetUser(u: string) {
    const resp = await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u }) })
    const j = await resp.json()
    if (j.error) setMessage(String(j.error))
    else setMessage(`New password for ${u}: ${j.password}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <div className="mb-4 p-4 bg-slate-900 rounded-lg">
        {/* Admin credentials removed: current logged-in user is used for auth */}
      </div>

      <div className="mb-6 p-4 bg-slate-900 rounded-lg">
        <h2 className="font-bold mb-2">Create user</h2>
        <form onSubmit={createUser} className="flex flex-col gap-2">
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} className="p-2 bg-slate-800" />
          <input placeholder="full name" value={nombre} onChange={e=>setNombre(e.target.value)} className="p-2 bg-slate-800" />
          <select value={role} onChange={e=>setRole(e.target.value)} className="p-2 bg-slate-800">
            <option value="PILOTO">PILOTO</option>
            <option value="ADMIN">INGENIERO</option>
            <option value="ADMIN_GENERAL">ADMIN</option>
          </select>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-emerald-600 rounded" type="submit">Create</button>
            <button type="button" onClick={fetchUsers} className="px-4 py-2 bg-sky-600 rounded">Refresh users</button>
          </div>
        </form>
      </div>

      <div className="p-4 bg-slate-900 rounded-lg">
        <h2 className="font-bold mb-2">Registered users</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-400"><th>User</th><th>Full name</th><th>Role</th><th></th></tr>
          </thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.username} className="border-t border-slate-800">
                <td className="py-2">{u.username}</td>
                <td className="py-2">{u.nombre_completo}</td>
                <td className="py-2">{u.rol}</td>
                <td className="py-2 flex gap-2">
                  <button onClick={()=>resetUser(u.username)} className="px-2 py-1 bg-yellow-600 rounded">Reset</button>
                  <button onClick={()=>delUser(u.username)} className="px-2 py-1 bg-red-600 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && <div className="mt-4 p-3 bg-slate-800 rounded">{message}</div>}
    </div>
  )
}
