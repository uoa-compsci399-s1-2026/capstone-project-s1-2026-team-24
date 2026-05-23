import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  mediaAsset: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("fs/promises", () => ({ unlink: vi.fn().mockResolvedValue(undefined) }));

import {
  PATCH as patchMedia,
  DELETE as deleteMedia,
} from "@/app/api/admin/media/[id]/route";

function jsonReq(method: string, body: unknown) {
  return new NextRequest("http://localhost/x", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/admin/media/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 for an invalid id", async () => {
    const res = await patchMedia(jsonReq("PATCH", { altText: "x" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("404 when the asset doesn't exist (not a 500)", async () => {
    mockPrisma.mediaAsset.findUnique.mockResolvedValueOnce(null);
    const res = await patchMedia(jsonReq("PATCH", { altText: "x" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(404);
    expect(mockPrisma.mediaAsset.update).not.toHaveBeenCalled();
  });

  it("returns the asset unchanged when no fields are provided", async () => {
    mockPrisma.mediaAsset.findUnique.mockResolvedValueOnce({
      id: 1,
      altText: "a",
      caption: "c",
    });
    const res = await patchMedia(jsonReq("PATCH", {}), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.mediaAsset.update).not.toHaveBeenCalled();
  });

  it("updates alt text for an existing asset", async () => {
    mockPrisma.mediaAsset.findUnique.mockResolvedValueOnce({
      id: 1,
      altText: "a",
      caption: "",
    });
    mockPrisma.mediaAsset.update.mockResolvedValueOnce({
      id: 1,
      altText: "new",
      caption: "",
    });
    const res = await patchMedia(jsonReq("PATCH", { altText: "new" }), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.mediaAsset.update).toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/media/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("404 when the asset doesn't exist", async () => {
    mockPrisma.mediaAsset.findUnique.mockResolvedValueOnce(null);
    const res = await deleteMedia(
      new Request("http://localhost/x", { method: "DELETE" }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(res.status).toBe(404);
    expect(mockPrisma.mediaAsset.delete).not.toHaveBeenCalled();
  });

  it("deletes the asset record", async () => {
    mockPrisma.mediaAsset.findUnique.mockResolvedValueOnce({
      id: 1,
      filePath: "/uploads/media/x.png",
    });
    mockPrisma.mediaAsset.delete.mockResolvedValueOnce({});
    const res = await deleteMedia(
      new Request("http://localhost/x", { method: "DELETE" }),
      { params: Promise.resolve({ id: "1" }) },
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.mediaAsset.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
