import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold " +
    "ring-offset-background transition-[background-color,border-color,transform,box-shadow] " +
    "duration-200 ease-soft active:scale-[0.985] focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // promotional / page-level actions — pill
        default:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-px",
        // creator-facing CTA only (citrus rule: one per screen)
        accent:
          "rounded-full bg-accent text-accent-foreground hover:-translate-y-px hover:shadow-e2",
        secondary:
          "rounded-full border-[1.5px] border-border bg-transparent text-foreground hover:border-primary hover:bg-muted",
        // inside cards, dialogs, wizards — radius 12
        form: "rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "rounded-lg border border-border bg-card hover:bg-muted",
        ghost: "rounded-md hover:bg-muted",
        destructive:
          "rounded-lg border-[1.5px] border-destructive/30 text-destructive bg-transparent hover:bg-destructive/[0.07]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        default: "h-12 px-6 text-[0.95rem]",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
