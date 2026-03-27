const fs = require('fs');
const content = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith('/login') || path.startsWith('/register'); 

  const isProtectedPage =
    path.startsWith('/dashboard') ||
    path.startsWith('/donor-dashboard') ||
    path.startsWith('/admin-dashboard') ||
    path.startsWith('/apply');

  // 1. Unauthenticated users cannot access protected pages
  if (!token && isProtectedPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users cannot access login/register pages
  if (token && isAuthPage) {
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    if (userRole === 'donor') return NextResponse.redirect(new URL('/donor-dashboard', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Strict RBAC validation
  if (token && isProtectedPage) {
    if (path.startsWith('/admin-dashboard') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/cases', request.url)); 
    }
    
    if (path.startsWith('/donor-dashboard') && userRole !== 'donor') {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if ((path.startsWith('/dashboard') || path.startsWith('/apply')) && userRole !== 'gharim') {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/donor-dashboard', request.url));   
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/donor-dashboard/:path*',
    '/admin-dashboard/:path*',
    '/apply/:path*',
    '/login',
    '/register'
  ],
};`;
fs.writeFileSync('src/middleware.ts', content);
