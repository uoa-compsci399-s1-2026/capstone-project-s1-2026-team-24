// Built-in branding defaults + the shared shape. Pure data — safe to import
// from both client components (SiteSettingsContext) and server code
// (src/lib/site-settings.ts, which resolves the stored overrides).

export const DEFAULT_FAVICON = "/images/logos/hnu-logo.svg";
export const DEFAULT_LOGO_LIGHT = "/images/logos/hnu-logo.svg"; // white-on-dark
export const DEFAULT_LOGO_DARK = "/images/logos/hnu-logo-blue.png"; // blue-on-light

export type SiteBranding = {
  faviconPath: string;
  logoLightPath: string;
  logoDarkPath: string;
};
