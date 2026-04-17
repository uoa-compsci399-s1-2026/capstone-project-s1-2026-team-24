import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
};

export const OnAbout: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/about' } },
  },
};

export const OnStudies: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/studies' } },
  },
};

export const OnCollaborations: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/collaborations/academic' } },
  },
};
