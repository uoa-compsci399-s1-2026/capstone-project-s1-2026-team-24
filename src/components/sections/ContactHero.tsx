const HERO_BG_URL = 'https://www.figma.com/api/mcp/asset/28e7c007-8c5a-446b-ba12-b77b0fc567e5';

const NAVBAR_HEIGHT = 220;
const UTILITY_BAR_HEIGHT = 110;

export default function ContactHero() {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center h-[420px] sm:h-[500px] lg:h-[594px]"
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
            opacity: 0.35,
            backgroundImage: 'url(/maori-pattern.svg)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            filter: 'sepia(0.4) hue-rotate(153deg) saturate(2) brightness(2)',
          }}
        />
      </div>

      <div className="relative px-6 sm:px-12 lg:px-[93px]">
        <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-extrabold text-white/75 tracking-[1.52px] leading-normal">
          Contact Us
        </h1>
        <p className="text-lg sm:text-2xl lg:text-[32px] font-normal text-white/75 tracking-[0.64px] leading-normal mt-2">
          Have a question or enquiry?
          <br />
          Get in touch with our team
        </p>
      </div>
    </section>
  );
}
