import type { Campaign } from "@/lib/api/types";

/* Landing-page content.
 *
 * The named-creator row was removed on 2026-09-18: those accounts were
 * invented, and presenting them as "creators already on the platform" is a
 * claim about real people. Bring it back only with reviewed creators who
 * have agreed, showing their real follower counts.
 *
 * SHOWCASE_CAMPAIGN below is still PLACEHOLDER — it illustrates what a brief
 * looks like rather than advertising a live one. Swap it for a campaign
 * fetched from the API before the hero is read as a real listing.
 */

/** Shaped as a real Campaign so the landing hero renders the exact card
 *  creators see in Discover — one component, no marketing-only variant. */
export const SHOWCASE_CAMPAIGN: Campaign = {
  id: 0,
  slug: "showcase",
  brand: {
    id: 0,
    username: "studioverde",
    email: "hello@example.com",
    first_name: "Studio",
    last_name: "Verde",
    role: "brand",
    credits: 0,
    created_at: new Date().toISOString(),
  },
  brand_profile: {
    id: 0,
    user: {
      id: 0,
      username: "studioverde",
      email: "hello@example.com",
      first_name: "Studio",
      last_name: "Verde",
      role: "brand",
      credits: 0,
      created_at: new Date().toISOString(),
    },
    company_name: "Studio Verde",
    industry: "Skincare",
    description: "Clean skincare, made in Bengaluru.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  title: "Summer skincare launch — Reels",
  description: "Three creators, one launch week, honest reviews only.",
  category: "Skincare",
  budget: 18000,
  budget_type: "fixed",
  requirements: "Shoot in daylight. No filters on the product shots.",
  deliverables_required: [
    { type: "REEL", count: 1 },
    { type: "STORY", count: 2 },
  ],
  post_date: new Date(Date.now() + 6 * 86400000).toISOString(),
  campaign_type: "online",
  location: "Remote",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const VALUE_POINTS = [
  {
    title: "Budgets are published up front",
    body: "Every brief shows the fee before you apply. No “DM us for rates”, no discovering the budget was product-only after three rounds of edits.",
  },
  {
    title: "Reach is verified, not claimed",
    body: "Creators connect Instagram directly, so brands see real follower and engagement numbers. Nobody loses a collab to a bought audience.",
  },
  {
    title: "Nobody takes a cut of your fee",
    body: "The brand pays you the posted budget. We charge for platform access, not a percentage of your work.",
  },
];

export const STEPS = [
  {
    title: "Create your profile",
    body: "Add your niche, city and Instagram handle. Every profile is reviewed by hand before it goes live.",
  },
  {
    title: "Apply to briefs",
    body: "Filter by budget, niche and deliverable. Apply with your verified numbers already attached.",
  },
  {
    title: "Post and get paid",
    body: "Deliver on Instagram, submit the link, and track approval to payout in one place.",
  },
];

type BentoCell = {
  eyebrow: string;
  title: string;
  body: string;
  intent: "default" | "tinted" | "feature";
  wide?: boolean;
};

export const BENTO: BentoCell[] = [
  {
    eyebrow: "Instagram native",
    title: "Verified reach on every profile",
    body: "Follower count, engagement rate and recent performance pulled straight from Instagram, refreshed automatically. Brands shortlist on real numbers and creators stop screenshotting their insights.",
    intent: "feature",
    wide: true,
  },
  {
    eyebrow: "Briefs",
    title: "Everything in the brief",
    body: "Budget, deliverables, hashtags, post date and the actual creative direction — before you apply.",
    intent: "default",
  },
  {
    eyebrow: "Applications",
    title: "One tap to apply",
    body: "Your verified stats travel with the application. No media kit, no pitch deck.",
    intent: "tinted",
  },
  {
    eyebrow: "Delivery",
    title: "Approval you can track",
    body: "Submit the post link and watch it move through review. Both sides see the same status.",
    intent: "default",
  },
  {
    eyebrow: "Trust",
    title: "Brands are reviewed too",
    body: "Every brand is manually checked before a brief goes live, so a collab is never a cold DM from an unknown account.",
    intent: "default",
  },
];
