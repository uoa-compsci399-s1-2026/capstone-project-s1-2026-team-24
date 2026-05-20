import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudyContent from './StudyContent';
import TrialDesign from '@/components/sections/TrialDesign';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchStudy(slug: string) {
  return prisma.study.findFirst({
    where: { slug },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await fetchStudy(slug);
  if (!study || !study.isActive) {
    return { title: 'Study Not Found | HNU Auckland' };
  }
  return {
    title: `${study.title} | HNU Auckland`,
    description: study.shortDescription,
  };
}

export default async function StudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await fetchStudy(slug);

  if (!study || !study.isActive) {
    notFound();
  }

  return (
    <>
      <Navbar />

      {/* Hero — extends behind the transparent main nav (same -180px pattern as StudiesHero) */}
      <section
        className="relative w-full overflow-hidden flex flex-col justify-end h-[400px] sm:h-[480px] lg:h-[554px]"
        style={{ backgroundColor: '#0c0c48', marginTop: '-180px' }}
      >
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            style={{
              position: 'absolute',
              width: '4018px',
              height: '296px',
              top: '85%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-8deg)',
              opacity: 0.25,
              backgroundImage: 'url(/maori-pattern.svg)',
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
            }}
          />
        </div>

        <div className="relative px-6 sm:px-12 lg:px-[93px] pb-10 sm:pb-14">
          <p className="text-white/60 text-sm sm:text-base font-medium tracking-widest uppercase mb-2">
            Our Studies
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-white tracking-tight leading-tight">
            {study.title}
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
          <li aria-hidden="true">&gt;</li>
          <li>
            <span className="font-bold">{study.title}</span>
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
          <TrialDesign />
        </div>
      </main>

      <Footer />
    </>
  );
}
