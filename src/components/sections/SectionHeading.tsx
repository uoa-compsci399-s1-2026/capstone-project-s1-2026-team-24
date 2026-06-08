// A heading band (e.g. "Check out our current studies!" on the home page).
// Extracted verbatim from the inline <section> markup so it can be a reorderable block.
//
// `align` controls where the heading sits within the band's vertical space:
//   - "center" shares the slack above and below the heading (used on the home
//     page, where piling it all on top read as too big a gap above the heading);
//   - "bottom" keeps the original bottom-aligned look (the default, so study
//     layout headings are unchanged).

const ALIGN_CLASSES = {
  center: "items-center",
  bottom: "items-end pb-6",
} as const;

export default function SectionHeading({
  text,
  heightClass = "h-32",
  align = "bottom",
}: {
  text: string;
  heightClass?: string;
  align?: keyof typeof ALIGN_CLASSES;
}) {
  return (
    <section
      className={`w-full ${heightClass} bg-white px-6 sm:px-12 lg:px-45 flex ${ALIGN_CLASSES[align]} justify-center`}
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
        {text}
      </h2>
    </section>
  );
}
