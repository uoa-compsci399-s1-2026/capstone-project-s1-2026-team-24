import SubpageHero from '@/components/layout/SubpageHero';

export default function StudiesHero() {
  return (
    <SubpageHero
      title="Our Studies"
      subtitleMaxWidth={655}
      subtitle={
        <>
          Take part in advancing nutrition science.
          <br />
          Explore our current studies and how to get involved.
        </>
      }
    />
  );
}
