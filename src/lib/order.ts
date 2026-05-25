// Sort-order values are stored in Prisma `Int` columns (32-bit signed). A value
// beyond that range writes to SQLite fine but throws when Prisma reads the row
// back, which can crash any admin list that selects the column. Every endpoint
// that accepts a client-supplied order must funnel it through clampOrder so a
// bad value can never reach the database.
export const MAX_ORDER = 2_147_483_647; // 32-bit signed Int ceiling

/** Coerce any value to a storable order: an integer in [0, MAX_ORDER]. */
export function clampOrder(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(0, Math.trunc(n)), MAX_ORDER);
}
