import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { Rise } from "@/components/motion";

/* Rebuilt on the new language: paper ground, one hairline, the Navbar's
   wordmark treatment. Removed: the deleted Grand Hotel `.brand` mark, the
   `border-border/40` hairline and the bespoke footer entrance animation. */

type FooterProps = {
  variant?: "landing" | "dashboard";
};

const FOOTER_LINKS = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { to: "/pricing", label: "Pricing" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
];

const Footer = ({ variant = "landing" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const isLanding = variant === "landing";

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Rise>
        <div className="container flex flex-col gap-9 py-12 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="max-w-[38ch]">
            <Link
              to="/"
              className="font-display text-[1.4375rem] font-semibold tracking-[-0.035em] text-foreground"
            >
              FameSync
            </Link>
            {isLanding && (
              <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
                Real brands, real budgets, real briefs — paid collabs for micro-creators, with
                no agency in the middle.
              </p>
            )}
          </div>

          {isLanding && (
            <nav aria-label="Footer" className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-8">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <a
            href="https://www.instagram.com/famesync_/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FameSync on Instagram"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
          >
            <Instagram className="size-4" />
          </a>
        </div>
      </Rise>

      <div className="border-t border-border">
        <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6">
          <p className="text-xs text-muted-foreground">
            © {currentYear} FameSync. All rights reserved.
          </p>
          <p className="eyebrow">India first</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
