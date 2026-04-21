import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroSection from "./HeroSection";

const meta: Meta<typeof HeroSection> = {
  title: "Components/UI/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "page"],
    },
    heading: { control: "text" },
    subheading: { control: "text" },
    backgroundImage: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
    secondaryCtaLabel: { control: "text" },
    secondaryCtaHref: { control: "text" },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const HomepagePrimary: Story = {
  args: {
    variant: "primary",
    heading: "Advancing Research at the University of Auckland",
    subheading:
      "Connecting industry partners and study participants with world-class research.",
    ctaLabel: "Partner with Us",
    ctaHref: "/partners",
    secondaryCtaLabel: "Participate in Research",
    secondaryCtaHref: "/participate",
  },
};

export const PageBanner: Story = {
  args: {
    variant: "page",
    heading: "About Our Research",
    subheading: "Exploring the frontiers of knowledge",
  },
};

export const PageBannerWithCta: Story = {
  args: {
    variant: "page",
    heading: "Contact Us",
    subheading: "Get in touch with our team",
    ctaLabel: "Send a Message",
    ctaHref: "/contact",
  },
};

export const PrimaryWithBackground: Story = {
  args: {
    variant: "primary",
    heading: "Advancing Research at the University of Auckland",
    subheading: "Connecting partners and participants with world-class research.",
    backgroundImage: "https://picsum.photos/1600/900",
    ctaLabel: "Partner with Us",
    ctaHref: "/partners",
    secondaryCtaLabel: "Participate in Research",
    secondaryCtaHref: "/participate",
  },
};

export const HeadingOnly: Story = {
  args: {
    variant: "page",
    heading: "Our Research Team",
  },
};
