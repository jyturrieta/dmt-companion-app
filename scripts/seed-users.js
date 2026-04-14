// Seed script for dmt-companion-app: crea usuarios de ejemplo (ingeniero/piloto)
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  // Usar los valores que la DB acepta (mayúsculas): ADMIN, PILOTO
  const usuarios = [
    { username: 'ingeniero1', password: 'pass123', nombre_completo: 'Ingeniero Demo', rol: 'ADMIN' },
    { username: 'piloto1', password: 'pass123', nombre_completo: 'Piloto Demo', rol: 'PILOTO' }
  ]

  try {
    // Usamos upsert para no duplicar si ya existen
    const { data, error } = await supabase.from('usuarios').upsert(usuarios, { onConflict: 'username' }).select()
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
