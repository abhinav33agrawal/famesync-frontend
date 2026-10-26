import { BatteryFull, Check, Signal, Wifi } from "lucide-react";
import { CampaignCard } from "@/components/CampaignCard";
import { SECOND_CAMPAIGN, SHOWCASE_CAMPAIGN } from "@/data/landing";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Skincare", "Reels", "Under ₹20K"];

/** The landing hero's right side: the creator Discover screen on a phone,
 *  with the moment the brief pays off ("Reel approved") laid over its edge.
 *  Built from the real CampaignCard so it can't drift from the product. */
export const HeroPhone = () => (
  <div className="relative mx-auto w-full max-w-[420px] pt-6">
    {/* stage light under the phone */}
    <div className="absolute inset-x-0 bottom-0 top-1/3 rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.5),transparent)]" />

    <div className="relative mx-auto w-[310px] rounded-[3rem] border border-ink-foreground/10 bg-ink-border p-2.5 shadow-e3 sm:w-[350px]">
      <div className="relative h-[560px] overflow-hidden rounded-[2.4rem] bg-background text-foreground sm:h-[600px]">
        {/* status bar */}
        <div className="flex items-center justify-between px-7 pb-2 pt-3.5 text-xs font-semibold">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>

        {/* app bar */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="font-display text-base font-black tracking-[-0.04em]">FameSync</span>
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
            Y
          </span>
        </div>

        <div className="px-4">
          <p className="eyebrow text-primary">Discover</p>
          <p className="mt-1 font-display text-[1.625rem] font-extrabold leading-tight tracking-[-0.035em]">
            Briefs for you
          </p>

          <ul className="-mr-4 mb-4 mt-4 flex gap-1.5 overflow-hidden whitespace-nowrap">
            {FILTERS.map((filter, i) => (
              <li
                key={filter}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  i === 0 ? "bg-ink text-ink-foreground" : "border border-border bg-card",
                )}
              >
                {filter}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-3 [&>*]:min-w-0">
            <CampaignCard campaign={SHOWCASE_CAMPAIGN} className="p-4 shadow-e2" />
            <CampaignCard campaign={SECOND_CAMPAIGN} className="p-4" />
          </div>
        </div>
      </div>
    </div>

    {/* the payoff, laid over the phone's cut-off second card */}
    <div className="absolute bottom-6 right-0 z-10 flex w-[250px] items-center gap-3 rounded-2xl bg-card p-3.5 text-foreground shadow-e3 sm:-right-8">
      <span className="brand-gradient inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
        <Check className="size-5" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight">Reel approved</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">Studio Verde · ₹18,000</p>
      </div>
      <span className="ml-auto self-start text-[11px] text-muted-foreground">now</span>
    </div>
  </div>
);
