import { prisma } from "@/lib/prisma";

function escapeCsvValue(value: string) {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function GET() {
  try {
    const entries = await prisma.mailingListEntry.findMany({
      orderBy: {
        joinedAt: "desc",
      },
      select: {
        email: true,
        joinedAt: true,
      },
    });

    const header = "email,joined_at";
    const rows = entries.map((entry) => {
      const email = escapeCsvValue(entry.email);
      const joinedAt = entry.joinedAt.toISOString();
      return `${email},${joinedAt}`;
    });

    const csv = [header, ...rows].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="hnu-mailing-list.csv"',
      },
    });
  } catch (error) {
    console.error("Failed to export mailing list entries:", error);

    return new Response("Failed to export mailing list entries", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

