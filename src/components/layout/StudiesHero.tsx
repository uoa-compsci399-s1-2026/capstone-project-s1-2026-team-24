import Image from "next/image";

type ImagePosition = "left" | "right" | "top" | "center" | "bottom";

interface StudyHeroProps {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  imagePosition?: ImagePosition;
}

export default function StudyHero({
  imageSrc,
  imageAlt = "",
  title,
  imagePosition = "center",
}: StudyHeroProps) {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "550px",
        marginTop: "-180px",
        overflow: "hidden",
      }}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        style={{ objectFit: "cover", objectPosition: imagePosition }}
        priority
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      <div
        className="px-6 sm:px-12 lg:px-45"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: "50px",
        }}
      >
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(40px, 6vw, 76px)",
            fontWeight: 800,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "1.52px",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
