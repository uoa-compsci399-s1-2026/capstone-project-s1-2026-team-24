import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/constants";
import MailingListSignup from "@/components/MailingListSignup";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/research", label: "Research" },
  { href: "/studies", label: "Studies" },
  { href: "/collaborations", label: "Collaborations" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "https://www.auckland.ac.nz", label: "University of Auckland", external: true },
  { href: "https://www.auckland.ac.nz/en/about/the-university/disclaimer.html", label: "Disclaimer", external: true },
  { href: "https://www.auckland.ac.nz/en/privacy.html", label: "Privacy", external: true },
  { href: "https://www.auckland.ac.nz/en/about/the-university/accessibility.html", label: "Accessibility", external: true },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--uoa-navy)" }} className="text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Identity */}
          <div>
            <h2 className="font-bold text-lg mb-2">{SITE_NAME}</h2>
            <p className="text-sm text-gray-300">
              Advancing human nutrition research in partnership with the University of Auckland.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Contact</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>
                <span className="italic text-yellow-300">[Phone number — TBC]</span>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-white hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mailing List */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Stay Updated</h3>
            <MailingListSignup />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="hover:text-white hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
