import Image from "next/image";
import Button from "./Button";
import RichText from "@/components/blocks/RichText";

type BgVariant = "dark" | "standard" | "light";

const bgColors: Record<BgVariant, string> = {
  dark: "#0a4379",
  standard: "#0a4379f2",
  light: "#1a6ab1e0",
};

interface InfoCardProps {
  title: string;
  paragraphs: string[];
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "center" | "right" | "left" | "top" | "bottom";
  cardBg?: BgVariant;
  showButton?: boolean;
}

export default function InfoCardRight({
  title,
  paragraphs,
  body,
  buttonLabel = "More Information",
  buttonHref = "#",
  imageSrc,
  imageAlt,
  imagePosition = "center",
  cardBg = "standard",
  showButton = false,
}: InfoCardProps) {
  const textContent = (fontSize: string, gap: string) =>
    body ? (
      <RichText
        html={body}
        className={`flex flex-col ${gap} text-white/85 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5`}
        style={{ fontFamily: "var(--font-inter), sans-serif", fontSize, lineHeight: 1.6 }}
      />
    ) : (
      <div className={`flex flex-col ${gap}`}>
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-white/85"
            style={{ fontFamily: "var(--font-inter), sans-serif", fontSize, lineHeight: 1.6 }}
          >
            {para}
          </p>
        ))}
      </div>
    );

  return (
    <section className="relative w-full bg-white overflow-hidden py-10">

      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex flex-col">
        <div className="relative w-full h-[280px] sm:h-[340px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={`object-cover object-${imagePosition}`}
            sizes="100vw"
          />
        </div>

        <div className="relative -mt-15 px-6">
          <div
            className="flex flex-col gap-5  p-6"
            style={{ backgroundColor: bgColors[cardBg], borderRadius: "40px 0" }}
          >
            <h2
              className="text-white font-bold"
              style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "28px", lineHeight: 1.2 }}
            >
              {title}
            </h2>
            {textContent("15px", "gap-3")}
            {showButton && (
              <div className="mt-2">
                <Button href={buttonHref} variant="white">{buttonLabel}</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:block py-16 px-12 lg:px-45">
        <div className="max-w-[1100px] mx-auto">
          <div className="relative flex flex-row items-center gap-0">
            <div
              className="relative rounded-[28px] overflow-hidden flex-1 -mr-65"
              style={{ height: "550px", zIndex: 9 }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className={`object-cover object-${imagePosition}`}
                sizes="70vw"
              />
            </div>

            <div
              className="relative z-10 flex-shrink-0 w-[550px] p-15 pl-20 flex flex-col gap-6"
              style={{ backgroundColor: bgColors[cardBg], borderRadius: "80px 0 80px 0" }}
            >
              <h2
                className="text-white font-bold"
                style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "32px", lineHeight: 1.2 }}
              >
                {title}
              </h2>
              {textContent("16px", "gap-4")}
              {showButton && (
                <Button href={buttonHref} variant="white">{buttonLabel}</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div
        className="hidden lg:flex absolute inset-0 overflow-hidden pointer-events-none items-center"
        aria-hidden="true"
      >
        <div
          className="w-full h-[200px]"
          style={{
            backgroundImage: "url(/maori-pattern.svg)",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            filter: "brightness(3) invert(0)",
            opacity: 0.25,
          }}
        />
      </div>

    </section>
  );
}