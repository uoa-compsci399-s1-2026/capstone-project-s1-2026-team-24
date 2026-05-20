import Link from "next/link";
import StudyCard from "@/components/ui/StudyCard";
import Button from "../ui/Button";

export default function AcademicCollaborators() {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title="LactoPharma consortium"
          description="Dairy bioactives and health"
          imageSrc="/daniel-quiceno-m-4MQtWCxUrYc-unsplash.jpg"
          imageAlt="Academic Collaborators"
          imagePosition="center"
        />
        <StudyCard
          title="Marine polysaccharide Chitosan and weight loss"
          description="Collaboration with the University of Queensland, Australia"
          imageSrc="/joachim-schnurle-TLEI9o1HdY4-unsplash.jpg"
          imageAlt="Academic Collaborators"
          imagePosition="center"
        />
      </div>

      <div className="max-w-[1400px] mx-auto h-16" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title="Omega-3 polyunsaturated fatty acids (fish oils) and stroke"
          description="Collaboration with the George Institute, Aus"
          imageSrc="/alex-saks-rCAJjRuTHyE-unsplash.jpg"
          imageAlt="Academic Collaborators"
          imagePosition="center"
        />
        <StudyCard
          title="Adipokynes in obesity"
          description="Collaboration with the University of Hong Kong"
          imageSrc="/siora-photography-cixohzDpNIo-unsplash.jpg"
          imageAlt="Academic Collaborators"
          imagePosition="center"
        />
      </div>

      <div className="flex justify-center mt-10">
        <Button href="/collaborations/academic" color="dark">
          View all academic partners
        </Button>
      </div>
    </section>
  );
}
