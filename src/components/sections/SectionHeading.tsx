// A centered heading band (e.g. "Check out our current studies!" on the home page).
// Extracted verbatim from the inline <section> markup so it can be a reorderable block.
// The heading is vertically centred in the band so the chosen vertical space is
// shared above and below it, rather than all piled on top (which read as too big
// a gap above the heading). (Restored — this was dropped in the mobile merge.)

export default function SectionHeading({
  text,
  heightClass = "h-32",
}: {
  text: string;
  heightClass?: string;
}) {
  return (
    <section
      className={`w-full ${heightClass} bg-white px-6 sm:px-12 lg:px-45 flex items-center justify-center`}
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
        {text}
      </h2>
    </section>
  );
}
