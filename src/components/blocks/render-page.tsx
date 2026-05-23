import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/BlockRenderer";

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

  return (
    <main id="main-content">
      {page.blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          type={block.type}
          content={block.content}
        />
      ))}
    </main>
  );
}
