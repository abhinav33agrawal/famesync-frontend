import { cn } from "@/lib/utils";

/** Aubergine-on-lilac initials fallback — replaces every
 *  `gradient-instagram` AvatarFallback in the old UI. */
export const Avatar = ({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) => {
  const initials = (name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-secondary font-semibold text-secondary-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {src ? <img src={src} alt={name ?? ""} className="h-full w-full object-cover" /> : initials}
    </span>
  );
};

/** Brand logo tile — square, radius 10/11, paper fill with the initial
 *  in the display face. Replaces the gradient icon tiles on campaign cards. */
export const BrandLogo = ({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-md",
      "border border-border bg-muted font-display text-lg font-semibold text-muted-foreground/60",
      className,
    )}
  >
    {src ? (
      <img src={src} alt={name ?? ""} className="h-full w-full object-cover" />
    ) : (
      (name ?? "?").charAt(0).toUpperCase()
    )}
  </span>
);
