"use client";

import { useState, useEffect, useRef } from "react";
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
  // enablejsapi=1 is required for the postMessage commands below (play/pause/
  // mute) — and for the scroll-into-view unmute — to be honoured by the player.
  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1`;

  function postMessage(command: string) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*",
    );
  }

  function toggleMute() {
    if (muted) {
      postMessage("unMute");
    } else {
      postMessage("mute");
    }
    setMuted((m) => !m);
  }

  function togglePlay() {
    if (playing) {
      postMessage("pauseVideo");
    } else {
      postMessage("playVideo");
    }
    setPlaying((p) => !p);
  }

  // Unmute when scrolled into view
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
      className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden"
    >
      
      <div className="max-w-[1100px] mx-auto">
        <div className="relative flex flex-col lg:flex-row items-center gap-0 z-5">
          {/* Video */}
          <div
            className="relative rounded-[28px] overflow-hidden flex-1 -mr-65"
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

          {/* Blue text card */}
          <div
            className="relative z-10 flex-shrink-0 w-[340px] sm:w-[400px] lg:w-[550px] p-15 pl-20 flex flex-col gap-6"
            style={{
              backgroundColor: "#0a4379f2",
              borderRadius: "80px 0 80px 0",
              transform: videoHovered ? "translateX(250px)" : "translateX(0)",
              transition: "transform 0.4s ease",
            }}
          >
            <h2
              className="text-white font-bold"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "32px",
                lineHeight: 1.2,
              }}
            >
              {cardTitle}
            </h2>

            <p
              className="text-white/85"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "16px",
                lineHeight: 1.6,
              }}
            >
              {cardParagraph1}
            </p>
            <p>{cardParagraph2}</p>

            {/* Controls — exposed so users can pause/mute the autoplaying,
                scroll-unmuting video (B53 / WCAG 2.2.2, 1.4.2). The YouTube
                embed also keeps its native controls. */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-2 w-fit bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a4379]"
              >
                {playing ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {playing ? "Pause" : "Play"}
              </button>

              {/* Mute/Unmute */}
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-2 w-fit bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a4379]"
              >
                {muted ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                    Unmute
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    Mute
                  </>
                )}
              </button>
            </div>
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
    </section>
  );
}
