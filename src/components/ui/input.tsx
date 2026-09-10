import * as React from "react";
import { cn } from "@/lib/utils";

/* The old input had no border at all — only a focus ring. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-lg border border-input bg-card px-4 text-[0.95rem]",
        "transition-[border-color,box-shadow] duration-150",
        "placeholder:text-muted-foreground/70",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.12]",
        "disabled:cursor-not-allowed disabled:bg-muted",
        "aria-[invalid=true]:border-destructive/50 aria-[invalid=true]:focus-visible:ring-destructive/[0.12]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[7.25rem] w-full resize-y rounded-lg border border-input bg-card px-4 py-3",
        "text-[0.95rem] leading-relaxed transition-[border-color,box-shadow] duration-150",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.12]",
        "disabled:cursor-not-allowed disabled:bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
