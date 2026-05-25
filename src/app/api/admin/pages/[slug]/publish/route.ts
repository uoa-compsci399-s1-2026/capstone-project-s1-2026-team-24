import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { snapshotBlocks } from "@/lib/page-publish";

export const runtime = "nodejs";

// Keep a bounded history of published versions per page.
const MAX_REVISIONS = 20;

// Publish a page: snapshot its current visible (draft) blocks into
// Page.publishedContent — what the public site renders — and record a revision.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        blocks: { where: { isVisible: true }, orderBy: { position: "asc" } },
      },
    });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const snapshot = snapshotBlocks(page.blocks);
    const publishedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: page.id },
        data: { publishedContent: snapshot, publishedAt },
      });
      await tx.pageRevision.create({
        data: { pageId: page.id, content: snapshot, label: "Published" },
      });
      // Prune anything beyond the most recent MAX_REVISIONS.
      const stale = await tx.pageRevision.findMany({
        where: { pageId: page.id },
        orderBy: { createdAt: "desc" },
        skip: MAX_REVISIONS,
        select: { id: true },
      });
      if (stale.length > 0) {
        await tx.pageRevision.deleteMany({
          where: { id: { in: stale.map((r) => r.id) } },
        });
      }
    });

    return NextResponse.json({ ok: true, publishedAt: publishedAt.toISOString() });
  } catch (error) {
    console.error("Failed to publish page:", error);
    return NextResponse.json(
      { error: "Failed to publish page" },
      { status: 500 },
    );
  }
}
