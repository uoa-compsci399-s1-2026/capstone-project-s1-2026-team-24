import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const LOGO_UPLOAD_PREFIX = "uploads/partner-logos";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function parseBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

function parseOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function isImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)
  );
}

async function saveLogoFile(file: File) {
  const uploadDir = path.join(process.cwd(), "public", LOGO_UPLOAD_PREFIX);

  await mkdir(uploadDir, { recursive: true });

  const safeFileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const diskPath = path.join(uploadDir, safeFileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(diskPath, buffer);

  return `/uploads/partner-logos/${safeFileName}`;
}

async function tryRemoveLogoFile(logoPath: string) {
  if (!logoPath) {
    return;
  }

  const relativePath = logoPath.replace(/^\/+/, "");

  if (!relativePath.startsWith(LOGO_UPLOAD_PREFIX)) {
    return;
  }

  const diskPath = path.join(process.cwd(), "public", relativePath);

  try {
    await unlink(diskPath);
  } catch (error) {
    console.warn("Logo file could not be removed:", error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let newSavedLogoPath = "";

  try {
    const { id } = await params;
    const partnerLogoId = Number(id);

    if (Number.isNaN(partnerLogoId)) {
      return NextResponse.json(
        { error: "Invalid partner logo ID" },
        { status: 400 }
      );
    }

    const existingPartnerLogo = await prisma.partnerLogo.findUnique({
      where: {
        id: partnerLogoId,
      },
    });

    if (!existingPartnerLogo) {
      return NextResponse.json(
        { error: "Partner logo not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const websiteUrl = formData.get("websiteUrl");
    const isPlaceholderRaw = formData.get("isPlaceholder");
    const orderRaw = formData.get("order");
    const file = formData.get("file") ?? formData.get("logo");

    if (typeof name === "string" && !name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (typeof websiteUrl === "string") {
      if (!websiteUrl.trim()) {
        return NextResponse.json(
          { error: "Website URL cannot be empty" },
          { status: 400 }
        );
      }

      try {
        new URL(websiteUrl.trim());
      } catch {
        return NextResponse.json(
          { error: "Website URL must be a valid absolute URL" },
          { status: 400 }
        );
      }
    }

    const parsedOrder = parseOrder(orderRaw);

    if (parsedOrder === null) {
      return NextResponse.json(
        { error: "Order must be a non-negative integer" },
        { status: 400 }
      );
    }

    const hasNewFile =
      file instanceof File && Boolean(file.name) && file.size > 0;

    if (hasNewFile) {
      if (!isImageFile(file)) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Logo image must be 5MB or less" },
          { status: 400 }
        );
      }

      newSavedLogoPath = await saveLogoFile(file);
    }

    const explicitPlaceholder = parseBoolean(isPlaceholderRaw);

    if (
      explicitPlaceholder === false &&
      !hasNewFile &&
      !existingPartnerLogo.logoPath
    ) {
      return NextResponse.json(
        {
          error:
            "A logo image is required when isPlaceholder is false",
        },
        { status: 400 }
      );
    }

    let nextLogoPath = existingPartnerLogo.logoPath;
    let nextIsPlaceholder = existingPartnerLogo.isPlaceholder;

    if (hasNewFile) {
      nextLogoPath = newSavedLogoPath;
      nextIsPlaceholder = false;
    } else if (explicitPlaceholder === true) {
      nextLogoPath = "";
      nextIsPlaceholder = true;
    } else if (explicitPlaceholder === false) {
      nextIsPlaceholder = false;
    }

    const updatedPartnerLogo = await prisma.partnerLogo.update({
      where: {
        id: partnerLogoId,
      },
      data: {
        name:
          typeof name === "string"
            ? name.trim()
            : existingPartnerLogo.name,
        websiteUrl:
          typeof websiteUrl === "string"
            ? websiteUrl.trim()
            : existingPartnerLogo.websiteUrl,
        order:
          parsedOrder !== undefined
            ? parsedOrder
            : existingPartnerLogo.order,
        isPlaceholder: nextIsPlaceholder,
        logoPath: nextLogoPath,
      },
    });

    if (
      existingPartnerLogo.logoPath &&
      existingPartnerLogo.logoPath !== updatedPartnerLogo.logoPath
    ) {
      await tryRemoveLogoFile(existingPartnerLogo.logoPath);
    }

    return NextResponse.json(updatedPartnerLogo);
  } catch (error) {
    if (newSavedLogoPath) {
      await tryRemoveLogoFile(newSavedLogoPath);
    }

    console.error("Failed to update partner logo:", error);

    return NextResponse.json(
      { error: "Failed to update partner logo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerLogoId = Number(id);

    if (Number.isNaN(partnerLogoId)) {
      return NextResponse.json(
        { error: "Invalid partner logo ID" },
        { status: 400 }
      );
    }

    const existingPartnerLogo = await prisma.partnerLogo.findUnique({
      where: {
        id: partnerLogoId,
      },
    });

    if (!existingPartnerLogo) {
      return NextResponse.json(
        { error: "Partner logo not found" },
        { status: 404 }
      );
    }

    await prisma.partnerLogo.delete({
      where: {
        id: partnerLogoId,
      },
    });

    await tryRemoveLogoFile(existingPartnerLogo.logoPath);

    return NextResponse.json({
      message: "Partner logo deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete partner logo:", error);

    return NextResponse.json(
      { error: "Failed to delete partner logo" },
      { status: 500 }
    );
  }
}

