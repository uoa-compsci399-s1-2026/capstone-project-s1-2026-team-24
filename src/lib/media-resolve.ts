import "server-only";
import { prisma } from "@/lib/prisma";
import { parseBlockContent, serializeBlockContent } from "@/lib/blocks/validate";
import { parseMediaRef, toMediaRef } from "@/lib/media-refs";

// Deep-walk a parsed content value, collecting every media-ref id it contains.
function collectIds(value: unknown, ids: Set<number>): void {
  if (typeof value === "string") {
    const id = parseMediaRef(value);
    if (id !== null) ids.add(id);
  } else if (Array.isArray(value)) {
    for (const v of value) collectIds(v, ids);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectIds(v, ids);
  }
}

// Deep-replace media refs with resolved paths. An unresolved ref becomes "" so a
// dangling reference renders as no-image rather than a literal "media:42".
function replaceRefs(value: unknown, paths: Map<number, string>): unknown {
  if (typeof value === "string") {
    const id = parseMediaRef(value);
    return id !== null ? (paths.get(id) ?? "") : value;
  }
  if (Array.isArray(value)) return value.map((v) => replaceRefs(v, paths));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, replaceRefs(v, paths)]),
    );
  }
  return value;
}

function contentHasPath(value: unknown, target: string): boolean {
  if (typeof value === "string") return value === target;
  if (Array.isArray(value)) return value.some((v) => contentHasPath(v, target));
  if (value && typeof value === "object") {
    return Object.values(value).some((v) => contentHasPath(v, target));
  }
  return false;
}

/**
 * Resolves "media:{id}" references in a list of block content JSON strings to
 * the referenced MediaAsset file paths, in one batched query. Raw-path values
 * pass through unchanged (back-compat). Returns the input untouched when there
 * are no references to resolve.
 */
export async function resolveBlockContents(
  contents: string[],
): Promise<string[]> {
  // Cheap fast path: only blocks whose JSON actually contains a "media:" token
  // need parsing/serialization — most pages have none, so skip the work.
  if (!contents.some((c) => c.includes("media:"))) return contents;

  const parsed = contents.map((c) => parseBlockContent(c));
  const ids = new Set<number>();
  for (const c of parsed) collectIds(c, ids);
  if (ids.size === 0) return contents;

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, filePath: true },
  });
  const paths = new Map(assets.map((a) => [a.id, a.filePath]));
  return parsed.map((c) => serializeBlockContent(replaceRefs(c, paths)));
}

export interface MediaUsage {
  pageSlug: string;
  pageTitle: string;
  blockId: number;
  blockType: string;
}

/**
 * Finds every page block that references an asset — by id ("media:{id}") or by
 * its raw file path (legacy references). Used for the "where is this used"
 * view and to block deletion of an in-use asset.
 */
export async function findAssetUsage(asset: {
  id: number;
  filePath: string;
}): Promise<MediaUsage[]> {
  const ref = toMediaRef(asset.id);
  const candidates = await prisma.pageBlock.findMany({
    where: {
      OR: [{ content: { contains: ref } }, { content: { contains: asset.filePath } }],
    },
    select: {
      id: true,
      type: true,
      content: true,
      page: { select: { slug: true, title: true } },
    },
  });

  // `contains` can over-match (e.g. media:42 inside media:420), so confirm a
  // real id match or an exact raw-path value before reporting usage.
  return candidates
    .filter((b) => {
      const content = parseBlockContent(b.content);
      const ids = new Set<number>();
      collectIds(content, ids);
      return ids.has(asset.id) || contentHasPath(content, asset.filePath);
    })
    .map((b) => ({
      pageSlug: b.page.slug,
      pageTitle: b.page.title,
      blockId: b.id,
      blockType: b.type,
    }));
}
