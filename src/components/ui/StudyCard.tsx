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
  buttonHref = "#",
  imageSrc,
  imageAlt,
  imagePosition = "center",
}: StudyCardProps) {
  return (
    <Link
      href={buttonHref}
      className="bg-white rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:outline hover:outline-2 hover:outline-[#0c0c48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c0c48]"
      style={{ boxShadow: "0 0 10px 10px rgba(0,0,0,0.05)" }}
    >
      {/* Image */}
      <div className="relative w-full h-[280px] flex-shrink-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className={`object-cover object-${imagePosition}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-[45px] py-8 flex-1">
        <h2
          className="text-[#0c0c48] font-bold"
          style={{ fontSize: "32px", lineHeight: 1.2 }}
        >
          {title}
        </h2>

        {subtitle && <p className="text-[#0c0c48] text-[16px]">{subtitle}</p>}

        <p className="text-[#0c0c48] text-[16px] leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
