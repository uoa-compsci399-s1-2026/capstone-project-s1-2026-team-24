const HERO_BG_URL =
  'https://www.figma.com/api/mcp/asset/22db2d9e-419c-4497-bf46-0a9ec9003bfb';

const NAVBAR_HEIGHT = 220;
const UTILITY_BAR_HEIGHT = 110;

export default function StudiesHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center h-[380px] sm:h-[480px] lg:h-[554px]"
      style={{
        marginTop: `-${NAVBAR_HEIGHT}px`,
        paddingTop: `${UTILITY_BAR_HEIGHT}px`,
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
            opacity: 0.25,
            backgroundImage: 'url(/maori-pattern.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
          }}
        />
      </div>

      <div className="relative px-6 sm:px-12 lg:px-[93px]">
        <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-normal">
          Our Studies
        </h1>
        <p className="text-lg sm:text-2xl lg:text-[32px] font-normal text-white/75 tracking-[0.64px] leading-normal mt-4 max-w-[655px]">
          Take part in advancing nutrition science.
          <br />
          Explore our current studies and how to get involved.
        </p>
      </div>
    </section>
  );
}
