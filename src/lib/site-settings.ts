import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_FAVICON,
  DEFAULT_LOGO_LIGHT,
  DEFAULT_LOGO_DARK,
  type SiteBranding,
} from "@/lib/branding";

// Site branding (favicon + navbar logos), editable from /admin/site-settings.
// Stored as a singleton SiteSettings row (id = 1) where an empty string means
// "use the built-in default asset" (constants in src/lib/branding.ts).

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/**
 * The raw stored row (empty strings preserved) — what the admin UI edits, so
 * it can tell "default" apart from an explicit upload. Missing row (fresh DB)
 * reads as all-defaults.
 */
export async function getRawSiteSettings(): Promise<SiteBranding> {
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return {
    faviconPath: row?.faviconPath ?? "",
    logoLightPath: row?.logoLightPath ?? "",
    logoDarkPath: row?.logoDarkPath ?? "",
  };
}

/**
 * Resolved branding for rendering: empty fields fall back to the built-in
 * defaults. Cached across requests (the navbar renders on every page — an
 * uncached read would cost a DB query per request); the admin save route
 * revalidates the tag.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteBranding> => {
    const raw = await getRawSiteSettings();
    return {
      faviconPath: raw.faviconPath || DEFAULT_FAVICON,
      logoLightPath: raw.logoLightPath || DEFAULT_LOGO_LIGHT,
      logoDarkPath: raw.logoDarkPath || DEFAULT_LOGO_DARK,
    };
  },
  ["site-settings"],
  { tags: [SITE_SETTINGS_CACHE_TAG] },
);
