import DirectorCard from "@/components/team/DirectorCard";
import { fetchTeamData } from "@/lib/fetch-api";

export default async function BoardOfDirectors() {
  const { boardOfDirectors } = await fetchTeamData();

  return (
    <section style={{ backgroundColor: "white", padding: "60px 48px" }}>
      <h2
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "48px",
          fontWeight: 800,
          color: "#0c0c48",
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        Board of Directors
      </h2>

      <div
        style={{
          display: "flex",
          gap: "24px",
          maxWidth: "1100px",
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {boardOfDirectors.map((director) => (
          <DirectorCard
            key={director.id}
            name={director.name}
            title={director.title}
            photoPath={director.photoPath}
          />
        ))}
      </div>
    </section>
  );
}
