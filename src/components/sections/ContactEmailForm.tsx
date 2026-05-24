'use client';

import { useEffect, useRef, useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const INQUIRY_TYPES = [
  'Study Participant Enquiry',
  'Industry Partnership',
  'Internship or PhD Opportunity',
  'Donation',
  'General Enquiry',
  'Other',
] as const;

const inputClass =
  'w-full border-2 border-[#cac7c7] rounded-[30px] h-[56px] px-6 text-base sm:text-[20px] placeholder:text-[#cac7c7] text-[#0a4479] bg-white focus:outline-none focus:border-[#0a4479] transition-colors';

const labelClass =
  'block font-bold text-[#0a4479] text-base sm:text-[24px] mb-2 ml-2';

const textareaClass =
  'w-full border-2 border-[#cac7c7] rounded-[30px] px-6 py-4 text-base sm:text-[20px] placeholder:text-[#cac7c7] text-[#0a4479] bg-white focus:outline-none focus:border-[#0a4479] transition-colors resize-none';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactEmailForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const mountedAtRef = useRef<number>(0);

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  function clearError() {
    if (state === 'error') {
      setState('idle');
      setErrorMsg('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !category || !message.trim()) {
      setErrorMsg('Please fill in all fields.');
      setState('error');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setErrorMsg(data.error || 'Submission failed. Please try again.');
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col gap-3 py-10">
        <p className="text-[#0a4479] text-xl font-bold">Message sent!</p>
        <p className="text-[#0a4479] text-base">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={e => {
            setName(e.target.value);
            clearError();
          }}
          placeholder="Enter your name"
          className={inputClass}
          disabled={state === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            clearError();
          }}
          placeholder="example@gmail.com"
          className={inputClass}
          disabled={state === 'loading'}
        />
      </div>

      <div>
        <label htmlFor="contact-category" className={labelClass}>
          Inquiry Type
        </label>
        <div className="relative">
          <select
            id="contact-category"
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              clearError();
            }}
            className={`${inputClass} appearance-none pr-12 cursor-pointer`}
            disabled={state === 'loading'}
          >
            <option value="" disabled>
              Select
            </option>
            {INQUIRY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
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
                stroke="#0a4479"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={e => {
            setMessage(e.target.value);
            clearError();
          }}
          placeholder="Write your message here..."
          rows={6}
          className={textareaClass}
          disabled={state === 'loading'}
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
          onChange={e => setHoneypot(e.target.value)}
        />
      </div>

      {state === 'error' && (
        <p className="text-red-500 text-sm ml-2" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-fit bg-[#0a4479] text-white font-bold text-base sm:text-[20px] px-8 sm:px-10 py-3 sm:py-4 rounded-[30px] hover:bg-[#083559] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
