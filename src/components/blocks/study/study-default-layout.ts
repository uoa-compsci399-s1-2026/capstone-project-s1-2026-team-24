// The canonical "original" study layout, defined in code so it can ALWAYS be
// recovered from the admin panel — even if the shared template is emptied or
// broken. The reset endpoint writes these blocks into a study override (or into
// the template itself), so the original design can never become unrecoverable.
// Pure data — safe to import from client, server and scripts.
export const DEFAULT_STUDY_LAYOUT_BLOCKS: {
  type: string;
  content: Record<string, unknown>;
}[] = [
  { type: "studyHero", content: { eyebrow: "Our Studies", title: "", image: "" } },
  { type: "studyStatusBar", content: {} },
  { type: "studyDescription", content: {} },
  { type: "studyEligibility", content: {} },
  { type: "studyCompensation", content: {} },
  { type: "studyPdfs", content: {} },
  { type: "studyJoinButton", content: {} },
  { type: "studyContact", content: {} },
  { type: "studyEthics", content: {} },
];
