import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return fallback;
}

export async function GET() {
  try {
    const studies = await prisma.study.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(studies, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/studies failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch studies." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const slug = asTrimmedString(body?.slug);
    const title = asTrimmedString(body?.title);
    const shortDescription = asTrimmedString(body?.shortDescription);
    const fullDescriptionEn = asTrimmedString(body?.fullDescriptionEn);
    const fullDescriptionZh = asTrimmedString(body?.fullDescriptionZh);
    const eligibilityEn = asTrimmedString(body?.eligibilityEn);
    const eligibilityZh = asTrimmedString(body?.eligibilityZh);
    const compensationEn = asTrimmedString(body?.compensationEn);
    const compensationZh = asTrimmedString(body?.compensationZh);
    const redcapUrl = asTrimmedString(body?.redcapUrl);
    const contactEmail = asTrimmedString(body?.contactEmail);
    const contactPhone = asTrimmedString(body?.contactPhone);
    const contactPhoneZh = asTrimmedString(body?.contactPhoneZh);
    const imagePath = asTrimmedString(body?.imagePath);
    const ethicsStatement = asTrimmedString(body?.ethicsStatement);

    if (
      !slug ||
      !title ||
      !shortDescription ||
      !fullDescriptionEn ||
      !fullDescriptionZh ||
      !eligibilityEn ||
      !eligibilityZh ||
      !compensationEn ||
      !compensationZh ||
      !redcapUrl ||
      !contactEmail ||
      !contactPhone ||
      !ethicsStatement
    ) {
      return NextResponse.json(
        { error: "Missing required study fields." },
        { status: 400 },
      );
    }

    const created = await prisma.study.create({
      data: {
        slug,
        title,
        shortDescription,
        fullDescriptionEn,
        fullDescriptionZh,
        eligibilityEn,
        eligibilityZh,
        compensationEn,
        compensationZh,
        redcapUrl,
        contactEmail,
        contactPhone,
        contactPhoneZh,
        imagePath,
        ethicsStatement,
        isActive: asBoolean(body?.isActive, true),
        order: asNumber(body?.order, 0),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/studies failed:", error);
    return NextResponse.json(
      { error: "Failed to create study." },
      { status: 500 },
    );
  }
}
