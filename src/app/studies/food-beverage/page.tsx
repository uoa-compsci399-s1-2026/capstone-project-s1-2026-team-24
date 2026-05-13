import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'NZ Food and Beverage | HNU Auckland',
  description:
    'A short-term study investigating how different foods and beverages affect your metabolic rate, fat burn, blood sugar levels, and appetite.',
};

// Full navbar height (utility bar 40px + main nav 140px)
const NAVBAR_HEIGHT = 180;

export default function NZFoodAndBeveragePage() {
  return (
    <>
      <Navbar />

      {/* Hero — image extends up behind the main nav portion of the navbar */}
      <section
        className="relative w-full overflow-hidden h-[380px] sm:h-[480px] lg:h-[554px]"
        style={{ marginTop: `-${NAVBAR_HEIGHT}px` }}
        aria-label="NZ Food and Beverage study hero"
      >
        <Image
          src="/food-bev.jpg"
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
            NZ Food and Beverage
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
            <span className="font-bold">NZ Food and Beverage</span>
          </li>
        </ol>
      </nav>

      {/* Content */}
      <main id="main-content" className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-[92px] pt-10 lg:pt-16 pb-16 lg:pb-24">
          <div className="text-[#0a4479] text-lg sm:text-2xl lg:text-[32px] font-normal leading-relaxed lg:leading-[50px] tracking-[0.64px]">
            <p className="mb-0">
              Are you interested in finding out how your body responds to different foods and
              beverages?
            </p>
            <p className="mb-0">
              This short-term assessment of metabolism in the hours after eating/drinking will
              investigate how different foods and beverages affect your metabolic rate, fat burn,
              blood sugar levels, and appetite.
            </p>
            <p className="mb-0">
              This study will help us to understand how specific components of common foods (e.g.
              polyphenols, complex carbohydrates and protein) influence the way we process foods
              after eating. Learning how these mechanisms work could inform future dietary
              guidelines, which may help people to avoid weight gain and poor metabolic health
              outcomes (e.g. type 2 diabetes).
            </p>
            <p className="mb-0">
              You will be required to come to our research unit for an initial screening visit
              (approximately 1 hour) and two further study visits (approximately 5 hours per visit).
            </p>
            <p className="mb-0">
              You may be eligible to take part in this study if you fulfil the following criteria:
            </p>
            <ol className="list-decimal mb-0 pl-12">
              <li className="mb-0">Between 18 - 60 years old</li>
              <li className="mb-0">Have BMI between 24 - 40 kg/m2 (overweight / obesity)</li>
              <li className="mb-0">
                Healthy or at increased risk of diabetes (but not yet diabetic) based on fasting
                blood sugar test
              </li>
              <li className="mb-0">
                European Caucasian OR Asian Chinese (more widely, individuals from mainland China,
                Singapore, Malaysia, Hong Kong, Taiwan and South Korea may also be eligible)
              </li>
              <li>
                Willing to consume different foods and beverages, whereby all products are readily
                available to the public (e.g. yoghurt, kiwifruit, fruit drink, feijoa extract)
              </li>
            </ol>
            <p className="mb-0">You will be compensated for your time.</p>
            <p className="mb-0">
              IMPORTANT: You cannot join the study if you have been diagnosed with diabetes.
            </p>
            <p className="mb-0">
              If you want to know more information, please get in touch with us:
              <br />
              Phone: 02109196703 (Chinese speakers) / 02109195443 (English speakers)
              <br />
              Email:{' '}
              <a
                href="mailto:HNU_SYNERGY@auckland.ac.nz"
                className="underline hover:opacity-70 transition-opacity"
              >
                HNU_SYNERGY@auckland.ac.nz
              </a>
            </p>
            <p className="mb-0">
              Statement of ethics approval:
              <br />
              This study has received ethical approval from the NZ Southern Health and Disability
              Ethics Committee (21/STH/231).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
