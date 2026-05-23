import type { Metadata } from "next";
import CollaborationsPageContent from "@/components/sections/CollaborationsPageContent";

export const metadata: Metadata = {
  title: "Collaborations | HNU Auckland",
  description:
    "Research collaborations and partnerships with industry and academic units, nationally and internationally.",
};

export default function CollaborationsPage() {
  return <CollaborationsPageContent />;
}