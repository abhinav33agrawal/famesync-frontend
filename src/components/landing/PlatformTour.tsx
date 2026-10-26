import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Instagram, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLogo } from "@/components/Avatar";
import { StatusBadge } from "@/components/Stat";
import { SOFT_EASE } from "@/components/motion";
import { FEATURES, SHOWCASE_CAMPAIGN, type FeatureKey } from "@/data/landing";
import { deliverableChips, formatINR } from "@/lib/format";
import { cn, formatDateDMY } from "@/lib/utils";

/* izea.com-style service tabs: a big numbered index on the left, and on the
   right the piece of product that feature actually is. Every fragment is an
   illustrative example — "@you", the Showcase brief — never a named creator. */

const brand = SHOWCASE_CAMPAIGN.brand_profile!;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
    <dt className="eyebrow text-[10.5px]">{label}</dt>
    <dd className="text-right text-sm font-semibold">{children}</dd>
  </div>
);

const Checked = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-sm">
    <span className="mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
      <Check className="size-3" strokeWidth={3} />
    </span>
    {children}
  </li>
);

// recent reel views, oldest first — drawn as bars, scaled to the max
const REEL_VIEWS = [18, 26, 21, 34, 29, 41];

const Reach = () => (
  <Card className="p-6">
    <div className="flex items-center gap-3">
      <span className="brand-gradient inline-flex size-12 items-center justify-center rounded-full font-display text-lg font-black text-primary-foreground">
        Y
      </span>
      <div>
        <p className="font-bold">@you</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Instagram className="size-3.5" /> Connected to Instagram
        </p>
      </div>
      <Badge variant="success" className="ml-auto">
        Verified
      </Badge>
    </div>

    <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border">
      {[
        ["Followers", "24.8K"],
        ["Eng. rate", "5.2%"],
        ["Avg. views", "31K"],
      ].map(([label, value]) => (
        <div key={label} className="min-w-0 bg-card p-2.5 sm:p-3">
          <dt className="eyebrow whitespace-nowrap text-[10px] tracking-[0.08em] sm:tracking-[0.16em]">{label}</dt>
          <dd className="num mt-1 text-xl">{value}</dd>
        </div>
      ))}
    </dl>

    <p className="eyebrow mb-3 mt-6 text-[10.5px]">Last 6 reels</p>
    <div className="flex h-20 items-end gap-2">
      {REEL_VIEWS.map((v, i) => (
        <span
          key={i}
          className={cn("flex-1 rounded-t-sm", i === REEL_VIEWS.length - 1 ? "bg-primary" : "bg-primary/20")}
          style={{ height: `${(v / Math.max(...REEL_VIEWS)) * 100}%` }}
        />
      ))}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">Synced from Instagram · 2 hours ago</p>
  </Card>
);

const Brief = () => (
  <Card className="overflow-hidden">
    <div className="flex items-center gap-3 border-b border-border p-5">
      <BrandLogo name={brand.company_name} className="size-11" />
      <div className="min-w-0">
        <p className="truncate font-display font-extrabold tracking-[-0.02em]">{SHOWCASE_CAMPAIGN.title}</p>
        <p className="text-xs text-muted-foreground">
          {brand.company_name} · {brand.industry}
        </p>
      </div>
    </div>
    <dl className="px-5">
      <Row label="Budget">
        <span className="num text-base">{formatINR(SHOWCASE_CAMPAIGN.budget)}</span> · Fixed
      </Row>
      <Row label="Deliverables">{deliverableChips(SHOWCASE_CAMPAIGN.deliverables_required).join(" · ")}</Row>
      <Row label="Post by">{formatDateDMY(SHOWCASE_CAMPAIGN.post_date)}</Row>
      <Row label="Hashtags">#VerdeSummer #CleanSkin</Row>
    </dl>
    <div className="m-5 mt-2 rounded-md bg-muted p-4">
      <p className="eyebrow mb-1.5 text-[10.5px]">Creative direction</p>
      <p className="text-sm leading-relaxed">“{SHOWCASE_CAMPAIGN.requirements}”</p>
    </div>
  </Card>
);

const Apply = () => (
  <Card className="p-6">
    <p className="eyebrow text-[10.5px]">Apply to</p>
    <p className="mt-1 font-display text-lg font-extrabold tracking-[-0.02em]">{SHOWCASE_CAMPAIGN.title}</p>

    <p className="eyebrow mb-3 mt-6 text-[10.5px]">Sent with your application</p>
    <ul className="grid gap-2.5">
      <Checked>
        Verified reach — <strong>24.8K followers</strong>
      </Checked>
      <Checked>
        Engagement rate — <strong>5.2%</strong>
      </Checked>
      <Checked>Niche and city from your profile</Checked>
    </ul>

    <div className="mt-6 rounded-lg border border-input p-3 text-sm text-muted-foreground">
      Add a note for the brand (optional)
    </div>
    {/* a picture of the button, not a button — nothing to click here */}
    <span className={cn(buttonVariants({ variant: "form" }), "mt-4 w-full")}>Apply — 1 credit</span>
  </Card>
);

