import Link from 'next/link';

function EmailIcon() {
  return (
    <svg
      className="shrink-0 mt-1"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0a4479" strokeWidth="2" />
      <path d="M2 7l10 7 10-7" stroke="#0a4479" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="shrink-0 mt-1"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.56a1 1 0 01-.25 1.01l-2.2 2.22z"
        stroke="#0a4479"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="shrink-0 mt-1"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#0a4479" strokeWidth="2" />
      <path
        d="M12 6v6l4 2"
        stroke="#0a4479"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className="shrink-0 mt-1"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="#0a4479"
        strokeWidth="2"
      />
      <circle cx="12" cy="9" r="2.5" stroke="#0a4479" strokeWidth="2" />
    </svg>
  );
}

export default function StudiesContactPanel() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-[#0a4479] text-lg sm:text-[24px] font-semibold leading-normal mb-3">
          Volunteering for Clinical Trial as a Study Participant
        </h3>
        <p className="text-[#0a4479] text-base sm:text-[20px] font-normal leading-normal">
          See our current studies or express your interest to participate in a
          future study by emailing us.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <EmailIcon />
          <p className="text-[#0a4479] text-base sm:text-[20px] tracking-[0.4px]">
            hnu@auckland.ac.nz
          </p>
        </div>
        <div className="flex items-start gap-4">
          <PhoneIcon />
          <p className="text-[#0a4479] text-base sm:text-[20px] tracking-[0.4px]">
            012 3456 789
          </p>
        </div>
        <div className="flex items-start gap-4">
          <ClockIcon />
          <p className="text-[#0a4479] text-base sm:text-[20px] tracking-[0.4px]">
            Mon - Fri&nbsp; 9am-5pm
          </p>
        </div>
        <div className="flex items-start gap-4">
          <LocationIcon />
          <p className="text-[#0a4479] text-base sm:text-[20px] tracking-[0.4px]">
            18 Carrick Place, Mt Eden
            <br />
            Auckland 1024, New Zealand
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-[#0a4479] text-lg sm:text-[24px] font-semibold leading-normal mb-3">
          Enquiries &amp; Opportunities
        </h3>
        <p className="text-[#0a4479] text-base sm:text-[20px] font-normal leading-normal">
          Interested in our research, collaborations, partnerships, or
          internships?
          <br />
          We welcome you to get in touch.
        </p>
      </div>

      <div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#0a4479] text-white font-bold text-base sm:text-[20px] px-8 sm:px-10 py-3 sm:py-4 rounded-[30px] hover:bg-[#083559] transition-colors"
        >
          Learn More <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
