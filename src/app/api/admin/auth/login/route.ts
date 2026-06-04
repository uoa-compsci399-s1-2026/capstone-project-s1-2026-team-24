import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieName,
  requireStrongSecret,
} from "@/lib/admin-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";

// Per-IP brute-force throttle on the login endpoint.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Constant-time comparison over fixed-length SHA-256 digests. Hashing first
// guarantees equal-length inputs to timingSafeEqual (which throws on length
// mismatch) and prevents the secret's length from leaking through timing.
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  // Throttle by client IP first, so brute-forcing is bounded regardless of
  // whether the submitted password is correct. The IP comes from the
  // trusted-proxy helper, so it can't be cheaply spoofed to dodge the limit.
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, {
    max: LOGIN_MAX_ATTEMPTS,
    windowMs: LOGIN_WINDOW_MS,
  });
  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
    if (rateLimit.retryAfterSeconds) {
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    }
    return response;
  }

  let expectedPassword: string;
  try {
    expectedPassword = requireStrongSecret(
      process.env.ADMIN_PASSWORD,
      "ADMIN_PASSWORD",
      12,
    );
  } catch {
    return NextResponse.json(
      { error: "Server auth config is missing or too weak" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  if (!safeEqual(password, expectedPassword)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // On success, issue a signed cookie token consumed by middleware.
  const token = await createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
