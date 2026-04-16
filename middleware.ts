// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export const runtime = 'experimental-edge';
export const dynamic = 'force-dynamic';
export function middleware(req: NextRequest) {
  const session = req.cookies.get('user_session')
  const role = req.cookies.get('user_role')
  const isLoginPage = req.nextUrl.pathname === '/login'

  // Si no hay sesión y no está en login, redirigir a login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si hay sesión e intenta ir a login, mandarlo al home
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Restricciones por rol: Solo los ingenieros o admin_general pueden crear sesiones o subir CSV
  const path = req.nextUrl.pathname
  const needsEngineer = path.startsWith('/cargar-csv') || path.startsWith('/create')
  if (needsEngineer && role?.value !== 'ingeniero' && role?.value !== 'admin_general') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Restricción para /admin: sólo admin_general puede acceder
  const isAdminArea = path.startsWith('/admin')
  if (isAdminArea && role?.value !== 'admin_general') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}