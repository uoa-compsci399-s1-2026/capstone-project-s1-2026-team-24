import type { MetadataRoute } from "next";

// Pre-launch: serve a deny-all robots.txt so the test deployment never gets
// indexed (a stray link to the .onrender.com URL would otherwise let Google
// list it, and it would later compete with the real domain). At the official
// launch set ALLOW_INDEXING=1 in the host environment — no code change needed.
// Works together with the site-wide noindex in src/app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.ALLOW_INDEXING === "1";
  return {
    rules: allowIndexing
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
  };
}
