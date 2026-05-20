import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  contactSubmission: {
    create: vi.fn(),
  },
  contactRecipient: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { POST as postContact } from "@/app/api/contact/route";

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid category", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "A",
        email: "a@example.com",
        category: "Invalid",
        message: "Hello",
      }),
    });

    const response = await postContact(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "category must be one of the allowed values.",
    });
  });

  it("returns 201 and stores submission on valid payload", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "General Enquiry",
      email: "general@example.com",
    });
    mockPrisma.contactSubmission.create.mockResolvedValueOnce({});
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@example.com",
        category: "General Enquiry",
        message: "Hello",
      }),
    });

    const response = await postContact(request);
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockPrisma.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        name: "Alice",
        email: "alice@example.com",
        category: "General Enquiry",
        message: "Hello",
      },
    });
  });
});
