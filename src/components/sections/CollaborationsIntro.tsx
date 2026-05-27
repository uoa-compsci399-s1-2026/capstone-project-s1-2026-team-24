import Image from "next/image";
import { COLLABORATIONS_INTRO_DEFAULTS } from "@/lib/blocks/collaborations-content";

// The "Research Collaborations + Pathway" intro section on the Collaborations
// page. Editable page-builder block: all copy and the image come from block
// content (resolved + machine-translated server-side before render). Empty
// props fall back to the shared defaults so a freshly-converted block renders
// unchanged.
//
// IMAGE NOTE: `image` is a resolved path string (a raw "/file.jpg" or the path a
// "media:{id}" ref resolved to). To swap it in code and keep it library-managed,
// set a raw path in the block content/seed/defaults (NOT here in JSX), drop the
// file in /public, and run `npm run catalog:media`. See
// src/lib/blocks/collaborations-content.ts for the full workflow.
interface CollaborationsIntroProps {
  sectionTitle?: string;
  sectionText?: string;
  pathwayTitle?: string;
  pathwaySteps?: string[];
  image?: string;
  imageAlt?: string;
  complianceTitle?: string;
  complianceText?: string;
}

export default function CollaborationsIntro({
  sectionTitle = COLLABORATIONS_INTRO_DEFAULTS.sectionTitle,
  sectionText = COLLABORATIONS_INTRO_DEFAULTS.sectionText,
  pathwayTitle = COLLABORATIONS_INTRO_DEFAULTS.pathwayTitle,
  pathwaySteps,
  image = COLLABORATIONS_INTRO_DEFAULTS.image,
  imageAlt = COLLABORATIONS_INTRO_DEFAULTS.imageAlt,
  complianceTitle = COLLABORATIONS_INTRO_DEFAULTS.complianceTitle,
  complianceText = COLLABORATIONS_INTRO_DEFAULTS.complianceText,
}: CollaborationsIntroProps) {
  const steps =
    pathwaySteps && pathwaySteps.length > 0
      ? pathwaySteps
      : [...COLLABORATIONS_INTRO_DEFAULTS.pathwaySteps];

  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div>
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#0c0c48",
                marginBottom: "16px",
                lineHeight: 1.2,
              }}
            >
              {sectionTitle}
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                color: "#4b5563",
                lineHeight: 1.7,
                marginBottom: "32px",
              }}
            >
              {sectionText}
            </p>

            <div
              style={{
                backgroundColor: "#0a4379",
                borderRadius: "0 30px",
                padding: "32px",
                height: "400px"
              }}
            >
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "white",
                  marginBottom: "20px",
                }}
              >
                {pathwayTitle}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {steps.map((step, i) => (
                  <div
                    key={`${i}-${step}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.85)",
                        margin: 0,
                      }}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div
              style={{
                borderRadius: "0 30px",
                overflow: "hidden",
                height: "396px",
                position: "relative",
              }}
            >
              {image ? (
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  style={{ objectFit: "cover" }}
                />
              ) : null}
            </div>

            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "30px 0",
                padding: "24px",
                border: "1px solid #e5e7eb",
                height: "150px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a4379"
                  strokeWidth="2.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#0a4379",
                    margin: 0,
                  }}
                >
                  {complianceTitle}
                </h3>
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {complianceText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
