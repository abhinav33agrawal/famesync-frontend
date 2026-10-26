import { Eye, Lock, LockOpen, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/Stat";
import { BrandLogo } from "@/components/Avatar";
import { formatINR, daysLeftLabel, deliverableChips, campaignDueDate, isGoingLive } from "@/lib/format";
import { formatDateDMY } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/api/types";

/** "owned" is the brand looking at its own brief: manage it, never apply. */
type CampaignCardState = "open" | "locked" | "applied" | "owned";

type CampaignCardProps = {
  campaign: Campaign;
  state?: CampaignCardState;
  className?: string;
  onApply?: () => void;
  /** locked only: opens the 1-credit unlock confirmation */
  onUnlock?: () => void;
  onView?: () => void;
  /** owned drafts only — puts Publish inside the card */
  onPublish?: () => void;
};

/** One component for every campaign surface: Discover grid, dashboard list,
 *  landing-page showcase, and the create-campaign live preview.
 *
 *  Changes from the old card:
 *  - budget + deadline promoted into a hairline-split numeric block (display face)
 *  - deliverables are flat muted chips, not primary-tinted double-bordered pills
 *  - brand logo tile instead of a gradient icon square
 *  - locked state = blurred brand and budget + "Locked" badge; one credit
 *    unlocks it (the server withholds those fields until then)
 */
export const CampaignCard = ({
  campaign,
  state = "open",
  className,
  onApply,
  onUnlock,
  onView,
  onPublish,
}: CampaignCardProps) => {
  const locked = state === "locked";
  const brandName = campaign.brand_profile?.company_name ?? "Brand";
  const dueDate = campaignDueDate(campaign);

  return (
    <Card intent="interactive" className={cn("flex flex-col p-5", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <span className="eyebrow">{daysLeftLabel(dueDate)}</span>
        <StatusBadge status={locked ? "locked" : isGoingLive(campaign) ? "going_live" : campaign.status} />
      </header>

      <div className="mb-4 flex items-center gap-3">
        {locked ? (
          <span className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground/60">
            <Lock className="size-4" />
          </span>
        ) : (
          <BrandLogo src={campaign.brand_profile?.logo} name={brandName} className="size-[42px]" />
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
            {campaign.title}
          </h3>
          <p
            className={cn(
              "truncate text-xs text-muted-foreground",
              locked && "select-none blur-[3.5px]",
            )}
          >
            {brandName} · {campaign.location || "Remote"}
          </p>
        </div>
      </div>

      {/* promoted numeric block — hairline split, display face, shrinkable */}
      <dl className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
        <div className="min-w-0 bg-card p-3">
          <dt className="eyebrow text-[10.5px]">Budget</dt>
          <dd className={cn("num mt-0.5 text-[1.0625rem]", locked && "select-none blur-[4px]")}>
            {formatINR(campaign.budget)}
          </dd>
        </div>
        <div className="min-w-0 bg-card p-3">
          <dt className="eyebrow whitespace-nowrap text-[10.5px]">Post by</dt>
          <dd className="num mt-0.5 text-[1.0625rem]">{formatDateDMY(dueDate) || "Flexible"}</dd>
        </div>
      </dl>

      <ul className="mb-4 flex flex-1 flex-wrap content-start gap-1.5">
        {deliverableChips(campaign.deliverables_required).map((chip) => (
          <li key={chip} className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium">
            {chip}
          </li>
        ))}
        {campaign.category && (
          <li className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium">{campaign.category}</li>
        )}
      </ul>

      {locked ? (
        <Button variant="form" size="sm" className="w-full" onClick={onUnlock}>
          <LockOpen />
          Unlock · 1 credit
        </Button>
      ) : state === "owned" ? (
        onPublish ? (
          <div className="flex gap-2">
            <Button variant="form" size="sm" className="flex-1" onClick={onPublish}>
              <Rocket />
              Publish
            </Button>
            <Button variant="outline" size="icon" aria-label="Open campaign" onClick={onView}>
              <Eye />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={onView}>
            Manage campaign
          </Button>
        )
      ) : state === "applied" ? (
        <Button variant="outline" size="sm" className="w-full" onClick={onView}>
          View application
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="form" size="sm" className="flex-1" onClick={onApply}>
            View &amp; apply
          </Button>
          <Button variant="outline" size="icon" aria-label="Preview brief" onClick={onView}>
            <Eye />
          </Button>
        </div>
      )}
    </Card>
  );
};
