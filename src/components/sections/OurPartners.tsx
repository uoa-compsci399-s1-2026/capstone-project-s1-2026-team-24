import { fetchPartnerLogos, type PartnerLogoRecord } from "@/lib/fetch-api";

function PartnerMarquee({
  partners,
  ariaLabel,
}: {
  partners: PartnerLogoRecord[];
  ariaLabel: string;
}) {
  const items = [...partners, ...partners];

  return (
    <div className="overflow-hidden w-full" aria-label={ariaLabel}>
      <div
        className="marquee-track flex items-center gap-8 sm:gap-12 lg:gap-16"
        aria-hidden="true"
      >
        {items.map((partner, idx) => (
          <div
            key={`${partner.id}-${idx}`}
            className="flex-none w-[160px] sm:w-[200px] lg:w-[240px] h-[100px] sm:h-[120px] lg:h-[140px] bg-white flex items-center justify-center"
          >
            {partner.websiteUrl ? (
              <a
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full items-center justify-center"
              >
                <img
                  src={partner.logoPath}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain"
                />
              </a>
            ) : (
              <img
                src={partner.logoPath}
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function OurPartners() {
  let partnerLogos: PartnerLogoRecord[] = [];

  try {
    partnerLogos = await fetchPartnerLogos();
  } catch (error) {
    console.error("Partner logos fetch failed:", error);
  }

  const collaborating = partnerLogos.filter((p) => p.group === "Collaborating");
  const industry = partnerLogos.filter((p) => p.group === "Industry");

  return (
    <section className="bg-white py-14 sm:py-18 lg:py-24">
      {collaborating.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c0c48] text-center mb-8 px-6">
            Collaborating Partners
          </h2>
          <PartnerMarquee
            partners={collaborating}
            ariaLabel="Collaborating partners"
          />
        </div>
      )}

      {industry.length > 0 && (
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c0c48] text-center mb-8 px-6">
            Current Industry Partners
          </h2>
          <PartnerMarquee
            partners={industry}
            ariaLabel="Current industry partners"
          />
        </div>
      )}
    </section>
  );
}
