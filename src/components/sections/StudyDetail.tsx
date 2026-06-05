"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "../ui/Button";
import en from "@/messages/en";
import zh from "@/messages/zh";

interface StudyDetailProps {
  status: "Open" | "Closed" | "Coming Soon";
  deadline?: string;
  eligibility: string[];
  contactHref?: string;
  joinHref?: string;
  pdfHref?: string;
  content: React.ReactNode;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Open: { bg: "#e6f4ea", color: "#1a7f37" },
  Closed: { bg: "#fce8e8", color: "#c0392b" },
  "Coming Soon": { bg: "#fff8e1", color: "#b07d00" },
};

export default function StudyDetail({
  status,
  deadline,
  eligibility,
  contactHref = "/contact",
  joinHref = "/contact",
  pdfHref,
  content,
}: StudyDetailProps) {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;
  const statusStyle = statusColors[status];
  const statusLabel =
    status === "Open"
      ? t.studies.statusOpen
      : status === "Closed"
        ? t.studies.statusClosed
        : t.studies.statusComingSoon;

  return (
    <section className="relative w-full bg-white py-10 sm:py-16 px-4 sm:px-12 lg:px-45 overflow-hidden">
      {/* Top pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "1.5px solid #0c0c48",
            borderRadius: "9999px",
            padding: "6px 16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            color: "#0c0c48",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: statusStyle.color,
              display: "inline-block",
            }}
          />
          {statusLabel}
        </div>

        {deadline && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1.5px solid #0c0c48",
              borderRadius: "9999px",
              padding: "6px 16px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#0c0c48",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0c0c48"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {deadline}
          </div>
        )}
      </div>

      {/* Main layout — stacked on mobile, side-by-side on lg */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left — study info */}
        <div
          className="w-full lg:flex-1"
          style={{
            backgroundColor: "white",
            borderRadius: "30px",
            boxShadow: "0 0 20px rgba(0,0,0,0.08)",
            padding: "24px",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              lineHeight: 1.8,
              color: "#1f2937",
            }}
          >
            {content}
          </div>
        </div>

        {/* Right — eligibility + join */}
        <div className="w-full lg:w-[320px] lg:flex-shrink-0 flex flex-col gap-4 sm:gap-6">
          {/* Eligibility */}
          <div
            style={{
              border: "2px solid #0c0c48",
              borderRadius: "30px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#0c0c48",
                marginBottom: "16px",
              }}
            >
              {t.studies.eligibility}
            </h2>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingLeft: "0",
                listStyle: "none",
                margin: 0,
              }}
            >
              {eligibility.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#0c0c48",
                      flexShrink: 0,
                      marginTop: "6px",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Join now */}
          <Button className="w-full bg-[#0c0c48] text-white font-bold text-base sm:text-[16px] px-8 sm:px-10 py-3 sm:py-4 rounded-[30px] hover:underline transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            <Link href={joinHref}>{t.studies.joinNow}</Link>
          </Button>

          {/* Contact link */}
          <Link
            href={contactHref}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#0c0c48",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            {t.studies.haveQuestions}
          </Link>
        </div>
      </div>
    </section>
  );
}