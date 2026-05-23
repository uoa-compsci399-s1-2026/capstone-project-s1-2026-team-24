// The single source of truth for block metadata: labels, categories, editor
// fields and default content. Pure data — safe to import from both client and
// server. Actual rendering lives in src/components/blocks/BlockRenderer.tsx,
// which maps each `type` to a React component.

import type { BlockDefinition, BlockField } from "./types";

const IMAGE_POSITION_OPTIONS = [
  "center",
  "right",
  "left",
  "top",
  "bottom",
] as const;

const CARD_BG_OPTIONS = ["dark", "standard", "light"] as const;

const INFO_CARD_FIELDS: readonly BlockField[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "body", label: "Body", type: "richText" },
  { key: "imageSrc", label: "Image", type: "image" },
  { key: "imageAlt", label: "Image alt text", type: "text" },
  {
    key: "imagePosition",
    label: "Image position",
    type: "enum",
    options: IMAGE_POSITION_OPTIONS,
  },
  {
    key: "cardBg",
    label: "Card background",
    type: "enum",
    options: CARD_BG_OPTIONS,
  },
  { key: "showButton", label: "Show button", type: "boolean" },
  { key: "buttonLabel", label: "Button label", type: "text" },
  { key: "buttonHref", label: "Button link", type: "url" },
];

const INFO_CARD_DEFAULT = {
  title: "New section",
  body: "<p>Add your content here.</p>",
  imageSrc: "",
  imageAlt: "",
  imagePosition: "center",
  cardBg: "standard",
  showButton: false,
  buttonLabel: "More Information",
  buttonHref: "#",
};

const CALLOUT_COMMON_FIELDS: readonly BlockField[] = [
  { key: "title", label: "Card title", type: "text" },
  { key: "description", label: "Card description", type: "richText" },
  { key: "showButton", label: "Show button", type: "boolean" },
  { key: "buttonLabel", label: "Button label", type: "text" },
  { key: "buttonHref", label: "Button link", type: "url" },
  { key: "backgroundImage", label: "Background image", type: "image" },
  { key: "backgroundColor", label: "Background colour / gradient", type: "text" },
];

