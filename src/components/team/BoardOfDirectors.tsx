import DirectorCard from './DirectorCard';

const DIRECTORS = [
  {
    name: 'Dr Jennifer Miles Chan',
    role: 'Managing Director',
    imageSrc: '/images/team/jennifer-miles-chan.jpeg',
  },
  {
    name: 'Professor Sally Poppitt',
    role: 'Founding Director',
    imageSrc: '/images/team/Sally-poppitt.png',
  },
  {
    name: 'Professor Garth Cooper',
    role: 'Co-Director',
    imageSrc: '/images/team/Garth-cooper.png',
  },
] as const;

export default function BoardOfDirectors() {
  return (
    <section className="bg-white py-10 sm:py-16 lg:py-20">
      <div className="max-w-[1420px] mx-auto px-4 sm:px-8 lg:px-12">
        <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-[#0a4479] tracking-[1.28px] text-center mb-10 sm:mb-14 lg:mb-16">
          Board of Directors
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 lg:gap-[34px]">
          {DIRECTORS.map((director) => (
            <DirectorCard key={director.name} {...director} />
          ))}
        </div>
      </div>
    </section>
  );
}
