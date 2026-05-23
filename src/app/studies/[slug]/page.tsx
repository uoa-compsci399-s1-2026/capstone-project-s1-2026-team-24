import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudyContent from "./StudyContent";
import { fetchStudyBySlug, fetchStudies } from "@/lib/fetch-api";
import en from "@/messages/en";
import zh from "@/messages/zh";
import { prisma } from "@/lib/prisma";
import { resolveStudyLayoutBlocks } from "@/components/blocks/study/resolve-study-layout";
import StudyLayoutView from "@/components/blocks/study/StudyLayoutView";


export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const studies = await fetchStudies();

  return studies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await fetchStudyBySlug(slug);

  if (!study) {
    return {
      title: "Study Not Found | Human Nutrition Unit",
    };
  }

  return {
    title: `${study.title} | Human Nutrition Unit`,
    description: study.shortDescription || study.fullDescriptionEn,
  };
}

export default async function StudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const study = await fetchStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "ZH" ? "ZH" : "EN";
  const t = lang === "EN" ? en : zh;
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

      <main id="main-content" className="bg-white">
        <section className="relative w-full overflow-hidden bg-[#0a4479] px-6 sm:px-12 lg:px-[71px] py-16 sm:py-20 lg:py-24 text-white">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: "url(/maori-pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "240px auto",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-[1180px] mx-auto">
            <nav className="mb-8 text-sm sm:text-base text-white/80">
              <a href="/studies" className="hover:underline">
                {t.studies.heroTitle}
              </a>
              <span className="mx-2">{">"}</span>
              <span className="font-semibold text-white">{study.title}</span>
            </nav>

            <p className="uppercase tracking-[0.28em] text-sm font-semibold text-white/70 mb-4">
              {t.studies.heroTitle}
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[72px] font-extrabold leading-tight tracking-[1.4px] max-w-[980px]">
              {study.title}
            </h1>

            {study.shortDescription && (
              <p className="mt-6 text-lg sm:text-2xl text-white/90 max-w-[760px] leading-relaxed">
                {study.shortDescription}
              </p>
            )}
          </div>
        </section>

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
          publishedAt={study.publishedAt}
          pdfs={study.pdfs}
        />
      </main>

      <Footer />
    </>
  );
}