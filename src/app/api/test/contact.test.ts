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

const mockSendContactNotification = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true }),
}));

vi.mock("@/lib/email", () => ({
  sendContactNotification: mockSendContactNotification,
}));

import { POST as postContact } from "@/app/api/contact/route";

function buildRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildValidPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Alice",
    email: "alice@example.com",
    category: "General Enquiry",
    message: "Hello there, this is valid.",
    elapsedMs: 5000,
    ...overrides,
  };
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendContactNotification.mockResolvedValue({ ok: true });
  });

  it("returns 400 for invalid category", async () => {
    const response = await postContact(
      buildRequest(
        buildValidPayload({
          category: "Invalid",
        }),
      ),
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
      buildRequest(buildValidPayload()),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockPrisma.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        name: "Alice",
        email: "alice@example.com",
        category: "General Enquiry",
        message: "Hello there, this is valid.",
      },
    });
    expect(mockSendContactNotification).toHaveBeenCalledWith({
      recipientEmail: "general@example.com",
      submission: {
        name: "Alice",
        email: "alice@example.com",
        category: "General Enquiry",
        message: "Hello there, this is valid.",
      },
    });
  });

  it("returns 201 even when the notification email fails", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "General Enquiry",
      email: "general@example.com",
    });
    mockPrisma.contactSubmission.create.mockResolvedValueOnce({});
    mockSendContactNotification.mockRejectedValueOnce(new Error("mail down"));

    const response = await postContact(buildRequest(buildValidPayload()));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockPrisma.contactSubmission.create).toHaveBeenCalled();
  });

  it("silently accepts when elapsedMs is missing", async () => {
    const response = await postContact(
      buildRequest(
        buildValidPayload({
          elapsedMs: undefined,
        }),
      ),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockPrisma.contactSubmission.create).not.toHaveBeenCalled();
  });

  it("returns 400 when name is too long", async () => {
    const response = await postContact(
      buildRequest(
        buildValidPayload({
          name: "A".repeat(121),
        }),
      ),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "name must be 120 characters or fewer.",
    });
  });

  it("returns 400 when message is too short", async () => {
    const response = await postContact(
      buildRequest(
        buildValidPayload({
          message: "short",
        }),
      ),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "message must be at least 10 characters.",
    });
  });

  it("returns 400 when message has too many URLs", async () => {
    const response = await postContact(
      buildRequest(
        buildValidPayload({
          message:
            "https://a.com https://b.com https://c.com https://d.com this has links",
        }),
      ),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please remove some links from your message.",
    });
  });
});
