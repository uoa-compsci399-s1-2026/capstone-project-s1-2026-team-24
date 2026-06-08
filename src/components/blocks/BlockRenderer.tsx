import type { ReactNode } from "react";

import HomepageHero from "@/components/sections/HomepageHero";
import DiscoverVideo from "@/components/sections/DiscoverVideo";
import StudiesOverviewBlock from "@/components/sections/StudiesOverviewBlock";
import TrialDesign from "@/components/sections/TrialDesign";
import RecentPublicationsBlock from "@/components/sections/RecentPublicationsBlock";
import OurPartners from "@/components/sections/OurPartners";
import PublicationIndexBlock from "@/components/sections/PublicationIndexBlock";
import AcademicCollaborators from "@/components/sections/AcademicCollaborators";
import IndustryCollaborators from "@/components/sections/IndustryCollaborators";
import BenefitsRow from "@/components/sections/BenefitsRow";
import SectionHeading from "@/components/sections/SectionHeading";
import CollaborationsIntro from "@/components/sections/CollaborationsIntro";
import PartnerImageGrid from "@/components/sections/PartnerImageGrid";
import StudiesContactCard from "@/components/sections/StudiesContactCard";
import ContactMap from "@/components/sections/ContactMap";
import ContactDetails from "@/components/sections/ContactDetails";
import StudiesHero from "@/components/layout/StudiesHero";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";
import CalloutBannerLeft from "@/components/ui/CalloutBannerLeft";
import CalloutBannerRight from "@/components/ui/CalloutBannerRight";
import SubpageHeroBlock from "@/components/blocks/SubpageHeroBlock";
import TeamSectionsBlock from "@/components/blocks/TeamSectionsBlock";
import HomepageStudiesBlock from "@/components/blocks/HomepageStudiesBlock";
import Updates from "@/components/sections/Updates";

import { parseBlockContent, serializeBlockContent } from "@/lib/blocks/validate";
import { getBlockDefinition } from "@/lib/blocks/registry";
import { readRowContent } from "@/lib/blocks/row";
import type { RowChild, StudyCardContent, UpdateItem } from "@/lib/blocks/types";

type Content = Record<string, unknown>;

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;
const bool = (v: unknown): boolean => v === true;
const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

type ImagePosition = "center" | "right" | "left" | "top" | "bottom";
const imgPos = (v: unknown): ImagePosition | undefined =>
  v === "center" || v === "right" || v === "left" || v === "top" || v === "bottom"
    ? v
    : undefined;
const cardBg = (v: unknown): "dark" | "standard" | "light" | undefined =>
  v === "dark" || v === "standard" || v === "light" ? v : undefined;
const partnerGroup = (
  v: unknown,
): "both" | "Collaborating" | "Industry" | undefined =>
  v === "both" || v === "Collaborating" || v === "Industry" ? v : undefined;
const teamTab = (
  v: unknown,
): "all" | "board" | "research" | "alumni" | undefined =>
  v === "all" || v === "board" || v === "research" || v === "alumni"
    ? v
    : undefined;

// Coerce persisted `studyCards` JSON into a safe StudyCardContent[]: every field
// becomes a string (so nothing undefined reaches next/image's `src`), and cards
// without a usable image are dropped — a malformed entry can't crash the render.
const studyCards = (v: unknown): StudyCardContent[] =>
  (Array.isArray(v) ? v : [])
    .map((card) => {
      const o = (
        card && typeof card === "object" ? card : {}
      ) as Record<string, unknown>;
      return {
        title: str(o.title),
        subtitle: str(o.subtitle) || undefined,
        description: str(o.description),
        buttonLabel: str(o.buttonLabel) || undefined,
        buttonHref: str(o.buttonHref) || undefined,
        imageSrc: str(o.imageSrc),
        imageAlt: str(o.imageAlt),
        imagePosition: imgPos(o.imagePosition),
      };
    })
    .filter((card) => card.imageSrc !== "");

function infoCardProps(c: Content) {
  return {
    title: str(c.title),
    paragraphs: strArray(c.paragraphs),
    body: str(c.body) || undefined,
    imageSrc: str(c.imageSrc),
    imageAlt: str(c.imageAlt),
    imagePosition: imgPos(c.imagePosition),
    cardBg: cardBg(c.cardBg),
    showButton: bool(c.showButton),
    buttonLabel: str(c.buttonLabel) || undefined,
    buttonHref: str(c.buttonHref) || undefined,
  };
}

