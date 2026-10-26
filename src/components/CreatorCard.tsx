import { BadgeCheck, MapPin } from "lucide-react";
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

/** Brand-side Discover card. A photo leads when there is one; without it
 *  the card opens on the person, not on an empty tinted band. Two numbers
 *  in the display face — reach and engagement — and collabs only when the
 *  API actually sends a count. One honest action: view the profile. */
export const CreatorCard = ({
  creator,
  className,
  onView,
  preview = false,
}: {
  creator: Creator;
  className?: string;
  onView?: () => void;
  /** onboarding's live preview: same card, nothing to click */
  preview?: boolean;
}) => {
  const verified = creator.verified && (
    <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Instagram verified" />
  );

  return (
    <Card
      intent={preview ? "default" : "interactive"}
      className={cn("flex flex-col overflow-hidden p-0", className)}
      onClick={preview ? undefined : onView}
    >
      {creator.photo && (
        <img src={creator.photo} alt={creator.name} className="aspect-[4/3] w-full object-cover" />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          {!creator.photo && <Avatar name={creator.name} size={48} />}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-display text-[1.0625rem] font-extrabold tracking-[-0.02em]">
              <span className="truncate">{creator.name}</span>
              {verified}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{creator.username}</p>
          </div>
        </div>

        {(creator.niches?.length || creator.city) && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs font-medium">
            {creator.niches?.map((niche) => (
              <span key={niche} className="rounded-sm bg-secondary px-2.5 py-1 text-secondary-foreground">
                {niche}
              </span>
            ))}
            {creator.city && (
              <span className="inline-flex items-center gap-1 px-1 text-muted-foreground">
                <MapPin className="size-3" />
                {creator.city}
              </span>
            )}
          </div>
        )}

        <dl className="mb-5 mt-5 flex gap-6 border-t border-border pt-4">
          <div>
            <dd className="num text-2xl leading-none">{formatCompact(creator.followers)}</dd>
            <dt className="mt-1.5 text-xs text-muted-foreground">Followers</dt>
          </div>
          <div>
            <dd className="num text-2xl leading-none">
              {creator.engagement !== null && creator.engagement !== undefined
                ? creator.engagement.toFixed(1) + "%"
                : "—"}
            </dd>
            <dt className="mt-1.5 text-xs text-muted-foreground">Engagement</dt>
          </div>
          {creator.collabs != null && (
            <div>
              <dd className="num text-2xl leading-none">{creator.collabs}</dd>
              <dt className="mt-1.5 text-xs text-muted-foreground">Collabs</dt>
            </div>
          )}
        </dl>

        {!preview && (
          <Button
            variant="outline"
            size="sm"
            className="mt-auto w-full"
            onClick={(e) => {
              e.stopPropagation();
              onView?.();
            }}
          >
            View profile
          </Button>
        )}
      </div>
    </Card>
  );
};
