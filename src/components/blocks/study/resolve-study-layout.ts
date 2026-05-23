import { prisma } from "@/lib/prisma";
import type { StudyData } from "./study-context";

// URL-safe Page slugs (reused by the admin /api/admin/pages endpoints).
export const STUDY_TEMPLATE_SLUG = "studylayout-__default__";

export function studyOverrideSlug(studySlug: string): string {
  return `studylayout-${studySlug}`;
}

export interface ResolvedLayoutBlock {
  id: number;
  type: string;
  content: string;
}

/**
 * Resolves a study's custom layout: a per-study override takes precedence over
 * the shared template. A layout with zero visible blocks is treated as absent so
 * the page falls back to its default rendering. Returns null when neither exists.
 */
export async function resolveStudyLayoutBlocks(
  studySlug: string,
): Promise<ResolvedLayoutBlock[] | null> {
  const visible = {
    blocks: { where: { isVisible: true }, orderBy: { position: "asc" } },
  } as const;

  const override = await prisma.page.findUnique({
    where: { slug: studyOverrideSlug(studySlug) },
    include: visible,
  });
  if (override && override.blocks.length > 0) return override.blocks;

  const template = await prisma.page.findUnique({
    where: { slug: STUDY_TEMPLATE_SLUG },
    include: visible,
  });
  if (template && template.blocks.length > 0) return template.blocks;

  return null;
}

// Convenience for routes (incl. the hardcoded ones): fetch the active study and
// its layout in one call. Returns null when the study is missing/inactive or has
// no custom layout, so the route renders its own default.
export async function getStudyLayoutForSlug(studySlug: string): Promise<{
  study: StudyRecord & { imagePath: string };
  blocks: ResolvedLayoutBlock[];
} | null> {
  const study = await prisma.study.findFirst({
    where: { slug: studySlug },
    include: { pdfs: { orderBy: [{ order: "asc" }, { uploadedAt: "asc" }] } },
  });
  if (!study || !study.isActive) return null;

  const blocks = await resolveStudyLayoutBlocks(studySlug);
  if (!blocks) return null;

  return { study, blocks };
}

type StudyRecord = {
  slug: string;
  title: string;
  fullDescriptionEn: string;
  fullDescriptionZh: string;
  eligibilityEn: string;
  eligibilityZh: string;
  compensationEn: string;
  compensationZh: string;
  redcapUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneZh: string;
  ethicsStatement: string;
  status: string;
  publishedAt: Date | null;
  pdfs: { id: number; title: string; pdfPath: string }[];
};

// Serialises a Prisma study (with pdfs) into the plain object passed to client blocks.
export function toStudyData(study: StudyRecord): StudyData {
  return {
    slug: study.slug,
    title: study.title,
    fullDescriptionEn: study.fullDescriptionEn,
    fullDescriptionZh: study.fullDescriptionZh,
    eligibilityEn: study.eligibilityEn,
    eligibilityZh: study.eligibilityZh,
    compensationEn: study.compensationEn,
    compensationZh: study.compensationZh,
    redcapUrl: study.redcapUrl,
    contactEmail: study.contactEmail,
    contactPhone: study.contactPhone,
    contactPhoneZh: study.contactPhoneZh,
    ethicsStatement: study.ethicsStatement,
    status: study.status,
    publishedAt: study.publishedAt ? study.publishedAt.toISOString() : null,
    pdfs: study.pdfs.map((pdf) => ({
      id: pdf.id,
      title: pdf.title,
      pdfPath: pdf.pdfPath,
    })),
  };
}
