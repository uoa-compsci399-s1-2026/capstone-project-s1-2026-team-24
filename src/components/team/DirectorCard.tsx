import Image from 'next/image';

interface DirectorCardProps {
  name: string;
  role: string;
  imageSrc: string;
  linkedinUrl?: string;
  email?: string;
}

function LinkedInIcon() {
  return (
    <svg
      width="37"
      height="37"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function DirectorCard({
  name,
  role,
  imageSrc,
  linkedinUrl,
  email,
}: DirectorCardProps) {
  return (
    <div className="bg-white rounded-[30px] shadow-[0px_0px_30px_0px_rgba(0,0,0,0.25)] flex flex-col items-center pt-[42px] pb-[67px] w-full max-w-[450px]">
      <div className="w-[300px] h-[300px] rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={imageSrc}
          alt={name}
          width={300}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-[59px] flex flex-col items-center text-center px-8">
        <h3 className="text-[32px] font-bold text-[#0c0c48] tracking-[0.64px] leading-normal">
          {name}
        </h3>
        <p className="mt-[21px] text-[24px] text-black tracking-[0.48px] leading-normal">
          {role}
        </p>
        <div className="mt-[47px] flex items-center gap-[28px] text-black opacity-50">
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on LinkedIn`}
              className="hover:opacity-100 transition-opacity"
            >
              <LinkedInIcon />
            </a>
          ) : (
            <span>
              <LinkedInIcon />
            </span>
          )}
          {email ? (
            <a
              href={`mailto:${email}`}
              aria-label={`Email ${name}`}
              className="hover:opacity-100 transition-opacity"
            >
              <EmailIcon />
            </a>
          ) : (
            <span>
              <EmailIcon />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
