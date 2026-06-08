// Accepts a bare 11-char YouTube id or any common YouTube URL (watch, embed,
// youtu.be, shorts) and returns just the id, or "" if none can be parsed.
function extractYouTubeId(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : "";
}

// A generic, responsive 16:9 video embed with an optional heading and caption.
// Unlike the page-specific `discoverVideo`, it works on mobile AND desktop and
// has no hardcoded copy or fallback image. Static iframe src (no autoplay/mute
// toggle), so it's a plain server component — no client JS. Empty-safe: shows a
// placeholder until a link is added, never a broken iframe.
export default function VideoEmbed({
  videoId = "",
  heading,
  caption,
}: {
  videoId?: string;
  heading?: string;
  caption?: string;
}) {
  const id = extractYouTubeId(videoId);
  const src = id
    ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
    : "";
  const hasHeading = Boolean(heading && heading.trim());
  const hasCaption = Boolean(caption && caption.trim());
  return (
    <section className="@container w-full bg-white px-6 py-10 sm:px-12 @5xl:px-45">
      <div className="mx-auto max-w-[1100px]">
        {hasHeading && (
          <h2
            className="mb-5 text-2xl font-bold text-[#0c0c48] sm:text-3xl"
            style={{ fontFamily: "var(--font-inter), sans-serif", lineHeight: 1.2 }}
          >
            {heading}
          </h2>
        )}
        <div
          className="relative w-full overflow-hidden rounded-[28px] bg-[#0c0c48]/5"
          style={{ aspectRatio: "16 / 9" }}
        >
          {src ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={src}
              title={hasHeading ? heading : "Embedded video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ border: "none" }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-[#0c0c48]/40"
              aria-hidden="true"
            >
              Add a YouTube link to embed a video
            </div>
          )}
        </div>
        {hasCaption && (
          <p
            className="mt-3 text-center text-sm text-[#0c0c48]/70"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
