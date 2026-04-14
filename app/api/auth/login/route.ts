import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body
    if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    const { data: usuario, error } = await supabase.from('usuarios').select('*').eq('username', username).single()
    if (error || !usuario) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const stored = usuario.password
    let match = false
    let needsPasswordChange = (usuario as any).must_change_password === true
    if (typeof stored === 'string' && stored.startsWith('scrypt$')) {
      const parts = stored.split('$')
      const salt = parts[1]
      const hash = parts[2]
      // marker de must-change si existe en parts[3] === 'mc'
      if (parts.length > 3 && parts[3] === 'mc') needsPasswordChange = true
      const derived = crypto.scryptSync(password, salt, 64).toString('hex')
      match = derived === hash
    } else {
      match = stored === password
    }

    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    return NextResponse.json({ success: true, user: { username: usuario.username, nombre_completo: usuario.nombre_completo, rol: usuario.rol }, needsPasswordChange })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
