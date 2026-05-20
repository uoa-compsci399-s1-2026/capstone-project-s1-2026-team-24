import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchNormalizedOrcidWorks } from "@/lib/orcid";
import {
  buildPublicationDedupKey,
  classifyPublicationRelevance,
  normalizePublicationTitle,
} from "@/lib/publication-filter";

type SyncMemberResult = {
  teamMember: string;
  orcidId: string;
  worksFound: number;
  syncedTitles: string[];
  skippedTitles: string[];
  error?: string;
};

async function syncPublicationsFromOrcid() {
  const members = await prisma.teamMember.findMany({
    where: {
      isVisible: true,
      orcidId: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      orcidId: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  if (members.length === 0) {
    return {
      syncedMembers: 0,
      failedMembers: 0,
      worksFound: 0,
      publicationsUpserted: 0,
      authorLinksUpserted: 0,
      skippedRejected: 0,
      skippedDuplicates: 0,
      results: [] as SyncMemberResult[],
      message:
        "No visible team members with an ORCID iD were found. Add an orcidId to a team member first.",
    };
  }

  const existingPublications = await prisma.publication.findMany({
    select: {
      id: true,
      title: true,
      year: true,
      doi: true,
      authorsRaw: true,
    },
  });

  const publicationByDoi = new Map<string, (typeof existingPublications)[number]>();
  const publicationByTitleYear = new Map<
    string,
    (typeof existingPublications)[number]
  >();

  for (const publication of existingPublications) {
    if (publication.doi?.trim()) {
      publicationByDoi.set(publication.doi.trim().toLowerCase(), publication);
    }

    publicationByTitleYear.set(
      buildPublicationDedupKey({
        title: publication.title,
        year: publication.year,
      }),
      publication,
    );
  }

  let totalWorksFound = 0;
  let totalPublicationsUpserted = 0;
  let totalAuthorLinksUpserted = 0;
  let failedMembers = 0;
  let skippedRejected = 0;
  let skippedDuplicates = 0;

  const results: SyncMemberResult[] = [];

  for (const member of members) {
    const orcidId = member.orcidId?.trim();

    if (!orcidId) continue;

    try {
      const works = await fetchNormalizedOrcidWorks(orcidId);
      totalWorksFound += works.length;

      const syncedTitles: string[] = [];
      const skippedTitles: string[] = [];
      const seenThisMember = new Set<string>();

      for (const work of works) {
        const relevance = classifyPublicationRelevance({
          title: work.title,
          journal: work.journal,
          abstract: work.abstract,
          pubType: work.pubType,
        });

        if (relevance.status === "Rejected") {
          skippedRejected += 1;
          skippedTitles.push(work.title);
          continue;
        }

        const doiKey = work.doi?.trim().toLowerCase() || null;
        const titleYearKey = buildPublicationDedupKey({
          title: work.title,
          year: work.year,
        });

        if (seenThisMember.has(doiKey || titleYearKey)) {
          skippedDuplicates += 1;
          skippedTitles.push(work.title);
          continue;
        }

        seenThisMember.add(doiKey || titleYearKey);

        let publication =
          doiKey && publicationByDoi.has(doiKey)
            ? publicationByDoi.get(doiKey) ?? null
            : publicationByTitleYear.get(titleYearKey) ?? null;

        if (publication) {
          const existingAuthors = publication.authorsRaw
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);

          const mergedAuthors = existingAuthors.includes(member.name)
            ? existingAuthors
            : [...existingAuthors, member.name];

          const updated = await prisma.publication.update({
            where: {
              id: publication.id,
            },
            data: {
              title: work.title,
              journal: work.journal,
              year: work.year,
              doi: work.doi,
              pubType: work.pubType,
              url: work.url,
              abstract: work.abstract,
              authorsRaw: mergedAuthors.join(", "),
              orcidSource: orcidId,
              status: relevance.status,
              matchedKeywords: relevance.matchedKeywords.join(", "),
              lastSyncedAt: new Date(),
            },
          });

          publication = {
            id: updated.id,
            title: updated.title,
            year: updated.year,
            doi: updated.doi,
            authorsRaw: updated.authorsRaw,
          };
        } else {
          const created = await prisma.publication.create({
            data: {
              title: work.title,
              authorsRaw: member.name,
              journal: work.journal,
              year: work.year,
              doi: work.doi,
              pubType: work.pubType,
              url: work.url,
              abstract: work.abstract,
              affiliation: "Human Nutrition Unit, University of Auckland",
              sourceType: work.sourceType,
              sourceId: `${orcidId}:${work.sourceId}`,
              orcidSource: orcidId,
              status: relevance.status,
              isVisible: true,
              hiddenManually: false,
              matchedKeywords: relevance.matchedKeywords.join(", "),
              lastSyncedAt: new Date(),
            },
          });

          publication = {
            id: created.id,
            title: created.title,
            year: created.year,
            doi: created.doi,
            authorsRaw: created.authorsRaw,
          };
        }

        if (publication.doi?.trim()) {
          publicationByDoi.set(publication.doi.trim().toLowerCase(), publication);
        }

        publicationByTitleYear.set(
          buildPublicationDedupKey({
            title: publication.title,
            year: publication.year,
          }),
          publication,
        );

        await prisma.publicationAuthor.upsert({
          where: {
            publicationId_teamMemberId: {
              publicationId: publication.id,
              teamMemberId: member.id,
            },
          },
          update: {
            order: 1,
          },
          create: {
            publicationId: publication.id,
            teamMemberId: member.id,
            order: 1,
          },
        });

        totalPublicationsUpserted += 1;
        totalAuthorLinksUpserted += 1;
        syncedTitles.push(work.title);
      }

      results.push({
        teamMember: member.name,
        orcidId,
        worksFound: works.length,
        syncedTitles,
        skippedTitles,
      });
    } catch (error) {
      console.error(`Failed to sync ORCID works for ${member.name} (${orcidId}):`, error);

      failedMembers += 1;
      results.push({
        teamMember: member.name,
        orcidId,
        worksFound: 0,
        syncedTitles: [],
        skippedTitles: [],
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    syncedMembers: results.length - failedMembers,
    failedMembers,
    worksFound: totalWorksFound,
    publicationsUpserted: totalPublicationsUpserted,
    authorLinksUpserted: totalAuthorLinksUpserted,
    skippedRejected,
    skippedDuplicates,
    results,
  };
}

export async function POST() {
  try {
    const result = await syncPublicationsFromOrcid();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/admin/publications/sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync publications from ORCID." },
      { status: 500 },
    );
  }
}