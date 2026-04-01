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
        <Link href="/" className="font-bold text-lg mr-4">
          UoA Research
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
