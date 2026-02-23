// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export function middleware(req: NextRequest) {
  const session = req.cookies.get('user_session')
  const isLoginPage = req.nextUrl.pathname === '/login'

  // Si no hay sesión y no está en login, redirigir a login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si hay sesión e intenta ir a login, mandarlo al home
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}