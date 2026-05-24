import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { resolveBlockContents } from "@/lib/media-resolve";

/**
 * Server helper that renders a page's visible blocks, in order, wrapped in the
 * shared <main id="main-content"> landmark. Pages call this between <Navbar />
 * and <Footer />.
 */
export async function renderPageBlocks(slug: string): Promise<ReactNode> {
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

  // Resolve any "media:{id}" image references to their current file paths so
  // block components keep receiving plain path strings.
  const contents = await resolveBlockContents(
    page.blocks.map((block) => block.content),
  );

  return (
    <main id="main-content">
      {page.blocks.map((block, i) => (
        <BlockRenderer key={block.id} type={block.type} content={contents[i]} />
      ))}
    </main>
  );
}
