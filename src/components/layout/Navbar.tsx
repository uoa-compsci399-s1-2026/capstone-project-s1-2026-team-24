'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const ABOUT_ITEMS = [
  { label: 'Discover HNU', href: '/about' },
  { label: 'Our Team', href: '/team' },
  { label: 'Our Research', href: '/research' },
] as const;

const TOP_BAR_LINKS = [
  { label: 'DONATIONS', href: '/collaborations/funding' },
  { label: 'CONTACT', href: '/contact' },
] as const;

const STUDIES_ITEMS = [
  { label: 'Studies Overview', href: '/studies' },
  { label: 'NZ Synergy Study', href: '/studies/nz-synergy' },
  { label: 'NZ Food & Beverage Study', href: '/studies/food-beverage' },
  { label: 'Ferdinand Study', href: '/studies/ferdinand' },
] as const;

const POPULAR_SEARCHES = [
  { label: 'Donations', href: '/collaborations/funding' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [studiesOpen, setStudiesOpen] = useState(false);
  const [searchStudiesOpen, setSearchStudiesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'ZH'>('EN');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileStudiesOpen, setMobileStudiesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
        setStudiesOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAboutOpen(false);
    setStudiesOpen(false);
    setSearchStudiesOpen(false);
    setSearchOpen(false);
    setLangOpen(false);
    setMobileAboutOpen(false);
    setMobileStudiesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  const mainNavStyle = searchOpen
    ? { backgroundColor: '#0c0c48' }
    : {};

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded focus:bg-white focus:text-[#0c0c48] focus:font-semibold"
      >
        Skip to main content
      </a>

      <header ref={headerRef} className="relative z-50">
        {/* Top utility bar */}
        <div className="bg-white">
          <div className="max-w-[1512px] mx-auto px-14 flex items-center justify-end h-10">
            {TOP_BAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 text-[14px] font-bold tracking-[0.28px] text-[#0c0c48] hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}

            {/* Language switcher */}
            <div className="relative ml-1">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-3 text-[14px] font-bold tracking-[0.28px] text-[#0c0c48] hover:opacity-70 transition-opacity"
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                {lang}
                <svg
                  className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded border border-gray-100 z-50 min-w-[60px]"
                >
                  {(['EN', 'ZH'] as const).map((l) => (
                    <li key={l} role="option" aria-selected={lang === l}>
                      <button
                        className={`block w-full px-4 py-2 text-[14px] font-bold text-[#0c0c48] hover:bg-gray-50 text-left ${lang === l ? 'bg-gray-50' : ''}`}
                        onClick={() => { setLang(l); setLangOpen(false); }}
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav
          style={mainNavStyle}
          className="transition-[background] duration-300"
          aria-label="Main navigation"
        >
          <div className="max-w-[1512px] mx-auto px-14 flex items-center justify-between h-[180px]">
            {/* Logos */}
            <div className="flex items-center">
              <Link href="/" aria-label="University of Auckland — Home">
                <Image
                  src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Small.png"
                  alt="University of Auckland"
                  width={164}
                  height={78}
                  priority
                  className="object-contain"
                />
              </Link>
              <div className="w-px h-16 bg-white/60 mx-5" aria-hidden="true" />
              <Link href="/" aria-label="HNU — Home">
                <Image
                  src="/images/logos/hnu-logo.svg"
                  alt="HNU"
                  width={173}
                  height={58}
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className="text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
              >
                Home
              </Link>

              {/* About dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
                  onClick={() => setAboutOpen(!aboutOpen)}
                  aria-expanded={aboutOpen}
                  aria-haspopup="true"
                  aria-controls="about-dropdown"
                >
                  About
                  <svg
                    className={`w-3 h-3 transition-transform ${aboutOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {aboutOpen && (
                  <ul
                    id="about-dropdown"
                    role="menu"
                    className="absolute top-full left-0 mt-2 w-52 rounded shadow-lg py-1 z-50 border border-white/15"
                    style={{ backgroundColor: '#0c0c48' }}
                  >
                    {ABOUT_ITEMS.map((item) => (
                      <li key={item.href} role="none">
                        <Link
                          href={item.href}
                          role="menuitem"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setAboutOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Studies dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
                  onClick={() => setStudiesOpen(!studiesOpen)}
                  aria-expanded={studiesOpen}
                  aria-haspopup="true"
                  aria-controls="studies-dropdown"
                >
                  Studies
                  <svg
                    className={`w-3 h-3 transition-transform ${studiesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {studiesOpen && (
                  <ul
                    id="studies-dropdown"
                    role="menu"
                    className="absolute top-full left-0 mt-2 w-56 rounded shadow-lg py-1 z-50 border border-white/15"
                    style={{ backgroundColor: '#0c0c48' }}
                  >
                    {STUDIES_ITEMS.map((item) => (
                      <li key={item.href} role="none">
                        <Link
                          href={item.href}
                          role="menuitem"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          onClick={() => setStudiesOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                href="/collaborations"
                className="text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
              >
                Collaborations
              </Link>

              {/* Search / Close button */}
              {searchOpen ? (
                <button
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-center w-[57px] h-[57px] rounded-full border-[3px] border-white text-white hover:bg-white/10 transition-colors"
                  aria-label="Close search"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-3 pl-4 pr-6 h-[57px] rounded-[28.5px] border-[3px] border-white text-white hover:bg-white/10 transition-colors text-[20px] tracking-[0.4px] whitespace-nowrap"
                  aria-label="Open search"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden"
            style={{ backgroundColor: '#0c0c48', borderTop: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ul className="px-4 py-2 space-y-1">
              <li>
                <Link href="/" className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  aria-expanded={mobileAboutOpen}
                >
                  About
                  <svg
                    className={`w-4 h-4 transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileAboutOpen && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {ABOUT_ITEMS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                  onClick={() => setMobileStudiesOpen(!mobileStudiesOpen)}
                  aria-expanded={mobileStudiesOpen}
                >
                  Studies
                  <svg
                    className={`w-4 h-4 transition-transform ${mobileStudiesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileStudiesOpen && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {STUDIES_ITEMS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li>
                <Link href="/collaborations" className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors">
                  Collaborations
                </Link>
              </li>
              <li className="border-t border-white/15 pt-1 mt-1">
                {TOP_BAR_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: '#0c0c48' }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          {/* Content starts below the header (40px top bar + 180px main nav) */}
          <div className="pt-[220px] px-14 max-w-[1512px] mx-auto">
            <div className="max-w-[741px]">
              <div className="flex items-center gap-4 pb-4 border-b border-white/30">
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search"
                  className="flex-1 bg-transparent text-[48px] font-bold text-white/75 placeholder:text-white/50 outline-none tracking-[0.96px] min-w-0"
                  aria-label="Search"
                />
                <svg
                  className="w-10 h-10 text-white/75 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="mt-3">
                <p className="text-white text-[16px] tracking-[0.32px] mb-1">Popular searches</p>
                <ul>
                  <li>
                    <button
                      className="flex items-center gap-2 text-[20px] font-bold text-white leading-[50px] hover:opacity-80 transition-opacity"
                      onClick={() => setSearchStudiesOpen(!searchStudiesOpen)}
                      aria-expanded={searchStudiesOpen}
                      aria-haspopup="true"
                      aria-controls="search-studies-dropdown"
                    >
                      Studies
                      <svg
                        className={`w-4 h-4 transition-transform ${searchStudiesOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {searchStudiesOpen && (
                      <ul
                        id="search-studies-dropdown"
                        role="menu"
                        className="ml-4 mb-1 border-l border-white/20 pl-4"
                      >
                        {STUDIES_ITEMS.map((item) => (
                          <li key={item.href} role="none">
                            <Link
                              href={item.href}
                              role="menuitem"
                              className="block text-[16px] text-white/80 leading-[40px] hover:text-white hover:opacity-80 transition-colors"
                              onClick={() => setSearchOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                  {POPULAR_SEARCHES.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block text-[20px] font-bold text-white leading-[50px] hover:opacity-80 transition-opacity"
                        onClick={() => setSearchOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
