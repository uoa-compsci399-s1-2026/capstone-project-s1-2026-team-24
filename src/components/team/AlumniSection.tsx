import Image from "next/image";
import { fetchTeamData } from "@/lib/fetch-api";

export default async function AlumniSection() {
  const { alumni } = await fetchTeamData();

  if (alumni.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div style={{ maxWidth: "1420px", margin: "0 auto" }}>
        <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-[#0c0c48] tracking-[1.28px] text-center mb-12 sm:mb-16 lg:mb-20">
          Alumni
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {alumni.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center"
            >
              <div className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={member.photoPath}
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
                {member.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
