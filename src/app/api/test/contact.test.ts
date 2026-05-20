import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

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

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true }),
}));

import { POST as postContact } from "@/app/api/contact/route";

function buildRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid category", async () => {
    const response = await postContact(
      buildRequest({
        name: "A",
        email: "a@example.com",
        category: "Invalid",
        message: "Hello",
      }),
    );
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

    const response = await postContact(
      buildRequest({
        name: "Alice",
        email: "alice@example.com",
        category: "General Enquiry",
        message: "Hello",
      }),
    );
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
