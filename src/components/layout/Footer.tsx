import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

/* Ink footer in the izea.com shape: wordmark and pitch on the left, link
   columns on the right, a legal bar underneath, and a giant wordmark to
   close the page. */

type FooterProps = {
  variant?: "landing" | "dashboard";
};

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { to: "/#how", label: "How it works" },
      { to: "/pricing", label: "Pricing" },
      { to: "/auth?role=influencer&mode=signup", label: "For creators" },
      { to: "/auth?role=brand&mode=signup", label: "For brands" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
    ],
  },
];

const Footer = ({ variant = "landing" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const isLanding = variant === "landing";

  return (
    <footer className="mt-auto overflow-hidden bg-ink text-ink-foreground">
      <div className="container grid gap-12 py-16 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div className="max-w-[38ch]">
          <Link to="/" className="font-display text-[1.75rem] font-black tracking-[-0.04em]">
            FameSync
          </Link>
          {isLanding && (
            <p className="mt-4 leading-relaxed text-ink-muted">
              Real brands, real budgets, real briefs — paid collabs for micro-creators, with no
              agency in the middle.
            </p>
          )}
          <a
            href="https://www.instagram.com/famesync_/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="FameSync on Instagram"
            className="mt-7 inline-flex size-11 items-center justify-center rounded-full border border-ink-border text-ink-muted transition-colors duration-200 hover:border-ink-foreground hover:text-ink-foreground"
          >
            <Instagram className="size-4" />
          </a>
        </div>

        {isLanding && (
          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className="eyebrow mb-3 text-ink-muted">{column.title}</h4>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-ink-foreground/85 transition-colors duration-200 hover:text-ink-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>

      <div className="border-t border-ink-border">
        <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6">
          <p className="text-xs text-ink-muted">© {currentYear} FameSync. All rights reserved.</p>
          <p className="eyebrow text-ink-muted">India first</p>
        </div>
      </div>

      {isLanding && (
        <p
          aria-hidden
          className="select-none pb-2 text-center font-display text-[15.5vw] font-black uppercase leading-[0.78] tracking-[-0.06em] text-ink-foreground/[0.06]"
        >
          FameSync
        </p>
      )}
    </footer>
  );
};

export default Footer;
