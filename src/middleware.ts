import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAdminSessionCookieName,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Split admin page traffic from admin API traffic because
  // they require different unauthenticated responses.
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isPublicAdminPath =
    pathname === "/admin/login" || pathname.startsWith("/api/admin/auth/");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (isPublicAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAdminSessionCookieName())?.value;
  const isValid = token ? await verifyAdminSessionToken(token) : false;

  if (isValid) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    // API consumers expect JSON status instead of browser redirects.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Preserve target location so login can navigate back after success.
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
