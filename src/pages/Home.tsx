import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/Avatar";
import { CampaignCard } from "@/components/CampaignCard";
import { Rise } from "@/components/motion";
import { FEATURED_CREATORS, SHOWCASE_CAMPAIGN, VALUE_POINTS, STEPS, BENTO } from "@/data/landing";

/* Removed from the old Home.tsx: FloatingOrb, SplitText, AnimatedCounter,
   the marquee strip, the mesh-gradient hero, the four soft stat tiles,
   the six gradient icon tiles, and every glow/shimmer/blob element. */

const Home = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();

  // Arriving from another page as /#value or /#how.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <>
      <Helmet>
        <title>FameSync — Get paid to post</title>
        <meta
          name="description"
          content="Real brands, real budgets, real briefs. Apply in a tap, deliver on Instagram, get paid — no agency in the middle."
        />
      </Helmet>

      {/* ------------------------------------------------------------ hero */}
        <section className="container grid items-center gap-16 py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <Rise>
            <span className="mb-7 inline-flex items-center gap-2.5 rounded-full bg-secondary py-1.5 pl-2.5 pr-3.5">
              <span className="size-1.5 rounded-full bg-accent ring-4 ring-accent/25" />
              <span className="text-xs font-semibold tracking-wide text-primary">
                Early access — India first
              </span>
            </span>

            <h1 className="font-display text-display-1">Get paid to post.</h1>

            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">
              Real brands, real budgets, real briefs. Apply in a tap, deliver on Instagram, get paid —
              no agency in the middle.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/auth?role=influencer&mode=signup")}>
                Join as a creator
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/auth?role=brand&mode=signup")}>
                I&apos;m a brand
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex">
                {FEATURED_CREATORS.slice(0, 4).map((c, i) => (
                  <Avatar
                    key={c.username}
                    src={c.photo}
                    name={c.name}
                    size={40}
                    className={i > 0 ? "-ml-3 ring-2 ring-background" : "ring-2 ring-background"}
                  />
                ))}
              </div>
              <p className="max-w-[26ch] text-sm leading-snug text-muted-foreground">
                Every creator profile is Instagram-verified and manually reviewed.
              </p>
            </div>
          </Rise>

          {/* one sized block — a video can replace the card later without
              touching the layout */}
          <Rise delay={0.06} className="relative">
            <div className="wash absolute inset-y-4 -bottom-3 left-6 right-0 rounded-[1.75rem]" />
            <CampaignCard campaign={SHOWCASE_CAMPAIGN} className="relative shadow-e3" />
          </Rise>
        </section>

        {/* --------------------------------------------- creator proof row */}
        <section className="container flex flex-wrap items-center justify-between gap-4 border-t border-border py-7 pb-24">
          <p className="eyebrow">Creators already on the platform</p>
          <div className="flex flex-wrap gap-7">
            {FEATURED_CREATORS.map((c) => (
              <div key={c.username} className="flex items-center gap-3">
                <Avatar src={c.photo} name={c.name} size={38} />
                <div>
                  <div className="text-sm font-semibold">@{c.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.followersLabel} · {c.niche}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --------------------------------------------- value proposition */}
        <section id="value" className="container grid items-start gap-16 pb-26 lg:grid-cols-[0.9fr_1.1fr]">
          <Rise>
            <p className="eyebrow mb-5">Why we built it</p>
            <h2 className="font-display text-display-2">
              Small creators do the best work and get the worst deals.
            </h2>
          </Rise>
          <div className="divide-y divide-border border-y border-border">
            {VALUE_POINTS.map((point, i) => (
              <Rise key={point.title} delay={i * 0.06}>
                <div className="grid grid-cols-[44px_1fr] gap-5 py-7">
                  <span className="num text-[0.9375rem] text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-[1.1875rem] font-semibold tracking-[-0.01em]">
                      {point.title}
                    </h3>
                    <p className="max-w-[52ch] leading-relaxed text-muted-foreground">{point.body}</p>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- how it works */}
        <section id="how" className="container pb-26">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-display-2">Three steps to your first collab.</h2>
            <p className="text-muted-foreground">Roughly nine minutes, start to finish.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Rise key={step.title} delay={i * 0.06}>
                <Card intent="interactive" className="h-full p-7">
                  <div className="mb-14 flex items-center justify-between">
                    <span className="eyebrow">Step {String(i + 1).padStart(2, "0")}</span>
                    <span className={i === 0 ? "size-2.5 rounded-full bg-accent" : "size-2.5 rounded-full bg-border"} />
                  </div>
                  <h3 className="mb-2.5 font-display text-display-3">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.body}</p>
                </Card>
              </Rise>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------- bento grid */}
        <section id="features" className="container pb-26">
          <h2 className="mb-11 max-w-[20ch] font-display text-display-2">
            Everything the collab needs. Nothing it doesn&apos;t.
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {BENTO.map((cell) => (
              <Card
                key={cell.title}
                intent={cell.intent}
                className={cell.wide ? "p-9 md:col-span-2" : "p-7"}
              >
                <span
                  className={
                    cell.intent === "feature"
                      ? "eyebrow text-accent"
                      : cell.intent === "tinted"
                        ? "eyebrow text-secondary-foreground/70"
                        : "eyebrow"
                  }
                >
                  {cell.eyebrow}
                </span>
                <h3
                  className={
                    cell.wide
                      ? "mb-3 mt-3.5 font-display text-[1.875rem] tracking-[-0.03em]"
                      : "mb-2.5 mt-3.5 font-display text-display-3"
                  }
                >
                  {cell.title}
                </h3>
                <p
                  className={
                    cell.intent === "feature"
                      ? "max-w-[40ch] leading-relaxed text-primary-foreground/75"
                      : "leading-relaxed text-muted-foreground"
                  }
                >
                  {cell.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- two-path CTA */}
        <section className="container grid gap-5 pb-14 md:grid-cols-2">
          <Card intent="feature" className="flex flex-col rounded-2xl p-11">
            <h3 className="mb-3.5 font-display text-[2.125rem] leading-tight tracking-[-0.03em]">
              For creators
            </h3>
            <p className="mb-7 max-w-[34ch] leading-relaxed text-primary-foreground/75">
              Find paid work that fits what you already make.
            </p>
            <ul className="mb-9 grid gap-3">
              {[
                "Browse briefs from reviewed brands",
                "Apply in one tap with your verified reach",
                "Get paid for content you'd post anyway",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3 text-[0.9375rem]">
                  <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {line}
                </li>
              ))}
            </ul>
            <Button
              variant="accent"
              size="lg"
              className="mt-auto self-start"
              onClick={() => navigate("/auth?role=influencer&mode=signup")}
            >
              Join as a creator
            </Button>
          </Card>

          <Card className="flex flex-col rounded-2xl p-11">
            <h3 className="mb-3.5 font-display text-[2.125rem] leading-tight tracking-[-0.03em]">
              For brands
            </h3>
            <p className="mb-7 max-w-[34ch] leading-relaxed text-muted-foreground">
              Run micro-creator campaigns without an agency retainer.
            </p>
            <ul className="mb-9 grid gap-3">
              {[
                "Post a brief in minutes",
                "Review verified applicants side by side",
                "Track deliverables to approval",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3 text-[0.9375rem]">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              size="lg"
              className="mt-auto self-start"
              onClick={() => navigate("/auth?role=brand&mode=signup")}
            >
              Post a campaign
            </Button>
          </Card>
      </section>
    </>
  );
};

export default Home;
