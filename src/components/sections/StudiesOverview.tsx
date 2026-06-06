'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

const STUDY_IMAGE_FALLBACK = '/images/team/placeholder.jpg';

type Study = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string | null;
  imagePath: string | null;
};

function studyImageSrc(imagePath: string | null): string {
  const trimmed = imagePath?.trim();
  return trimmed ? trimmed : STUDY_IMAGE_FALLBACK;
}

// Studies are read on the server (getStudies: active + ordered, 中文 localized)
// and passed in as props, so the listing is in the initial HTML. A language
// toggle re-renders this via router.refresh() (re-localized server-side), so no
// fetch-on-mount and no loading skeleton are needed. Stays a client component
// for the search box + labels.
export default function StudiesOverview({
  studies = [],
}: {
  studies?: Study[];
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  const filtered = studies.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="bg-white px-4 sm:px-8 lg:px-[93px] py-12 lg:py-16">
      {/* Search bar */}
      <div className="max-w-[1084px] mx-auto mb-12">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.studies.search}
            aria-label={t.studies.searchStudies}
            className="w-full h-[72px] sm:h-[94px] border-[3px] border-[#8e8d8d] rounded-[50px] pl-8 sm:pl-16 pr-16 sm:pr-24 text-[#8e8d8d] text-xl sm:text-[36px] tracking-[0.72px] focus:outline-none focus:border-[#0a4479] transition-colors bg-white"
          />
          <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="19" cy="19" r="12" stroke="#8e8d8d" strokeWidth="3" />
              <path
                d="M29 29L38 38"
                stroke="#8e8d8d"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Study cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[1330px] mx-auto">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-[#8e8d8d] text-xl py-12">
            {studies.length === 0 ? t.studies.noStudiesAvailable : t.studies.noStudiesMatch}
          </p>
        ) : (
          filtered.map(study => (
            <Link key={study.id} href={`/studies/${study.slug}`} className="group">
              <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-[0px_0px_40px_0px_rgba(0,0,0,0.3)] transition-shadow h-full">
                <div className="relative h-[260px] sm:h-[311px] mx-4 sm:mx-5 mt-4 sm:mt-5 rounded-[10px] overflow-hidden">
                  <Image
                    src={studyImageSrc(study.imagePath)}
                    alt={study.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="py-6 px-4 text-center">
                  <h2 className="text-[#0c0c48] text-2xl sm:text-[32px] font-bold tracking-[0.64px] leading-normal">
                    {study.title}
                  </h2>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
