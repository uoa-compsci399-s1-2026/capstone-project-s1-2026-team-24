import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ResearchHero from '@/components/sections/ResearchHero';
import ResearchIntroduction from '@/components/sections/ResearchIntroduction';
import ResearchFocus from '@/components/sections/ResearchFocus';
import TrialDesign from '@/components/sections/TrialDesign';
import PostureMaintenanceCallout from '@/components/sections/PostureMaintenanceCallout';

export const metadata: Metadata = {
  title: 'Our Research | HNU',
  description: 'Better health through nutrition science. Explore our research in diet, disease, and clinical trials.',
};

export default function ResearchPage() {
  return (
    <>
      <Navbar />
      {/*
        ResearchHero is a direct flex sibling of Navbar in the body's flex-col.
        Its negative margin-top (equal to the navbar height) slides it up so its
        background fills the space behind the transparent navbar, while its
        padding-top keeps the visible content below the navbar.
      */}
      <ResearchHero />
      <main id="main-content">
        <ResearchIntroduction />
        <ResearchFocus />
        <TrialDesign />
        <PostureMaintenanceCallout />
      </main>
      <Footer />
    </>
  );
}
