import { Link } from 'react-router-dom';
import { Instagram, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type FooterProps = {
  variant?: 'landing' | 'dashboard';
};

const Footer = ({ variant = 'landing' }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const isLanding = variant === 'landing';

  return (
    <>
      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="border-t border-border/40 bg-background"
      >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <Link to="/" className="font-display font-semibold tracking-[-0.035em] text-lg font-semibold">
                FameSync
              </Link>

              {isLanding && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  © {currentYear}
                </span>
              )}
            </div>

            {/* Center — links (landing only) */}
            {isLanding && (
              <nav className="flex flex-wrap gap-2 sm:gap-4 md:gap-5 text-xs sm:text-sm text-muted-foreground justify-center max-w-full">
                <Link to="/about" className="hover:text-primary transition whitespace-nowrap">
                  About Us
                </Link>
                <Link to="/contact" className="hover:text-primary transition whitespace-nowrap">
                  Contact Us
                </Link>
                <Link to="/pricing" className="hover:text-primary transition whitespace-nowrap">
                  Pricing
                </Link>
                <Link to="/privacy" className="hover:text-primary transition whitespace-nowrap">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-primary transition whitespace-nowrap">
                  Terms of Service
                </Link>
              </nav>
            )}

            {/* Right */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/famesync_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition"
              >
                <Instagram className="h-4 w-4" />
              </a>

              {!isLanding && (
                <span className="text-xs text-muted-foreground">
                  © {currentYear}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.footer>
    </>
  );
};

export default Footer;
