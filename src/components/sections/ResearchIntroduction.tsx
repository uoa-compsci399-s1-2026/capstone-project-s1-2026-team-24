import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  "Overweight and obesity",
  "Weight control & appetite regulation",
  "Metabolic syndrome & dyslipidaemia",
  "Cardiovascular & diabetic risk"
];

export default function ResearchIntroduction() {
  return (
    <section className="relative w-full py-12 px-[93px] max-w-[1512px] mx-auto bg-white">
      {/* Breadcrumbs */}
      <nav className="mb-12 text-[20px] tracking-[0.4px] text-[#0c0c48]">
        <Link href="/about" className="hover:underline">About</Link>
        <span className="mx-2 font-normal"> {'>'} </span>
        <span className="font-bold">Our Research</span>
      </nav>

      {/* Main Content Box */}
      <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] p-16">
        <h2 className="text-[48px] font-bold text-[#0a4479] text-center leading-tight tracking-[0.96px] mb-16">
          HNU is a nutrition research facility within The University of Auckland, New Zealand’s most prestigious and largest University.
        </h2>

        <div className="flex flex-col lg:flex-row gap-20 items-stretch">
          {/* Left Description */}
          <div className="flex-1 text-[32px] font-normal text-[#0a4479] leading-tight tracking-[0.64px] space-y-8">
            <p>
              The Unit undertakes research to establish links between diet, health and disease prevention.
            </p>
            <p>
              We investigate the effects of whole foods, food components, bioactives and nutraceutical products on health and disease.
            </p>
            <p>
              Trials are carried out both as academic and commercial collaborations.
            </p>
          </div>

          {/* Right Categories (Pills) */}
          <div className="flex-1 flex flex-col justify-between gap-5">
            {CATEGORIES.map((category) => (
              <div
                key={category}
                className="flex items-center justify-center min-h-[100px] flex-1 border-[3px] border-[#0a4479] rounded-[66.5px] bg-white text-[24px] font-bold text-[#0a4479] text-center px-10 tracking-[0.48px]"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
