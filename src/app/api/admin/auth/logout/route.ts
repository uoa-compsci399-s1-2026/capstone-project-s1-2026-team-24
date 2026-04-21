import { NextResponse } from "next/server";
import { getAdminSessionCookieName } from "@/lib/admin-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Overwrite with empty value and immediate expiration.
  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
}
