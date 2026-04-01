import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/research", label: "Research" },
  { href: "/studies", label: "Studies" },
  { href: "/collaborations", label: "Collaborations" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <nav style={{ backgroundColor: "var(--uoa-navy)" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 flex-wrap">
        <Link href="/" className="mr-4 flex-shrink-0">
          <Image
            src="/images/logos/UoA-Logo-Primary-RGB-Reversed-Small.png"
            alt="University of Auckland"
            width={120}
            height={40}
            priority
          />
        </Link>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:underline text-sm">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
