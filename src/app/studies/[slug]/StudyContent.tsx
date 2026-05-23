"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

interface StudyPdfRecord {
  id: number;
  title: string;
  pdfPath: string;
}

interface StudyContentProps {
  fullDescriptionEn: string;
  fullDescriptionZh: string;
  eligibilityEn: string;
  eligibilityZh: string;
  compensationEn: string;
  compensationZh: string;
  redcapUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneZh: string;
  ethicsStatement: string;
  status: string;
  publishedAt: string | null;
  pdfs: StudyPdfRecord[];
}

const STATUS_STYLES: Record<
  string,
  { dot: string; label: { EN: string; ZH: string } }
> = {
  Recruiting: { dot: "#1a7f37", label: { EN: "Recruiting", ZH: "招募中" } },
  Active: { dot: "#0a4479", label: { EN: "Active", ZH: "进行中" } },
  Completed: { dot: "#8e8d8d", label: { EN: "Completed", ZH: "已结束" } },
};

export default function StudyContent({
  fullDescriptionEn,
  fullDescriptionZh,
  eligibilityEn,
  eligibilityZh,
  compensationEn,
  compensationZh,
  redcapUrl,
  contactEmail,
  contactPhone,
  contactPhoneZh,
  ethicsStatement,
  status,
  publishedAt,
  pdfs,
}: StudyContentProps) {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const description = lang === "EN" ? fullDescriptionEn : fullDescriptionZh;
  const eligibility = (lang === "EN" ? eligibilityEn : eligibilityZh)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const compensation = lang === "EN" ? compensationEn : compensationZh;
  const phone = lang === "EN" ? contactPhone : contactPhoneZh;

  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Completed;

  const deadlineDisplay = publishedAt
    ? new Date(publishedAt).toLocaleDateString(lang === "EN" ? "en-NZ" : "zh-CN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="relative w-full bg-white py-10 sm:py-16 px-6 sm:px-12 lg:px-[45px] overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-[#0c0c48]"
          style={{ border: "1.5px solid #0c0c48" }}
          aria-label={`${t.studies.status}: ${statusStyle.label[lang]}`}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: statusStyle.dot }}
          />
          {statusStyle.label[lang]}
        </div>

        {deadlineDisplay && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-[#0c0c48]"
            style={{ border: "1.5px solid #0c0c48" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0c0c48"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {deadlineDisplay}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1 bg-white rounded-[20px] shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 lg:p-10">
          <div className="text-[#1f2937] text-base lg:text-[17px] leading-[1.8] space-y-5">
            <p className="whitespace-pre-wrap">{description}</p>

            <h2 className="text-[#0c0c48] text-xl lg:text-2xl font-bold pt-3">
              {t.studies.whatYouReceive}
            </h2>
            <p className="whitespace-pre-wrap">{compensation}</p>

            {pdfs.length > 0 && (
              <>
                <h2 className="text-[#0c0c48] text-xl lg:text-2xl font-bold pt-3">
                  {t.studies.downloads}
                </h2>

                <ul className="flex flex-col gap-2 list-none p-0 m-0">
                  {pdfs.map((pdf) => (
                    <li key={pdf.id}>
                      <a
                        href={pdf.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#0a4479] hover:underline font-semibold"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <polyline points="9 15 12 18 15 15" />
                        </svg>
                        {pdf.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h2 className="text-[#0c0c48] text-xl lg:text-2xl font-bold pt-3">
              {t.studies.contact}
            </h2>

            <p>
              <span className="font-semibold">{t.studies.emailLabel}</span>
              <a
                href={`mailto:${contactEmail}`}
                className="text-[#1f2bd4] hover:underline"
              >
                {contactEmail}
              </a>
            </p>

            <p>
              <span className="font-semibold">{t.studies.phoneLabel}</span>
              {phone}
            </p>

            <p className="text-[#8e8d8d] text-sm leading-relaxed pt-6 border-t border-[#e5e5e5]">
              <span className="font-semibold">{t.studies.ethicsLabel}</span>
              {ethicsStatement}
            </p>
          </div>
        </div>

        <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
          <div
            className="rounded-2xl p-6 bg-white"
            style={{ border: "2px solid #0c0c48" }}
          >
            <h2 className="text-[#0c0c48] text-lg font-bold mb-4">
              {t.studies.eligibility}
            </h2>

            <ul className="flex flex-col gap-3 list-none p-0">
              {eligibility.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[#374151] leading-snug"
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#0c0c48] flex-shrink-0 mt-2"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={redcapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-2xl py-6 text-xl font-semibold text-[#0c0c48] bg-white hover:bg-[#0c0c48] hover:text-white transition-colors"
            style={{ border: "2px solid #0c0c48" }}
            aria-label={t.studies.joinViaRedcap}
          >
            {t.studies.joinNow}
          </a>

          <Link
            href="/contact"
            className="text-center text-sm text-[#0c0c48] underline hover:opacity-70 transition-opacity"
          >
            {t.studies.haveQuestions}
          </Link>

          <p className="text-[#8e8d8d] text-xs leading-relaxed">
            {t.studies.redcapNotice}
          </p>
        </aside>
      </div>
    </section>
  );
}