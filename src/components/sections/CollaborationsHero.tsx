const HERO_BG_URL =
  'https://www.figma.com/api/mcp/asset/28e7c007-8c5a-446b-ba12-b77b0fc567e5';

// Full navbar height: 40px white utility bar + 180px transparent main nav
const NAVBAR_HEIGHT = 220;

export default function CollaborationsHero() {
  return (
    <section
      className="relative w-full overflow-hidden h-[460px] sm:h-[560px] lg:h-[660px]"
      style={{
        marginTop: `-${NAVBAR_HEIGHT}px`,
        backgroundColor: '#0c0c48',
      }}
    >
      <img
        src={HERO_BG_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            width: '4018px',
            height: '296px',
            top: '85%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-8deg)',
            opacity: 0.35,
            backgroundImage: 'url(/maori-pattern.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            filter: 'sepia(0.4) hue-rotate(153deg) saturate(2) brightness(2)',
          }}
        />
      </div>

      {/*
        This inner div spans only the visible area below the navbar (top: NAVBAR_HEIGHT).
        justify-center then centres the text perfectly within that visible window,
        giving equal space above and below the heading+subtitle block.
      */}
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col justify-center pb-16 sm:pb-20 lg:pb-24 px-6 sm:px-12 lg:px-[93px]"
        style={{ top: `${NAVBAR_HEIGHT}px` }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-normal">
          Collaborations
        </h1>
        <p className="text-lg sm:text-2xl lg:text-[32px] font-normal text-white/75 tracking-[0.64px] leading-normal mt-2 max-w-[669px]">
          Building partnerships in nutrition research.
          <br />
          Learn more about our collaborative work and initiatives
        </p>
      </div>
    </section>
  );
}
