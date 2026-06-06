import "server-only";
import { prisma } from "@/lib/prisma";

export type RecentPublicationRecord = {
  id: number;
  title: string;
  authorsRaw: string;
  journal: string | null;
  year: number | null;
  pubType: string;
  url: string | null;
  doi: string | null;
};

const recentPublicationSelect = {
  id: true,
  title: true,
  authorsRaw: true,
  journal: true,
  year: true,
  pubType: true,
  url: true,
  doi: true,
} as const;

/**
 * The `limit` most recent approved/visible publications, narrow-selected for the
 * homepage "Recent Publications" cards.
 *
 * Single source of truth shared by the RecentPublications server wrapper, which
 * calls this directly instead of HTTP-fetching the whole /api/publications table
 * and slicing it in the browser. `year: { not: null }` mirrors the old
 * client-side `.filter(p => p.year)`; ordering + take run in SQLite so only
 * `limit` rows (and only the 8 card fields) ever leave the database.
 */
export async function getRecentPublications(
  limit: number,
): Promise<RecentPublicationRecord[]> {
  return prisma.publication.findMany({
    where: {
      status: "Approved",
      isVisible: true,
      hiddenManually: false,
      year: { not: null },
    },
    orderBy: [{ year: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: recentPublicationSelect,
  });
}
