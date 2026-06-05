import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  contactRecipient: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  contactSubmission: {
    count: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import {
  GET,
  POST,
  PATCH,
  DELETE,
} from "@/app/api/admin/contact-recipients/route";

function jsonRequest(method: string, body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/contact-recipients", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("admin contact-recipients (inquiry types)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.contactRecipient.aggregate.mockResolvedValue({
      _max: { order: 6 },
    });
  });

  it("GET lists recipients, active first", async () => {
    mockPrisma.contactRecipient.findMany.mockResolvedValueOnce([]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(mockPrisma.contactRecipient.findMany).toHaveBeenCalledWith({
      orderBy: [{ isArchived: "asc" }, { order: "asc" }, { id: "asc" }],
    });
  });

  it("POST creates a new type with the English label as canonical category", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce(null);
    mockPrisma.contactRecipient.create.mockImplementationOnce(
      async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }),
    );

    const response = await POST(
      jsonRequest("POST", {
        labelEn: "  Media   Enquiry ",
        labelZh: "媒体咨询",
        email: "media@example.com",
      }),
    );
    expect(response.status).toBe(201);
    expect(mockPrisma.contactRecipient.create).toHaveBeenCalledWith({
      data: {
        category: "Media Enquiry", // trimmed + whitespace-collapsed
        labelEn: "Media Enquiry",
        labelZh: "媒体咨询",
        email: "media@example.com",
        order: 7, // appended after the current max order
      },
    });
  });

  it("POST restores an archived type with the same category", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      id: 7,
      category: "Media Enquiry",
      isArchived: true,
    });
    mockPrisma.contactRecipient.update.mockResolvedValueOnce({ id: 7 });

    const response = await POST(
      jsonRequest("POST", {
        labelEn: "Media Enquiry",
        labelZh: "",
        email: "media@example.com",
      }),
    );
    expect(response.status).toBe(200);
    expect(mockPrisma.contactRecipient.update).toHaveBeenCalledWith({
      where: { category: "Media Enquiry" },
      data: expect.objectContaining({ isArchived: false }),
    });
    expect(mockPrisma.contactRecipient.create).not.toHaveBeenCalled();
  });

  it("POST rejects a duplicate active type", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Donation",
      isArchived: false,
    });
    const response = await POST(
      jsonRequest("POST", { labelEn: "Donation", email: "d@example.com" }),
    );
    expect(response.status).toBe(409);
  });

  it("POST rejects a missing label or invalid email", async () => {
    expect(
      (await POST(jsonRequest("POST", { labelEn: "", email: "a@b.co" }))).status,
    ).toBe(400);
    expect(
      (await POST(jsonRequest("POST", { labelEn: "X", email: "nope" }))).status,
    ).toBe(400);
  });

  it("PATCH updates labels without touching the canonical category", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Donation",
      isArchived: false,
    });
    mockPrisma.contactRecipient.update.mockResolvedValueOnce({});

    const response = await PATCH(
      jsonRequest("PATCH", {
        category: "Donation",
        labelEn: "Donations & Giving",
        labelZh: "捐赠与支持",
      }),
    );
    expect(response.status).toBe(200);
    expect(mockPrisma.contactRecipient.update).toHaveBeenCalledWith({
      where: { category: "Donation" },
      data: { labelEn: "Donations & Giving", labelZh: "捐赠与支持" },
    });
  });

  it("PATCH refuses to archive the last active type", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Other",
      isArchived: false,
    });
    mockPrisma.contactRecipient.count.mockResolvedValueOnce(1);

    const response = await PATCH(
      jsonRequest("PATCH", { category: "Other", isArchived: true }),
    );
    expect(response.status).toBe(400);
    expect(mockPrisma.contactRecipient.update).not.toHaveBeenCalled();
  });

  it("PATCH archives a type when others remain active", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Donation",
      isArchived: false,
    });
    mockPrisma.contactRecipient.count.mockResolvedValueOnce(6);
    mockPrisma.contactRecipient.update.mockResolvedValueOnce({});

    const response = await PATCH(
      jsonRequest("PATCH", { category: "Donation", isArchived: true }),
    );
    expect(response.status).toBe(200);
  });

  it("PATCH returns 404 for an unknown category", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce(null);
    const response = await PATCH(
      jsonRequest("PATCH", { category: "Ghost", email: "a@b.co" }),
    );
    expect(response.status).toBe(404);
  });

  it("DELETE refuses when submissions reference the category", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Donation",
      isArchived: true,
    });
    mockPrisma.contactSubmission.count.mockResolvedValueOnce(3);

    const response = await DELETE(jsonRequest("DELETE", { category: "Donation" }));
    expect(response.status).toBe(409);
    expect(mockPrisma.contactRecipient.delete).not.toHaveBeenCalled();
  });

  it("DELETE removes an unreferenced type", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Media Enquiry",
      isArchived: true,
    });
    mockPrisma.contactSubmission.count.mockResolvedValueOnce(0);
    mockPrisma.contactRecipient.delete.mockResolvedValueOnce({});

    const response = await DELETE(
      jsonRequest("DELETE", { category: "Media Enquiry" }),
    );
    expect(response.status).toBe(200);
    expect(mockPrisma.contactRecipient.delete).toHaveBeenCalledWith({
      where: { category: "Media Enquiry" },
    });
  });

  it("DELETE refuses to remove the last active type", async () => {
    mockPrisma.contactRecipient.findUnique.mockResolvedValueOnce({
      category: "Other",
      isArchived: false,
    });
    mockPrisma.contactSubmission.count.mockResolvedValueOnce(0);
    mockPrisma.contactRecipient.count.mockResolvedValueOnce(1);

    const response = await DELETE(jsonRequest("DELETE", { category: "Other" }));
    expect(response.status).toBe(400);
    expect(mockPrisma.contactRecipient.delete).not.toHaveBeenCalled();
  });
});
