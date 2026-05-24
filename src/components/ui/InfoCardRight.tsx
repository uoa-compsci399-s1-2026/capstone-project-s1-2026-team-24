import Image from "next/image";
import Link from "next/link";
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
  /** Legacy plain-text paragraphs. Rendered only when `body` is empty. */
  paragraphs: string[];
  /** Rich-text HTML body (preferred). Sanitized on render by <RichText/>. */
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
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="max-w-[1512px] mx-auto">
        <div className="relative flex flex-col lg:flex-row items-center gap-0 z-9">
          {/* Image */}
          <div
            className="relative rounded-[28px] overflow-hidden flex-1 -mr-65"
            style={{ height: "550px" }}
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className={`object-cover object-${imagePosition}`}
              sizes="(max-width: 768px) 100vw, 70vw"
            />
          </div>

          {/* Blue text card */}
          <div
            className="relative z-10 flex-shrink-0 w-[340px] sm:w-[400px] lg:w-[550px] p-15 pl-20 flex flex-col gap-6"
            style={{
              backgroundColor: bgColors[cardBg],
              borderRadius: "80px 0 80px 0",
            }}
          >
            <h2
              className="text-white font-bold"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "32px",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>

            {body ? (
              <RichText
                html={body}
                className="flex flex-col gap-4 text-white/85 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  lineHeight: 1.6,
                }}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="text-white/85"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      lineHeight: 1.6,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {showButton && (
              <Button href={buttonHref} variant="white">
                {buttonLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            width: "4000px",
            height: "200px",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.25,
            backgroundImage: "url(/maori-pattern.svg)",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            filter: "brightness(3) invert(0)",
          }}
        />
      </div>
    </section>
  );
}
