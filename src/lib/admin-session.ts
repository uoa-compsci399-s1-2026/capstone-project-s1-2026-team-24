import { jwtVerify, SignJWT } from "jose";

// Cookie and JWT metadata are kept in one place
// so middleware and auth routes always use the same contract.
const COOKIE_NAME = "admin_session";
const ALGORITHM = "HS256";
const ISSUER = "hnu-admin";
const AUDIENCE = "hnu-admin-users";

// Minimum length for a machine-generated secret (e.g. ADMIN_SESSION_SECRET).
const MIN_SECRET_LENGTH = 32;

// Well-known placeholder values that must never reach a production deploy —
// the .env.example default plus other obvious stand-ins.
const PLACEHOLDER_SECRETS = new Set([
  "replace-with-a-long-random-string",
  "change-me",
  "changeme",
  "secret",
  "password",
  "admin",
]);

/**
 * Returns `value` if it is a usable secret, otherwise throws. Always rejects a
 * missing value. In production it additionally fails closed on secrets that are
 * too short or a known placeholder, so a default can never silently reach the
 * deploy (B12). Outside production the strict checks are skipped so local dev
 * and tests can use short throwaway secrets. Edge-safe (no Node APIs), so it is
 * also reachable from middleware.
 */
export function requireStrongSecret(
  value: string | undefined,
  name: string,
  minLength: number = MIN_SECRET_LENGTH,
): string {
  // Trim first so a stray newline/space from a copy-paste can't slip a short or
  // placeholder value past the checks (and so the same secret is used verbatim
  // across environments regardless of surrounding whitespace).
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing ${name}`);
  }
  if (process.env.NODE_ENV === "production") {
    if (trimmed.length < minLength) {
      throw new Error(
        `${name} is too weak: it must be at least ${minLength} characters`,
      );
    }
    if (PLACEHOLDER_SECRETS.has(trimmed.toLowerCase())) {
      throw new Error(`${name} is set to a known placeholder value`);
    }
  }
  return trimmed;
}

function getSecret() {
  const secret = requireStrongSecret(
    process.env.ADMIN_SESSION_SECRET,
    "ADMIN_SESSION_SECRET",
  );
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
