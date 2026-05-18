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
        height: "450px",
        marginTop: "0px",
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
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "45px",
        }}
      >
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "76px",
            fontWeight: 800,
            color: "white",
            margin: 0,
            lineHeight: 1.1,
            opacity: 0.75,
          }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}