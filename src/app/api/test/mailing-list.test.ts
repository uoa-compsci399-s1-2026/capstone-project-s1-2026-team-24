import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  mailingListEntry: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { POST as postMailingList } from "@/app/api/mailing-list/route";

describe("POST /api/mailing-list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid email", async () => {
    const request = new Request("http://localhost/api/mailing-list", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "invalid" }),
    });

    const response = await postMailingList(request);
    expect(response.status).toBe(400);
  });

  it("returns alreadySubscribed true when duplicate exists", async () => {
    mockPrisma.mailingListEntry.findUnique.mockResolvedValueOnce({ id: 1 });
    const request = new Request("http://localhost/api/mailing-list", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "dup@example.com" }),
    });

    const response = await postMailingList(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ alreadySubscribed: true });
  });

  it("creates new subscription and returns 201", async () => {
    mockPrisma.mailingListEntry.findUnique.mockResolvedValueOnce(null);
    mockPrisma.mailingListEntry.create.mockResolvedValueOnce({});
    const request = new Request("http://localhost/api/mailing-list", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "new@example.com" }),
    });

    const response = await postMailingList(request);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ alreadySubscribed: false });
  });
});
