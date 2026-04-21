import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error("Missing DATABASE_URL");
}

// Prisma 7 with SQLite requires an explicit adapter at runtime.
const adapter = new PrismaBetterSqlite3({ url: datasourceUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  // Reuse the same client during hot reload in development.
  globalForPrisma.prisma = prisma;
}
