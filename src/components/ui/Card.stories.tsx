import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./Card";
import Button from "./Button";

const meta: Meta<typeof Card> = {
  title: "Components/UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    imageSrc: { control: "text" },
    imageAlt: { control: "text" },
    href: { control: "text" },
    tag: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: "Understanding Sleep Patterns in Adults",
    description:
      "A comprehensive study exploring how modern lifestyles affect sleep quality and duration across different age groups.",
  },
};

export const WithTag: Story = {
  args: {
    title: "Cognitive Load in Remote Work Environments",
    description:
      "Examining the mental demands placed on knowledge workers during distributed collaboration.",
    tag: "Active Study",
  },
};

export const WithImage: Story = {
  args: {
    title: "Urban Biodiversity Research",
    description:
      "Tracking plant and animal species across Auckland's green corridors to measure ecosystem resilience.",
    imageSrc: "https://picsum.photos/seed/uoa/640/360",
    imageAlt: "Green urban park with diverse plant life",
    tag: "Recruiting",
  },
};

export const AsLink: Story = {
  args: {
    title: "Climate Adaptation in Pacific Communities",
    description:
      "Partnering with iwi and Pacific communities to develop locally-led resilience strategies.",
    imageSrc: "https://picsum.photos/seed/climate/640/360",
    imageAlt: "Pacific coastline at sunset",
    tag: "Active Study",
    href: "/studies/climate-adaptation",
  },
};

export const AsExternalLink: Story = {
  args: {
    title: "Global Health Initiative",
    description: "An international collaboration on post-pandemic recovery.",
    href: "https://www.auckland.ac.nz",
    tag: "Partner Project",
  },
};

export const WithFooter: Story = {
  args: {
    title: "Dr. Sarah Mitchell",
    description: "Associate Professor, Department of Psychological Medicine",
    imageSrc: "https://picsum.photos/seed/person/640/360",
    imageAlt: "Portrait of Dr. Sarah Mitchell",
    footer: <Button variant="outline" size="sm">View Profile</Button>,
  },
};

export const WithFooterAndTag: Story = {
  args: {
    title: "Digital Wellbeing in Adolescents",
    description:
      "Investigating how screen time and social media usage correlates with mental health outcomes in 14–18 year olds.",
    tag: "Completed",
    footer: (
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="primary" size="sm" href="/studies/digital-wellbeing">
          View Study
        </Button>
        <Button variant="outline" size="sm">
          Download Report
        </Button>
      </div>
    ),
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Minimal card with just a title",
  },
};

export const GridOfCards: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 340px)",
          gap: 24,
        }}
      >
        <Story />
        <Card
          title="Study Two"
          description="A second card to show grid layout."
          tag="Active Study"
          href="/studies/two"
        />
        <Card
          title="Study Three"
          description="A third card completing the row."
          tag="Recruiting"
          href="/studies/three"
        />
      </div>
    ),
  ],
  args: {
    title: "Study One",
    description: "This card demonstrates how a row of cards looks together.",
    tag: "Completed",
    href: "/studies/one",
  },
};
