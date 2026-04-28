import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactHero from '@/components/sections/ContactHero';
import ContactMap from '@/components/sections/ContactMap';
import ContactDetails from '@/components/sections/ContactDetails';

export const metadata: Metadata = {
  title: 'Contact Us | HNU Auckland',
  description:
    'Have a question or enquiry? Get in touch with the Human Nutrition Unit team.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <ContactHero />
      <main id="main-content">
        <ContactMap />
        <ContactDetails />
      </main>
      <Footer />
    </>
  );
}
