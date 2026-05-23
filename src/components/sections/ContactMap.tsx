"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function ContactMap() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;

  const mapLanguage = lang === "EN" ? "en" : "zh-CN";

  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="mx-auto max-w-[1412px] rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] overflow-hidden h-[300px] sm:h-[450px] lg:h-[600px]">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.62085243865!2d174.74999331301763!3d-36.87549318088687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d4771e23b727d%3A0x90ba816391e739dc!2sHuman%20Nutrition%20Unit!5e0!3m2!1s${mapLanguage}!2snz!4v1777374580042!5m2!1s${mapLanguage}!2snz`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={t.contactPage.mapTitle}
        />
      </div>
    </section>
  );
}