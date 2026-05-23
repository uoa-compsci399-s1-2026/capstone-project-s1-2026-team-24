import type { ReactNode } from "react";

import HomepageHero from "@/components/sections/HomepageHero";
import DiscoverHero from "@/components/sections/DiscoverHero";
import ResearchHero from "@/components/sections/ResearchHero";
import ContactHero from "@/components/sections/ContactHero";
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
import TeamHero from "@/components/team/TeamHero";
import StudiesHero from "@/components/layout/StudiesHero";
import InfoCardLeft from "@/components/ui/InfoCardLeft";
import InfoCardRight from "@/components/ui/InfoCardRight";
import CalloutBannerLeft from "@/components/ui/CalloutBannerLeft";
import CalloutBannerRight from "@/components/ui/CalloutBannerRight";
import SubpageHeroBlock from "@/components/blocks/SubpageHeroBlock";
import TeamSectionsBlock from "@/components/blocks/TeamSectionsBlock";
import HomepageStudiesBlock from "@/components/blocks/HomepageStudiesBlock";

import { parseBlockContent } from "@/lib/blocks/validate";
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
    // Heroes (content-frozen)
    case "homepageHero":
      return <HomepageHero />;
    case "discoverHero":
      return <DiscoverHero />;
    case "researchHero":
      return <ResearchHero />;
    case "teamHero":
      return <TeamHero />;
    case "contactHero":
      return <ContactHero />;
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
      return <TrialDesign />;
    case "discoverVideo":
      return <DiscoverVideo />;
    case "contactMap":
      return <ContactMap />;
    case "contactDetails":
      return <ContactDetails />;

    // Dynamic (live data)
    case "recentPublications":
      return <RecentPublications />;
    case "ourPartners":
      return <OurPartners />;
    case "publicationIndex":
      return <PublicationIndex />;
    case "academicCollaborators":
      return <AcademicCollaborators />;
    case "industryCollaborators":
      return <IndustryCollaborators />;
    case "teamSections":
      return <TeamSectionsBlock />;

    default:
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[BlockRenderer] Unknown block type: ${type}`);
      }
      return null;
  }
}