// Builds SubpageHeroBlock props from block content, falling back to the block
// type's registry defaults (the original hardcoded title/subtitle) when a field
// is empty — so a freshly-converted block with empty content renders unchanged.
function subpageHeroFromContent(type: string, c: Content) {
  const dc = getBlockDefinition(type)?.defaultContent ?? {};
  const width = c.subtitleMaxWidth;
  const defWidth = dc.subtitleMaxWidth;
  const resolvedWidth =
    typeof width === "number" || (typeof width === "string" && width !== "")
      ? width
      : typeof defWidth === "number" || typeof defWidth === "string"
        ? defWidth
        : undefined;
  return {
    title: str(c.title) || str(dc.title),
    subtitle: str(c.subtitle) || str(dc.subtitle),
    subtitleMaxWidth: resolvedWidth as string | number | undefined,
  };
}

/** Renders a single block given its type and raw JSON content string. */
export default function BlockRenderer({
  type,
  content: rawContent,
}: {
  type: string;
  content: string;
}): ReactNode {
  const c = parseBlockContent(rawContent);

  switch (type) {
    // Heroes
    case "homepageHero":
      return (
        <HomepageHero
          title={str(c.title) || undefined}
          buttonLabel={str(c.buttonLabel) || undefined}
          buttonHref={str(c.buttonHref) || undefined}
          backgroundGradient={str(c.backgroundGradient) || undefined}
          heroImageSrc={str(c.heroImageSrc) || undefined}
        />
      );
    // The page-specific heroes share the SubpageHero markup; empty content
    // falls back to the registry defaults (the original hardcoded values).
    case "discoverHero":
    case "researchHero":
    case "teamHero":
    case "contactHero":
      return <SubpageHeroBlock {...subpageHeroFromContent(type, c)} />;
    case "studiesHero":
      return <StudiesHero />;

    // Editable hero
    case "subpageHero":
      return (
        <SubpageHeroBlock
          title={str(c.title)}
          subtitle={str(c.subtitle)}
          subtitleMaxWidth={
            typeof c.subtitleMaxWidth === "number" ||
            typeof c.subtitleMaxWidth === "string"
              ? c.subtitleMaxWidth
              : undefined
          }
        />
      );

    // Editable content
    case "infoCardLeft":
      return <InfoCardLeft {...infoCardProps(c)} />;
    case "infoCardRight":
      return <InfoCardRight {...infoCardProps(c)} />;
    case "calloutBannerRight":
      return (
        <CalloutBannerRight
          leftTitle={str(c.leftTitle) || undefined}
          leftDescription={str(c.leftDescription) || undefined}
          title={str(c.title)}
          description={str(c.description)}
          showButton={bool(c.showButton)}
          buttonLabel={str(c.buttonLabel) || undefined}
          buttonHref={str(c.buttonHref) || undefined}
          backgroundImage={str(c.backgroundImage) || undefined}
          backgroundColor={str(c.backgroundColor) || undefined}
        />
      );
    case "calloutBannerLeft":
      return (
        <CalloutBannerLeft
          rightTitle={str(c.rightTitle) || undefined}
          rightDescription={str(c.rightDescription) || undefined}
          title={str(c.title)}
          description={str(c.description)}
          showButton={bool(c.showButton)}
          buttonLabel={str(c.buttonLabel) || undefined}
          buttonHref={str(c.buttonHref) || undefined}
          backgroundImage={str(c.backgroundImage) || undefined}
          backgroundColor={str(c.backgroundColor) || undefined}
        />
      );
    case "homepageStudies":
      return (
        <HomepageStudiesBlock
          cards={(Array.isArray(c.cards) ? c.cards : []) as StudyCardContent[]}
        />
      );
    case "updates": {
      const items = (Array.isArray(c.updates) ? c.updates : []) as UpdateItem[];
      const normalized = items.map((it) => ({
        title: str(it?.title),
        date: str(it?.date) || undefined,
        paragraphs: strArray(it?.paragraphs),
      }));
      // The carousel reads updates[current]; render nothing when empty.
      if (normalized.length === 0) return null;
      return (
        <Updates
          updates={normalized}
          backgroundColor={str(c.backgroundColor) || undefined}
        />
      );
    }
    case "sectionHeading":
      return (
        <SectionHeading
          text={str(c.text)}
          heightClass={str(c.heightClass, "h-32")}
          align="center"
        />
      );
    case "partnerImageGrid":
      return (
        <PartnerImageGrid
          breadcrumbLabel={str(c.breadcrumbLabel)}
          images={strArray(c.images)}
          variant={c.variant === "industry" ? "industry" : "academic"}
        />
      );
    case "benefitsRow":
      return (
        <BenefitsRow
          variant={
            c.variant === "industry"
              ? "industry"
              : c.variant === "both"
                ? "both"
                : "academic"
          }
          title={str(c.title) || undefined}
        />
      );

    // Editable collaborations blocks. Empty fields fall back to each
    // component's defaults (the original copy/images), so a freshly-converted
    // block renders unchanged. `str()`/`strArray()` coerce untrusted JSON; the
    // resolver has already turned any "media:{id}" refs into plain paths.
    case "collaborationsIntro":
      return (
        <CollaborationsIntro
          sectionTitle={str(c.sectionTitle) || undefined}
          sectionText={str(c.sectionText) || undefined}
          pathwayTitle={str(c.pathwayTitle) || undefined}
          pathwaySteps={
            Array.isArray(c.pathwaySteps) ? strArray(c.pathwaySteps) : undefined
          }
          image={str(c.image) || undefined}
          imageAlt={str(c.imageAlt) || undefined}
          complianceTitle={str(c.complianceTitle) || undefined}
          complianceText={str(c.complianceText) || undefined}
        />
      );

    // Content-frozen
    case "studiesContactCard":
      return <StudiesContactCard />;
    case "studiesOverview":
      return <StudiesOverviewBlock />;
    case "trialDesign":
      return (
        <TrialDesign
          heading={str(c.heading) || undefined}
          intro={str(c.intro) || undefined}
          residentialHeading={str(c.residentialHeading) || undefined}
          residentialBody={str(c.residentialBody) || undefined}
          communityHeading={str(c.communityHeading) || undefined}
          communityBody={str(c.communityBody) || undefined}
        />
      );
    case "discoverVideo":
      return (
        <DiscoverVideo
          videoId={str(c.videoId) || undefined}
          cardTitle={str(c.cardTitle) || undefined}
          cardParagraph1={str(c.cardParagraph1) || undefined}
          cardParagraph2={str(c.cardParagraph2) || undefined}
        />
      );
    case "contactMap":
      return <ContactMap mapUrl={str(c.mapUrl) || undefined} />;
    case "contactDetails":
      return (
        <ContactDetails
          cardOneTitle={str(c.cardOneTitle) || undefined}
          cardOneBody={str(c.cardOneBody) || undefined}
          cardTwoTitle={str(c.cardTwoTitle) || undefined}
          cardTwoBody={str(c.cardTwoBody) || undefined}
          cardThreeTitle={str(c.cardThreeTitle) || undefined}
          cardThreeBody={str(c.cardThreeBody) || undefined}
          phone={str(c.phone) || undefined}
          phoneHref={str(c.phoneHref) || undefined}
          address={str(c.address) || undefined}
        />
      );

    // Dynamic (live data, with optional display config)
    case "recentPublications":
      return <RecentPublicationsBlock limit={Number(c.limit) || undefined} />;
    // TODO: remove once carousel-deletion PR lands (Karendeep). The OurPartners
    // marquee + its home-page seed + the OurPartners component go together —
    // coordinate merge order so this case isn't deleted before the seed is.
    case "ourPartners":
      return <OurPartners group={partnerGroup(c.group)} />;
    case "publicationIndex":
      return <PublicationIndexBlock pageSize={Number(c.pageSize) || undefined} />;
    case "academicCollaborators": {
      const cards = studyCards(c.cards);
      return (
        <AcademicCollaborators
          heading={str(c.heading) || undefined}
          cards={cards.length > 0 ? cards : undefined}
          buttonLabel={str(c.buttonLabel) || undefined}
          buttonHref={str(c.buttonHref) || undefined}
        />
      );
    }
    case "industryCollaborators": {
      const cards = studyCards(c.cards);
      return (
        <IndustryCollaborators
          heading={str(c.heading) || undefined}
          cards={cards.length > 0 ? cards : undefined}
          buttonLabel={str(c.buttonLabel) || undefined}
          buttonHref={str(c.buttonHref) || undefined}
        />
      );
    }
    case "teamSections":
      return <TeamSectionsBlock defaultTab={teamTab(c.defaultTab)} />;

    // Layout: a row of 1–3 columns whose children are themselves blocks. Rows
    // can't nest (validated on write), so a row child is rendered directly.
    case "row": {
      const { columns, widths } = readRowContent(c);
      const renderChild = (child: RowChild) =>
        child.type === "row" ? null : (
          <BlockRenderer
            key={child.id}
            type={child.type}
            content={serializeBlockContent(child.content)}
          />
        );
      if (columns.length === 1) {
        return (
          <div className="flex flex-col gap-8">{columns[0].map(renderChild)}</div>
        );
      }
      return (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {columns.map((col, i) => (
            <div
              key={i}
              className="flex min-w-0 w-full flex-col gap-8 lg:w-auto"
              style={{ flexGrow: widths[i], flexBasis: 0 }}
            >
              {col.map(renderChild)}
            </div>
          ))}
        </div>
      );
    }

    default:
      // Prod-visible signal: a drifted/unknown block type would otherwise vanish
      // silently (the page still 200s). Log unconditionally so it's diagnosable.
      console.error(`[BlockRenderer] Unknown block type: ${type}`);
      return null;
  }
}
