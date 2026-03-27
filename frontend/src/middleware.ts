import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const path = request.nextUrl.pathname;

  // مسارات المصادقة
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register');
  
  // المسارات المحمية
  const isProtectedPage = 
    path.startsWith('/dashboard') || 
    path.startsWith('/donor-dashboard') ||
    path.startsWith('/apply');

  // 1. إذا كان المستخدم غير مسجل دخول ويحاول الوصول لصفحة محمية
  if (!token && isProtectedPage) {
    const url = new URL('/login', request.url);
    // تذكر الصفحة التي حاول الوصول إليها لإعادته لها بعد تسجيل الدخول (اختياري لكن مفيد UX)
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 2. إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحات تسجيل الدخول/الإنشاء
  if (token && isAuthPage) {
    // يمكننا توجيهه للوحة تحكمه أو الصفحة الرئيسية، حالياً سنوجهه للرئيسية
    // سيقوم المكون الخاص بالتحقق بتحويله للوحة المناسبة له بناءً على نوعه
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// تحديد المسارات التي سيتم تشغيل الميدلوير عليها
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