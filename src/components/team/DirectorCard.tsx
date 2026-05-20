import Image from "next/image";

export type DirectorCardProps = {
  name: string;
  title: string;
  photoPath: string;
  linkedinUrl?: string;
  email?: string;
};

function PersonIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function DirectorCard({
  name,
  title,
  photoPath,
  linkedinUrl,
  email,
}: DirectorCardProps) {
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
          src={photoPath}
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
        {title}
      </p>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {linkedinUrl ? (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} profile`}
          >
            <PersonIcon />
          </a>
        ) : (
          <span style={{ opacity: 0.4 }}>
            <PersonIcon />
          </span>
        )}
        {email ? (
          <a href={`mailto:${email}`} aria-label={`Email ${name}`}>
            <MailIcon />
          </a>
        ) : (
          <span style={{ opacity: 0.4 }}>
            <MailIcon />
          </span>
        )}
      </div>
    </div>
  );
}

