import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

// Backfills ContactRecipient.labelEn/labelZh/order for the six original
// inquiry types (labels previously hardcoded in src/messages/en.ts / zh.ts).
// For environments updated via `prisma db push` (which skips the migration's
// backfill SQL). Idempotent: only touches rows whose labelEn is still empty.
// Run:
//   DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/backfill-inquiry-labels.ts

const ORIGINAL_LABELS: Record<string, { labelZh: string; order: number }> = {
  "Study Participant Enquiry": { labelZh: "研究参与者咨询", order: 1 },
  "Industry Partnership": { labelZh: "行业合作", order: 2 },
  "Internship or PhD Opportunity": { labelZh: "实习或博士机会", order: 3 },
  Donation: { labelZh: "捐赠", order: 4 },
  "General Enquiry": { labelZh: "一般咨询", order: 5 },
  Other: { labelZh: "其他", order: 6 },
};

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  });
  const prisma = new PrismaClient({ adapter });

  try {
    let updated = 0;
    for (const [category, { labelZh, order }] of Object.entries(
      ORIGINAL_LABELS,
    )) {
      const result = await prisma.contactRecipient.updateMany({
        where: { category, labelEn: "" },
        data: { labelEn: category, labelZh, order },
      });
      if (result.count > 0) {
        console.log(`• ${category}: labels backfilled`);
        updated += result.count;
      } else {
        console.log(`• ${category}: already labelled or missing — skipping`);
      }
    }
    console.log(`Done. ${updated} row(s) updated.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
