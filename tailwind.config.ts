import type { Config } from "tailwindcss";

export default {
  // single theme — dark mode removed
  darkMode: [],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "sans-serif"],
      },
      fontSize: {
        "display-1": ["clamp(46px,6.2vw,82px)", { lineHeight: "0.94", letterSpacing: "-0.04em" }],
        "display-2": ["clamp(32px,3.6vw,50px)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        "display-3": ["1.4375rem", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
      },
      spacing: {
        // section rhythm used between landing blocks (pb-26) — not in the default scale
        "26": "6.5rem",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 6px)", //  6 — chips, tags
        md: "calc(var(--radius) - 3px)", //  9
        lg: "var(--radius)", // 12 — inputs, in-card buttons
        xl: "calc(var(--radius) + 6px)", // 18 — cards
        "2xl": "calc(var(--radius) + 12px)", // 24 — panels, CTA blocks
      },
      boxShadow: {
        e1: "var(--elevation-1)",
        e2: "var(--elevation-2)",
        e3: "var(--elevation-3)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        rise: "rise .45s cubic-bezier(.22,1,.36,1) both",
        fade: "fade .3s ease-out both",
        "accordion-down": "accordion-down .2s ease-out",
        "accordion-up": "accordion-up .2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

/* Removed from the old config:
   keyframes/animations — glow, float, float-delayed, morph, spin-slow,
   gradient-shift, shimmer, pulse-ring, bounce-subtle, wave.
   darkMode: ["class"] -> [] */
