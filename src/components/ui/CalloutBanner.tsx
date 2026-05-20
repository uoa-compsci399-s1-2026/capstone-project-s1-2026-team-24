// src/components/ui/CalloutBanner.tsx
import Link from "next/link";

interface CalloutBannerProps {
  tag?: string;
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}

export default function CalloutBanner({
  title,
  description,
  buttonLabel = "Find out more",
  buttonHref = "#",
  backgroundImage,
  backgroundColor = "linear-gradient(135deg, #0f2e75 0%, #0b4e93 48%, #0a95ca 100%)",
}: CalloutBannerProps) {
  return (
    <section
      className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        background: backgroundColor,
      }}
    >
      {/* Background image if provided */}
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
          borderRadius: "0 80px",
          padding: "50px",
          paddingRight: "80px",
          maxWidth: "550px",
          width: "100%",
          boxShadow: "0 0px 20px 20PX rgba(0,0,0,0.15)",
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

        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            color: "#4b5563",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        >
          {description}
        </p>

        <Link
          href={buttonHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0c0c48",
            color: "white",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            padding: "14px 28px",
            borderRadius: "9999px",
            textDecoration: "none",
          }}
        >
          {buttonLabel}
        </Link>
      </div>
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
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
