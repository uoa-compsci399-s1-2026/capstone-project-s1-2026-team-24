import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { resolveBlockContents } from "@/lib/media-resolve";
import { parsePublishedSnapshot } from "@/lib/page-publish";

/**
 * Server helper that renders a page's blocks, in order, wrapped in the shared
 * <main id="main-content"> landmark. Pages call this between <Navbar /> and
 * <Footer />.
 *
 * By default the *published* snapshot is rendered (what the public site shows).
 * Pass `{ draft: true }` (used by the admin preview route) to render the current
 * live/draft blocks instead. A page that has never been published falls back to
 * its live blocks so it still renders before the first publish.
 */
export async function renderPageBlocks(
  slug: string,
  opts: { draft?: boolean } = {},
): Promise<ReactNode> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      blocks: {
        where: { isVisible: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!page) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[renderPageBlocks] No page found for slug: "${slug}"`);
    }
    return <main id="main-content" />;
  }

  const useDraft = opts.draft || page.publishedContent == null;
  const blocks = useDraft
    ? page.blocks.map((b) => ({ type: b.type, content: b.content }))
    : parsePublishedSnapshot(page.publishedContent);

  // Resolve any "media:{id}" image references to their current file paths so
  // block components keep receiving plain path strings.
  const contents = await resolveBlockContents(blocks.map((b) => b.content));

  return (
    <main id="main-content">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} type={block.type} content={contents[i]} />
      ))}
    </main>
  );
}
