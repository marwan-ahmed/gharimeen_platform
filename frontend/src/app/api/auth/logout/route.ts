import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  cookieStore.delete("user-role");
  
  // also need to sign out from firebase client side, but server cookies are the blocker for middleware here
  return NextResponse.redirect(new URL("/login", request.url));
}
