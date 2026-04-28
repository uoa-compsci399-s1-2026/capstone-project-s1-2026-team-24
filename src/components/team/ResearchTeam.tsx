import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
}

const RESEARCH_TEAM: TeamMember[] = [
  {
    name: 'Dr Ivana Sequeira',
    role: 'Senior Lecturer',
    imageSrc: '/images/team/Ivana-sequeira.png',
  },
  {
    name: 'Dr Louise Lu',
    role: 'Research Fellow',
    imageSrc: '/images/team/louise-lu.png',
  },
  {
    name: 'Mr Jack Penhaligan',
    role: 'PhD Candidate',
    imageSrc: '/images/team/jack-penhaligan.png',
  },
  {
    name: 'Ms Julia Cree',
    role: 'PhD Candidate',
    imageSrc: '/images/team/julia-cree.png',
  },
  {
    name: 'Mr Kok Hong Leiu',
    role: 'PhD Candidate',
    imageSrc: '/images/team/kok-hong-leiu.png',
  },
  {
    name: 'Ms Theresa Alipia',
    role: 'PhD Candidate',
    imageSrc: '/images/team/theresa-alipia.png',
  },
  {
    name: 'Dr William Zhu',
    role: 'Research Nurse',
    imageSrc: '/images/team/william-zhu.jpg',
  },
  {
    name: 'Ms Shakeela Jayasinghe',
    role: 'HNU Administrator',
    imageSrc: '/images/team/shakeela-jayasinghe.jpeg',
  },
  {
    name: 'Ms Natalie Radich',
    role: 'HNU Administrator',
    imageSrc: '/images/team/no-team-member-picture.png',
  },
  {
    name: 'Mr Saril Vaid',
    role: 'Metabolic Cook',
    imageSrc: '/images/team/no-team-member-picture.png',
  },
  {
    name: 'Ms Niamh Brennan',
    role: 'Research Assistant',
    imageSrc: '/images/team/no-team-member-picture.png',
  },
];

export default function ResearchTeam() {
  return (
    <section className="bg-[#eeeeee] py-20">
      <div className="max-w-[1420px] mx-auto px-12">
        <h2 className="text-[64px] font-extrabold text-[#0a4479] tracking-[1.28px] text-center mb-20">
          Research Team
        </h2>
        <div className="flex flex-wrap justify-center gap-x-[34px] gap-y-16">
          {RESEARCH_TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center text-center w-[300px]"
            >
              <div className="w-[300px] h-[300px] rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-6 text-[32px] font-bold text-[#0c0c48] tracking-[0.64px] leading-normal">
                {member.name}
              </h3>
              <p className="mt-2 text-[24px] text-black tracking-[0.48px] leading-normal">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
