export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export async function fetchTeamData() {
  const res = await fetch(`${getApiBaseUrl()}/api/team`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch team data");
  }
  return res.json() as Promise<{
    boardOfDirectors: TeamMemberRecord[];
    researchTeam: TeamMemberRecord[];
    alumni: TeamMemberRecord[];
  }>;
}

export async function fetchPartnerLogos() {
  const res = await fetch(`${getApiBaseUrl()}/api/partner-logos`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch partner logos");
  }
  return res.json() as Promise<PartnerLogoRecord[]>;
}

export type TeamMemberRecord = {
  id: number;
  name: string;
  title: string;
  section: string;
  bio: string;
  photoPath: string;
  profileUrl: string | null;
};

export type PartnerLogoRecord = {
  id: number;
  name: string;
  logoPath: string;
  websiteUrl: string;
  isPlaceholder: boolean;
  group: string;
};
