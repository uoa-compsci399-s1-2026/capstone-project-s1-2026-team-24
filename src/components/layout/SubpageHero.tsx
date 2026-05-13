import type { CSSProperties, ReactNode } from 'react';

// Full navbar height = 40px white utility bar + 140px main nav row.
// Heroes use a negative margin-top equal to this height so the hero gradient
// sits behind the (partially transparent) main nav, letting both gradients
// blend smoothly per the Figma combined design.
export const NAVBAR_HEIGHT = 180;
export const UTILITY_BAR_HEIGHT = 40;

// Diagonal subpage hero gradient sampled from the Figma "Team page hero"
// component (node 2008:275 / 146:6446). #092d65 at the top-left through to
// #02a8d0 at the bottom-right; 112deg matches the home hero's gradient angle.
export const SUBPAGE_HERO_GRADIENT =
  'linear-gradient(112deg, #092d65 0%, #06699b 50%, #02a8d0 100%)';

type SubpageHeroProps = {
  title: string;
  subtitle: ReactNode;
  /** Optional override for the subtitle max-width in px at lg breakpoint. */
  subtitleMaxWidth?: number;
  /** Optional inline style override on the section (used sparingly). */
  style?: CSSProperties;
};

export default function SubpageHero({
  title,
  subtitle,
  subtitleMaxWidth,
  style,
}: SubpageHeroProps) {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center h-[380px] sm:h-[480px] lg:h-[554px]"
      style={{
        marginTop: `-${NAVBAR_HEIGHT}px`,
        paddingTop: `${UTILITY_BAR_HEIGHT}px`,
        backgroundImage: SUBPAGE_HERO_GRADIENT,
        backgroundColor: '#092d65',
        ...style,
      }}
    >
      {/* Diagonal Māori pattern overlay — matches Figma (rotate -12.38deg,
          opacity 0.25, centred at the bottom of the hero so the cluster sits
          across the lower-right). The brightness(0) invert(1) filter renders
          the pattern in white at low opacity, matching the Discover HNU page. */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            width: '4000px',
            height: '250px',
            top: '100%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-12.38deg)',
            opacity: 0.25,
            backgroundImage: 'url(/maori-pattern.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative px-6 sm:px-12 lg:px-[93px]">
        <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-normal">
          {title}
        </h1>
        <p
          className="text-lg sm:text-2xl lg:text-[32px] font-normal text-white/75 tracking-[0.64px] leading-tight mt-4"
          style={
            subtitleMaxWidth !== undefined
              ? { maxWidth: `${subtitleMaxWidth}px` }
              : undefined
          }
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
