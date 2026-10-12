import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) return NextResponse.next();
  const token = request.cookies.get("snt_admin")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
  try {
    const session = await verifyAdminToken(token);
    if (!session) throw new Error("invalid");
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("snt_admin");
    return response;
  }
}

export const config = { matcher: ["/admin/:path*"] };
