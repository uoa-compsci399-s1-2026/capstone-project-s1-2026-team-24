"use client";

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { DISCOVER_VIDEO_DEFAULTS } from "@/lib/blocks/default-content";

// Subscribe to a media query without setState-in-effect (SSR-safe: false on the
// server and the first client paint, then corrected once mounted). Guards for
// environments without matchMedia (very old browsers / a jsdom test runner), and
// falls back to the deprecated addListener/removeListener for Safari < 14.
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mq = window.matchMedia(query);
      if (mq.addEventListener) {
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
      }
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    },
    () =>
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia(query).matches
        : false,
    () => false,
  );
}

export default function DiscoverVideo({
  videoId = DISCOVER_VIDEO_DEFAULTS.videoId,
  cardTitle = DISCOVER_VIDEO_DEFAULTS.cardTitle,
  cardParagraph1 = DISCOVER_VIDEO_DEFAULTS.cardParagraph1,
  cardParagraph2 = DISCOVER_VIDEO_DEFAULTS.cardParagraph2,
}: {
  videoId?: string;
  cardTitle?: string;
  cardParagraph1?: string;
  cardParagraph2?: string;
} = {}) {
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [videoHovered, setVideoHovered] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  // The src is STATIC: it always starts muted (required for autoplay) and turns
  // on the iframe JS API. Mute is then toggled purely via postMessage, so the
  // iframe never reloads (the old bug: `mute` was interpolated into the src, so
  // toggling it changed the URL and remounted/restarted the player).
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  // Target the embed's own origin in postMessage (not "*") so a player command
  // can't be delivered to an unexpected document. Derived from the src so it
  // follows the host if it ever changes (e.g. youtube-nocookie.com).
  const youtubeOrigin = useMemo(() => {
    try {
      return new URL(src).origin;
    } catch {
      return "https://www.youtube.com";
    }
  }, [src]);

  function postMessage(command: string) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      youtubeOrigin,
    );
  }

  function toggleMute() {
    postMessage(muted ? "unMute" : "mute");
    setMuted((m) => !m);
  }

  // Unmute once the video scrolls into view (people expect sound when they
  // reach it). postMessage only — the static src means setMuted just updates
  // the button, it never reloads the player.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && muted) {
          postMessage("unMute");
          setMuted(false);
        }
      },
      { threshold: 0.5 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [muted]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white overflow-hidden py-10"
    >
      {/* ── Mobile layout ── */}
      <div className="sm:hidden flex flex-col">
        <div className="relative w-full h-[280px]">
          <Image
            src="/Discover HNU.jpg"
            alt="Discover HNU"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="relative -mt-15 px-6 pb-10">
          <div
            className="flex flex-col gap-5 p-6"
            style={{ backgroundColor: "#0a4379f2", borderRadius: "40px 0" }}
          >
            <h2
              className="text-white font-bold"
              style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "28px", lineHeight: 1.2 }}
            >
              {cardTitle}
            </h2>
            <p
              className="text-white/85"
              style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "15px", lineHeight: 1.6 }}
            >
              {cardParagraph1}
            </p>
            {cardParagraph2 && (
              <p
                className="text-white/85"
                style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "15px", lineHeight: 1.6 }}
              >
                {cardParagraph2}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden sm:block py-16 px-6 sm:px-12 lg:px-45">
        <div className="max-w-[1100px] mx-auto">
          <div className="relative flex flex-row items-center gap-0">
            {isDesktop && (
              <div
                className="relative rounded-[28px] overflow-hidden flex-1 -mr-65 z-10"
                style={{ height: "550px" }}
                onMouseEnter={() => setVideoHovered(true)}
                onMouseLeave={() => setVideoHovered(false)}
              >
                <iframe
                  ref={iframeRef}
                  className="absolute w-full h-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    border: "none",
                  }}
                  src={src}
                  title="HNU video"
                  allow="autoplay; encrypted-media; fullscreen"
                />

                {/* Custom mute toggle — drives the player via postMessage so it
                    mutes in place instead of reloading. */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={!muted}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className="absolute bottom-4 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {muted ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4V5z" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4V5z" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            <div
              className="relative z-10 flex-shrink-0 w-[550px] p-15 pl-20 flex flex-col gap-6"
              style={{
                backgroundColor: "#0a4379f2",
                borderRadius: "80px 0 80px 0",
                transform: videoHovered ? "translateX(250px)" : "translateX(0)",
                transition: "transform 0.4s ease",
              }}
            >
              <h2
                className="text-white font-bold"
                style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "32px", lineHeight: 1.2 }}
              >
                {cardTitle}
              </h2>
              <p
                className="text-white/85"
                style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "16px", lineHeight: 1.6 }}
              >
                {cardParagraph1}
              </p>
              {cardParagraph2 && (
                <p
                  className="text-white/85"
                  style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "16px", lineHeight: 1.6 }}
                >
                  {cardParagraph2}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden pointer-events-none flex items-center"
          aria-hidden="true"
        >
          <div
            className="w-full h-[200px]"
            style={{
              backgroundImage: "url(/maori-pattern.svg)",
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              filter: "brightness(3) invert(0)",
              opacity: 0.25,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
