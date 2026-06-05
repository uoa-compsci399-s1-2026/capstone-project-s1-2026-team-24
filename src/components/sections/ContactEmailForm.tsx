"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

type FormState = "idle" | "loading" | "success" | "error";

// Canonical inquiry-type values sent to the API (must stay English for contact
// routing / recipient matching). The visible label is translated separately.
const INQUIRY_TYPES = [
  "Study Participant Enquiry",
  "Industry Partnership",
  "Internship or PhD Opportunity",
  "Donation",
  "General Enquiry",
  "Other",
] as const;

const inputClass =
  "w-full border-2 border-[#cac7c7] rounded-[30px] h-[56px] px-6 text-base sm:text-[20px] placeholder:text-[#cac7c7] text-[#0c0c48] bg-white focus:outline-none focus:border-[#0c0c48] transition-colors";

const labelClass =
  "block font-bold text-[#0c0c48] text-base sm:text-[24px] mb-2 ml-2";

const textareaClass =
  "w-full border-2 border-[#cac7c7] rounded-[30px] px-6 py-4 text-base sm:text-[20px] placeholder:text-[#cac7c7] text-[#0c0c48] bg-white focus:outline-none focus:border-[#0c0c48] transition-colors resize-none";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactEmailForm() {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;
  const inquiryLabels: Record<(typeof INQUIRY_TYPES)[number], string> = {
    "Study Participant Enquiry": t.contactPage.inquiryStudyParticipant,
    "Industry Partnership": t.contactPage.inquiryIndustryPartnership,
    "Internship or PhD Opportunity": t.contactPage.inquiryInternshipPhd,
    Donation: t.contactPage.inquiryDonation,
    "General Enquiry": t.contactPage.inquiryGeneral,
    Other: t.contactPage.inquiryOther,
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const mountedAtRef = useRef<number>(0);

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  function clearError() {
    if (state === "error") {
      setState("idle");
      setErrorMsg("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !category || !message.trim()) {
      setErrorMsg(t.contactPage.requiredError);
      setState("error");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg(t.contactPage.invalidEmailError);
      setState("error");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
          honeypot: honeypot.trim(),
          elapsedMs: Date.now() - (mountedAtRef.current || Date.now()),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || t.contactPage.submissionError);
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMsg(t.contactPage.genericError);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col gap-3 py-10">
        <p className="text-[#0c0c48] text-xl font-bold">
          {t.contactPage.successTitle}
        </p>
        <p className="text-[#0c0c48] text-base">{t.contactPage.successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-3xl sm:text-4xl lg:text-20px font-bold text-[#0c0c48] pb-5">
          Get in Touch
        </h2>
        <p className="text-12px font-regular text-[#0c0c48]">
          Interested in participating in a study or have questions about our
          research? Send us a message and we'll be in touch.
        </p>
      </div>
      <div>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError();
          }}
          placeholder={t.contactPage.namePlaceholder}
          className={inputClass}
          disabled={state === "loading"}
        />
      </div>

      <div>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          placeholder="example@gmail.com"
          className={inputClass}
          disabled={state === "loading"}
        />
      </div>

      <div>
        <div className="relative">
          <select
            id="contact-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              clearError();
            }}
            className={`${inputClass} appearance-none pr-12 cursor-pointer`}
            disabled={state === "loading"}
          >
            <option value="" disabled>
              {t.contactPage.selectPlaceholder}
            </option>
            {INQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {inquiryLabels[type]}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="20"
              height="12"
              viewBox="0 0 20 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L10 11L19 1"
                stroke="#0c0c48"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearError();
          }}
          placeholder={t.contactPage.messagePlaceholder}
          rows={6}
          className={textareaClass}
          disabled={state === "loading"}
        />
      </div>

      <div
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {state === "error" && (
        <p className="text-red-500 text-sm ml-2" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-fit bg-[#0c0c48] text-white font-bold text-base sm:text-[16px] px-8 sm:px-10 py-3 sm:py-4 rounded-[30px] hover:underline transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading"
          ? t.contactPage.sending
          : t.contactPage.sendMessage}
      </button>
    </form>
  );
}
