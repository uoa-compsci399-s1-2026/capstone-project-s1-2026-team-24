import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePublishedSnapshot } from "@/lib/page-publish";
import { replaceDraftBlocks } from "@/lib/page-draft-ops";

export const runtime = "nodejs";

// Discard unpublished changes: replace the live (draft) blocks with the current
// published snapshot, so the draft matches what's live again.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    if (page.publishedContent == null) {
      // Nothing has been published yet — nothing to revert to.
      return NextResponse.json({ ok: true, noop: true });
    }

    await replaceDraftBlocks(page.id, parsePublishedSnapshot(page.publishedContent));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to discard page changes:", error);
    return NextResponse.json(
      { error: "Failed to discard changes" },
      { status: 500 },
    );
  }
}
