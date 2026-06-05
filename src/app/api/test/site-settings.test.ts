import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  siteSettings: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const mockFs = vi.hoisted(() => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

vi.mock("node:fs/promises", () => mockFs);

// unstable_cache becomes a pass-through so getSiteSettings hits the (mocked)
// DB directly; revalidateTag is observable.
const mockRevalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: mockRevalidateTag,
}));

import { GET, POST } from "@/app/api/admin/site-settings/route";
import { getSiteSettings } from "@/lib/site-settings";
import {
  DEFAULT_FAVICON,
  DEFAULT_LOGO_LIGHT,
  DEFAULT_LOGO_DARK,
} from "@/lib/branding";

function postRequest(fields: Record<string, string | File>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return new Request("http://localhost/api/admin/site-settings", {
    method: "POST",
    body: form,
  });
}

describe("site settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSiteSettings falls back to the built-in defaults when no row exists", async () => {
    mockPrisma.siteSettings.findUnique.mockResolvedValueOnce(null);
    await expect(getSiteSettings()).resolves.toEqual({
      faviconPath: DEFAULT_FAVICON,
      logoLightPath: DEFAULT_LOGO_LIGHT,
      logoDarkPath: DEFAULT_LOGO_DARK,
    });
  });

  it("GET returns the raw stored values (empty = default) for the admin UI", async () => {
    mockPrisma.siteSettings.findUnique.mockResolvedValueOnce({
      id: 1,
      faviconPath: "/uploads/branding/123-icon.png",
      logoLightPath: "",
      logoDarkPath: "",
    });
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      faviconPath: "/uploads/branding/123-icon.png",
      logoLightPath: "",
      logoDarkPath: "",
    });
  });

  it("POST rejects an unknown target", async () => {
    const response = await POST(
      postRequest({ target: "background", reset: "true" }) as never,
    );
    expect(response.status).toBe(400);
  });

  it("POST rejects an SVG favicon (no-SVG upload stance)", async () => {
    const response = await POST(
      postRequest({
        target: "favicon",
        file: new File(["<svg/>"], "icon.svg", { type: "image/svg+xml" }),
      }) as never,
    );
    expect(response.status).toBe(400);
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it("POST rejects a JPEG logo (PNG/WebP only)", async () => {
    const response = await POST(
      postRequest({
        target: "logoLight",
        file: new File(["x"], "logo.jpg", { type: "image/jpeg" }),
      }) as never,
    );
    expect(response.status).toBe(400);
  });

  it("POST stores an uploaded PNG favicon and revalidates the cache tag", async () => {
    mockPrisma.siteSettings.findUnique.mockResolvedValueOnce(null);
    mockPrisma.siteSettings.upsert.mockImplementationOnce(
      async ({ create }: { create: Record<string, string> }) => ({
        id: 1,
        faviconPath: create.faviconPath ?? "",
        logoLightPath: "",
        logoDarkPath: "",
      }),
    );

    const response = await POST(
      postRequest({
        target: "favicon",
        file: new File(["png-bytes"], "icon.png", { type: "image/png" }),
      }) as never,
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { faviconPath: string };
    expect(body.faviconPath).toMatch(/^\/uploads\/branding\/\d+-icon\.png$/);
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
    expect(mockRevalidateTag).toHaveBeenCalledWith("site-settings", { expire: 0 });
    // The favicon column was the one written.
    expect(mockPrisma.siteSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { faviconPath: body.faviconPath },
      }),
    );
  });

  it("POST accepts a .ico favicon by extension (MIME is browser-inconsistent)", async () => {
    mockPrisma.siteSettings.findUnique.mockResolvedValueOnce(null);
    mockPrisma.siteSettings.upsert.mockResolvedValueOnce({
      id: 1,
      faviconPath: "/uploads/branding/1-favicon.ico",
      logoLightPath: "",
      logoDarkPath: "",
    });
    const response = await POST(
      postRequest({
        target: "favicon",
        file: new File(["ico"], "favicon.ico", { type: "application/octet-stream" }),
      }) as never,
    );
    expect(response.status).toBe(200);
  });

  it("POST reset clears the override and removes the old uploaded file", async () => {
    mockPrisma.siteSettings.findUnique.mockResolvedValueOnce({
      id: 1,
      faviconPath: "",
      logoLightPath: "/uploads/branding/111-logo.png",
      logoDarkPath: "",
    });
    mockPrisma.siteSettings.upsert.mockResolvedValueOnce({
      id: 1,
      faviconPath: "",
      logoLightPath: "",
      logoDarkPath: "",
    });

    const response = await POST(
      postRequest({ target: "logoLight", reset: "true" }) as never,
    );
    expect(response.status).toBe(200);
    expect(mockPrisma.siteSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { logoLightPath: "" } }),
    );
    // The previously-uploaded file is cleaned up...
    expect(mockFs.unlink).toHaveBeenCalledTimes(1);
    expect(String(mockFs.unlink.mock.calls[0][0])).toContain("111-logo.png");
    expect(mockRevalidateTag).toHaveBeenCalledWith("site-settings", { expire: 0 });
  });

  it("POST reset never deletes a committed default asset", async () => {
    mockPrisma.siteSettings.findUnique.mockResolvedValueOnce({
      id: 1,
      faviconPath: "/images/logos/hnu-logo.svg",
      logoLightPath: "",
      logoDarkPath: "",
    });
    mockPrisma.siteSettings.upsert.mockResolvedValueOnce({
      id: 1,
      faviconPath: "",
      logoLightPath: "",
      logoDarkPath: "",
    });

    const response = await POST(
      postRequest({ target: "favicon", reset: "true" }) as never,
    );
    expect(response.status).toBe(200);
    // Old value pointed outside /uploads/branding → must not be unlinked.
    expect(mockFs.unlink).not.toHaveBeenCalled();
  });
});
