import React from 'react';
import Image from 'next/image';

export default function ResearchHero() {
  return (
    <section className="relative w-full h-[554px] overflow-hidden bg-[#0a4479]">
      {/* Hero background image / gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a4479] to-[#08355e]">
        {/* Diagonal Māori pattern overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute w-[4000px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12.38deg] opacity-25"
            style={{
              backgroundImage: 'url(/maori-pattern.svg)',
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
              filter: 'sepia(0.4) hue-rotate(153deg) saturate(2) brightness(2)',
            }}
          />
        </div>
      </div>

      {/* Content — Positioned to match Figma absolute coordinates */}
      <div className="relative h-full max-w-[1512px] mx-auto px-[93px]">
        <div className="absolute top-[228px] left-[93px]">
          <h1 className="text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-tight mb-2">
            Our Research
          </h1>
          <p className="text-[32px] font-normal text-white/75 tracking-[0.64px] leading-tight max-w-[626px]">
            Better health through nutrition science.<br />
            Explore our research in diet, disease, and clinical trials
          </p>
        </div>
      </div>
    </section>
  );
}
