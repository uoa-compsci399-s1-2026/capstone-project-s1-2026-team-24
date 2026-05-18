import ContactEmailForm from './ContactEmailForm';

function PhoneIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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

function ClockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="14" stroke="#0a4479" strokeWidth="2.5" />
      <path
        d="M20 12v9l5 3"
        stroke="#0a4479"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactDetails() {
  return (
    <section className="relative w-full bg-white py-16 px-6 sm:px-12 lg:px-45 overflow-hidden">
      <div className="mx-auto max-w-[1412px] bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] p-8 sm:p-12 lg:p-[60px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ContactEmailForm />

          <div className="flex flex-col gap-8">
            <div className="space-y-5 text-[#0a4479]">
              <div>
                <h2 className="text-lg sm:text-[24px] font-bold leading-snug mb-2">
                  MSc/PhD Opportunities
                </h2>
                <p className="text-sm sm:text-[20px] leading-relaxed">
                  From time to time, opportunities for MSc or PhD studentship may become
                  available. Feel free to contact us with your expression of interest through
                  the contact form.
                </p>
              </div>

              <div>
                <h2 className="text-lg sm:text-[24px] font-bold leading-snug mb-2">
                  Internship Opportunities
                </h2>
                <p className="text-sm sm:text-[20px] leading-relaxed">
                  We do have plenty opportunities for voluntary internship opportunities for
                  both local and international students. Many international students from
                  overseas completed their internship with us as a part of their Bachelor&apos;s
                  program. Use the contact form if you are interested in gaining practical
                  experience in human clinical studies.
                </p>
              </div>

              <div>
                <h2 className="text-lg sm:text-[24px] font-bold leading-snug mb-2">
                  Volunteering for Clinical Trial as a Study Participant
                </h2>
                <p className="text-sm sm:text-[20px] leading-relaxed">
                  See our current studies or express your interest to participate in a future
                  study through the contact form.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 text-[#0a4479]">
              <div className="flex items-center gap-3">
                <PhoneIcon />
                <a href="tel:+6492345678" className="text-sm sm:text-[20px] hover:underline">
                  09 923 4567
                </a>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  <LocationIcon />
                </div>
                <address className="not-italic text-sm sm:text-[20px] leading-relaxed">
                  18 Carrick Place, Mt Eden
                  <br />
                  Auckland 1024,
                  <br />
                  New Zealand
                </address>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                  <ClockIcon />
                </div>
                <p className="text-sm sm:text-[20px] leading-relaxed">
                  Mon – Fri
                  <br />
                  9am – 5pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}