import { jwtVerify, SignJWT } from "jose";

// Cookie and JWT metadata are kept in one place
// so middleware and auth routes always use the same contract.
const COOKIE_NAME = "admin_session";
const ALGORITHM = "HS256";
const ISSUER = "hnu-admin";
const AUDIENCE = "hnu-admin-users";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export function getAdminSessionCookieName() {
  return COOKIE_NAME;
}

export async function createAdminSessionToken() {
  const secret = getSecret();
  // Keep payload intentionally minimal; role is enough for this prototype.
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const secret = getSecret();
    // Verify both signature and registered claims to prevent token replay
    // across issuers/audiences and to enforce expiration.
    await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: [ALGORITHM],
    });
    return true;
  } catch {
    return false;
  }
}
