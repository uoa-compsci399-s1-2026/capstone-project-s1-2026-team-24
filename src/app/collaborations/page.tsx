import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CollaborationsHero from '@/components/sections/CollaborationsHero';
import CollaborationsBody from '@/components/sections/CollaborationsBody';
import OurPartners from '@/components/sections/OurPartners';

export const metadata: Metadata = {
  title: 'Collaborations | HNU Auckland',
  description:
    'Building partnerships in nutrition research. Learn more about our collaborative work and initiatives.',
};

export default function CollaborationsPage() {
  return (
    <>
      <Navbar />
      {/*
        CollaborationsHero is a direct flex sibling of Navbar in the body's flex-col.
        Its negative margin-top slides it up behind the transparent navbar while
        padding-top keeps the visible text below the navbar.
      */}
      <CollaborationsHero />
      <main id="main-content">
        <CollaborationsBody />
        <OurPartners />
      </main>
      <Footer />
    </>
  );
}
