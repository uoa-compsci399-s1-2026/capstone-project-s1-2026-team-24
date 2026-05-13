import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Ferdinand | HNU Auckland',
  description:
    'A 6-month weight loss nutrition study investigating whether daily feijoa whole fruit powder alters the risk of developing type 2 diabetes.',
};

// Full navbar height (utility bar 40px + main nav 180px)
const NAVBAR_HEIGHT = 220;

export default function FerdinandPage() {
  return (
    <>
      <Navbar />

      {/* Hero — image extends up behind the main nav portion of the navbar */}
      <section
        className="relative w-full overflow-hidden h-[520px] sm:h-[660px] lg:h-[800px]"
        style={{ marginTop: `-${NAVBAR_HEIGHT + 90}px` }}
        aria-label="Ferdinand study hero"
      >
        <Image
          src="/feijoa.jpg"
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
            Ferdinand
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
            <span className="font-bold">Ferdinand</span>
          </li>
        </ol>
      </nav>

      {/* Content */}
      <main id="main-content" className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-[92px] pt-10 lg:pt-16 pb-16 lg:pb-24">
          <div className="text-[#0a4479] text-lg sm:text-2xl lg:text-[32px] font-normal leading-relaxed lg:leading-[50px] tracking-[0.64px]">
            <ul className="list-disc mb-0 pl-12">
              <li className="mb-0">Would you like to participate in a 6-month nutrition study?</li>
              <li className="mb-0">Would you like to lose weight?</li>
              <li>Are you concerned about your diabetes risk?</li>
            </ul>
            <p className="mb-0">
              We will investigate whether daily consumption of feijoa whole fruit powder alters
              risk of developing type 2 diabetes.
            </p>
            <p className="mb-0">You will be required to:</p>
            <ul className="list-disc mb-0 pl-12">
              <li className="mb-0">Visit the Human Nutrition Unit, in Mt Eden, 7 times</li>
              <li className="mb-0">Follow the low energy, Cambridge weight-loss diet for 8-weeks</li>
              <li className="mb-0">Complete a 4-month weight maintenance programme</li>
              <li>
                Consume feijoa whole fruit powder or placebo matched powder every day for six months
              </li>
            </ul>
            <p className="mb-0">
              If you are located in Tāmaki Makaurau (Auckland area), you may be eligible if you:
            </p>
            <ul className="list-disc mb-0 pl-12">
              <li className="mb-0">
                Have elevated blood glucose but are not diabetic (we can check this for you)
              </li>
              <li className="mb-0">Are between 18-70 years</li>
              <li className="mb-0">
                Are overweight or obese (this is calculated by your height and weight)
              </li>
              <li className="mb-0">Are happy to participate in an 6-month weight loss study</li>
              <li className="mb-0">
                Are happy to consume feijoa whole fruit powder or matched placebo powder every day
                for six months
              </li>
              <li>Are happy to complete 7 visits to the Human Nutrition Unit</li>
            </ul>
            <p className="mb-0">You will be compensated for your time.</p>
            <p className="mb-0">
              IMPORTANT: You cannot participate in the study if you have already been diagnosed
              with type 2 diabetes.
            </p>
            <p className="mb-0">
              To sign up for the study, click{' '}
              <a href="/studies" className="underline hover:opacity-70 transition-opacity">
                here
              </a>
            </p>
            <p className="mb-0">
              If you have any further questions please visit our{' '}
              <a href="/studies" className="underline hover:opacity-70 transition-opacity">
                FAQ
              </a>{' '}
              page
            </p>
            <p className="mb-0">
              If you would like to learn more about this study, please contact us:
              <br />
              Phone: 09 630 1162
              <br />
              Email:{' '}
              <a
                href="mailto:FERDINAND@auckland.ac.nz"
                className="underline hover:opacity-70 transition-opacity"
              >
                FERDINAND@auckland.ac.nz
              </a>
            </p>
            <p className="mb-0">
              Statement of ethics approval:
              <br />
              This study has been approved by the Southern Health and Disability Ethics Committee
              (2022 EXP 12032).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
