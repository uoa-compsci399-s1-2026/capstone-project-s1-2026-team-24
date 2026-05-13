import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudyContent from './StudyContent';

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchStudy(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/studies/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/studies`, { cache: 'no-store' });
  if (!res.ok) return [];
  const studies: { slug: string }[] = await res.json();
  return studies.map(s => ({ slug: s.slug }));
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

      {/* Hero — same pattern as StudiesHero but with dynamic title */}
      <section
        className="relative w-full overflow-hidden flex flex-col justify-end h-[280px] sm:h-[360px] lg:h-[420px]"
        style={{ backgroundColor: '#0c0c48' }}
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
