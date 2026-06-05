import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  // Serve images directly instead of through Next's on-the-fly optimizer.
  // The optimizer (sharp) OOMs on small hosts (e.g. Render's 512MB Starter) when
  // resizing large source images, which left collaboration/study card images
  // broken in production. Source images are kept reasonably sized at commit time,
  // so direct serving is fine here.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
