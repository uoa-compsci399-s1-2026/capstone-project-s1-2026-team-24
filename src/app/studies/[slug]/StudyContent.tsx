'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

type Lang = 'en' | 'zh';

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
}

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
}: StudyContentProps) {
  const [lang, setLang] = useState<Lang>('en');

  const description = lang === 'en' ? fullDescriptionEn : fullDescriptionZh;
  const eligibility = lang === 'en' ? eligibilityEn : eligibilityZh;
  const compensation = lang === 'en' ? compensationEn : compensationZh;
  const phone = lang === 'en' ? contactPhone : contactPhoneZh;

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 lg:px-0 py-12 lg:py-16 flex flex-col gap-12">
      {/* Language toggle */}
      <div className="flex gap-3" role="group" aria-label="Language">
        <button
          type="button"
          aria-pressed={lang === 'en'}
          onClick={() => setLang('en')}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c0c48] ${
            lang === 'en'
              ? 'bg-[#0c0c48] text-white'
              : 'border border-[#0c0c48] text-[#0c0c48] hover:bg-[#0c0c48]/10'
          }`}
        >
          English
        </button>
        <button
          type="button"
          aria-pressed={lang === 'zh'}
          onClick={() => setLang('zh')}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c0c48] ${
            lang === 'zh'
              ? 'bg-[#0c0c48] text-white'
              : 'border border-[#0c0c48] text-[#0c0c48] hover:bg-[#0c0c48]/10'
          }`}
        >
          中文
        </button>
      </div>

      {/* Description */}
      <section>
        <h2 className="text-[#0c0c48] text-2xl sm:text-3xl font-bold mb-4">
          {lang === 'en' ? 'About This Study' : '研究简介'}
        </h2>
        <p className="text-[#3d3d3d] text-base sm:text-lg leading-relaxed">
          {description}
        </p>
      </section>

      {/* Eligibility */}
      <section>
        <h2 className="text-[#0c0c48] text-2xl sm:text-3xl font-bold mb-4">
          {lang === 'en' ? 'Who Can Participate' : '参与条件'}
        </h2>
        <ul className="list-disc list-outside pl-5 flex flex-col gap-2">
          {eligibility.split('\n').filter(Boolean).map((line, i) => (
            <li key={i} className="text-[#3d3d3d] text-base sm:text-lg leading-relaxed">
              {line.trim()}
            </li>
          ))}
        </ul>
      </section>

      {/* Compensation */}
      <section>
        <h2 className="text-[#0c0c48] text-2xl sm:text-3xl font-bold mb-4">
          {lang === 'en' ? 'What You Will Receive' : '参与补偿'}
        </h2>
        <p className="text-[#3d3d3d] text-base sm:text-lg leading-relaxed">
          {compensation}
        </p>
      </section>

      {/* How to sign up */}
      <section className="bg-[#f5f7ff] rounded-[20px] p-8 flex flex-col gap-4">
        <h2 className="text-[#0c0c48] text-2xl sm:text-3xl font-bold">
          {lang === 'en' ? 'How to Sign Up' : '如何报名'}
        </h2>
        <Button href={redcapUrl} variant="blue" color="dark">
          Apply via REDCap Questionnaire
        </Button>
        <p className="text-[#8e8d8d] text-sm leading-relaxed max-w-[600px]">
          You will be redirected to REDCap, the University&apos;s secure questionnaire system.
          HNU does not collect personal health information on this website.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-[#0c0c48] text-2xl sm:text-3xl font-bold mb-4">
          {lang === 'en' ? 'Contact' : '联系方式'}
        </h2>
        <div className="flex flex-col gap-2 text-base sm:text-lg text-[#3d3d3d]">
          <p>
            <span className="font-semibold">Email: </span>
            <a href={`mailto:${contactEmail}`} className="text-[#1f2bd4] hover:underline">
              {contactEmail}
            </a>
          </p>
          <p>
            <span className="font-semibold">{lang === 'en' ? 'Phone: ' : '电话：'}</span>
            {phone}
          </p>
        </div>
      </section>

      {/* Ethics */}
      <section className="border-t border-[#e5e5e5] pt-8">
        <p className="text-[#8e8d8d] text-sm leading-relaxed">
          <span className="font-semibold">Ethics: </span>
          {ethicsStatement}
        </p>
      </section>
    </div>
  );
}
