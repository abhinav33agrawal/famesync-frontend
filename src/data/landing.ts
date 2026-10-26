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
  id: "",
  slug: "showcase",
  brand: {
    id: "",
    username: "studioverde",
    email: "hello@example.com",
    first_name: "Studio",
    last_name: "Verde",
    role: "brand",
    credits: 0,
    created_at: new Date().toISOString(),
  },
  brand_profile: {
    id: "",
    user: {
      id: "",
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

/** `word` is the giant stacked verb in the "How?" section. */
export const STEPS = [
  {
    word: "Create",
    title: "Create your profile",
    body: "Add your niche, city and Instagram handle. Every profile is reviewed by hand before it goes live.",
  },
  {
    word: "Apply",
    title: "Apply to briefs",
    body: "Filter by budget, niche and deliverable. Apply with your verified numbers already attached.",
  },
  {
    word: "Get paid",
    title: "Post and get paid",
    body: "Deliver on Instagram, submit the link, and track approval to payout in one place.",
  },
];

/** Second brief on the hero phone, half cut off by the screen edge.
 *  PLACEHOLDER like SHOWCASE_CAMPAIGN — illustrative, not a live listing. */
export const SECOND_CAMPAIGN: Campaign = {
  ...SHOWCASE_CAMPAIGN,
  slug: "showcase-2",
  brand_profile: {
    ...SHOWCASE_CAMPAIGN.brand_profile!,
    company_name: "Kora Threads",
    industry: "Fashion",
  },
  title: "Monsoon lookbook — carousel posts",
  category: "Fashion",
  budget: 12000,
  deliverables_required: [{ type: "POST", count: 2 }],
  post_date: new Date(Date.now() + 11 * 86400000).toISOString(),
};

export type FeatureKey = "reach" | "brief" | "apply" | "delivery" | "trust";

/** The Platform tour: one row per feature, each paired with a UI fragment
 *  in components/landing/PlatformTour.tsx. */
export const FEATURES: { key: FeatureKey; title: string; body: string }[] = [
  {
    key: "reach",
    title: "Verified reach",
    body: "Follower count, engagement rate and recent performance pulled straight from Instagram, refreshed automatically. Brands shortlist on real numbers and creators stop screenshotting their insights.",
  },
  {
    key: "brief",
    title: "The whole brief",
    body: "Budget, deliverables, hashtags, post date and the actual creative direction — before you apply.",
  },
  {
    key: "apply",
    title: "One tap to apply",
    body: "Your verified stats travel with the application. No media kit, no pitch deck.",
  },
  {
    key: "delivery",
    title: "Approval you can track",
    body: "Submit the post link and watch it move through review. Both sides see the same status.",
  },
  {
    key: "trust",
    title: "Brands are reviewed too",
    body: "Every brand is manually checked before a brief goes live, so a collab is never a cold DM from an unknown account.",
  },
];

/** The hero ticker. Niches, not brand logos — there is no "trusted by" row
 *  until real brands have agreed to be named. */
export const NICHES = [
  "Beauty",
  "Fashion",
  "Food",
  "Fitness",
  "Travel",
  "Tech",
  "Skincare",
  "Lifestyle",
  "Gaming",
  "Parenting",
  "Finance",
  "Home",
];

/** Product facts, not traction numbers — each one restates a promise made
 *  elsewhere on the page. Don't add user counts or view totals here until
 *  they come from the API. */
export const FACTS = [
  { value: "0%", label: "taken from a creator's fee" },
  { value: "100%", label: "of profiles reviewed by hand" },
  { value: "1 tap", label: "to apply with verified reach" },
  { value: "Upfront", label: "budget shown on every brief" },
];

export const AUDIENCES = [
  {
    eyebrow: "For creators",
    title: "Find paid work that fits what you already make.",
    lines: [
      "Browse briefs from reviewed brands",
      "Apply in one tap with your verified reach",
      "Keep the whole fee — no cut taken",
      "Get paid for content you'd post anyway",
    ],
    cta: "Join as a creator",
    to: "/auth?role=influencer&mode=signup",
  },
  {
    eyebrow: "For brands",
    title: "Run micro-creator campaigns without an agency retainer.",
    lines: [
      "Post a brief in minutes",
      "Review verified applicants side by side",
      "Shortlist on real Instagram numbers",
      "Track deliverables to approval",
    ],
    cta: "Post a campaign",
    to: "/auth?role=brand&mode=signup",
  },
];
