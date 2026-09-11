#!/usr/bin/env node
/**
 * Enforces the rules in DESIGN.md that can be checked mechanically.
 *
 *   node scripts/design-check.mjs
 *
 * Comments are stripped before matching, so a note explaining that a banned
 * utility *was removed* never trips the check.
 */
import { readFileSync, globSync } from "node:fs";

const FILES = globSync("src/**/*.{ts,tsx}");

/** Remove block and line comments, and JSX {/* *\/} comments. */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const RULES = [
  {
    name: "deleted decorative utilities",
    re: /\b(gradient-instagram|gradient-text|gradient-animated|hover-glow|transition-smooth|mesh-gradient|dotted-pattern|grid-pattern|text-glow|noise-overlay|floating-orb|float-icon|pulse-glow|bounce-slow|card-3d|perspective-1000)\b/,
    hint: "these utilities no longer exist in index.css",
  },
  {
    name: "dark-mode variants",
    re: /\bdark:/,
    hint: "there is no dark mode; use the light tokens",
    skip: /ui\/chart\.tsx$/, // recharts' own theme map, inert without a .dark root
  },
  {
    name: "raw palette colours",
    re: /\b(?:bg|text|border|from|to|via|ring|shadow|fill|stroke)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
    hint: "use semantic tokens (primary/secondary/accent/muted/success/warning/destructive)",
  },
  {
    name: "text-white",
    re: /\btext-white\b/,
    hint: "use text-primary-foreground or a semantic foreground token",
  },
  {
    name: "looping animation",
    re: /repeat:\s*Infinity/,
    hint: "nothing loops except the Confetti celebration",
    skip: /Confetti\.tsx$/,
  },
  {
    name: "Grand Hotel wordmark",
    re: /Grand Hotel/,
    hint: "the wordmark is font-display now",
  },
];

let failures = 0;

for (const rule of RULES) {
  const hits = [];
  for (const file of FILES) {
    if (rule.skip?.test(file)) continue;
    const lines = stripComments(readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (rule.re.test(line)) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 110)}`);
    });
  }
  if (hits.length) {
    failures += hits.length;
    console.log(`\n✗ ${rule.name} (${hits.length}) — ${rule.hint}`);
    hits.slice(0, 15).forEach((h) => console.log("   " + h));
    if (hits.length > 15) console.log(`   …and ${hits.length - 15} more`);
  } else {
    console.log(`✓ ${rule.name}`);
  }
}

// The citrus budget is a soft rule: report, don't fail.
const citrus = FILES.map((f) => [f, (stripComments(readFileSync(f, "utf8")).match(/bg-accent\b/g) || []).length])
  .filter(([f, n]) => n > 1 && !/components\/ui\//.test(f));
if (citrus.length) {
  console.log("\n! citrus budget — more than one bg-accent (review, not a hard failure)");
  citrus.forEach(([f, n]) => console.log(`   ${f}: ${n}`));
}

console.log(failures ? `\n${failures} violation(s)` : "\nAll design checks clean");
process.exit(failures ? 1 : 0);
