import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

interface HomepageHeroProps {
  title?: string;
  buttonLabel?: string;
  buttonHref?: string;
  backgroundGradient?: string;
  heroImageSrc?: string;
}

export default function HomepageHero({
  title = "Unlock the power of food with \n the Human Nutrition Unit",
  buttonLabel = "JOIN A STUDY",
  buttonHref = "/contact",
  backgroundGradient = "linear-gradient(112deg, #0f2e75 0%, #0b4e93 50%, #0a95ca 100%)",
  heroImageSrc = "/images/homepage-hero-bowl.webp",
}: HomepageHeroProps = {}) {
  const titleLines = title.split("\n");

  return (
    <>
      {/* ── DESKTOP HERO (hidden on mobile) ── */}
      <section
        className="hidden md:block"
        style={{ maxWidth: "100%" }}
        aria-label="Human Nutrition Unit hero section"
      >
        <div
          className="relative min-h-[810px] md:px-15 md:pt-[280px] lg:px-15"
          style={{ background: backgroundGradient }}
        >
          <div
            className="pointer-events-none absolute bottom-[-400px] h-[1000px] w-[1000px]"
            style={{ left: "max(-400px, calc(50% - 1000px))" }}
          >
            <Image
              src={heroImageSrc}
              alt="Colourful salad bowl with fresh vegetables"
              fill
              priority
              sizes="900px"
              className="object-contain drop-shadow-2xl"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          <div
            className="max-w-[1400px] mx-auto"
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minHeight: "350px",
            }}
          >
            <div className="max-w-6xl text-center text-white lg:text-right">
              <h1
                className="leading-[1.05]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "72px",
                  fontWeight: 800,
                  opacity: 0.75,
                }}
              >
                {titleLines.map((line, i) => (
                  <Fragment key={i}>
                    {line}
                    {i < titleLines.length - 1 && <br />}
                  </Fragment>
                ))}
              </h1>
              <Link
                href={buttonHref}
                className="
    mt-15 inline-flex w-[300px] justify-center rounded-full
    px-10 py-3 font-bold tracking-wide text-white
    backdrop-blur-[40px]
    bg-white/10
    transition-all duration-300
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
    hover:bg-white/50
  "
                style={{
                  fontSize: "28px",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.3), 0 8px 32px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(255,255,255,0.1), inset 0 0 40px rgba(255,255,255,0.04)",
                }}
              >
                {buttonLabel}
              </Link>
            </div>
          </div>

          <div
            className="max-w-[1400px] mx-auto"
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              alignItems: "end",
              justifyContent: "flex-end",
              minHeight: "150px",
            }}
          >
            <div className="relative h-[120px] w-[300px] mr-[-20]">
              <Image
                src="/1000003090.png"
                alt="Uniservices logo"
                fill
                sizes="500px"
                className="object-contain"
                style={{ opacity: 0.5 }}
              />
            </div>
            <div
              className="m-5 h-[75px] w-[3px] bg-white/100 mr-[15]"
              aria-hidden="true"
              style={{ opacity: 0.5 }}
            />
            <div className="relative h-[120px] w-[200px]">
              <Image
                src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Large.png"
                alt="University of Auckland"
                fill
                sizes="122px"
                className="object-contain"
                style={{ opacity: 0.5 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE HERO (hidden on md+) ── */}
      <section
        className="md:hidden w-full relative overflow-hidden"
        aria-label="Human Nutrition Unit hero section"
        style={{
          background: backgroundGradient,
          height: "500px",
        }}
      >
        {/* Top label — the page <h1> on mobile (the desktop hero's <h1> is
            display:none here, so exactly one h1 is exposed per breakpoint). */}
        <h1
          className="absolute text-white text-center w-full"
          style={{
            top: "70px",
            margin: 0,
            fontSize: "24px",
            fontFamily: "inter",
            fontWeight: 700,
          }}
        >
          Human Nutrition Unit
        </h1>

        {/* Text — sits just above the bowl */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{
            bottom: "calc(52vw + 25px)",
            padding: "0 32px",
            overflow: "hidden",
            opacity: 0.75,
          }}
        >
          <div style={{ overflow: "hidden", width: "100%" }}>
            <p
              id="hnu-headline"
              className="text-white text-center"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                transition:
                  "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Unlock the power of food.
            </p>
          </div>
          <div style={{ overflow: "hidden", width: "100%" }}>
            <p
              id="hnu-sub"
              className="text-white text-center"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                transition:
                  "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              World-class nutrition science at the University of Auckland.
            </p>
          </div>
        </div>

        {/* Bowl */}
        <div
          id="bowl-spinner"
          className="absolute left-1/2 pointer-events-none"
          style={{
            bottom: "-50vw",
            transform: "translateX(-50%) rotate(0deg)",
            width: "160vw",
            height: "105vw",
            transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Image
            src={heroImageSrc}
            alt="Colourful salad bowl with fresh vegetables"
            fill
            priority
            sizes="100vw"
            className="object-contain drop-shadow-2xl"
          />
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
    (function() {
      var slides = [
        { headline: "Unlock the power of food", sub: "World-class nutrition science at the University of Auckland." },
        { headline: "Clinical trials", sub: "Participating in gold-standard human intervention studies." },
        { headline: "Dietary research", sub: "Understanding how what we eat shapes long-term health." },
        { headline: "Gut microbiome.", sub: "Exploring the link between diet, gut bacteria and wellbeing." },
        { headline: "Metabolic health", sub: "Investigating blood sugar, insulin and cardiovascular risk." },
        { headline: "Infant nutrition", sub: "Supporting healthy development from the very first days." },
        { headline: "Sports performance", sub: "Fuelling athletes with evidence-based nutritional strategies." },
        { headline: "Join a study", sub: "Volunteers welcome — help us advance the science of food." },
      ];
      var deg = 0;
      var idx = 0;

      setInterval(function() {
        deg += 45;
        idx = (idx + 1) % slides.length;

        var bowl = document.getElementById('bowl-spinner');
        var hl   = document.getElementById('hnu-headline');
        var sub  = document.getElementById('hnu-sub');

        if (bowl) bowl.style.transform = 'translateX(-50%) rotate(' + deg + 'deg)';

        if (hl && sub) {
          /* swap content and snap to left instantly */
          hl.textContent      = slides[idx].headline;
          sub.textContent     = slides[idx].sub;
          hl.style.transition  = 'none';
          sub.style.transition = 'none';
          hl.style.transform  = 'translateX(-100%)';
          hl.style.opacity    = '0';
          sub.style.transform = 'translateX(-100%)';
          sub.style.opacity   = '0';

          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              /* slide in from left — same moment as bowl rotates */
              hl.style.transition  = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              sub.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              hl.style.transform  = 'translateX(0)';
              hl.style.opacity    = '1';
              sub.style.transform = 'translateX(0)';
              sub.style.opacity   = '1';
            });
          });
        }
      }, 3000);
    })();
  `,
          }}
        />
      </section>
    </>
  );
}