const TIMELINE = [
  { label: "Applied", note: "12 Oct", state: "done" },
  { label: "Accepted by Studio Verde", note: "13 Oct", state: "done" },
  { label: "Reel link submitted", note: "instagram.com/reel/…", state: "done" },
  { label: "Brand review", note: "Usually within 48 hours", state: "current" },
  { label: "Approved", note: "", state: "next" },
] as const;

const Delivery = () => (
  <Card className="p-6">
    <div className="mb-6 flex items-center justify-between gap-3">
      <p className="truncate font-display font-extrabold tracking-[-0.02em]">{SHOWCASE_CAMPAIGN.title}</p>
      <StatusBadge status="in_review" className="shrink-0 whitespace-nowrap" />
    </div>
    <ol>
      {TIMELINE.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 pb-5 last:pb-0">
          {i < TIMELINE.length - 1 && (
            <span
              className={cn(
                "absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5",
                step.state === "done" ? "bg-primary" : "bg-border",
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full",
              step.state === "done" && "bg-primary text-primary-foreground",
              step.state === "current" && "border-2 border-primary bg-card",
              step.state === "next" && "border-2 border-border bg-card",
            )}
          >
            {step.state === "done" && <Check className="size-3.5" strokeWidth={3} />}
            {step.state === "current" && <span className="size-2 rounded-full bg-primary" />}
          </span>
          <div>
            <p className={cn("text-sm font-semibold", step.state === "next" && "text-muted-foreground")}>
              {step.label}
            </p>
            {step.note && <p className="text-xs text-muted-foreground">{step.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  </Card>
);

const Trust = () => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <BrandLogo name={brand.company_name} className="size-14 text-xl" />
      <div>
        <p className="font-display text-lg font-extrabold tracking-[-0.02em]">{brand.company_name}</p>
        <p className="text-xs text-muted-foreground">{brand.description}</p>
      </div>
    </div>
    <div className="mt-5 flex items-center gap-2 rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground">
      <ShieldCheck className="size-4" />
      Reviewed by the FameSync team
    </div>
    <ul className="mt-5 grid gap-2.5">
      <Checked>Brand profile checked by hand</Checked>
      <Checked>Brief reviewed before it goes live</Checked>
      <Checked>Budget published on every brief</Checked>
    </ul>
  </Card>
);

const FRAGMENTS: Record<FeatureKey, () => JSX.Element> = {
  reach: Reach,
  brief: Brief,
  apply: Apply,
  delivery: Delivery,
  trust: Trust,
};

export const PlatformTour = () => {
  const [active, setActive] = useState(0);
  const still = useReducedMotion();
  const Fragment = FRAGMENTS[FEATURES[active].key];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div role="tablist" aria-orientation="vertical" aria-label="Platform features" className="border-t border-border">
        {FEATURES.map((feature, i) => {
          const selected = i === active;
          return (
            <button
              key={feature.key}
              type="button"
              role="tab"
              id={`tour-tab-${feature.key}`}
              aria-selected={selected}
              aria-controls="tour-panel"
              onClick={() => setActive(i)}
              className="group block w-full border-b border-border py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-baseline gap-5">
                <span className={cn("num w-6 text-sm", selected ? "text-primary" : "text-muted-foreground/60")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-display text-[1.5rem] font-extrabold tracking-[-0.035em] transition-colors duration-200 sm:text-[1.875rem]",
                    selected ? "text-foreground" : "text-muted-foreground/45 group-hover:text-foreground",
                  )}
                >
                  {feature.title}
                </span>
              </span>
              {selected && (
                <span className="mt-3 block max-w-[46ch] pl-11 leading-relaxed text-muted-foreground">
                  {feature.body}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        id="tour-panel"
        role="tabpanel"
        aria-labelledby={`tour-tab-${FEATURES[active].key}`}
        className="relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl bg-ink px-5 py-12 sm:px-10"
      >
        <span className="num pointer-events-none absolute -bottom-12 -right-3 select-none text-[220px] leading-none text-ink-foreground/[0.05]">
          {String(active + 1).padStart(2, "0")}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="relative w-full max-w-[400px]"
            initial={still ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: SOFT_EASE }}
          >
            <Fragment />
          </motion.div>
        </AnimatePresence>
        <p className="eyebrow absolute bottom-4 left-5 text-[10px] text-ink-muted sm:left-10">Illustrative example</p>
      </div>
    </div>
  );
};
