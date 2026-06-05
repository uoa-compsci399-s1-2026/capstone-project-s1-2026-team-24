import ContactEmailForm from "./ContactEmailForm";
import ContactMap from "./ContactMap";

export default function ContactDetails() {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="mx-auto max-w-[1412px] bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] p-8 sm:p-12 lg:p-[60px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <ContactEmailForm />
          <div className="hidden sm:flex">
            <ContactMap />
          </div>
        </div>
      </div>
    </section>
  );
}