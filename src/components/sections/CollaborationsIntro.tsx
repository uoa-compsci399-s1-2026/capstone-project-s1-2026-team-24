"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

// The "Research Collaborations + Pathway" intro section on the Collaborations
// page. Fixed copy, translated via the shared dictionary.
export default function CollaborationsIntro() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const RESEARCH_PATHWAY = [
    t.collaborations.pathwayEarlyInception,
    t.collaborations.pathwayProtocolDevelopment,
    t.collaborations.pathwayEthicalApproval,
    t.collaborations.pathwayCompletionTrials,
    t.collaborations.pathwayDataAnalysis,
    t.collaborations.pathwayInterpretation,
    t.collaborations.pathwayReportWriting,
  ];

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
              {t.collaborations.researchPartnershipsTitle}
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
              {t.collaborations.researchPartnershipsText}
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
                {t.collaborations.researchPathwayTitle}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {RESEARCH_PATHWAY.map((step, i) => (
                  <div
                    key={step}
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
              <Image
                src="/Our Team.jpg"
                alt="Research collaboration"
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                style={{ objectFit: "cover" }}
              />
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
                  {t.collaborations.complianceTitle}
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
                {t.collaborations.complianceText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
