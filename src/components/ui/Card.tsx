import React from "react";

interface CardProps {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
  tag?: string;
  footer?: React.ReactNode;
  className?: string;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export default function Card({
  title,
  description,
  imageSrc,
  imageAlt,
  href,
  tag,
  footer,
  className = "",
}: CardProps) {
  const cardClasses = [
    "bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col",
    href
      ? "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c0c48]"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const normalizedImageAlt = imageAlt?.trim() ? imageAlt.trim() : title;

  const content = (
    <>
      {imageSrc && (
        <div className="aspect-video overflow-hidden">
          <img
            src={imageSrc}
            alt={normalizedImageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {tag && (
          <span className="inline-block self-start mb-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00caef]/15 text-[#007a92]">
            {tag}
          </span>
        )}

        <h3 className="text-lg font-semibold text-[#0c0c48] leading-snug">
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">
            {description}
          </p>
        )}

        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-100">{footer}</div>
        )}
      </div>
    </>
  );

  if (href) {
    const external = isExternalHref(href);
    return (
      <a
        href={href}
        className={cardClasses}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return <article className={cardClasses}>{content}</article>;
}
