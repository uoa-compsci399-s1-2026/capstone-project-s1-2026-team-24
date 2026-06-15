import "server-only";

// The active-language dictionary shape, derived from the English source of
// truth. zh.ts must stay structurally assignable to this — enforced by
// src/app/api/test/i18n-dictionary-parity.test.ts.
export type Dictionary = (typeof import("@/messages/en"))["default"];

/**
 * Loads ONLY the active-language dictionary on the server, via dynamic import so
 * a single language's strings (~24KB) ride the RSC payload instead of both
 * en+zh (~48KB) being statically bundled into every client component that needs
 * translations. The result is passed to the client LanguageProvider as `dict`
 * and consumed through useLanguage().t.
 */
export async function getDictionary(lang: "EN" | "ZH"): Promise<Dictionary> {
  return lang === "ZH"
    ? (await import("@/messages/zh")).default
    : (await import("@/messages/en")).default;
}
