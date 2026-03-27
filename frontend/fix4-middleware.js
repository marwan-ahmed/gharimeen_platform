const fs = require("fs"); const content = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const userRole = request.cookies.get("user-role")?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/register");

  const isProtectedPage =
    path.startsWith("/dashboard") ||
    path.startsWith("/donor-dashboard") ||
    path.startsWith("/admin-dashboard") ||
    path.startsWith("/apply");

  if (!token && isProtectedPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (token && isAuthPage) {
    if (userRole === "admin") return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    if (userRole === "donor") return NextResponse.redirect(new URL("/donor-dashboard", request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token && isProtectedPage) {
    if (userRole === "admin") {
      if (!path.startsWith("/admin-dashboard")) {
        return NextResponse.redirect(new URL("/admin-dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (userRole === "donor") {
      if (!path.startsWith("/donor-dashboard")) {
        return NextResponse.redirect(new URL("/donor-dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (userRole === "gharim" || userRole === "user") {
      if (!path.startsWith("/dashboard") && !path.startsWith("/apply")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/donor-dashboard/:path*",
    "/admin-dashboard/:path*",
    "/apply/:path*",
    "/login",
    "/register"
  ],
};`; fs.writeFileSync("src/middleware.ts", content);
