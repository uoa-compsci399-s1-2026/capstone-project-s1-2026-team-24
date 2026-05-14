import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomepageHero from '@/components/sections/HomepageHero';
import HomepageStudies from '@/components/sections/HomepageStudies';
import OurPartners from '@/components/sections/OurPartners';
import PostureMaintenanceCallout from '@/components/sections/PostureMaintenanceCallout';
import HomepageAboutUs from '@/components/sections/HomepageAboutUs';

export const metadata: Metadata = {
    title: 'Home | Human Nutrition Unit',
    description:
        'The Human Nutrition Unit Homepage',
    };

    export default function HomePage() {
        return (
            <>
                <Navbar />
                <HomepageHero />
                <main id="main-content">
                    <HomepageStudies />
                    <HomepageAboutUs />
                    <PostureMaintenanceCallout />
                    <OurPartners />
                </main>
                <Footer />
            </>
        );
    }