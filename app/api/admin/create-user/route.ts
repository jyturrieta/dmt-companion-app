import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

async function verifyAdminByCreds(supabase: any, username: string, password: string) {
  const { data: admin } = await supabase.from('usuarios').select('*').eq('username', username).single()
  if (!admin) return false
  const stored = admin.password
  if (typeof stored === 'string' && stored.startsWith('scrypt$')) {
    const parts = stored.split('$')
    const salt = parts[1]
    const hash = parts[2]
    const derived = crypto.scryptSync(password, salt, 64).toString('hex')
    if (derived !== hash) return false
  } else {
    if (stored !== password) return false
  }
  const rol = (admin.rol || '').toString().toUpperCase()
  return rol === 'ADMIN' || rol === 'ADMIN_GENERAL' || rol.includes('ADMIN')
}

function parseCookies(cookieHeader: string | null) {
  const map: Record<string,string> = {}
  if (!cookieHeader) return map
  cookieHeader.split(';').forEach(pair => {
    const idx = pair.indexOf('=')
    if (idx === -1) return
    const key = pair.slice(0, idx).trim()
    const val = pair.slice(idx + 1).trim()
    map[key] = decodeURIComponent(val)
  })
  return map
}

async function verifyAdminFromCookieHeader(supabase: any, cookieHeader: string | null) {
  const cookies = parseCookies(cookieHeader)
  const userCookie = cookies['user_session']
  const roleCookie = cookies['user_role']
  if (roleCookie && roleCookie === 'ingeniero') return true
  if (!userCookie) return false
  const { data: admin } = await supabase.from('usuarios').select('*').eq('username', userCookie).single()
  if (!admin) return false
  const rol = (admin.rol || '').toString().toUpperCase()
  return rol === 'ADMIN' || rol === 'ADMIN_GENERAL' || rol.includes('ADMIN')
}

function base64UrlToBase64(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = input.length % 4
  if (pad === 2) input += '=='
  else if (pad === 3) input += '='
  else if (pad === 1) input += '==='
  return input
}

function verifyJwtHS256(token: string, secret: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, sigB64] = parts
    const signing = `${headerB64}.${payloadB64}`
    const sig = Buffer.from(base64UrlToBase64(sigB64), 'base64')
    const computed = crypto.createHmac('sha256', secret).update(signing).digest()
    if (!crypto.timingSafeEqual(sig, computed)) return null
    const payloadJson = Buffer.from(base64UrlToBase64(payloadB64), 'base64').toString('utf8')
    const payload = JSON.parse(payloadJson)
    // check exp if present
    if (payload.exp && Date.now() / 1000 > payload.exp) return null
    return payload
  } catch (e) {
    return null
  }
}

function verifyAdminFromJWTHeader(req: Request) {
  const auth = req.headers && typeof req.headers.get === 'function' ? req.headers.get('authorization') : null
  if (!auth) return false
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return false
  const token = parts[1]
  const secret = process.env.ADMIN_JWT_SECRET || ''
  if (!secret) return false
  const payload: any = verifyJwtHS256(token, secret)
  if (!payload) return false
  const role = (payload.role || '').toString().toUpperCase()
  return role === 'ADMIN_GENERAL' || role === 'ADMIN' || role.includes('ADMIN')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const username = body?.username || body?.user || body?.name
    const { adminUsername, adminPassword } = body || {}
    const nombre_completo = body?.nombre_completo || body?.nombre || ''
    const rol = body?.rol || body?.role || 'PILOTO'
    if (!username) return NextResponse.json({ error: 'Missing parameters', received: Object.keys(body || {}) }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    let ok = false
    // 1) prefer JWT in Authorization: Bearer <token>
    ok = verifyAdminFromJWTHeader(req)
    // 2) cookie-based session (read from request headers)
    if (!ok) {
      const cookieHeader = (req.headers && typeof req.headers.get === 'function') ? req.headers.get('cookie') : null
      ok = await verifyAdminFromCookieHeader(supabase, cookieHeader)
    }
    // fallback to explicit creds if provided
    if (!ok && adminUsername && adminPassword) ok = await verifyAdminByCreds(supabase, adminUsername, adminPassword)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // generate random password
    const rawPassword = crypto.randomBytes(6).toString('base64')
    const salt = crypto.randomBytes(16).toString('hex')
    const derived = crypto.scryptSync(rawPassword, salt, 64).toString('hex')
    let hashed = `scrypt$${salt}$${derived}`
    // append marker to indicate must-change on first login
    hashed = `${hashed}$mc`

    let { error } = await supabase.from('usuarios').insert({ username, nombre_completo, password: hashed, rol, must_change_password: true })
    if (error) {
      const msg = String(error.message || '').toLowerCase()
      const code = String(error.code || '').toLowerCase()
      if (msg.includes('must_change_password') || code.includes('pgrst204') || msg.includes('column') ) {
        // retry without the optional column
        const resp = await supabase.from('usuarios').insert({ username, nombre_completo, password: hashed, rol })
        error = resp.error
      }
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, password: rawPassword })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
