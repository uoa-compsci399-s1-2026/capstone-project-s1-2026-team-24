import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchNormalizedOrcidWorks } from "@/lib/orcid";
import { classifyPublicationRelevance } from "@/lib/publication-filter";

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
      worksFound: 0,
      publicationsUpserted: 0,
      authorLinksUpserted: 0,
      results: [],
      message:
        "No visible team members with an ORCID iD were found. Add an orcidId to a team member first.",
    };
  }

  let totalWorksFound = 0;
  let totalPublicationsUpserted = 0;
  let totalAuthorLinksUpserted = 0;

  const results: Array<{
    teamMember: string;
    orcidId: string;
    worksFound: number;
    syncedTitles: string[];
  }> = [];

  for (const member of members) {
    const orcidId = member.orcidId?.trim();

    if (!orcidId) continue;

    const works = await fetchNormalizedOrcidWorks(orcidId);
    totalWorksFound += works.length;

    const syncedTitles: string[] = [];

    for (const work of works) {
      const relevance = classifyPublicationRelevance({
        title: work.title,
        journal: work.journal,
        abstract: work.abstract,
        pubType: work.pubType,
      });

      let publication =
        work.doi && work.doi.trim()
          ? await prisma.publication.findFirst({
              where: {
                doi: work.doi,
              },
            })
          : null;

      if (publication) {
        publication = await prisma.publication.update({
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
            orcidSource: orcidId,
            status: relevance.status,
            matchedKeywords: relevance.matchedKeywords.join(", "),
            lastSyncedAt: new Date(),
          },
        });
      } else {
        publication = await prisma.publication.upsert({
          where: {
            sourceType_sourceId: {
              sourceType: work.sourceType,
              sourceId: work.sourceId,
            },
          },
          update: {
            title: work.title,
            journal: work.journal,
            year: work.year,
            doi: work.doi,
            pubType: work.pubType,
            url: work.url,
            abstract: work.abstract,
            orcidSource: orcidId,
            status: relevance.status,
            matchedKeywords: relevance.matchedKeywords.join(", "),
            lastSyncedAt: new Date(),
          },
          create: {
            title: work.title,
            authorsRaw: "",
            journal: work.journal,
            year: work.year,
            doi: work.doi,
            pubType: work.pubType,
            url: work.url,
            abstract: work.abstract,
            affiliation: "Human Nutrition Unit, University of Auckland",
            sourceType: work.sourceType,
            sourceId: work.sourceId,
            orcidSource: orcidId,
            status: relevance.status,
            isVisible: true,
            hiddenManually: false,
            matchedKeywords: relevance.matchedKeywords.join(", "),
            lastSyncedAt: new Date(),
          },
        });
      }

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
    });
  }

  return {
    syncedMembers: results.length,
    worksFound: totalWorksFound,
    publicationsUpserted: totalPublicationsUpserted,
    authorLinksUpserted: totalAuthorLinksUpserted,
    results,
  };
}

export async function GET() {
  try {
    const result = await syncPublicationsFromOrcid();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/test/publications-sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync publications from ORCID." },
      { status: 500 },
    );
  }
}