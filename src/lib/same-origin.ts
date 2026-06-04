// State-changing HTTP methods that a cross-site page could forge against a
// cookie-authenticated admin. Safe methods (GET/HEAD/OPTIONS) are never CSRF
// vectors for mutations and always pass.
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

/**
 * Defence-in-depth CSRF check for the admin surface. The PRIMARY protection is
 * the SameSite=Strict session cookie; this adds a server-side origin assertion
 * so we don't rely solely on the browser honouring SameSite.
 *
 * Returns true when a request is allowed to proceed:
 *   - safe methods (GET/HEAD/OPTIONS/...) always pass;
 *   - for unsafe methods, if an Origin (or, as a fallback, Referer) header is
 *     present, its host must equal the request host;
 *   - if neither is present, it passes — a genuine cross-site browser request
 *     always sends Origin on unsafe methods, so absence implies a non-browser
 *     client, which carries no victim cookies and therefore can't be CSRF'd.
 *
 * Returns false only when a cross-origin (or malformed) Origin/Referer is seen
 * on a state-changing request.
 */
export function isSameOriginOrSafe(request: Request): boolean {
  if (!UNSAFE_METHODS.has(request.method.toUpperCase())) {
    return true;
  }

  const sourceHost = hostOf(
    request.headers.get("origin") ?? request.headers.get("referer"),
  );
  if (sourceHost === null) {
    // Either no Origin/Referer (non-browser client) or a malformed one. Treat a
    // *present but malformed* value as hostile; distinguish the two:
    const hasSource =
      request.headers.get("origin") !== null ||
      request.headers.get("referer") !== null;
    return !hasSource;
  }

  const targetHost =
    request.headers.get("host") ?? hostOf(request.url);
  return targetHost !== null && sourceHost === targetHost;
}
