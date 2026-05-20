import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TeamHero from "@/components/team/TeamHero";
import ResearchTeam from "@/components/team/ResearchTeam";
import BoardOfDirectors from "@/components/team/BoardOfDirectors";
import AlumniSection from "@/components/team/AlumniSection";

export const metadata: Metadata = {
  title: "Our Team | HNU Auckland",
  description:
    "Meet the people behind the Human Nutrition Unit — our board of directors and research team.",
};

export default function TeamPage() {
  return (
    <>
      <Navbar />
      {/*
        TeamHero is a direct flex sibling of Navbar in the body's flex-col.
        Its negative margin-top (equal to the navbar height) slides it up so its
        background fills the space behind the transparent navbar, while its
        padding-top keeps the visible content below the navbar.
      */}
      <TeamHero />
      <main id="main-content">

        <BoardOfDirectors />
        <ResearchTeam />
        <AlumniSection />
      </main>
      <Footer />
    </>
  );
}
