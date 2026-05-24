import type { ReactNode } from "react";

import HomepageHero from "@/components/sections/HomepageHero";
import DiscoverVideo from "@/components/sections/DiscoverVideo";
import StudiesOverview from "@/components/sections/StudiesOverview";
import TrialDesign from "@/components/sections/TrialDesign";
import RecentPublications from "@/components/sections/RecentPublications";
import OurPartners from "@/components/sections/OurPartners";
import PublicationIndex from "@/components/sections/PublicationIndex";
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

import { parseBlockContent } from "@/lib/blocks/validate";
import { getBlockDefinition } from "@/lib/blocks/registry";
import type { StudyCardContent } from "@/lib/blocks/types";

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
    case "sectionHeading":
      return (
        <SectionHeading
          text={str(c.text)}
          heightClass={str(c.heightClass, "h-32")}
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

    // Content-frozen
    case "collaborationsIntro":
      return <CollaborationsIntro />;
    case "studiesContactCard":
      return <StudiesContactCard />;
    case "studiesOverview":
      return <StudiesOverview />;
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
      return <RecentPublications limit={Number(c.limit) || undefined} />;
    case "ourPartners":
      return <OurPartners group={partnerGroup(c.group)} />;
    case "publicationIndex":
      return <PublicationIndex pageSize={Number(c.pageSize) || undefined} />;
    case "academicCollaborators":
      return <AcademicCollaborators />;
    case "industryCollaborators":
      return <IndustryCollaborators />;
    case "teamSections":
      return <TeamSectionsBlock defaultTab={teamTab(c.defaultTab)} />;

    default:
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[BlockRenderer] Unknown block type: ${type}`);
      }
      return null;
  }
}
