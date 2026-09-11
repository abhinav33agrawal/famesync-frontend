import { BadgeCheck, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/Avatar";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

type Creator = {
  id: string | number;
  name: string;
  username: string;
  niches?: string[];
  city?: string | null;
  photo?: string | null;
  followers?: number | null;
  engagement?: number | null;
  collabs?: number | null;
  verified?: boolean;
};

/** Brand-side Discover card. Photography leads; three metrics maximum,
 *  set in the display face so they read as a claim, not data slop. */
export const CreatorCard = ({
  creator,
  className,
  onInvite,
  onSave,
}: {
  creator: Creator;
  className?: string;
  onInvite?: () => void;
  onSave?: () => void;
}) => (
  <Card intent="interactive" className={cn("overflow-hidden p-0", className)}>
    <div className="relative h-[150px] bg-secondary">
      {creator.photo ? (
        <img src={creator.photo} alt={creator.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center">
          <Avatar name={creator.name} size={56} className="bg-card" />
        </span>
      )}
      {creator.verified && (
        <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <BadgeCheck className="size-3" />
          Verified
        </span>
      )}
    </div>

    <div className="p-4">
      <div className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">{creator.name}</div>
      <p className="mb-3.5 mt-0.5 truncate text-xs text-muted-foreground">
        @{creator.username}
        {creator.niches?.length ? " · " + creator.niches.join(", ") : ""}
      </p>

      <dl className="mb-3.5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border">
        <div className="min-w-0 bg-card px-2.5 py-2">
          <dd className="num text-[0.9375rem]">{formatCompact(creator.followers)}</dd>
          <dt className="whitespace-nowrap text-[10px] font-medium text-muted-foreground/75">Reach</dt>
        </div>
        <div className="min-w-0 bg-card px-2.5 py-2">
          <dd className="num text-[0.9375rem]">
            {creator.engagement !== null && creator.engagement !== undefined
              ? creator.engagement.toFixed(1) + "%"
              : "—"}
          </dd>
          <dt className="whitespace-nowrap text-[10px] font-medium text-muted-foreground/75">Engag.</dt>
        </div>
        <div className="min-w-0 bg-card px-2.5 py-2">
          <dd className="num text-[0.9375rem]">{creator.collabs ?? 0}</dd>
          <dt className="whitespace-nowrap text-[10px] font-medium text-muted-foreground/75">Collabs</dt>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button variant="form" size="sm" className="flex-1" onClick={onInvite}>
          Invite to campaign
        </Button>
        <Button variant="outline" size="icon" aria-label="Save creator" onClick={onSave}>
          <Bookmark />
        </Button>
      </div>
    </div>
  </Card>
);
