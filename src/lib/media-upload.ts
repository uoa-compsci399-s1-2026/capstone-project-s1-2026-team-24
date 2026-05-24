import { unlink } from "fs/promises";
import path from "path";

// Shared constants/helpers for the media upload + replace routes (kept in one
// place so the allow-list and limits can't drift between them).

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MEDIA_UPLOAD_PREFIX = "uploads/media";

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Raster formats only — SVG is excluded to avoid stored-XSS via uploaded markup.
export function isAllowedImage(file: File): boolean {
  return (
    /^image\/(png|jpe?g|webp|gif|avif)$/i.test(file.type) ||
    /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)
  );
}

// Remove a managed upload file; only ever touches files under uploads/media.
export async function tryRemoveFile(filePath: string): Promise<void> {
  const relative = filePath.replace(/^\/+/, "");
  if (!relative.startsWith(MEDIA_UPLOAD_PREFIX)) return;
  try {
    await unlink(path.join(process.cwd(), "public", relative));
  } catch (error) {
    console.warn("Media file could not be removed:", error);
  }
}
