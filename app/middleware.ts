// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('is_logged_in')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Si no está logueado y no está en la página de login, lo mandamos al login
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está logueado e intenta ir al login, lo mandamos al inicio
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configurar en qué rutas se aplica el middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}