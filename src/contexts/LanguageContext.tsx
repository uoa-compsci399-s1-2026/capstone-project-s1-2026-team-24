"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Language = "EN" | "ZH";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "EN",
  setLang: () => {},
});

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");

    if (savedLang === "EN" || savedLang === "ZH") {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
  localStorage.setItem("lang", lang);
  document.cookie = `lang=${lang}; path=/; max-age=31536000`;
}, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}