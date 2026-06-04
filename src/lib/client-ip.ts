import { isIP } from "node:net";

// Number of trusted reverse proxies in front of the app. On Render the platform
// load balancer is the single trusted hop, and it appends the real client IP as
// the RIGHTMOST entry of `x-forwarded-for`. Reading the leftmost value (as the
// old contact handler did) is spoofable: a client can pre-seed the header and
// the proxy simply appends after it. We therefore read the entry our trusted
// proxy added — the one at (length - TRUSTED_PROXY_HOPS).
const TRUSTED_PROXY_HOPS = 1;

/**
 * Best-effort client IP for rate-limiting keys. Behind exactly one trusted proxy
 * (Render's load balancer) the rightmost `x-forwarded-for` entry is the real
 * client and is not client-spoofable. Every returned value is validated with
 * `net.isIP`, so a forged header can never inject a non-IP, null-byte, or
 * arbitrarily long string as a rate-limit key (which would otherwise let an
 * attacker mint unbounded/huge keys). Anything unrecognised collapses to
 * "unknown"; callers treat the result as an advisory throttling key, not an
 * authenticated identity.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      const index = Math.max(parts.length - TRUSTED_PROXY_HOPS, 0);
      const candidate = parts[index];
      if (candidate && isIP(candidate)) {
        return candidate;
      }
    }
  }

  // Fallback for proxies that only set x-real-ip. Still validated, so it cannot
  // be abused to inject an arbitrary key when x-forwarded-for is absent.
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp)) {
    return realIp;
  }

  return "unknown";
}
