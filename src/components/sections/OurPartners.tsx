const PLACEHOLDER = '/images/team/no-team-member-picture.png';

const PARTNER_COUNT = 6;
const partners = Array.from({ length: PARTNER_COUNT }, (_, i) => ({
  id: i,
  src: PLACEHOLDER,
  alt: `Partner ${i + 1}`,
}));

export default function OurPartners() {
  return (
    <section className="bg-white py-14 sm:py-18 lg:py-24">
      <h2 className="text-2xl sm:text-3xl lg:text-[48px] font-bold text-[#0a4479] tracking-[0.96px] text-center mb-10 sm:mb-14 lg:mb-16">
        OUR PARTNERS
      </h2>

      {/* Marquee track */}
      <div className="overflow-hidden w-full" aria-label="Our partners">
        <div
          className="marquee-track items-center gap-8 sm:gap-12 lg:gap-16"
          aria-hidden="true"
        >
          {/* Render items twice for seamless loop */}
          {[...partners, ...partners].map((partner, idx) => (
            <div
              key={idx}
              className="flex-none w-[160px] sm:w-[200px] lg:w-[240px] h-[100px] sm:h-[120px] lg:h-[140px] bg-white border border-gray-200 rounded-lg flex items-center justify-center p-4 shadow-sm"
            >
              <img
                src={partner.src}
                alt={partner.alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
