const HERO_BG_URL =
  'https://www.figma.com/api/mcp/asset/28e7c007-8c5a-446b-ba12-b77b0fc567e5';

// Full navbar height: h-10 (40px white utility bar) + h-[180px] (transparent main nav)
const NAVBAR_HEIGHT = 220;
// The main nav is transparent, so the hero background shows through it.
// paddingTop uses only the white utility bar (40px) so that justify-center
// places the text at the midpoint of the full visible blue area —
// 180px empty above (behind transparent nav) equals 180px empty below.
const UTILITY_BAR_HEIGHT = 110;

export default function TeamHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center"
      style={{
        height: '674px',
        marginTop: `-${NAVBAR_HEIGHT}px`,
        paddingTop: `${UTILITY_BAR_HEIGHT}px`,
        backgroundColor: '#0c0c48',
      }}
    >
      {/* Hero background image */}
      <img
        src={HERO_BG_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Diagonal Māori pattern overlay */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            width: '4018px',
            height: '296px',
            top: '50%',
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

      {/* Content — vertically centred in the full visible blue area */}
      <div className="relative px-[93px]">
        <h1 className="text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-normal">
          Our Team
        </h1>
        <p className="text-[32px] text-white/75 tracking-[0.64px] leading-normal mt-4">
          We&apos;re passionate about what we do.
          <br />
          Find out more about the people behind
          <br />
          the Human Nutrition Unit
        </p>
      </div>
    </section>
  );
}
