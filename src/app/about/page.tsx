import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DiscoverHero from '@/components/sections/DiscoverHero';
import DiscoverVideo from '@/components/sections/DiscoverVideo';
import DiscoverWhoAreWe from '@/components/sections/DiscoverWhoAreWe';
import DiscoverServicesExpertise from '@/components/sections/DiscoverServicesExpertise';
import DiscoverCapabilities from '@/components/sections/DiscoverCapabilities';
import DiscoverFacilities from '@/components/sections/DiscoverFacilities';

export const metadata: Metadata = {
  title: 'Discover HNU | Human Nutrition Unit',
  description:
    'Focused on better health through nutrition. Learn more about the Human Nutrition Unit — New Zealand\'s only live-in nutrition trials facility.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      {/*
        DiscoverHero is a direct flex sibling of Navbar in the body's flex-col.
        Its negative margin-top (equal to the navbar height) slides it up so its
        background fills the space behind the transparent navbar, while its
        padding-top keeps the visible content below the navbar.
      */}
      <DiscoverHero />
      <main id="main-content">
        <DiscoverVideo />
        <DiscoverWhoAreWe />
        <section className="bg-white py-10 sm:py-12 lg:py-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[64px] font-extrabold text-[#0a4479] text-center tracking-[1.28px] leading-tight">
            What we do
          </h2>
        </section>
        <DiscoverServicesExpertise />
        <DiscoverCapabilities />
        <DiscoverFacilities />
      </main>
      <Footer />
    </>
  );
}
