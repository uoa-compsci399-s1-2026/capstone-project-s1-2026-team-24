"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { NAVBAR_HEIGHT } from "./SubpageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";
import type { SearchResult } from "@/app/api/search/route";

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // True once a fetch for a >=2-char query has completed, so we can tell the
  // "no results" state apart from "haven't searched yet".
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
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
    { label: t.navbar.donations, href: "/contact" },
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
    { label: t.navbar.discoverHnu, href: "/about" },
    { label: t.navbar.nzSynergy, href: "/studies/nz-synergy" },
    { label: t.navbar.collaborations, href: "/collaborations" },
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

  // Reset all search query state whenever the dialog closes, so reopening it
  // starts clean (and the popular-searches list shows again).
  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSearchLoading(false);
      setSearchPerformed(false);
      setActiveIndex(-1);
    }
  }, [searchOpen]);

  // Debounced live search. Fires ~250ms after the user stops typing and cancels
  // any in-flight request so stale responses can't clobber newer ones.
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchPerformed(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Search request failed: ${res.status}`);
        const data: { results?: SearchResult[] } = await res.json();
        setSearchResults(Array.isArray(data.results) ? data.results : []);
        setSearchPerformed(true);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Search failed:", error);
        setSearchResults([]);
        setSearchPerformed(true);
        setActiveIndex(-1);
      } finally {
        // The abort path leaves loading on for the superseding request, which
        // sets its own loading=true; only clear when this request wasn't aborted.
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

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

  // Activate a result by index by clicking its rendered <Link> anchor. Routing
  // through the real anchor keeps Next.js client-side navigation (and the
  // anchor's own onClick, which closes the dialog) intact, and handles external
  // links correctly — so the component needs no router instance of its own.
  const goToResult = (index: number) => {
    const anchor = document
      .getElementById(`search-result-${index}`)
      ?.querySelector<HTMLAnchorElement>("a[href]");
    anchor?.click();
  };

  // Arrow-key navigation through the live results, with Enter selecting the
  // active one. Lives on the input (which stays focused while typing) so it
  // doesn't interfere with the dialog-level Escape/Tab focus trap.
  const handleSearchInputKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (searchResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? searchResults.length - 1 : index - 1,
      );
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < searchResults.length) {
        event.preventDefault();
        goToResult(activeIndex);
      }
    }
  };

  const SEARCH_GROUP_LABELS: Record<SearchResult["type"], string> = {
    page: t.navbar.searchGroupPages,
    study: t.navbar.searchGroupStudies,
    team: t.navbar.searchGroupTeam,
    publication: t.navbar.searchGroupPublications,
    "page-content": t.navbar.searchGroupContent,
  };

  // Keep results in a stable, readable order, then group them by type while
  // preserving the flat index each row carries (used for arrow-key highlight).
  const SEARCH_GROUP_ORDER: SearchResult["type"][] = [
    "page",
    "study",
    "team",
    "publication",
    "page-content",
  ];
  const groupedResults = SEARCH_GROUP_ORDER.map((type) => ({
    type,
    items: searchResults
      .map((result, index) => ({ result, index }))
      .filter((entry) => entry.result.type === type),
  })).filter((group) => group.items.length > 0);

  const trimmedQuery = searchQuery.trim();
  const showPopularSearches = trimmedQuery.length < 2;
  const showNoResults =
    !showPopularSearches &&
    !searchLoading &&
    searchPerformed &&
    searchResults.length === 0;
  const showResults =
    !showPopularSearches && searchResults.length > 0;

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

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="z-50"
        style={{ position: "fixed", top: 0, left: 0, right: 0 }}
      >
        {/* Top utility bar */}
        <div className="hidden lg:flex relative z-[100] bg-white">
          <div className="max-w-[1512px] ml-auto px-12 flex items-center justify-end h-9.5">
            {TOP_BAR_LINKS.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
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
            className="w-full mx-auto"
            style={{
              maxWidth: mounted && scrolled && isDesktop ? "900px" : "1512px",
              margin: "0 auto",
              padding: mounted && scrolled && isDesktop ? "0 32px" : "0 48px",
              height: mounted && scrolled && isDesktop ? "80px" : "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                mounted && scrolled && isDesktop ? "rgba(0, 0, 0, 0.35)" : "transparent",
              backdropFilter: mounted && scrolled && isDesktop ? "blur(15px)" : "none",
              borderRadius: mounted && scrolled && isDesktop ? "9999px" : "0",
              transition: "all 0.4s ease",
              marginTop: mounted && scrolled && isDesktop ? "8px" : "0",
              marginBottom: mounted && scrolled && isDesktop ? "8px" : "0",
            }}
          >
            {/* Logos */}
            <div className="hidden lg:block flex items-center">
              {(!mounted || !scrolled) && <></>}
              <Link href="/" aria-label="HNU — Home">
                <Image
                  src="/images/logos/hnu-logo.svg"
                  alt="HNU"
                  width={mounted && scrolled && isDesktop ? 180 : 200}
                  height={mounted && scrolled && isDesktop ? 52 : 70}
                  className="object-contain ml-[-10px]"
                />
              </Link>
            </div>
            {/* Desktop nav items */}
            <div className="hidden lg:flex items-center gap-8">
              {/* About dropdown */}
              <div className="relative">
                <button
                  className="nav-link flex items-center gap-2 text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
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
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      backdropFilter:
                        mounted && scrolled && isDesktop ? "blur(15px)" : "blur(15px)",
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
                            <div className="absolute inset-[-0.25] bg-gradient-to-t from-[#000000] to-[#00000020] opacity-90 rounded-[30px]" />
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
                  className="nav-link flex items-center gap-2 text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
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
                    className={`fixed inset-x-0 top-0 z-[-1] ${aboutClosing ? "animate-[slideUp_0.3s_ease-out]" : "animate-[slideDown_0.3s_ease-out]"}`}
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      backdropFilter: "blur(15px)",
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
                            <div className="absolute inset-[-0.25] bg-gradient-to-t from-[#000000] to-[#00000020] opacity-90 rounded-[30px]" />
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
                className="nav-link text-[20px] text-white tracking-[0.4px] hover:opacity-80 transition-opacity"
              >
                {t.navbar.collaborations}
              </Link>

              {/* Search button */}
              <button
                ref={searchTriggerRef}
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (aboutOpen) {
                    setAboutClosing(true);
                    setTimeout(() => {
                      setAboutOpen(false);
                      setAboutClosing(false);
                    }, 300);
                  }
                  if (studiesOpen) {
                    setStudiesClosing(true);
                    setTimeout(() => {
                      setStudiesOpen(false);
                      setStudiesClosing(false);
                    }, 300);
                  }
                }}
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

            {/* Mobile nav bar — logo center, search left, hamburger right */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Logo — centered absolutely */}
              <Link
                href="/"
                aria-label="HNU — Home"
                className="absolute left-1/2 -translate-x-1/2"
              >
                <Image
                  src="/images/logos/hnu-logo.svg"
                  alt="HNU"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile full-screen overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-[200] flex flex-col animate-[fadeIn_0.3s_ease-out] lg:hidden"
            style={{
              backgroundColor: "rgba(0,0,0,0.88)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                aria-label="HNU — Home"
              >
                <Image
                  src="/images/logos/hnu-logo.svg"
                  alt="HNU"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu content */}
            <div className="flex-1 overflow-y-auto px-7 py-10">
              <p className="text-[11px] tracking-[2px] uppercase text-white/35 mb-4">
                Explore
              </p>
              <ul className="space-y-0 mb-10">
                {[
                  { label: t.navbar.home, href: "/" },
                  { label: t.navbar.about, href: "/about" },
                  { label: t.navbar.studies, href: "/studies" },
                  { label: t.navbar.collaborations, href: "/collaborations" },
                  { label: t.navbar.research, href: "/research" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-3.5 text-white text-[22px] font-medium tracking-tight border-b border-white/10 hover:opacity-70 transition-opacity"
                    >
                      {item.label}
                      <svg
                        className="w-4 h-4 text-white/35"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="text-[11px] tracking-[2px] uppercase text-white/35 mb-4">
                Connect
              </p>
              <ul className="space-y-0 mb-12">
                {TOP_BAR_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-3 text-white/70 text-[17px] border-b border-white/08 hover:opacity-70 transition-opacity"
                    >
                      {link.label}
                      <svg
                        className="w-3.5 h-3.5 text-white/25"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Language */}
              <div className="flex gap-2.5">
                {(["EN", "ZH"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm tracking-widest transition-colors border ${
                      lang === l
                        ? "bg-white/15 border-white/30 text-white"
                        : "bg-white/06 border-white/15 text-white/50"
                    }`}
                  >
                    {l === "EN" ? "EN" : "中文"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full-screen search overlay — slides down from top behind navbar */}
      {searchOpen && (
        <div
          ref={searchDialogRef}
          className="fixed inset-x-0 top-0 z-40 min-h-screen animate-[slideDown_0.3s_ease-out]"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(15px)",
          }}
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
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  placeholder={t.navbar.searchPlaceholder}
                  className="flex-1 bg-transparent text-[48px] font-bold text-white/75 placeholder:text-white/50 outline-none tracking-[0.96px] min-w-0"
                  aria-label={t.navbar.search}
                  role="combobox"
                  aria-expanded={showResults}
                  aria-controls={showResults ? "search-results" : undefined}
                  aria-activedescendant={
                    activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
                  }
                  autoComplete="off"
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

              <div
                className="mt-3 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 220px)" }}
              >
                {/* Popular searches — shown until the query reaches 2 chars. */}
                {showPopularSearches && (
                  <div>
                    <p className="text-white text-[16px] tracking-[0.32px] mb-1">
                      {t.navbar.popularSearches}
                    </p>
                    <ul>
                      {POPULAR_SEARCHES.map((item) => (
                        <li key={`${item.label}-${item.href}`}>
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
                )}

                {/* Loading — only before the first results for this query land. */}
                {!showPopularSearches && searchLoading && !showResults && (
                  <p
                    className="text-white/70 text-[18px] leading-[50px]"
                    aria-live="polite"
                  >
                    {t.navbar.searchLoading}
                  </p>
                )}

                {/* No results. */}
                {showNoResults && (
                  <p
                    className="text-white/70 text-[18px] leading-[50px]"
                    aria-live="polite"
                  >
                    {t.navbar.searchNoResults}
                  </p>
                )}

                {/* Live results, grouped and labelled by type. */}
                {showResults && (
                  <ul id="search-results" role="listbox" aria-label={t.navbar.search}>
                    {groupedResults.map((group) => (
                      <li
                        key={group.type}
                        role="group"
                        aria-label={SEARCH_GROUP_LABELS[group.type]}
                        className="mb-3"
                      >
                        <p
                          className="text-white/50 text-[13px] uppercase tracking-[1.5px] mb-1"
                          aria-hidden="true"
                        >
                          {SEARCH_GROUP_LABELS[group.type]}
                        </p>
                        {group.items.map(({ result, index }) => (
                          <div
                            key={`${result.type}-${result.href}-${index}`}
                            id={`search-result-${index}`}
                            role="option"
                            aria-selected={activeIndex === index}
                          >
                            <Link
                              href={result.href}
                              onClick={() => setSearchOpen(false)}
                              onMouseEnter={() => setActiveIndex(index)}
                              className={`block rounded-lg px-3 py-2 transition-colors ${
                                activeIndex === index
                                  ? "bg-white/15"
                                  : "hover:bg-white/10"
                              }`}
                            >
                              <span className="block text-[20px] font-bold text-white leading-snug">
                                {result.title}
                              </span>
                              {result.snippet && (
                                <span className="block text-[15px] text-white/60 leading-snug mt-0.5 line-clamp-2">
                                  {result.snippet}
                                </span>
                              )}
                            </Link>
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
