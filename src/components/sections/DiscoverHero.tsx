const NAVBAR_HEIGHT = 220;
const UTILITY_BAR_HEIGHT = 110;

export default function DiscoverHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center h-[380px] sm:h-[480px] lg:h-[554px]"
      style={{
        marginTop: `-${NAVBAR_HEIGHT}px`,
        paddingTop: `${UTILITY_BAR_HEIGHT}px`,
        backgroundColor: '#0c0c48',
      }}
    >
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
            opacity: 0.25,
            backgroundImage: 'url(/maori-pattern.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            filter: 'sepia(0.4) hue-rotate(153deg) saturate(2) brightness(2)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative px-6 sm:px-12 lg:px-[93px]">
        <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-normal">
          Discover HNU
        </h1>
        <p className="text-lg sm:text-2xl lg:text-[32px] font-normal text-white/75 tracking-[0.64px] leading-tight max-w-[697px] mt-4">
          Focused on better health through nutrition.
          <br />
          Learn more about our work and purpose
        </p>
      </div>
    </section>
  );
}
