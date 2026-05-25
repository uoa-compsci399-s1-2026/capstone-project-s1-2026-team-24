import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageEditorLoader from "@/components/admin/page-editor/PageEditorLoader";
import { publicPath } from "@/lib/blocks/page-paths";

export const dynamic = "force-dynamic";

export default async function AdminPageEditorRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { blocks: { orderBy: { position: "asc" } } },
  });

  if (!page) notFound();

  return (
    <PageEditorLoader
      slug={page.slug}
      title={page.title}
      previewHref={publicPath(page.slug)}
      initialBlocks={page.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        content: b.content,
        isVisible: b.isVisible,
      }))}
    />
  );
}
