import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePublishedSnapshot } from "@/lib/page-publish";

export const runtime = "nodejs";

// List a page's saved revisions (most recent first). Returns lightweight
// metadata only — the full snapshot is fetched/applied by the restore endpoint.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const revisions = await prisma.pageRevision.findMany({
      where: { pageId: page.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, createdAt: true, content: true },
    });

    return NextResponse.json(
      revisions.map((r) => ({
        id: r.id,
        label: r.label,
        createdAt: r.createdAt,
        blockCount: parsePublishedSnapshot(r.content).length,
      })),
    );
  } catch (error) {
    console.error("Failed to list revisions:", error);
    return NextResponse.json(
      { error: "Failed to list revisions" },
      { status: 500 },
    );
  }
}
