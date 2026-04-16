// Site identity
export const SITE_NAME = "HNU Auckland";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const CONTACT_EMAIL = "hnu@auckland.ac.nz";

// UoA brand colours (source: BRAND.md)
export const BRAND_COLORS = {
  /** Waitematā – Deep Blue. Primary background for navbars, headers, and key UI elements. */
  uoaWaitemata: "#0c0c48",
  /** Azure – Bright Blue. Secondary brand colour. */
  uoaAzure: "#1f2bd4",
  /** Māhina – Light Blue ("early morning light"). Secondary brand colour. */
  uoaMahina: "#00caef",
} as const;

// Audience categories for the contact form
export const CONTACT_AUDIENCE_CATEGORIES = [
  "Student",
  "Researcher / Academic",
  "Industry Partner",
  "Media",
  "General Public",
] as const;

export type ContactAudienceCategory = (typeof CONTACT_AUDIENCE_CATEGORIES)[number];
