import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudyContent from '../[slug]/StudyContent';

async function fetchStudy() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/studies/nz-synergy`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export const metadata: Metadata = {
  title: 'NZ Synergy | HNU Auckland',
  description:
    'A two-week residential nutrition study investigating dietary effects on diabetes risk markers.',
};

// Full navbar height (utility bar 40px + main nav 180px)
const NAVBAR_HEIGHT = 220;

export default async function NZSynergyPage() {
  const study = await fetchStudy();

  if (!study || !study.isActive) {
    notFound();
  }

  return (
    <>
      <Navbar />

      {/* Hero — image extends up behind the main nav portion of the navbar */}
      <section
        className="relative w-full overflow-hidden h-[380px] sm:h-[480px] lg:h-[554px]"
        style={{ marginTop: `-${NAVBAR_HEIGHT}px` }}
        aria-label="NZ Synergy study hero"
      >
        <Image
          src="/services-and-expertise.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-extrabold text-white text-center tracking-[1.52px] leading-normal px-4">
            NZ Synergy
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="px-6 sm:px-12 lg:px-[52px] py-5">
        <ol className="flex items-center gap-2 text-[20px] text-[#0c0c48] tracking-[0.4px]">
          <li>
            <Link href="/studies" className="hover:opacity-70 transition-opacity">
              Studies
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#0c0c48]">
            &gt;
          </li>
          <li>
            <span className="font-bold">NZ Synergy</span>
          </li>
        </ol>
      </nav>

      <main id="main-content" className="bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-[93px]">
          <StudyContent
            fullDescriptionEn={study.fullDescriptionEn}
            fullDescriptionZh={study.fullDescriptionZh}
            eligibilityEn={study.eligibilityEn}
            eligibilityZh={study.eligibilityZh}
            compensationEn={study.compensationEn}
            compensationZh={study.compensationZh}
            redcapUrl={study.redcapUrl}
            contactEmail={study.contactEmail}
            contactPhone={study.contactPhone}
            contactPhoneZh={study.contactPhoneZh}
            ethicsStatement={study.ethicsStatement}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
