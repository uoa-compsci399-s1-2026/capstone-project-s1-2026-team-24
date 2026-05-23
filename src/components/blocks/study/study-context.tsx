"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type StudyLang = "en" | "zh";

export interface StudyData {
  slug: string;
  title: string;
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
  pdfs: { id: number; title: string; pdfPath: string }[];
}

interface StudyContextValue {
  study: StudyData;
  lang: StudyLang;
  setLang: (lang: StudyLang) => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({
  study,
  children,
}: {
  study: StudyData;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<StudyLang>("en");
  return (
    <StudyContext.Provider value={{ study, lang, setLang }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error("Study blocks must be rendered within a StudyProvider");
  }
  return ctx;
}
