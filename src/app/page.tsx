import PageLayout from "@/components/layout/PageLayout";
import AudiencePathway from "@/components/sections/AudiencePathway";

export default function HomePage() {
  return (
    <PageLayout
      title="UoA Research"
      description="University of Auckland Research"
    >
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Home
      </h1>
      <AudiencePathway />
    </PageLayout>
  );
}
