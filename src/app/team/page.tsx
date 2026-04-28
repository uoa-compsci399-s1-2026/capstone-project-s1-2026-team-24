import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TeamHero from '@/components/team/TeamHero';
import BoardOfDirectors from '@/components/team/BoardOfDirectors';
import ResearchTeam from '@/components/team/ResearchTeam';

export const metadata: Metadata = {
  title: 'Our Team | HNU Auckland',
  description:
    'Meet the people behind the Human Nutrition Unit — our board of directors and research team.',
};

export default function TeamPage() {
  return (
    <>
      <Navbar />
      {/*
        TeamHero is a direct flex sibling of Navbar in the body's flex-col.
        Its negative margin-top (equal to the navbar height) slides it up so its
        background fills the space behind the transparent navbar, while its
        padding-top keeps the visible content below the navbar.
      */}
      <TeamHero />
      <main id="main-content">
        <div className="bg-white px-4 sm:px-8 lg:px-13 py-5">
          <p className="text-sm sm:text-base lg:text-[20px] text-black tracking-[0.4px]">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span className="mx-2">{`>`}</span>
            <strong>Our Team</strong>
          </p>
        </div>

        <BoardOfDirectors />
        <ResearchTeam />
      </main>
      <Footer />
    </>
  );
}
