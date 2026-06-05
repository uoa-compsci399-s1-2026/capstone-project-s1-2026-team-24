import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyContent from "./StudyContent";
import { prisma } from "@/lib/prisma";
import { resolveStudyLayoutBlocks } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";
import { getServerLang } from "@/lib/lang";
import { localizeStrings } from "@/lib/translate/blocks";


export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

// Wrapped in React cache() so the two reads in one request — generateMetadata
// and the page component — share a single query instead of hitting SQLite twice.
// Request-scoped only: nothing persists across requests, so admin edits to a
// study still appear on the next load (the page stays force-dynamic).
const fetchStudy = cache(async (slug: string) => {
  return prisma.study.findFirst({
    where: { slug },
    include: {
      pdfs: {
        orderBy: [{ order: "asc" }, { uploadedAt: "asc" }],
      },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await fetchStudy(slug);
  if (!study || !study.isActive) {
    return { title: "Study Not Found | HNU Auckland" };
  }
  const lang = await getServerLang();
  if (lang === "ZH") {
    const [title, description] = await localizeStrings([
      study.title,
      study.shortDescription,
    ]);
    return {
      title: `${title} | HNU Auckland`,
      description,
    };
  }
  return {
    title: `${study.title} | HNU Auckland`,
    description: study.shortDescription,
  };
}

const FALLBACK_IMAGE = "/services-and-expertise.jpg";

export default async function StudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await fetchStudy(slug);

  if (!study || !study.isActive) {
    notFound();
  }

  // If an admin has built a custom layout (or a template applies), render it
  // instead of the default StudyContent.
  const layout = await resolveStudyLayoutBlocks(slug);
  if (layout) {
    return <StudyLayoutView study={study} blocks={layout} />;
  }

  const heroImage = study.imagePath?.trim() ? study.imagePath : FALLBACK_IMAGE;

  return (
    <>
      <Navbar />

      {/* Hero — image bleeds up behind the transparent navbar */}
      <section
        className="relative w-full overflow-hidden h-[420px] sm:h-[480px] lg:h-[554px]"
        style={{ marginTop: "-180px" }}
        aria-label={`${study.title} hero`}
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center center" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 px-6 sm:px-12 lg:px-[45px] pb-10 sm:pb-14">
          <p className="text-white/75 text-xs sm:text-sm font-semibold tracking-[2px] uppercase mb-3">
            Our Studies
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-white leading-tight tracking-[1.2px] max-w-[1100px]">
            {study.title}
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white px-6 sm:px-12 lg:px-[52px] py-5"
      >
        <ol className="flex items-center gap-2 text-[18px] text-[#0c0c48] tracking-[0.36px]">
          <li>
            <Link
              href="/studies"
              className="hover:opacity-70 transition-opacity"
            >
              Studies
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <span className="font-bold">{study.title}</span>
          </li>
        </ol>
      </nav>

      <main id="main-content" className="bg-white">
        <StudyContent
          fullDescriptionEn={study.fullDescriptionEn}
          fullDescriptionZh={study.fullDescriptionZh}
          eligibilityEn={study.eligibilityEn}
          eligibilityZh={study.eligibilityZh}
          compensationEn={study.compensationEn}
          compensationZh={study.compensationZh}
          redcapUrl={study.redcapUrl}
          contactEmail={study.contactEmail}
          contactPhone={study.contactPhone}
          contactPhoneZh={study.contactPhoneZh}
          ethicsStatement={study.ethicsStatement}
          status={study.status}
          publishedAt={
            study.publishedAt ? study.publishedAt.toISOString() : null
          }
          pdfs={study.pdfs.map((pdf) => ({
            id: pdf.id,
            title: pdf.title,
            pdfPath: pdf.pdfPath,
          }))}
        />
      </main>

      <Footer />
    </>
  );
}
