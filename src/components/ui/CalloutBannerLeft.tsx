// src/components/ui/CalloutBanner.tsx
import Link from "next/link";
import RichText from "@/components/blocks/RichText";

interface CalloutBannerLeftProps {
  tag?: string;
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  rightTitle?: string;
  rightDescription?: string;
  showButton?: boolean;
}

export default function CalloutBannerLeft({
  title,
  description,
  buttonLabel = "",
  buttonHref = "#",
  backgroundImage,
  backgroundColor = "linear-gradient(112deg,   #092d65 0%, #06699b 50%, #02a8d0 100%)",
  rightTitle,
  rightDescription,
  showButton = false,
}: CalloutBannerLeftProps) {
  return (
    <section
      className="relative w-full py-16 px-6 sm:px-12 lg:px-45 overflow-hidden"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "40px",
        background: backgroundColor,
      }}
    >
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 1,
            zIndex: 5,
          }}
        />
      )}

      {/* White card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          backgroundColor: "white",
          borderRadius: "80px 0",
          padding: "50px",
          paddingRight: "80px",
          maxWidth: "550px",
          width: "100%",
          boxShadow: "0 0px 20px 20px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "28px",
            fontWeight: 800,
            color: "#0c0c48",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>

        <RichText
          html={description}
          className="[&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:text-[#0c0c48] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            color: "#4b5563",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        />

        {showButton && (
          <Link
            href={buttonHref}
            className="inline-flex items-center justify-center rounded-full bg-[#0c0c48] px-7 py-3 text-base font-semibold text-white no-underline"
            style={{
              fontFamily: "Inter, sans-serif",
            }}
          >
            {buttonLabel}
          </Link>
        )}
      </div>

      {/* Right text */}
      {(rightTitle || rightDescription) && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            flex: 1,
            maxWidth: "500px",
          }}
        >
          {rightTitle && (
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "42px",
                fontWeight: 800,
                color: "white",
                marginBottom: "16px",
                lineHeight: 1.2,
              }}
            >
              {rightTitle}
            </h2>
          )}
          {rightDescription && (
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.6,
              }}
            >
              {rightDescription}
            </p>
          )}
        </div>
      )}

      <div
        className="absolute inset-0 overflow-hidden pointer-events-none hidden"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            width: "4000px",
            height: "250px",
            top: "100%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-18deg)",
            opacity: 0.25,
            backgroundImage: "url(/maori-pattern.svg)",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            filter: "brightness(0) invert(1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "4000px",
            height: "250px",
            top: "103%",
            left: "-6%",
            transform: "translate(-50%, -50%) rotate(-18deg)",
            opacity: 0.25,
            backgroundImage: "url(/maori-pattern.svg)",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>
    </section>
  );
}
