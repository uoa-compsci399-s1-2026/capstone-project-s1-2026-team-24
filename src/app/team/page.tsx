import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TeamHero from "@/components/team/TeamHero";
import ResearchTeam from "@/components/team/ResearchTeam";
import BoardOfDirectors from "@/components/team/BoardOfDirectors";
import AlumniSection from "@/components/team/AlumniSection";
import TeamFilter from "@/components/team/TeamFilter";
import { fetchTeamData } from "@/lib/fetch-api";

export const metadata: Metadata = {
  title: "Our Team | HNU Auckland",
  description:
    "Meet the people behind the Human Nutrition Unit — our board of directors and research team.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { boardOfDirectors, researchTeam, alumni } = await fetchTeamData();

  return (
    <>
      <Navbar />
      <TeamHero />
      <main id="main-content">
        <TeamFilter
          board={<BoardOfDirectors members={boardOfDirectors} />}
          research={<ResearchTeam members={researchTeam} />}
          alumni={<AlumniSection members={alumni} />}
          hasAlumni={alumni.length > 0}
        />
      </main>
      <Footer />
    </>
  );
}
