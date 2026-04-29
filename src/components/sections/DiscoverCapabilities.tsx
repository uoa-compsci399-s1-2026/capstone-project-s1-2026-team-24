export default function DiscoverCapabilities() {
  return (
    <section className="relative overflow-hidden bg-[#eee]">
      {/*
        Desktop: image is absolutely positioned to fill the right ~75% of the section,
        bleeding flush to the top, right, and bottom edges.
        Gradient percentages match the Figma — the transition starts at 35.3% of the
        image container width so the #eee bg is solid until past the text column.
      */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 right-0"
        style={{ left: '25%' }}
      >
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to right, rgb(238,238,238) 35.3%, rgba(238,238,238,0.94) 39.9%, rgba(238,238,238,0.80) 42.2%, rgba(238,238,238,0.70) 44.7%, rgba(238,238,238,0.46) 46.9%, rgba(238,238,238,0) 55.1%)',
          }}
        />
        <img
          src="/capabilities.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Text — constrained to left ~45% on desktop, full-width on mobile/tablet */}
      <div className="relative z-10 max-w-[1512px] mx-auto px-4 sm:px-8 lg:px-[93px] py-14 sm:py-16 lg:py-20 flex flex-col justify-center lg:min-h-[755px]">
        <div className="lg:max-w-[45%]">
          <h3 className="text-2xl sm:text-3xl lg:text-[48px] font-bold text-[#0a4479] leading-tight tracking-[0.96px] mb-4 sm:mb-6">
            Capabilities
          </h3>
          <p className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] leading-relaxed tracking-[0.6px] mb-6 sm:mb-8">
            The Unit is equipped to deliver highly controlled and precise nutrition research.
            Capabilities include controlled diet provision, energy expenditure measurement,
            anthropometric assessments such as body composition analysis, and clinical
            procedures including phlebotomy and venous cannulation. Additional services include
            urine and faecal sample collection, with external nursing support available for
            overnight studies when required.
          </p>
          <a
            href="/research"
            className="text-base sm:text-xl lg:text-[30px] font-normal text-[#0a4479] underline tracking-[0.6px] hover:opacity-70 transition-opacity"
          >
            Read More →
          </a>
        </div>
      </div>

      {/* Mobile / tablet: image stacked below text in normal flow */}
      <div className="lg:hidden w-full h-[260px] sm:h-[360px]">
        <img
          src="/capabilities.jpg"
          alt="Research capabilities"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
