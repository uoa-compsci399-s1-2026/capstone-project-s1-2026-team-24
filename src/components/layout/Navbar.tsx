"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAVBAR_HEIGHT } from "./SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";



export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [studiesOpen, setStudiesOpen] = useState(false);
  const [searchStudiesOpen, setSearchStudiesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = lang === "EN" ? en : zh;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileStudiesOpen, setMobileStudiesOpen] = useState(false);
  const [aboutClosing, setAboutClosing] = useState(false);
  const [studiesClosing, setStudiesClosing] = useState(false);
  const [searchContentTopOffset, setSearchContentTopOffset] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);
  const wasSearchOpenRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ABOUT_ITEMS = [
    { label: t.navbar.discoverHnu, image: "Discover HNU", href: "/about" },
    { label: t.navbar.team, image: "Our Team", href: "/team" },
    { label: t.navbar.research, image: "Our Research", href: "/research" },
  ] as const;

  const TOP_BAR_LINKS = [
    { label: t.navbar.donations, href: "/collaborations/funding" },
    { label: t.navbar.contact, href: "/contact" },
  ] as const;

  const STUDIES_ITEMS = [
    {
      label: t.navbar.studiesOverview,
      image: "Studies Overview",
      href: "/studies",
    },
    {
      label: t.navbar.nzSynergy,
      image: "NZ Synergy Study",
      href: "/studies/nz-synergy",
    },
    {
      label: t.navbar.foodBeverage,
      image: "NZ Food & Beverage Study",
      href: "/studies/food-beverage",
    },
    {
      label: t.navbar.ferdinand,
      image: "Ferdinand Study",
      href: "/studies/ferdinand",
    },
  ] as const;

  const POPULAR_SEARCHES = [
    { label: t.navbar.donations, href: "/collaborations/funding" },
    { label: t.navbar.contact, href: "/contact" },
  ] as const;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else if (window.scrollY < 5) {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
        setStudiesOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Close any open menus and re-evaluate transient scroll/mount UI on
    // navigation — an intentional reset keyed on the pathname change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setAboutOpen(false);
    setStudiesOpen(false);
    setSearchStudiesOpen(false);
    setSearchOpen(false);
    setLangOpen(false);
    setMobileAboutOpen(false);
    setMobileStudiesOpen(false);
    // Reset scroll state and re-evaluate
    setScrolled(window.scrollY > 10);
    setMounted(true);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    } else if (wasSearchOpenRef.current) {
      searchTriggerRef.current?.focus();
    }
    wasSearchOpenRef.current = searchOpen;
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      previousBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else if (previousBodyOverflowRef.current !== null) {
      document.body.style.overflow = previousBodyOverflowRef.current;
      previousBodyOverflowRef.current = null;
    }

    return () => {
      if (previousBodyOverflowRef.current !== null) {
        document.body.style.overflow = previousBodyOverflowRef.current;
        previousBodyOverflowRef.current = null;
      }
    };
  }, [searchOpen]);

  useEffect(() => {
    const updateSearchContentTopOffset = () => {
      setSearchContentTopOffset(headerRef.current?.offsetHeight ?? 0);
    };

    updateSearchContentTopOffset();

    window.addEventListener("resize", updateSearchContentTopOffset);
    const headerElement = headerRef.current;
    const resizeObserver =
      typeof window !== "undefined" && "ResizeObserver" in window
        ? new ResizeObserver(updateSearchContentTopOffset)
        : null;

    if (headerElement && resizeObserver) {
      resizeObserver.observe(headerElement);
    }

    return () => {
      window.removeEventListener("resize", updateSearchContentTopOffset);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    function handleSearchDialogKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSearchOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const dialogElement = searchDialogRef.current;
      if (!dialogElement) return;

      const focusableElements = Array.from(
        dialogElement.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          !dialogElement.contains(activeElement)
        ) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (
        activeElement === lastElement ||
        !dialogElement.contains(activeElement)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleSearchDialogKeyDown);
    return () =>
      document.removeEventListener("keydown", handleSearchDialogKeyDown);
  }, [searchOpen]);

  // The home page hero pulls its own gradient up over the navbar, so the
  // navbar stays transparent there to let it show through. On every other
  // page the navbar carries its own gradient (sampled from Figma): opaque
  // dark navy at the top fading to fully transparent at the bottom, so the
  // subpage hero gradient flows up into the navbar and the two read as one
  // block with no hard seam.
  const isHomePage = pathname === "/";
  const mainNavStyle = isHomePage
    ? { backgroundColor: "#00000000" }
    : isHomePage
      ? undefined
      : { backgroundColor: "#00000000" };

  return (
    <>
      <header
        ref={headerRef}
        className="z-50"
        style={{ position: "fixed", top: 0, left: 0, right: 0 }}
      >
        {/* Top utility bar */}
        <div className="relative z-[100] bg-white">
          <div className="max-w-[1512px] mx-auto px-12 flex items-center justify-end h-9.5">
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
            <div className="relative z-[110] ml-1">
              <button
                onClick={() => {
                  setLangOpen((open) => !open);
                  setAboutOpen(false);
                  setStudiesOpen(false);
                }}
                className="flex items-center gap-1 px-3 text-[14px] font-bold tracking-[0.28px] text-[#0c0c48] hover:opacity-70 transition-opacity"
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                {lang}
                <svg
                  className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {langOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full mt-1 z-[9999] min-w-[60px] rounded border border-gray-100 bg-white shadow-lg"
                >
                  {(["EN", "ZH"] as const).map((l) => (
                    <li key={l} role="option" aria-selected={lang === l}>
                      <button
                        className={`block w-full px-4 py-2 text-[14px] font-bold text-[#0c0c48] hover:bg-gray-50 text-left ${lang === l ? "bg-gray-50" : ""}`}
                        onClick={() => {
                          setLang(l);
                          setLangOpen(false);
                        }}
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
          className="transition-all duration-300"
          aria-label="Main navigation"
        >
          <div
            style={{
              maxWidth: mounted && scrolled ? "900px" : "1512px",
              margin: "0 auto",
              padding: mounted && scrolled ? "0 32px" : "0 48px",
              height: mounted && scrolled ? "80px" : "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                mounted && scrolled ? "rgba(0, 0, 0, 0.35)" : "transparent",
              backdropFilter: mounted && scrolled ? "blur(15px)" : "none",
              borderRadius: mounted && scrolled ? "9999px" : "0",
              transition: "all 0.4s ease",
              marginTop: mounted && scrolled ? "8px" : "0",
              marginBottom: mounted && scrolled ? "8px" : "0",
            }}
          >
            {/* Logos */}
            <div className="flex items-center">
              {(!mounted || !scrolled) && (
                <>
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
                  <div
                    className="w-[2px] h-16 bg-white/60 mx-2"
                    aria-hidden="true"
                  />
                </>
              )}
              <Link href="/" aria-label="HNU — Home">
                <Image
                  src="/images/logos/hnu-logo.svg"
                  alt="HNU"
                  width={mounted && scrolled ? 150 : 200}
                  height={mounted && scrolled ? 52 : 70}
                  className="object-contain ml-[-10px]"
                />
              </Link>
            </div>
            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-8">
              {/* About dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (aboutOpen) {
                      setAboutClosing(true);
                      setTimeout(() => {
                        setAboutOpen(false);
                        setAboutClosing(false);
                      }, 300);
                    } else {
                      setAboutOpen(true);
                    }
                    setStudiesOpen(false);
                    setLangOpen(false);
                  }}
                  aria-expanded={aboutOpen}
                  aria-haspopup="true"
                  aria-controls="about-dropdown"
                >
                  {t.navbar.about}
                  <svg
                    className={`w-3 h-3 transition-transform ${aboutOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {(aboutOpen || aboutClosing) && (
                  <div
                    id="about-dropdown"
                    role="menu"
                    className={`fixed inset-x-0 top-0 z-[-1] overflow-hidden ${aboutClosing ? "animate-[slideUp_0.3s_ease-out]" : "animate-[slideDown_0.3s_ease-out]"}`}
                    style={{
                      backgroundColor: "#0c0c48",
                      height: scrolled ? "350px" : "400px",
                      paddingTop: scrolled
                        ? `${searchContentTopOffset - 40}px`
                        : `${searchContentTopOffset}px`,
                      borderRadius: scrolled ? "40px" : "0",
                    }}
                  >
                    <div className="max-w-[1512px] mx-auto px-12 h-full flex items-end pb-10 justify-end">
                      <div className="flex space-x-4">
                        {ABOUT_ITEMS.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setAboutClosing(true);
                              setTimeout(() => {
                                setAboutOpen(false);
                                setAboutClosing(false);
                              }, 300);
                            }}
                            className="relative group block transition-transform duration-300 hover:scale-105"
                          >
                            <img
                              src={`/${item.image}.jpg`}
                              className="w-[300px] h-[200px] object-cover rounded-[30px]"
                              alt={item.label}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c48] to-[#0c0c4830] opacity-90 rounded-[30px]" />
                            <p className="absolute bottom-0 left-0 pl-[20px] pb-[10px] text-white text-[18px] font-semibold">
                              {item.label}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Studies dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (studiesOpen) {
                      setStudiesClosing(true);
                      setTimeout(() => {
                        setStudiesOpen(false);
                        setStudiesClosing(false);
                      }, 300);
                    } else {
                      setStudiesOpen(true);
                    }
                    setAboutOpen(false);
                    setLangOpen(false);
                  }}
                  aria-expanded={studiesOpen}
                  aria-haspopup="true"
                  aria-controls="studies-dropdown"
                >
                  {t.navbar.studies}
                  <svg
                    className={`w-3 h-3 transition-transform ${studiesOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Studies dropdown — outside header so it scrolls with page */}
                {(studiesOpen || studiesClosing) && (
                  <div
                    id="studies-dropdown"
                    role="menu"
                    className={`fixed inset-x-0 top-0 z-[-1] overflow-hidden ${studiesClosing ? "animate-[slideUp_0.3s_ease-out]" : "animate-[slideDown_0.3s_ease-out]"}`}
                    style={{
                      backgroundColor: "#0c0c48",
                      height: scrolled ? "350px" : "400px",
                      paddingTop: scrolled
                        ? `${searchContentTopOffset - 40}px`
                        : `${searchContentTopOffset}px`,
                      borderRadius: scrolled ? "40px" : "0",
                    }}
                  >
                    <div className="max-w-[1512px] mx-auto px-12 h-full flex items-end pb-10 justify-end">
                      <div className="flex space-x-4">
                        {STUDIES_ITEMS.slice(1).map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setStudiesClosing(true);
                              setTimeout(() => {
                                setStudiesOpen(false);
                                setStudiesClosing(false);
                              }, 300);
                            }}
                            className="relative group block transition-transform duration-300 hover:scale-105"
                          >
                            <img
                              src={`/${item.image}.jpg`}
                              className="w-[300px] h-[200px] object-cover rounded-[30px]"
                              alt={item.label}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c48] to-[#0c0c4830] opacity-90 rounded-[30px]" />
                            <p className="absolute bottom-0 left-0 pl-[20px] pb-[10px] text-white text-[18px] font-semibold">
                              {item.label}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/collaborations"
                className="text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
              >
                {t.navbar.collaborations}
              </Link>

              {/* Search button */}
              <button
                ref={searchTriggerRef}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                className={`flex items-center justify-center border-[3px] border-white text-white hover:bg-white/10 h-[57px] transition-all duration-300 ease-in-out ${
                  searchOpen
                    ? "w-[57px] rounded-full"
                    : "w-[160px] rounded-[28.5px] gap-3 pl-4 pr-6"
                }`}
              >
                <div className="relative w-5 h-5 flex-shrink-0">
                  <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      searchOpen
                        ? "opacity-0 rotate-90 scale-50"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <svg
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                      searchOpen
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-90 scale-50"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <span
                  className={`text-[20px] tracking-[0.4px] whitespace-nowrap transition-all duration-300 overflow-hidden ${
                    searchOpen ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}
                >
                  {t.navbar.search}
                </span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
            style={{
              backgroundColor: "#0c0c48",
              borderTop: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <ul className="px-4 py-2 space-y-1">
              <li>
                <Link
                  href="/"
                  className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                >
                  {t.navbar.home}
                </Link>
              </li>
              <li>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  aria-expanded={mobileAboutOpen}
                >
                  {t.navbar.about}
                  <svg
                    className={`w-4 h-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
                  {t.navbar.studies}
                  <svg
                    className={`w-4 h-4 transition-transform ${mobileStudiesOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
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
                <Link
                  href="/collaborations"
                  className="block px-3 py-2 text-sm text-white rounded hover:bg-white/10 transition-colors"
                >
                  {t.navbar.collaborations}
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

      {/* Full-screen search overlay — slides down from top behind navbar */}
      {searchOpen && (
        <div
          ref={searchDialogRef}
          className="fixed inset-x-0 top-0 z-40 min-h-screen animate-[slideDown_0.3s_ease-out]"
          style={{ backgroundColor: "#0c0c48" }}
          role="dialog"
          aria-modal="true"
          aria-label={t.navbar.search}
        >
          <div
            className="px-14 max-w-[1512px] mx-auto"
            style={{ paddingTop: `${searchContentTopOffset}px` }}
          >
            <div className="max-w-[741px] mx-auto">
              <div className="flex items-center gap-4 pb-4 border-b border-white/30">
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder={t.navbar.search}
                  className="flex-1 bg-transparent text-[48px] font-bold text-white/75 placeholder:text-white/50 outline-none tracking-[0.96px] min-w-0"
                  aria-label={t.navbar.search}
                />
                <svg
                  className="w-10 h-10 text-white/75 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="mt-3">
                <p className="text-white text-[16px] tracking-[0.32px] mb-1">
                  {t.navbar.popularSearches}
                </p>
                <ul>
                  <li>
                    <button
                      className="flex items-center gap-2 text-[20px] font-bold text-white leading-[50px] hover:opacity-80 transition-opacity"
                      onClick={() => setSearchStudiesOpen(!searchStudiesOpen)}
                      aria-expanded={searchStudiesOpen}
                      aria-haspopup="true"
                      aria-controls="search-studies-dropdown"
                    >
                      {t.navbar.studies}
                      <svg
                        className={`w-4 h-4 transition-transform ${searchStudiesOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
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
