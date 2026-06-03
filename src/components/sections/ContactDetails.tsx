import ContactEmailForm from "./ContactEmailForm";
import ContactMap from "./ContactMap";

function PhoneIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 6h7l3 8-4 2.5a18 18 0 0 0 9.5 9.5L26 22l8 3v7a2 2 0 0 1-2 2C12.5 34 6 21.5 6 8a2 2 0 0 1 2-2z"
        stroke="#0a4479"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 4C14.48 4 10 8.48 10 14c0 8.25 10 22 10 22s10-13.75 10-22c0-5.52-4.48-10-10-10z"
        stroke="#0a4479"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="14" r="3.5" stroke="#0a4479" strokeWidth="2.5" />
    </svg>
  );
}

interface ContactDetailsProps {
  cardOneTitle?: string;
  cardOneBody?: string;
  cardTwoTitle?: string;
  cardTwoBody?: string;
  cardThreeTitle?: string;
  cardThreeBody?: string;
  phone?: string;
  phoneHref?: string;
  address?: string;
}

export default function ContactDetails({}: ContactDetailsProps = {}) {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="mx-auto max-w-[1412px] bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] p-8 sm:p-12 lg:p-[60px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ContactEmailForm />
          <ContactMap />
        </div>
      </div>
    </section>
  );
}
