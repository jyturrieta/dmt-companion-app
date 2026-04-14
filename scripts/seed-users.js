// Seed script for dmt-companion-app: crea usuarios de ejemplo (ingeniero/piloto)
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${derived}`
}

async function seed() {
  // Usar los valores que la DB acepta (mayúsculas): ADMIN, PILOTO
  const usuariosRaw = [
    { username: 'ingeniero1', password: 'pass123', nombre_completo: 'Ingeniero Demo', rol: 'ADMIN' },
    { username: 'piloto1', password: 'pass123', nombre_completo: 'Piloto Demo', rol: 'PILOTO' }
  ]

  // Añadimos un sufijo marker '$mc' en la contraseña hasheada para indicar "must change"
  const usuarios = usuariosRaw.map(u => ({
    username: u.username,
    password: hashPassword(u.password) + '$mc',
    nombre_completo: u.nombre_completo,
    rol: u.rol,
    must_change_password: true
  }))

  try {
    // Usamos upsert para no duplicar si ya existen
    let { data, error } = await supabase.from('usuarios').upsert(usuarios, { onConflict: 'username' }).select()
    if (error) {
      // Si la tabla no tiene la columna must_change_password, intentamos sin ese campo
      if (error.code === 'PGRST204' && String(error.message).toLowerCase().includes('must_change_password')) {
        console.warn('La columna must_change_password no existe, reintentando sin ese campo...')
        const usuariosNoFlag = usuarios.map(u => {
          const copy = { ...u }
          delete copy.must_change_password
          return copy
        })
        const resp = await supabase.from('usuarios').upsert(usuariosNoFlag, { onConflict: 'username' }).select()
        data = resp.data
        error = resp.error
      }
    }
    if (error) {
      console.error('Error al insertar usuarios:', error)
      process.exit(1)
    }
    console.log('Seed completado. Usuarios insertados/actualizados:')
    console.table(data)
    process.exit(0)
  } catch (err) {
    console.error('Error inesperado:', err)
    process.exit(1)
  }
}

seed()
