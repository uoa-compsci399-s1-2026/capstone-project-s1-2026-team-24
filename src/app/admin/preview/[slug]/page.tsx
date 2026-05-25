import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { renderPageBlocks } from "@/components/blocks/render-page";

// Admin-only draft preview of a page (gated by the /admin middleware, and the
// admin shell is bypassed in admin/layout.tsx). Renders the live/draft blocks
// with the real public chrome so editors can see unpublished changes before
// publishing. Shown in the editor's preview iframe.
export const dynamic = "force-dynamic";

export default async function PagePreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      <Navbar />
      {await renderPageBlocks(slug, { draft: true })}
      <Footer />
    </>
  );
}
