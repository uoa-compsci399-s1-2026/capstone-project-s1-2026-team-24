// Helpers for reading/writing PageBlock.content, which is a JSON string column.

import { getBlockDefinition } from "./registry";

export type BlockContent = Record<string, unknown>;

/** Tolerant parse used on the render path — never throws. */
export function parseBlockContent(raw: string | null | undefined): BlockContent {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as BlockContent;
    }
    return {};
  } catch {
    return {};
  }
}

export function serializeBlockContent(value: unknown): string {
  return JSON.stringify(value ?? {});
}

/**
 * Validates a block type + content for writing. Confirms the type is registered
 * and the content is a plain object. Returns the normalized content string.
 */
export function validateBlockForWrite(
  type: unknown,
  content: unknown,
):
  | { ok: true; type: string; content: string }
  | { ok: false; error: string } {
  if (typeof type !== "string" || !getBlockDefinition(type)) {
    return { ok: false, error: `Unknown block type: ${String(type)}` };
  }
  if (content === undefined || content === null) {
    return { ok: true, type, content: "{}" };
  }
  if (typeof content !== "object" || Array.isArray(content)) {
    return { ok: false, error: "Block content must be an object" };
  }
  return { ok: true, type, content: serializeBlockContent(content) };
}
