import "server-only";
import sanitizeHtml from "sanitize-html";

// Allow-list for admin-authored rich text. Intentionally small: structural and
// inline formatting only — no script/style/iframe/img/event handlers. The
// `server-only` import keeps the (Node) sanitizer out of client bundles.
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Force a safe rel on every link to prevent reverse-tabnabbing.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

/** Sanitize a rich-text HTML string. Returns "" for empty/nullish input. */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, RICH_TEXT_OPTIONS).trim();
}
