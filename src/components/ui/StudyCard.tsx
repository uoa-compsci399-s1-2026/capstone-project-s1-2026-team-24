"use client";

import Image from "next/image";
import Link from "next/link";

interface StudyCardProps {
  title: string;
  subtitle?: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "center" | "right" | "left" | "top" | "bottom";
}

export default function StudyCard({
  title,
  subtitle,
  description,
  buttonLabel = "Find out more >",
  buttonHref,
  imageSrc,
  imageAlt,
  imagePosition = "center",
}: StudyCardProps) {
  const cardStyle = { boxShadow: "0 0 10px 10px rgba(0,0,0,0.05)" };
  const cardClass = "bg-white rounded-[20px] overflow-hidden flex flex-col transition-all duration-200";
  const hoverHandlers = buttonHref ? {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.outline = "2px solid #0c0c48";
      (e.currentTarget as HTMLElement).style.outlineOffset = "6px";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.outline = "none";
      (e.currentTarget as HTMLElement).style.outlineOffset = "0";
    },
  } : {};

  const inner = (
    <>
      <div className="relative w-full h-[280px] flex-shrink-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className={`object-cover object-${imagePosition}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col gap-4 px-[45px] py-8 flex-1">
        <h2 className="text-[#0c0c48] font-bold" style={{ fontSize: "32px", lineHeight: 1.2 }}>
          {title}
        </h2>
        {subtitle && <p className="text-[#0c0c48] text-[16px]">{subtitle}</p>}
        <p className="text-[#0c0c48] text-[16px] leading-relaxed">{description}</p>
      </div>
    </>
  );

  if (buttonHref) {
    return (
      <Link href={buttonHref} className={`${cardClass} hover:-translate-y-1`} style={cardStyle} {...hoverHandlers}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cardClass} style={cardStyle}>
      {inner}
    </div>
  );
}