const DEFINITIONS: BlockDefinition[] = [
  // ---- Heroes ----
  {
    type: "homepageHero",
    label: "Homepage hero",
    category: "Hero",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "discoverHero",
    label: "Discover hero",
    category: "Hero",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "researchHero",
    label: "Research hero",
    category: "Hero",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "teamHero",
    label: "Team hero",
    category: "Hero",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "contactHero",
    label: "Contact hero",
    category: "Hero",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studiesHero",
    label: "Studies hero",
    category: "Hero",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "subpageHero",
    label: "Subpage hero",
    category: "Hero",
    editable: true,
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "subtitle",
        label: "Subtitle",
        type: "textarea",
        help: "Each new line becomes a line break.",
      },
      {
        key: "subtitleMaxWidth",
        label: "Subtitle max width (px)",
        type: "text",
        help: "Optional. Leave blank for full width.",
      },
    ],
    defaultContent: { title: "Page title", subtitle: "", subtitleMaxWidth: "" },
  },

  // ---- Content ----
  {
    type: "infoCardLeft",
    label: "Info card (image left)",
    category: "Content",
    editable: true,
    fields: INFO_CARD_FIELDS,
    defaultContent: { ...INFO_CARD_DEFAULT, imagePosition: "left" },
  },
  {
    type: "infoCardRight",
    label: "Info card (image right)",
    category: "Content",
    editable: true,
    fields: INFO_CARD_FIELDS,
    defaultContent: { ...INFO_CARD_DEFAULT, imagePosition: "right" },
  },
  {
    type: "calloutBannerRight",
    label: "Callout banner (card right)",
    category: "Content",
    editable: true,
    fields: [
      { key: "leftTitle", label: "Left title", type: "text" },
      { key: "leftDescription", label: "Left description", type: "textarea" },
      ...CALLOUT_COMMON_FIELDS,
    ],
    defaultContent: {
      leftTitle: "",
      leftDescription: "",
      title: "Heading",
      description: "Description text.",
      showButton: false,
      buttonLabel: "Find out more",
      buttonHref: "#",
      backgroundImage: "",
      backgroundColor: "",
    },
  },
  {
    type: "calloutBannerLeft",
    label: "Callout banner (card left)",
    category: "Content",
    editable: true,
    fields: [
      { key: "rightTitle", label: "Right title", type: "text" },
      { key: "rightDescription", label: "Right description", type: "textarea" },
      ...CALLOUT_COMMON_FIELDS,
    ],
    defaultContent: {
      rightTitle: "",
      rightDescription: "",
      title: "Heading",
      description: "Description text.",
      showButton: false,
      buttonLabel: "Find out more",
      buttonHref: "#",
      backgroundImage: "",
      backgroundColor: "",
    },
  },
  {
    type: "homepageStudies",
    label: "Study cards row",
    category: "Content",
    editable: true,
    fields: [{ key: "cards", label: "Study cards", type: "studyCards" }],
    defaultContent: {
      cards: [
        {
          title: "Study title",
          subtitle: "",
          description: "Short description of the study.",
          buttonLabel: "Find out more >",
          buttonHref: "/studies",
          imageSrc: "",
          imageAlt: "",
          imagePosition: "center",
        },
      ],
    },
  },
  {
    type: "sectionHeading",
    label: "Section heading",
    category: "Heading",
    scope: "both",
    editable: true,
    fields: [
      { key: "text", label: "Heading text", type: "text" },
      {
        key: "heightClass",
        label: "Vertical space",
        type: "enum",
        options: ["h-32", "h-80"],
        help: "h-32 = compact, h-80 = tall.",
      },
    ],
    defaultContent: { text: "Heading", heightClass: "h-32" },
  },
  {
    type: "collaborationsIntro",
    label: "Collaborations intro",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "partnerImageGrid",
    label: "Partner logo grid",
    category: "Content",
    editable: true,
    fields: [
      { key: "breadcrumbLabel", label: "Breadcrumb label", type: "text" },
      { key: "images", label: "Logos", type: "imageArray" },
    ],
    defaultContent: { breadcrumbLabel: "Partners", images: [], variant: "academic" },
  },
  {
    type: "studiesContactCard",
    label: "Studies contact card",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studiesOverview",
    label: "Studies overview",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "trialDesign",
    label: "Trial design",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "discoverVideo",
    label: "Discover video",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "contactMap",
    label: "Contact map",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "contactDetails",
    label: "Contact details",
    category: "Content",
    editable: false,
    fields: [],
    defaultContent: {},
  },

  // ---- Dynamic (pull live data from existing admin sections) ----
  {
    type: "recentPublications",
    label: "Recent publications",
    category: "Dynamic",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "ourPartners",
    label: "Our partners",
    category: "Dynamic",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "publicationIndex",
    label: "Publication index",
    category: "Dynamic",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "academicCollaborators",
    label: "Academic collaborators",
    category: "Dynamic",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "industryCollaborators",
    label: "Industry collaborators",
    category: "Dynamic",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "teamSections",
    label: "Team members",
    category: "Dynamic",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "benefitsRow",
    label: "Benefits row",
    category: "Content",
    editable: true,
    fields: [
      {
        key: "variant",
        label: "Variant",
        type: "enum",
        options: ["academic", "industry", "both"],
      },
      { key: "title", label: "Title (optional)", type: "text" },
    ],
    defaultContent: { variant: "academic", title: "" },
  },

  // ---- Study layout blocks (study-layout builder only) ----
  // These render live data from the study being viewed, so they have no
  // editable content — they are placed, reordered and arranged into columns.
  {
    type: "studyStatusBar",
    label: "Status & language bar",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyDescription",
    label: "Description",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyCompensation",
    label: "What you'll receive",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyEligibility",
    label: "Eligibility panel",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyJoinButton",
    label: "Join now (REDCap)",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyContact",
    label: "Contact details",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyEthics",
    label: "Ethics statement",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "studyPdfs",
    label: "Downloads",
    category: "Study",
    scope: "study",
    editable: false,
    fields: [],
    defaultContent: {},
  },
  {
    type: "row",
    label: "Row (columns)",
    category: "Layout",
    scope: "study",
    editable: true,
    fields: [],
    defaultContent: { variant: "twoColumn", columns: [[], []] },
  },
];

export const BLOCK_REGISTRY: Record<string, BlockDefinition> =
  Object.fromEntries(DEFINITIONS.map((def) => [def.type, def]));

// List block definitions available in a given builder scope. A block's scope
// defaults to "page"; "both" appears everywhere.
export function listBlockDefinitions(
  scope: "page" | "study" = "page",
): BlockDefinition[] {
  return DEFINITIONS.filter((def) => {
    const defScope = def.scope ?? "page";
    return defScope === "both" || defScope === scope;
  });
}

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return BLOCK_REGISTRY[type];
}
