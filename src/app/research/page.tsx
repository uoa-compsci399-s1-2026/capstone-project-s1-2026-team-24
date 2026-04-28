import PageLayout from '@/components/layout/PageLayout';
import ResearchHero from '@/components/sections/ResearchHero';
import ResearchIntroduction from '@/components/sections/ResearchIntroduction';
import ResearchFocus from '@/components/sections/ResearchFocus';
import TrialDesign from '@/components/sections/TrialDesign';
import PostureMaintenanceCallout from '@/components/sections/PostureMaintenanceCallout';

export default function ResearchPage() {
  return (
    <PageLayout 
      title="Our Research | HNU" 
      description="Better health through nutrition science. Explore our research in diet, disease, and clinical trials."
      transparentNavbar={true}
    >
      <ResearchHero />
      <ResearchIntroduction />
      <ResearchFocus />
      <TrialDesign />
      <PostureMaintenanceCallout />
    </PageLayout>
  );
}
