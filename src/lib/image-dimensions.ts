import { imageSize } from "image-size";

/**
 * Best-effort pixel dimensions for an image buffer. Returns null if the format
 * can't be parsed (so callers can still store the asset without dimensions).
 * Pure-JS (image-size) — no native deps; uploads are admin-only so the input is
 * trusted.
 */
export function getImageDimensions(
  buffer: Buffer | Uint8Array,
): { width: number; height: number } | null {
  try {
    const { width, height } = imageSize(
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer),
    );
    if (typeof width === "number" && typeof height === "number") {
      return { width, height };
    }
  } catch {
    // Unsupported/corrupt image — dimensions are optional.
  }
  return null;
}
