import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { SITE_NAME } from '@/lib/constants';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
        {/* HNU Logo */}
        <div className="mb-6">
          <Image
            src="/images/logos/UoA-Logo-Primary-RGB-Small.png"
            alt="University of Auckland logo"
            width={180}
            height={60}
            priority
          />
        </div>

        {/* Site name */}
        <p
          className="text-sm font-semibold uppercase tracking-widest mb-8"
          style={{ color: 'var(--uoa-mahina)' }}
        >
          {SITE_NAME}
        </p>

        {/* 404 heading */}
        <h1
          className="text-6xl sm:text-8xl font-bold mb-4"
          style={{ color: 'var(--uoa-waitemata)' }}
        >
          404
        </h1>
        <h2
          className="text-2xl sm:text-3xl font-semibold mb-6"
          style={{ color: 'var(--uoa-waitemata)' }}
        >
          Page Not Found
        </h2>

        {/* Friendly message */}
        <p className="text-gray-600 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--uoa-waitemata)' }}
          >
            Go to Homepage
          </Link>
          <Link
            href="/studies"
            className="px-6 py-3 rounded font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--uoa-azure)' }}
          >
            Browse Studies
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
