"use client";

import DirectorCard from "@/components/team/DirectorCard";
import type { TeamMemberRecord } from "@/lib/fetch-api";
import { useLanguage } from "@/contexts/LanguageContext";
import en from "@/messages/en";
import zh from "@/messages/zh";

export default function BoardOfDirectors({
  members,
}: {
  members: TeamMemberRecord[];
}) {
  const { lang } = useLanguage();
  const t = lang === "EN" ? en : zh;
  return (
    <section style={{ backgroundColor: "white", padding: "60px 48px" }}>
      <h2
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "48px",
          fontWeight: 700,
          color: "#0c0c48",
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        {t.team.boardOfDirectors}
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
        {members.map((director) => (
          <DirectorCard
            key={director.id}
            name={director.name}
            title={director.title}
            photoPath={director.photoPath}
            profileUrl={director.profileUrl}
          />
        ))}
      </div>
    </section>
  );
}
