import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroPhone } from "@/components/landing/HeroPhone";
import { PlatformTour } from "@/components/landing/PlatformTour";
import { Rise } from "@/components/motion";
import { AUDIENCES, FACTS, NICHES, STEPS, VALUE_POINTS } from "@/data/landing";

/* Layout modelled on izea.com: an ink hero with a heavy headline and a
   ticker, a "why" statement in three numbered columns, a "How?" section of
   giant stacked verbs, a tabbed platform tour, an ink facts-and-audiences block, and a
   gradient closing banner. */

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
      <section className="overflow-hidden bg-ink text-ink-foreground">
        <div className="container grid grid-cols-1 items-center gap-16 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
          <Rise className="min-w-0">
            <span className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-ink-border py-1.5 pl-2.5 pr-3.5">
              <span className="size-1.5 rounded-full bg-accent ring-4 ring-accent/25" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Early access — India first
              </span>
            </span>

            <h1 className="font-display text-display-1 uppercase">
              Get paid
              <br />
              to <span className="brand-gradient-text">post.</span>
            </h1>

            <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-muted">
              Real brands, real budgets, real briefs. Apply in a tap, deliver on Instagram, get paid —
              no agency in the middle.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => navigate("/auth?role=influencer&mode=signup")}>
                Join as a creator
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline-inverse" onClick={() => navigate("/auth?role=brand&mode=signup")}>
                I&apos;m a brand
              </Button>
            </div>
          </Rise>

          <Rise delay={0.06}>
            <HeroPhone />
          </Rise>
        </div>

        {/* niche ticker — the list is doubled so the loop is seamless */}
        <div className="border-y border-ink-border py-5" aria-label="Niches on FameSync">
          <div className="overflow-hidden">
            <ul className="marquee gap-10 pr-10">
              {[...NICHES, ...NICHES].map((niche, i) => (
                <li
                  key={i}
                  aria-hidden={i >= NICHES.length}
                  className="flex items-center gap-10 whitespace-nowrap font-display text-2xl font-extrabold uppercase tracking-[-0.02em] text-ink-foreground/80"
                >
                  {niche}
                  <span className="size-2 rounded-full bg-primary" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- value proposition */}
      <section id="value" className="container py-24 lg:py-32">
        <Rise className="max-w-[880px]">
          <p className="eyebrow mb-5 text-primary">Why we built it</p>
          <h2 className="font-display text-display-2">
            Small creators do the best work and get the worst deals.
          </h2>
        </Rise>

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {VALUE_POINTS.map((point, i) => (
            <Rise key={point.title} delay={i * 0.06}>
              <div className="border-t-2 border-foreground pt-6">
                <span className="num text-5xl text-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mb-3 mt-5 text-xl font-extrabold tracking-[-0.02em]">{point.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            </Rise>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section id="how" className="bg-secondary py-24 lg:py-32">
        <div className="container">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-4 text-secondary-foreground">How?</p>
              <h2 className="font-display text-display-2">Three steps to your first collab.</h2>
            </div>
            <p className="text-secondary-foreground">Roughly nine minutes, start to finish.</p>
          </div>

          <ol className="border-t border-secondary-foreground/20">
            {STEPS.map((step, i) => (
              <Rise key={step.title} delay={i * 0.06}>
                <li className="grid gap-4 border-b border-secondary-foreground/20 py-10 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-12">
                  <div className="flex items-baseline gap-5">
                    <span className="num text-base text-secondary-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[clamp(48px,8vw,112px)] font-black uppercase leading-[0.9] tracking-[-0.05em] text-primary">
                      {step.word}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-extrabold tracking-[-0.02em]">{step.title}</h3>
                    <p className="max-w-[46ch] leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              </Rise>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------- bento grid */}
      <section id="features" className="container py-24 lg:py-32">
        <Rise>
          <p className="eyebrow mb-5 text-primary">The platform</p>
          <h2 className="mb-14 max-w-[20ch] font-display text-display-2">
            Everything the collab needs. Nothing it doesn&apos;t.
          </h2>
        </Rise>
        <PlatformTour />
      </section>

      {/* ----------------------------------------- facts + two audiences */}
      <section className="bg-ink py-24 text-ink-foreground lg:py-32">
        <div className="container">
          <Rise>
            <p className="eyebrow mb-5 text-ink-muted">Why believe in FameSync?</p>
            <h2 className="max-w-[18ch] font-display text-display-2">
              Fair by default, <span className="brand-gradient-text">on both sides.</span>
            </h2>
          </Rise>

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-y border-ink-border py-12 lg:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="num block text-[clamp(40px,5vw,64px)] leading-none">{fact.value}</span>
                  <span className="mt-3 block max-w-[22ch] text-sm leading-relaxed text-ink-muted">
                    {fact.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-10">
            {AUDIENCES.map((audience, i) => (
              <Rise key={audience.eyebrow} delay={i * 0.06} className="flex flex-col">
                <p className="eyebrow mb-4 text-ink-muted">{audience.eyebrow}</p>
                <h3 className="max-w-[22ch] font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                  {audience.title}
                </h3>
                <ul className="mb-10 mt-8 border-t border-ink-border">
                  {audience.lines.map((line) => (
                    <li
                      key={line}
                      className="flex items-center justify-between gap-4 border-b border-ink-border py-4 text-[1.0625rem] font-semibold"
                    >
                      {line}
                      <ArrowUpRight className="size-4 shrink-0 text-primary" />
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  variant={i === 0 ? "inverse" : "outline-inverse"}
                  className="mt-auto self-start"
                  onClick={() => navigate(audience.to)}
                >
                  {audience.cta}
                </Button>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- closing banner */}
      <section className="container py-20">
        <Rise>
          <div className="brand-gradient flex flex-col gap-8 rounded-2xl px-8 py-14 text-primary-foreground md:flex-row md:items-end md:justify-between md:px-14 md:py-20">
            <h2 className="max-w-[16ch] font-display text-display-2 uppercase">
              Let&apos;s make something worth posting.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="inverse" onClick={() => navigate("/auth?mode=signup")}>
                Start free
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline-inverse" onClick={() => navigate("/contact")}>
                Talk to us
              </Button>
            </div>
          </div>
        </Rise>
      </section>
    </>
  );
};

export default Home;
