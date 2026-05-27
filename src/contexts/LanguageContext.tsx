"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

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
  initialLang = "EN",
}: {
  children: ReactNode;
  // Seeded from the `lang` cookie on the server (see getServerLang), so the first
  // paint already matches the visitor's choice — no English flash, no hydration
  // mismatch.
  initialLang?: Language;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Language>(initialLang);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Persist the choice (the cookie is what the server reads) and reflect it on
    // <html lang> for accessibility.
    localStorage.setItem("lang", lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    document.documentElement.lang = lang === "ZH" ? "zh" : "en";

    // Skip the initial mount — the server already rendered in `initialLang`, so
    // there's nothing to re-fetch. On a genuine change, refresh re-renders the
    // server components (page blocks) against the updated cookie, translating
    // the rest of the site to match.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    router.refresh();
  }, [lang, router]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
