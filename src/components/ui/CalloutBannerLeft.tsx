// src/components/ui/CalloutBannerLeft.tsx
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
  backgroundColor = "linear-gradient(112deg, #092d65 0%, #06699b 50%, #02a8d0 100%)",
  rightTitle,
  rightDescription,
  showButton = false,
}: CalloutBannerLeftProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: backgroundColor }}
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

      {/* ── Mobile layout ── */}
      <div className="lg:hidden relative z-10 flex flex-col gap-8 px-6 py-12">
        {/* White card first */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "40px 0",
            padding: "36px 32px",
            boxShadow: "0 0px 20px 20px rgba(0,0,0,0.15)",
          }}
        >
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "22px",
              fontWeight: 800,
              color: "#0c0c48",
              marginBottom: "12px",
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
              fontSize: "15px",
              color: "#4b5563",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          />

          {showButton && (
            <Link
              href={buttonHref}
              className="inline-flex items-center justify-center rounded-full bg-[#0c0c48] px-7 py-3 text-base font-semibold text-white no-underline"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {buttonLabel}
            </Link>
          )}
        </div>

        {/* Right text below */}
        {(rightTitle || rightDescription) && (
          <div>
            {rightTitle && (
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "white",
                  marginBottom: "12px",
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
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                }}
              >
                {rightDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop layout ── */}
      <div
        className="hidden lg:flex relative z-10 py-16 px-6 sm:px-12 lg:px-45"
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: "40px",
        }}
      >
        <div
          className="max-w-[1100px] mx-auto w-full"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "40px",
          }}
        >
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
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {buttonLabel}
              </Link>
            )}
          </div>

          {/* Right text */}
          {(rightTitle || rightDescription) && (
            <div style={{ flex: 1, maxWidth: "500px" }}>
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
        </div>
      </div>
    </section>
  );
}
