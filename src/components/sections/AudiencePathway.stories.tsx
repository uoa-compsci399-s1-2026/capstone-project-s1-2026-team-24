import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AudiencePathway from "./AudiencePathway";

const meta: Meta<typeof AudiencePathway> = {
  title: "Components/Sections/AudiencePathway",
  component: AudiencePathway,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AudiencePathway>;

export const Default: Story = {};
