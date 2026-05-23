// A centered heading band (e.g. "Check out our current studies!" on the home page).
// Extracted verbatim from the inline <section> markup so it can be a reorderable block.

export default function SectionHeading({
  text,
  heightClass = "h-32",
}: {
  text: string;
  heightClass?: string;
}) {
  return (
    <section
      className={`w-full ${heightClass} bg-white px-6 sm:px-12 lg:px-45 flex items-end justify-center pb-6`}
    >
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c0c48]">
        {text}
      </h2>
    </section>
  );
}
