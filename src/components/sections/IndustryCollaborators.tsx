import Link from "next/link";
import StudyCard from "@/components/ui/StudyCard";
import Button from "../ui/Button";

export default function IndustryCollaborators() {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title="Pharmaceutical"
          description="New therapeutics for treatment of diabetic cardiomyopathy Complete diet balance studies"
          imageSrc="/roberto-sorin-RS0-h_pyByk-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />
        <StudyCard
          title="Food"
          description="Novel butter fat and cardiovascular risk - Dairy lipids & proteins and cholesterol lowering"
          imageSrc="/lily-banse--YHSwy6uqvk-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />
      </div>

      <div className="max-w-[1400px] mx-auto h-16" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        <StudyCard
          title="Food Ingredients"
          description="Barley ß-glucan Glucagel and cholesterol lowering - Barley ß-glucan Cerogen and glucose control"
          imageSrc="/dan-gold-4_jhDO54BYg-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />
        <StudyCard
          title="Nutraceuticals"
          description="Marine polysaccharide Chitosan and weight loss - Omega-3 polyunsaturated fatty acids (fish oils) and stroke"
          imageSrc="/towfiqu-barbhuiya-4N0dLUmdLAY-unsplash.jpg"
          imageAlt="Industry Collaborators"
          imagePosition="center"
        />
      </div>

      <div className="flex justify-center mt-10">
              <Button href="/collaborations/industry" color="dark">
                View all industry partners
              </Button>
            </div>
            
    </section>
  );
}
