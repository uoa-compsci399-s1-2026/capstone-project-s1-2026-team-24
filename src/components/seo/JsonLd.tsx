import type { ReactElement } from "react";

/**
 * Renders a JSON-LD structured-data <script>. Pure server component (emits no
 * client JS). The inline script is permitted by the production CSP
 * (`script-src 'unsafe-inline'`, see src/lib/security-headers.ts) and the data
 * is always app-authored (never user input), so injecting it is safe.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }): ReactElement {
  return (
    <script
      type="application/ld+json"
      // The payload is data, not markup — escape "<" so a stray "</script>" in
      // any string value can't break out of the script element.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
