import HeroSection from '@/components/ui/HeroSection';
import SectionContainer from '@/components/layout/SectionContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageLayout from '@/components/layout/PageLayout';

const facilities = [
  {
    title: 'Residential Suites (Controlled Diet)',
    description:
      'Purpose-built, comfortable accommodation allowing for highly controlled, overnight dietary intervention studies and 24-hour monitoring.',
  },
  {
    title: 'Metabolic Kitchen',
    description:
      'A specialized, fully equipped facility designed for the precise preparation, portioning, and nutritional analysis of customized study diets.',
  },
  {
    title: 'Appetite Research Lab',
    description:
      'Dedicated clinical space tailored for assessing satiety, eating behaviors, and psychological responses to food.',
  },
  {
    title: 'Indirect Calorimetry Suite',
    description:
      'Equipped with advanced technology to accurately measure resting energy expenditure and metabolic rates.',
  },
  {
    title: 'Phlebotomy & Sample Collection',
    description:
      'Clean, clinical environments dedicated to the safe, efficient drawing of blood and the processing of biological samples.',
  },
  {
    title: 'Nursing Cover',
    description:
      'Professional, on-site clinical oversight ensuring the highest standards of participant safety and strict adherence to trial protocols.',
  },
];

const trialFocusAreas = [
  'Overweight and obesity',
  'Weight control & appetite regulation',
  'Metabolic syndrome & dyslipidaemia',
  'Cardiovascular & diabetic risk',
];

export default function AboutPage() {
  return (
    <PageLayout
      title="About HNU | Human Nutrition Unit"
      description="Learn about the Human Nutrition Unit — Australasia's only residential nutrition trial facility with 25+ years of research excellence."
    >
      {/* Section 1: Hero */}
      <HeroSection
        variant="page"
        heading="About HNU"
        subheading="Establishing links between diet, health, and disease prevention through world-class clinical research."
      />

      {/* Section 2: Who We Are */}
      <SectionContainer background="white" padding="md">
        <h2 className="text-3xl font-bold text-[#0c0c48] mb-6">Who We Are</h2>
        <p className="text-gray-700 leading-relaxed max-w-3xl">
          The Human Nutrition Unit (HNU) is a premier nutrition research facility within The
          University of Auckland, New Zealand&apos;s largest and most prestigious university. With a
          proud history spanning over 25 years, HNU stands as Australasia&apos;s only residential
          nutrition trial facility. Operating on a highly successful, self-sustaining grant model,
          our unit has secured over $25M+ in trial funding to date. Our core mission is to undertake
          rigorous research that establishes clear, evidence-based links between diet, health, and
          the prevention of chronic diseases.
        </p>
      </SectionContainer>

      {/* Section 3: Our Facilities */}
      <SectionContainer background="light" padding="md">
        <h2 className="text-3xl font-bold text-[#0c0c48] mb-8">Our Facilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <Card
              key={facility.title}
              title={facility.title}
              description={facility.description}
            />
          ))}
        </div>
      </SectionContainer>

      {/* Section 4: What We Do */}
      <SectionContainer background="white" padding="md">
        <h2 className="text-3xl font-bold text-[#0c0c48] mb-6">What We Do</h2>
        <div className="max-w-3xl">
          <p className="text-gray-700 leading-relaxed mb-6">
            We conduct rigorous, high-quality clinical trials through both academic partnerships and
            commercial collaborations. Our specialized team investigates the physiological effects of
            whole foods, food components, bioactives, and nutraceutical products on human health.
          </p>
          <p className="text-gray-700 font-medium mb-3">Our clinical trials primarily focus on:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {trialFocusAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      </SectionContainer>

      {/* Section 5: CTA Row */}
      <SectionContainer background="dark" padding="md">
        <div className="text-center">
          <p className="text-xl font-medium text-white mb-8">
            Discover the people and the science driving our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button href="/our-team" variant="secondary" size="lg">
              Meet Our Team
            </Button>
            <Button href="/research" variant="outline" size="lg" className="border-white text-white hover:bg-white/10 focus-visible:outline-white">
              Explore Our Research
            </Button>
          </div>
        </div>
      </SectionContainer>
    </PageLayout>
  );
}
