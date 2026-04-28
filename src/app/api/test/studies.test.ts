import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  study: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { GET as getStudies } from "@/app/api/studies/route";
import { GET as getStudyBySlug } from "@/app/api/studies/[slug]/route";

describe("GET /api/studies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active studies with expected fields", async () => {
    mockPrisma.study.findMany.mockResolvedValueOnce([
      {
        id: 1,
        slug: "s1",
        title: "Study 1",
        shortDescription: "Desc",
        contactEmail: "team@example.com",
        isActive: true,
      },
    ]);

    const response = await getStudies();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: 1,
        slug: "s1",
        title: "Study 1",
        shortDescription: "Desc",
        contactEmail: "team@example.com",
        isActive: true,
      },
    ]);
    expect(mockPrisma.study.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        contactEmail: true,
        isActive: true,
      },
    });
  });

  it("returns 500 when database query fails", async () => {
    mockPrisma.study.findMany.mockRejectedValueOnce(new Error("db error"));
    const response = await getStudies();
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to fetch studies.",
    });
  });
});

describe("GET /api/studies/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns study details by slug", async () => {
    mockPrisma.study.findFirst.mockResolvedValueOnce({
      title: "Study 1",
      fullDescriptionEn: "en",
      fullDescriptionZh: "zh",
      eligibilityEn: "elig en",
      eligibilityZh: "elig zh",
      compensationEn: "comp en",
      compensationZh: "comp zh",
      redcapUrl: "https://example.com",
      contactEmail: "team@example.com",
      contactPhone: "123",
      ethicsStatement: "ethics",
    });

    const response = await getStudyBySlug(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "s1" }),
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      title: "Study 1",
      fullDescriptionEn: "en",
      fullDescriptionZh: "zh",
    });
  });

  it("returns 404 when study does not exist", async () => {
    mockPrisma.study.findFirst.mockResolvedValueOnce(null);
    const response = await getStudyBySlug(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "missing" }),
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Study not found." });
  });
});
