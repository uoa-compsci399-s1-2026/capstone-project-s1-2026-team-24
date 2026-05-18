import Image from "next/image";

interface Director {
  name: string;
  role: string;
  imageSrc: string;
  linkedinUrl?: string;
  email?: string;
}

const DIRECTORS: Director[] = [
  {
    name: "Dr Jennifer Miles Chan",
    role: "Managing Director",
    imageSrc: "/images/team/jennifer-miles-chan.jpeg",
  },
  {
    name: "Professor Sally Poppitt",
    role: "Founding Director",
    imageSrc: "/images/team/Sally-poppitt.png",
  },
  {
    name: "Professor Garth Cooper",
    role: "Co-Director",
    imageSrc: "/images/team/Garth-cooper.png",
  },
];

function DirectorCard({ name, role, imageSrc }: Director) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 0 20px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 32px 32px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          marginBottom: "28px",
        }}
      >
        <Image
          src={imageSrc}
          alt={name}
          width={180}
          height={180}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          color: "#0c0c48",
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        {name}
      </p>

      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          color: "#4b5563",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        {role}
      </p>
    </div>
  );
}

export default function BoardOfDirectors() {
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
        {DIRECTORS.map((director) => (
          <DirectorCard key={director.name} {...director} />
        ))}
      </div>
    </section>
  );
}