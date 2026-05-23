import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

// One-off, idempotent migration: converts legacy InfoCard `paragraphs: string[]`
// content into the rich-text `body` HTML field introduced in the rich-text PR.
// Run after deploying that change (and on the dev DB):
//   DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/migrate-blocks-richtext.ts
// Safe to run repeatedly — blocks that already have a non-empty `body` are skipped.

const INFO_CARD_TYPES = new Set(["infoCardLeft", "infoCardRight"]);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paragraphsToHtml(paragraphs: unknown): string | null {
  if (!Array.isArray(paragraphs)) return null;
  const parts = paragraphs
    .filter((p): p is string => typeof p === "string")
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${escapeHtml(p)}</p>`);
  return parts.length > 0 ? parts.join("") : null;
}

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  });
  const prisma = new PrismaClient({ adapter });
  try {
    const blocks = await prisma.pageBlock.findMany();
    let migrated = 0;
    for (const block of blocks) {
      if (!INFO_CARD_TYPES.has(block.type)) continue;

      let content: Record<string, unknown>;
      try {
        content = JSON.parse(block.content || "{}");
      } catch {
        continue;
      }

      const hasBody =
        typeof content.body === "string" && content.body.trim().length > 0;
      if (hasBody) continue;

      const html = paragraphsToHtml(content.paragraphs);
      if (!html) continue;

      const { paragraphs: _legacy, ...rest } = content;
      void _legacy;
      await prisma.pageBlock.update({
        where: { id: block.id },
        data: { content: JSON.stringify({ ...rest, body: html }) },
      });
      migrated++;
      console.log(`✓ migrated block #${block.id} (${block.type})`);
    }
    console.log(`Done. Migrated ${migrated} InfoCard block(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
