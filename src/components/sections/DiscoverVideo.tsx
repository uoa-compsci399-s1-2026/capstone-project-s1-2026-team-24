import Link from 'next/link';

export default function DiscoverVideo() {
  return (
    <section className="bg-white py-8 sm:py-10 lg:py-12 px-4 sm:px-8 lg:px-[93px]">
      <div className="max-w-[1512px] mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 sm:mb-10 lg:mb-12 text-sm sm:text-base lg:text-[20px] tracking-[0.4px] text-[#0c0c48]">
          <Link href="/about" className="hover:underline">About</Link>
          <span className="mx-2">{`>`}</span>
          <strong>Discover HNU</strong>
        </nav>

        {/* Video embed */}
        <div className="w-full rounded-[20px] sm:rounded-[30px] overflow-hidden shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)]">
          <div className="relative w-full aspect-video">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/FSvG3KU8-uo?si=5JpFdOO8fRKduDmJ"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
