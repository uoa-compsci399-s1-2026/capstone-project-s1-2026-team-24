import TeamFilter from "@/components/team/TeamFilter";
import BoardOfDirectors from "@/components/team/BoardOfDirectors";
import ResearchTeam from "@/components/team/ResearchTeam";
import AlumniSection from "@/components/team/AlumniSection";
import { fetchTeamData } from "@/lib/fetch-api";

// The Team page's filterable member sections. Self-contained: fetches its own
// data so it can be placed as a block. Mirrors the previous page-level composition.
export default async function TeamSectionsBlock() {
  const { boardOfDirectors, researchTeam, alumni } = await fetchTeamData();

  return (
    <TeamFilter
      board={<BoardOfDirectors members={boardOfDirectors} />}
      research={<ResearchTeam members={researchTeam} />}
      alumni={<AlumniSection members={alumni} />}
      hasAlumni={alumni.length > 0}
    />
  );
}
