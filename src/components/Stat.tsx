import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Stat ---- */

type StatProps = {
  label: string;
  value: string | number;
  note?: string;
  noteTone?: "muted" | "success" | "warning";
  tone?: "default" | "feature";
  className?: string;
};

/** Replaces the four gradient stat tiles on every dashboard.
 *  Use tone="feature" for the single aubergine credits block. */
export const Stat = ({ label, value, note, noteTone = "muted", tone = "default", className }: StatProps) => (
  <Card intent={tone === "feature" ? "feature" : "default"} className={cn("p-6", className)}>
    <span className={cn("eyebrow", tone === "feature" && "text-accent")}>{label}</span>
    <div className="num mt-5 text-[2.375rem] leading-none">{value}</div>
    {note && (
      <p
        className={cn(
          "mt-2 text-sm",
          tone === "feature" && "text-primary-foreground/70",
          tone === "default" && noteTone === "muted" && "text-muted-foreground",
          noteTone === "success" && "font-medium text-success",
          noteTone === "warning" && "font-medium text-warning",
        )}
      >
        {note}
      </p>
    )}
  </Card>
);

/* --------------------------------------------------------- StatusBadge ---- */

const STATUS = {
  accepted: { label: "Accepted", variant: "success" },
  approved: { label: "Approved", variant: "success" },
  active: { label: "Live", variant: "success" },
  open: { label: "Accepting", variant: "success" },
  pending: { label: "In review", variant: "warning" },
  in_review: { label: "In review", variant: "warning" },
  submitted: { label: "In review", variant: "warning" },
  paused: { label: "Paused", variant: "warning" },
  rejected: { label: "Declined", variant: "destructive" },
  declined: { label: "Declined", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "neutral" },
  expired: { label: "Closed", variant: "neutral" },
  draft: { label: "Draft", variant: "neutral" },
  not_submitted: { label: "Not submitted", variant: "neutral" },
  locked: { label: "Pro", variant: "premium" },
} as const;

export type StatusKey = keyof typeof STATUS;

/** One mapping for every status string the API returns.
 *  Deletes getStatusIcon() in influencer/Dashboard.tsx and the ad-hoc
 *  colour maps in Applications.tsx, Deliverables.tsx and brand/Campaigns.tsx. */
export const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const s = STATUS[status as StatusKey] ?? STATUS.draft;
  return (
    <Badge variant={s.variant} className={className}>
      {s.label}
    </Badge>
  );
};
