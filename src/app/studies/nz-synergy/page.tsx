import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
// Keep hero heading vertically aligned by offsetting for content below navbar.
const HERO_CONTENT_OFFSET = 90;
const HERO_MARGIN_TOP = -(NAVBAR_HEIGHT + HERO_CONTENT_OFFSET);

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
        className="relative w-full overflow-hidden h-[520px] sm:h-[660px] lg:h-[800px]"
        style={{ marginTop: `${HERO_MARGIN_TOP}px` }}
        aria-label="NZ Synergy study hero"
      >
        <Image
          src="/services-and-expertise.jpg"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: 'center 40px' }}
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
      <nav aria-label="Breadcrumb" className="bg-white px-6 sm:px-12 lg:px-[52px] py-5">
        <ol className="flex items-center gap-2 text-[20px] text-[#0c0c48] tracking-[0.4px]">
          <li>
            <Link href="/studies" className="hover:opacity-70 transition-opacity">
              Studies
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <span className="font-bold">NZ Synergy</span>
          </li>
        </ol>
      </nav>

      {/* Content — single flowing block matching the Figma design */}
      <main id="main-content" className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-[92px] pt-10 lg:pt-16 pb-16 lg:pb-24">
        <div
          className="text-[#0a4479] text-lg sm:text-2xl lg:text-[32px] font-normal leading-relaxed lg:leading-[50px] tracking-[0.64px]"
        >
          <p className="mb-0">
            Would you like to participate in a two-week nutrition study? Are you concerned about
            your diabetes risk?
          </p>
          <p className="mb-0">
            We will investigate whether the foods that you eat (your diet) alters circulating blood
            markers that we have recently found to be associated with the risk of type 2 diabetes.
          </p>
          <p className="mb-0">You will be required to:</p>
          <ol className="list-decimal mb-0 pl-12">
            <li className="mb-0">
              Live at the Human Nutrition Unit, Mt Eden for two weeks (you may attend daily work,
              classes, or visit friends and family during the day – but must only eat the food and
              drinks that we will provide to you).
            </li>
            <li className="mb-0">
              Avoid vigorous exercise (e.g. power walking, running, intense cycling).
            </li>
            <li>Consume all of your meals and snacks provided.</li>
          </ol>
          <p className="mb-0">If you are in the Auckland area and are:</p>
          <ol className="list-decimal mb-0 pl-12">
            <li className="mb-0">
              Elevated fasting blood sugar but not yet diabetic (we can check this for you)
            </li>
            <li className="mb-0">
              Chinese (including mainland China, Singapore, Malaysia, Hong Kong, Taiwan) or
              European Caucasian
            </li>
            <li className="mb-0">Between 18-60 yrs</li>
            <li className="mb-0">Have a BMI 24-40 kg/m2 (overweight/obesity)</li>
            <li className="mb-0">Happy to participate in a 2 week residential study</li>
            <li>
              Happy to eat a wide range of foods (you cannot be vegetarian or vegan)
            </li>
          </ol>
          <p className="mb-0">You will be compensated for your time.</p>
          <p className="mb-0">
            IMPORTANT: You cannot be in the study if you have already been diagnosed with diabetes.
          </p>
          <p className="mb-0">
            Complete the pre-screening survey{' '}
            <a
              href={study.redcapUrl}
              className="underline hover:opacity-70 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
          </p>
          <p className="mb-0">
            If you want to know more information, please get in touch with us:
            <br />
            Phone: {study.contactPhoneZh} (Chinese speakers) / {study.contactPhone.trim()} (English
            speakers)
            <br />
            Email:{' '}
            <a
              href={`mailto:${study.contactEmail}`}
              className="underline hover:opacity-70 transition-opacity"
            >
              {study.contactEmail}
            </a>
          </p>
          <p className="mb-0">
            Statement of ethics approval
            <br />
            {study.ethicsStatement}
          </p>
          <p className="mb-0">
            <a
              href="https://www.auckland.ac.nz/en/science/our-research/research-study-recruitment/human-nutrition-unit-studies.html"
              className="underline hover:opacity-70 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.auckland.ac.nz/en/science/our-research/research-study-recru…
            </a>
          </p>
          <p className="mb-0">If you have any further questions, please see our</p>
          <p>
            <Link
              href="/studies"
              className="underline hover:opacity-70 transition-opacity"
            >
              FAQs
            </Link>
          </p>
        </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
