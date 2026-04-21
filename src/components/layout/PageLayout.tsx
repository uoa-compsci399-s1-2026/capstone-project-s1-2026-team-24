import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <Navbar />
      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
