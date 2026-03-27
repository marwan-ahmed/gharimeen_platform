import { NextResponse } from 'next/server';
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

  // 1. إذا كان المستخدم غير مسجل دخول ويحاول الوصول لصفحة محمية
  if (!token && isProtectedPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 2. إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحات تسجيل الدخول
  if (token && isAuthPage) {
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    if (userRole === 'donor') return NextResponse.redirect(new URL('/donor-dashboard', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. التحقق الصارم من الصلاحيات (RBAC)
  if (token && isProtectedPage) {
    if (path.startsWith('/admin-dashboard') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/cases', request.url)); // بدلاً من 401، نرجعه للصفحة العامة
    }
    
    if (path.startsWith('/donor-dashboard') && userRole !== 'donor') {
      if (userRole === 'admin') return NextResponse.next();
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if ((path.startsWith('/dashboard') || path.startsWith('/apply')) && userRole !== 'gharim') {
      if (userRole === 'admin') return NextResponse.next();
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
};