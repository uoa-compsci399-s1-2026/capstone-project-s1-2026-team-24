import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeFileName } from "@/lib/media-upload";
import {
  getRawSiteSettings,
  SITE_SETTINGS_CACHE_TAG,
} from "@/lib/site-settings";

export const runtime = "nodejs";

const BRANDING_UPLOAD_PREFIX = "/uploads/branding/";

// Favicons are tiny; logos match the team-photo limit.
const MAX_FAVICON_SIZE = 1 * 1024 * 1024;
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

type Target = "favicon" | "logoLight" | "logoDark";

const TARGET_COLUMNS: Record<Target, "faviconPath" | "logoLightPath" | "logoDarkPath"> = {
  favicon: "faviconPath",
  logoLight: "logoLightPath",
  logoDark: "logoDarkPath",
};

function parseTarget(value: FormDataEntryValue | null): Target | null {
  return value === "favicon" || value === "logoLight" || value === "logoDark"
    ? value
    : null;
}

// SVG stays banned for uploads (stored-XSS stance shared with media uploads;
// the committed default logo IS an SVG, but resets restore that, uploads
// can't introduce new ones). Favicons additionally accept .ico — its MIME is
// inconsistent across browsers, so fall back to the extension.
function isAllowedFaviconFile(file: File): boolean {
  return (
    /^image\/(png|x-icon|vnd\.microsoft\.icon)$/i.test(file.type) ||
    /\.(png|ico)$/i.test(file.name)
  );
}

function isAllowedLogoFile(file: File): boolean {
  return /^image\/(png|webp)$/i.test(file.type) || /\.(png|webp)$/i.test(file.name);
}

// Remove a previously-uploaded branding file; never touches anything outside
// /public/uploads/branding (the committed default assets live elsewhere).
async function tryRemoveBrandingFile(filePath: string): Promise<void> {
  if (!filePath.startsWith(BRANDING_UPLOAD_PREFIX)) return;
  const relative = filePath.replace(/^\/+/, "");
  try {
    await unlink(path.join(process.cwd(), "public", relative));
  } catch (error) {
    console.warn("Branding file could not be removed:", error);
  }
}

async function saveBrandingFile(file: File): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "branding");
  await mkdir(uploadDir, { recursive: true });

  // Timestamped name: collision-free, and a fresh URL each upload busts the
  // browser's (aggressive) favicon cache.
  const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  await writeFile(
    path.join(uploadDir, safeFileName),
    Buffer.from(await file.arrayBuffer()),
  );
  return `${BRANDING_UPLOAD_PREFIX}${safeFileName}`;
}

/** Raw stored values ("" = built-in default) for the admin UI. */
export async function GET() {
  try {
    const settings = await getRawSiteSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/site-settings failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch site settings." },
      { status: 500 },
    );
  }
}

/**
 * Upload or reset one branding asset. Multipart form fields:
 * - target: "favicon" | "logoLight" | "logoDark"
 * - file:   the replacement image (omit when resetting)
 * - reset:  "true" to clear the override back to the built-in default
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const target = parseTarget(formData.get("target"));
    if (!target) {
      return NextResponse.json(
        { error: "target must be favicon, logoLight, or logoDark." },
        { status: 400 },
      );
    }
    const column = TARGET_COLUMNS[target];
    const reset = formData.get("reset") === "true";
    const file = formData.get("file");

    let newPath = "";
    if (!reset) {
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "file is required (or pass reset=true)." },
          { status: 400 },
        );
      }
      if (target === "favicon" ? !isAllowedFaviconFile(file) : !isAllowedLogoFile(file)) {
        return NextResponse.json(
          {
            error:
              target === "favicon"
                ? "Favicon must be a PNG or ICO file."
                : "Logo must be a PNG or WebP file.",
          },
          { status: 400 },
        );
      }
      const maxSize = target === "favicon" ? MAX_FAVICON_SIZE : MAX_LOGO_SIZE;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File must be under ${Math.round(maxSize / 1024 / 1024)}MB.` },
          { status: 400 },
        );
      }
      newPath = await saveBrandingFile(file);
    }

    const previous = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, [column]: newPath },
      update: { [column]: newPath },
    });

    // Clean up the file the old value pointed at (no-op for defaults/"").
    const previousPath = previous?.[column] ?? "";
    if (previousPath && previousPath !== newPath) {
      await tryRemoveBrandingFile(previousPath);
    }

    // expire:0 forces the next render to refetch (plain profile strings are
    // stale-while-revalidate — one request would still serve the old logo).
    revalidateTag(SITE_SETTINGS_CACHE_TAG, { expire: 0 });

    return NextResponse.json(
      {
        faviconPath: updated.faviconPath,
        logoLightPath: updated.logoLightPath,
        logoDarkPath: updated.logoDarkPath,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/admin/site-settings failed:", error);
    return NextResponse.json(
      { error: "Failed to update site settings." },
      { status: 500 },
    );
  }
}
