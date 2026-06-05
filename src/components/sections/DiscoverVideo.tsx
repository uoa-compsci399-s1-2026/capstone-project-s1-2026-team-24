"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { DISCOVER_VIDEO_DEFAULTS } from "@/lib/blocks/default-content";

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
  const [playing, setPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [videoHovered, setVideoHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1`;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function postMessage(command: string) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*",
    );
  }

  function toggleMute() {
    if (muted) postMessage("unMute");
    else postMessage("mute");
    setMuted((m) => !m);
  }

  function togglePlay() {
    if (playing) postMessage("pauseVideo");
    else postMessage("playVideo");
    setPlaying((p) => !p);
  }

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
              style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", lineHeight: 1.2 }}
            >
              {cardTitle}
            </h2>
            <p
              className="text-white/85"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: 1.6 }}
            >
              {cardParagraph1}
            </p>
            {cardParagraph2 && (
              <p
                className="text-white/85"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: 1.6 }}
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
                style={{ fontFamily: "Inter, sans-serif", fontSize: "32px", lineHeight: 1.2 }}
              >
                {cardTitle}
              </h2>
              <p
                className="text-white/85"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: 1.6 }}
              >
                {cardParagraph1}
              </p>
              {cardParagraph2 && (
                <p
                  className="text-white/85"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: 1.6 }}
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