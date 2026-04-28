import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PostureMaintenanceCallout() {
  const bgColor = '#eeeeee'; // solid background color

  return (
    <section 
      className="relative w-full overflow-hidden min-h-[595px] flex items-stretch"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative z-10 w-full max-w-[1512px] mx-auto flex flex-col lg:flex-row items-stretch">
        {/* Left Content */}
        <div className="flex-[1.2] py-20 px-[93px] flex flex-col justify-center">
          <h2 className="text-[40px] font-bold text-[#0a4479] leading-[50px] tracking-[0.4px] mb-8">
            Does the heterogeneity in the energy cost of posture maintenance reside in differential patterns of spontaneous weight-shifting?
          </h2>
          <p className="text-[20px] font-normal text-[#0a4479] leading-[35px] mb-12 max-w-[700px]">
            Due to sedentarity-associated disease risks, there is much interest in methods to increase low-intensity physical activity. In this context, it is widely assumed that altering posture allocation can modify energy expenditure (EE) to impact body-weight regulation and health. However, we have recently shown the existence of two distinct phenotypes pertaining to the energy cost of standing...
          </p>
          <div>
            <Link
              href="/research/posture-maintenance"
              className="inline-block bg-white/75 px-10 py-4 rounded-[10px] text-[24px] font-normal text-[#0c0c48] tracking-[0.48px] hover:bg-white transition-colors"
            >
              More Information
            </Link>
          </div>
        </div>

        {/* Right Image Container - Full Bleed */}
        <div className="flex-1 relative min-h-[595px]">
          <Image
            src="/spinal-page-clipboard.png"
            alt="Spinal page clipboard"
            fill
            className="object-cover object-right"
            priority
          />
          {/* Seamless Gradient Overlay: Fades from solid background color to transparent */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              background: `linear-gradient(to right, ${bgColor} 0%, ${bgColor} 10%, rgba(238, 238, 238, 0) 50%)` 
            }}
            aria-hidden="true" 
          />
        </div>
      </div>
    </section>
  );
}
