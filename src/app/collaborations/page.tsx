import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SubpageHero from "@/components/layout/SubpageHero";
import AcademicCollaborators from "@/components/sections/AcademicCollaborators";
import IndustryCollaborators from "@/components/sections/IndustryCollaborators";
import StudyCard from "@/components/ui/StudyCard";
import CalloutBanner from "@/components/ui/CalloutBanner";

export const metadata: Metadata = {
  title: "Collaborations | HNU Auckland",
  description:
    "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
};

const RESEARCH_PATHWAY = [
  "Early Inception Hypotheses",
  "Protocol Development",
  "Ethical And Regulatory Approval",
  "Completion Of Trials",
  "Data Analysis",
  "Interpretation",
  "Report Writing And Publication",
];

const ACADEMIC_BENEFITS = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Knowledge Exchange",
    description: "Access to cutting-edge research and expertise",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Student Training",
    description: "Opportunities for postgraduate research projects",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Joint Publications",
    description: "Co-authored research in leading journals",
  },
];

const INDUSTRY_BENEFITS = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Independent Expertise",
    description: "Rigorous, unbiased research you can trust",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Regulatory Compliance",
    description: "Full GCP compliance and ethics approval support",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Commercial Value",
    description: "Evidence-based results that drive product innovation",
  },
];

function BenefitsRow({ benefits }: { benefits: typeof ACADEMIC_BENEFITS }) {
  return (
    <section style={{ backgroundColor: "#f0f0f0", padding: "60px 45px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
          }}
        >
          {benefits.map((benefit) => (
            <div key={benefit.title} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "#0a4379",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {benefit.icon}
              </div>
              <h3
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0c0c48",
                  marginBottom: "8px",
                }}
              >
                {benefit.title}
              </h3>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CollaborationsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <SubpageHero
          title="Our Collaborations"
          subtitle={
            <>
              Building partnerships in nutrition research.
              <br /> Learn more about our collaborative
              <br /> work and initiatives.
            </>
          }
        />

        {/* Section 1 — Research Collaborations + Pathway */}
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
                <h1
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "36px",
                    fontWeight: 800,
                    color: "#0c0c48",
                    marginBottom: "16px",
                    lineHeight: 1.2,
                  }}
                >
                  Research Collaborations and Partnerships
                </h1>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    color: "#4b5563",
                    lineHeight: 1.7,
                    marginBottom: "32px",
                  }}
                >
                  The Human Nutrition Unit encourages research collaborations
                  with industry and academic units, both nationally and
                  internationally.
                </p>

                <div
                  style={{
                    backgroundColor: "#0a4379",
                    borderRadius: "0 30px",
                    padding: "32px",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "white",
                      marginBottom: "20px",
                    }}
                  >
                    The Research Pathway
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
                    height: "260px",
                    position: "relative",
                  }}
                >
                  <Image
                    src="/Our Team.jpg"
                    alt="Research collaboration"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "#f8f9ff",
                    borderRadius: "30px 0",
                    padding: "24px",
                    border: "1px solid #e5e7eb",
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
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#0a4379",
                        margin: 0,
                      }}
                    >
                      Compliance & Quality Assurance
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
                    The Unit ensures compliance with Good Clinical Practice, up
                    to the level of ICH GCP where required, and has experience
                    of and welcomes independent trial monitoring and audit
                    processes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AcademicCollaborators />

        <BenefitsRow benefits={ACADEMIC_BENEFITS} />

        <IndustryCollaborators />

        <BenefitsRow benefits={INDUSTRY_BENEFITS} />

        <CalloutBanner
            tag="Tūhuratia | Discover"
            title="Ready to Partner with HNU?"
            description="Whether academic or industry, we'd love to explore how we can work together to advance nutrition science."
            buttonLabel="Contact Us →"
            buttonHref="/about"
          />
      </main>

      <Footer />
    </>
  );
}
