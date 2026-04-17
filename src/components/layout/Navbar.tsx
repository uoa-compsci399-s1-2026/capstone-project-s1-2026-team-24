'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Research', href: '/research' },
  {
    label: 'Studies',
    href: '/studies',
    children: [
      { label: 'Studies Overview', href: '/studies' },
      { label: 'NZ Synergy Study', href: '/studies/nz-synergy' },
      { label: 'Ferdinand Study', href: '/studies/ferdinand' },
      { label: 'NZ Food & Beverage Study', href: '/studies/food-beverage' },
    ],
  },
  {
    label: 'Collaborations',
    href: '/collaborations',
    children: [
      { label: 'Academic Collaborations', href: '/collaborations/academic' },
      { label: 'Industry Collaboration', href: '/collaborations/industry' },
      { label: 'Funding', href: '/collaborations/funding' },
    ],
  },
  { label: 'Media & Publications', href: '/media-publications' },
  { label: 'Contact', href: '/contact' },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];
type DropdownItem = { label: string; href: string };

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [pathname]);

  function handleDropdownKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    label: string,
    children: readonly DropdownItem[],
    dropdownId: string,
  ) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenDropdown(openDropdown === label ? null : label);
    } else if (e.key === 'Escape') {
      setOpenDropdown(null);
    } else if (e.key === 'ArrowDown' && openDropdown === label) {
      e.preventDefault();
      const firstItem = document.querySelector<HTMLElement>(`#${dropdownId} a`);
      firstItem?.focus();
    }
  }

  function handleDropdownItemKeyDown(
    e: React.KeyboardEvent<HTMLAnchorElement>,
    items: readonly DropdownItem[],
    index: number,
    dropdownId: string,
  ) {
    const allItems = document.querySelectorAll<HTMLElement>(`#${dropdownId} a`);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      allItems[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        // Focus the trigger button
        const btn = document.querySelector<HTMLElement>(
          `[aria-controls="${dropdownId}"]`,
        );
        btn?.focus();
      } else {
        allItems[index - 1]?.focus();
      }
    } else if (e.key === 'Escape') {
      setOpenDropdown(null);
      const btn = document.querySelector<HTMLElement>(
        `[aria-controls="${dropdownId}"]`,
      );
      btn?.focus();
    }
  }

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded focus:bg-white focus:text-[#0c0c48] focus:font-semibold"
      >
        Skip to main content
      </a>

      <nav
        ref={navRef}
        style={{ backgroundColor: '#0c0c48' }}
        className="text-white relative z-40"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0" aria-label="University of Auckland — Home">
              <Image
                src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Small.png"
                alt="University of Auckland"
                width={120}
                height={40}
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const hasChildren = 'children' in item && item.children;
                const dropdownId = `dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

                if (hasChildren) {
                  return (
                    <div key={item.label} className="relative">
                      <button
                        id={`btn-${dropdownId}`}
                        aria-haspopup="true"
                        aria-expanded={openDropdown === item.label}
                        aria-controls={dropdownId}
                        onClick={() =>
                          setOpenDropdown(openDropdown === item.label ? null : item.label)
                        }
                        onKeyDown={(e) =>
                          handleDropdownKeyDown(e, item.label, item.children, dropdownId)
                        }
                        className={`flex items-center gap-1 px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                          isActive(item.href) ? 'font-semibold underline underline-offset-4' : ''
                        }`}
                      >
                        {item.label}
                        <svg
                          className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openDropdown === item.label && (
                        <ul
                          id={dropdownId}
                          role="menu"
                          aria-labelledby={`btn-${dropdownId}`}
                          className="absolute top-full left-0 mt-1 w-56 rounded shadow-lg py-1 z-50"
                          style={{ backgroundColor: '#0c0c48', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                          {item.children.map((child, idx) => (
                            <li key={child.href} role="none">
                              <Link
                                href={child.href}
                                role="menuitem"
                                className={`block px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                                  isActive(child.href) ? 'font-semibold bg-white/10' : ''
                                }`}
                                onClick={() => setOpenDropdown(null)}
                                onKeyDown={(e) =>
                                  handleDropdownItemKeyDown(e, item.children, idx, dropdownId)
                                }
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                      isActive(item.href) ? 'font-semibold underline underline-offset-4' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Hamburger button */}
            <button
              className="lg:hidden p-2 rounded hover:bg-white/10 transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            style={{ backgroundColor: '#0c0c48', borderTop: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ul className="max-w-7xl mx-auto px-4 py-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const hasChildren = 'children' in item && item.children;

                if (hasChildren) {
                  return (
                    <li key={item.label}>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                          isActive(item.href) ? 'font-semibold' : ''
                        }`}
                        onClick={() =>
                          setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                        }
                        aria-expanded={mobileExpanded === item.label}
                      >
                        {item.label}
                        <svg
                          className={`w-4 h-4 transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {mobileExpanded === item.label && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`block px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                                  isActive(child.href) ? 'font-semibold bg-white/10' : ''
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-sm rounded hover:bg-white/10 transition-colors ${
                        isActive(item.href) ? 'font-semibold underline underline-offset-4' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
