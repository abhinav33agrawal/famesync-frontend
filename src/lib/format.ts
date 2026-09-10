/** INR formatting used on every campaign surface. Whole rupees, no decimals. */
export const formatINR = (value?: number | string | null) => {
  const n = typeof value === "string" ? Number(value.replace(/[^0-9.]/g, "")) : value;
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

/** 28412 -> "28.4K". Follower counts, reach, applicant totals. */
export const formatCompact = (n?: number | null) => {
  if (n === null || n === undefined) return "—";
  if (n >= 10000000) return (n / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

/** "2 days left" / "Closes today" / "Closed" — the card eyebrow. */
export const daysLeftLabel = (deadline?: string | null) => {
  if (!deadline) return "Open";
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return days + " days left";
};

const DELIVERABLE_LABELS: Record<string, string> = {
  POST: "Post",
  STORY: "Story",
  REEL: "Reel",
  VIDEO: "Video",
  YOUTUBE_VIDEO: "YT video",
  YOUTUBE_SHORTS: "Shorts",
  MIXED: "Mixed content",
};

/** Normalises every historical deliverable shape (string[], {type,count}[],
 *  or a bare string) into flat chip labels like "2 Stories".
 *  Replaces the ~90-line renderDeliverables() in influencer/Campaigns.tsx. */
export const deliverableChips = (d: unknown): string[] => {
  const label = (raw: string) => {
    const mapped = DELIVERABLE_LABELS[raw];
    if (mapped) return mapped;
    const t = (raw || "").toLowerCase();
    if (t.includes("youtube") && t.includes("short")) return "Shorts";
    if (t.includes("youtube") || t.includes("yt")) return "YT video";
    if (t.includes("post")) return "Post";
    if (t.includes("stor")) return "Story";
    if (t.includes("reel")) return "Reel";
    if (t.includes("short")) return "Shorts";
    if (t.includes("video")) return "Video";
    return raw;
  };

  const plural = (name: string, count: number) =>
    count > 1 ? count + " " + name + (name.endsWith("s") ? "" : "s") : "1 " + name;

  if (Array.isArray(d)) {
    if (d.length && typeof d[0] === "object" && d[0] !== null) {
      return (d as { type: string; count?: number }[]).map((it) =>
        plural(label(it.type), it.count && it.count > 0 ? it.count : 1),
      );
    }
    return (d as string[]).map((s) => plural(label(s), 1));
  }
  if (typeof d === "string" && d.trim()) return [plural(label(d), 1)];
  return [];
};
