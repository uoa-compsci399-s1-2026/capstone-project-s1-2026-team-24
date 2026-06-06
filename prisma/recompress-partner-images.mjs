// One-off: recompress oversized partner logos in public/images/partners IN
// PLACE (same filename + format), because these paths are stored in the DB as
// Partner.logoPath — renaming or changing extension would break the refs. The
// Next image optimizer is deliberately off (images.unoptimized: true) for the
// 512MB box, so source size == wire size; shrinking the source is the win.
//
// Run from the repo root: node prisma/recompress-partner-images.mjs
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(process.cwd(), "public/images/partners");
const THRESHOLD = 100 * 1024; // only touch files larger than 100KB
const MAX_DIM = 600; // cap longest side; logos display <=~288px, so this is ~2x
const JPEG_QUALITY = 80;

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

const entries = await readdir(DIR);
let totalBefore = 0;
let totalAfter = 0;
const rows = [];

for (const name of entries) {
  const ext = path.extname(name).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;

  const full = path.join(DIR, name);
  const before = (await stat(full)).size;
  if (before < THRESHOLD) continue;

  const input = await readFile(full);
  let pipeline = sharp(input).resize({
    width: MAX_DIM,
    height: MAX_DIM,
    fit: "inside",
    withoutEnlargement: true,
  });
  pipeline =
    ext === ".png"
      ? pipeline.png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
      : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

  const output = await pipeline.toBuffer();
  // Never write a larger file than we started with.
  if (output.length >= before) continue;

  await writeFile(full, output);
  totalBefore += before;
  totalAfter += output.length;
  rows.push({ name, before, after: output.length });
}

rows.sort((a, b) => b.before - a.before);
console.log("Recompressed partner images (in place, same filename + format):\n");
for (const r of rows) {
  const pct = (100 * (1 - r.after / r.before)).toFixed(0);
  console.log(`  ${r.name}: ${kb(r.before)} -> ${kb(r.after)} (-${pct}%)`);
}
if (rows.length) {
  const pct = (100 * (1 - totalAfter / totalBefore)).toFixed(0);
  console.log(`\n  TOTAL: ${kb(totalBefore)} -> ${kb(totalAfter)} (-${pct}%)`);
} else {
  console.log("  (nothing over threshold)");
}
