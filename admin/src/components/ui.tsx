import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ button */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-primary",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-primary",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export const Button = ({
  variant = "primary",
  size = "md",
  busy,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  busy?: boolean;
}) => (
  <button
    {...rest}
    disabled={disabled || busy}
    className={cn(
      "inline-flex items-center justify-center rounded-md font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      VARIANTS[variant],
      SIZES[size],
      className
    )}
  >
    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
    {children}
  </button>
);

/* -------------------------------------------------------------------- card */

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "rounded-lg border border-border bg-card shadow-e1",
      className
    )}
  >
    {children}
  </div>
);

export const CardHead = ({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
    {action}
  </div>
);

/* ------------------------------------------------------------------- badge */

type Tone = "neutral" | "success" | "warning" | "danger" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/12 text-destructive",
  brand: "bg-secondary text-secondary-foreground",
};

export const Badge = ({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-5",
      TONES[tone]
    )}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------ inputs */

export const Input = ({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...rest}
    className={cn(
      "h-10 w-full rounded-md border border-input bg-card px-3 text-sm",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "disabled:opacity-50",
      className
    )}
  />
);

export const Select = ({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...rest}
    className={cn(
      "h-10 rounded-md border border-input bg-card px-3 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
  >
    {children}
  </select>
);

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {label}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

/* ------------------------------------------------------------------ states */

export const Spinner = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    {label ?? "Loading"}
  </div>
);

export const Empty = ({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) => (
  <div className="px-5 py-14 text-center">
    <p className="text-sm font-medium">{title}</p>
    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
  </div>
);

export const ErrorNote = ({ error }: { error: unknown }) => {
  const e = error as any;
  const status = e?.response?.status;
  const detail =
    e?.response?.data?.detail ??
    e?.response?.data?.error ??
    e?.message ??
    "Something went wrong.";
  return (
    <div className="m-5 rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
      {status ? `${status} — ` : ""}
      {String(detail)}
    </div>
  );
};

/* ------------------------------------------------------------------- table */

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">{children}</table>
  </div>
);

export const Th = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <th
    className={cn(
      "whitespace-nowrap border-b border-border px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground",
      className
    )}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <td className={cn("border-b border-border px-4 py-3 align-middle", className)}>
    {children}
  </td>
);

/* -------------------------------------------------------------- pagination */

export const Pager = ({
  page,
  count,
  pageSize = 20,
  onPage,
}: {
  page: number;
  count: number;
  pageSize?: number;
  onPage: (p: number) => void;
}) => {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-xs text-muted-foreground">
      <span className="nums">
        {from}–{to} of {count}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <span className="nums px-1">
          {page} / {pages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
