import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, newPassword } = body
    if (!username || !newPassword) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    const salt = crypto.randomBytes(16).toString('hex')
    const derived = crypto.scryptSync(newPassword, salt, 64).toString('hex')
    const hashed = `scrypt$${salt}$${derived}`

    // Intentamos actualizar la contraseña y limpiar el flag si existe
    let { error } = await supabase.from('usuarios').update({ password: hashed, must_change_password: false }).eq('username', username)
    if (error) {
      // Si la columna no existe en el esquema, reintentamos solo con la contraseña
      if (String(error.message).toLowerCase().includes('must_change_password') || String(error.code).toLowerCase().includes('pgrst204')) {
        const resp = await supabase.from('usuarios').update({ password: hashed }).eq('username', username)
        error = resp.error
      }
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
