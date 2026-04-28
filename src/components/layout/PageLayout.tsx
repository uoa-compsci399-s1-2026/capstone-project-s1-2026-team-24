import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <div className="bg-[#0c0c48]">
        <Navbar />
      </div>
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
