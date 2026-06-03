import "server-only";
import { prisma } from "@/lib/prisma";

export type PartnerLogoRecord = {
  id: number;
  name: string;
  logoPath: string;
  websiteUrl: string;
  isPlaceholder: boolean;
  group: string;
};

/**
 * Reads partner logos straight from the database (public fields only), ordered
 * by group then display order.
 *
 * Single source of truth shared by the `/api/partner-logos` route (for client
 * components) and the OurPartners server component. Server components call this
 * directly rather than HTTP-fetching our own API during render — an SSR
 * self-fetch adds a needless round-trip and is fragile in dev.
 */
export function getPartnerLogos(): Promise<PartnerLogoRecord[]> {
  return prisma.partnerLogo.findMany({
    orderBy: [{ group: "asc" }, { order: "asc" }],
    select: {
      id: true,
      name: true,
      logoPath: true,
      websiteUrl: true,
      isPlaceholder: true,
      group: true,
    },
  });
}
