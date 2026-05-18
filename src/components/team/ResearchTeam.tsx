import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
}

const RESEARCH_TEAM: TeamMember[] = [
  {
    name: "Dr Ivana Sequeira",
    role: "Senior Lecturer",
    imageSrc: "/images/team/Ivana-sequeira.png",
  },
  {
    name: "Dr Louise Lu",
    role: "Research Fellow",
    imageSrc: "/images/team/louise-lu.png",
  },
  {
    name: "Mr Jack Penhaligan",
    role: "PhD Candidate",
    imageSrc: "/images/team/jack-penhaligan.png",
  },
  {
    name: "Ms Julia Cree",
    role: "PhD Candidate",
    imageSrc: "/images/team/julia-cree.png",
  },
  {
    name: "Mr Kok Hong Leiu",
    role: "PhD Candidate",
    imageSrc: "/images/team/kok-hong-leiu.png",
  },
  {
    name: "Ms Theresa Alipia",
    role: "PhD Candidate",
    imageSrc: "/images/team/theresa-alipia.png",
  },
  {
    name: "Dr William Zhu",
    role: "Research Nurse",
    imageSrc: "/images/team/william-zhu.jpg",
  },
  {
    name: "Ms Shakeela Jayasinghe",
    role: "HNU Administrator",
    imageSrc: "/images/team/shakeela-jayasinghe.jpeg",
  },
  {
    name: "Ms Natalie Radich",
    role: "HNU Administrator",
    imageSrc: "/images/team/no-team-member-picture.png",
  },
  {
    name: "Mr Saril Vaid",
    role: "Metabolic Cook",
    imageSrc: "/images/team/no-team-member-picture.png",
  },
  {
    name: "Ms Niamh Brennan",
    role: "Research Assistant",
    imageSrc: "/images/team/no-team-member-picture.png",
  },
];

export default function ResearchTeam() {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div style={{ maxWidth: "1420px", margin: "0 auto" }}>
        <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-[#0c0c48] tracking-[1.28px] text-center mb-12 sm:mb-16 lg:mb-20">
          Research Team
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {RESEARCH_TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center text-center"
            >
              <div className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-[#0c0c48] tracking-[0.64px] leading-normal">
                {member.name}
              </h3>
              <p className="mt-1 text-[15px] text-black tracking-[0.48px] leading-normal">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
