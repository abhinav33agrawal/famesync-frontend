import { CreditCard, AlertTriangle, Coins, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/* Every amber-500 / dark:text-amber-400 tint here is now the `warning` token. */

// Credit cost for different actions
export const CREDIT_COSTS = {
  apply: 1,
  boost: 5,
} as const;

// Warning copy - friendly, non-alarming
export const CREDIT_MESSAGES = {
  apply: {
    normal: 'This will use 1 credit from your balance.',
    low: 'Heads up! This will use your last credit.',
    lastFew: (remaining: number) => `You have ${remaining} credits left. This will use 1.`,
    insufficient: 'You need at least 1 credit to apply.',
    success: 'Application sent! 1 credit used.',
  },
  balance: {
    healthy: (credits: number) => `${credits} credits available`,
    low: (credits: number) => `Only ${credits} credit${credits !== 1 ? 's' : ''} left`,
    empty: 'No credits remaining',
  },
} as const;

interface CreditBalanceDisplayProps {
  credits: number;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

// Compact credit balance indicator
export const CreditBalanceDisplay = ({
  credits,
  size = 'md',
  showIcon = true,
  className
}: CreditBalanceDisplayProps) => {
  const isLow = credits <= 1; // Updated for new lower limits
  const isEmpty = credits <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-medium",
        size === 'sm' ? 'text-xs' : 'text-sm',
        isEmpty ? 'text-destructive' : isLow ? 'text-warning' : 'text-muted-foreground',
        className
      )}
    >
      {showIcon && (
        <Coins className={cn(
          size === 'sm' ? 'size-3' : 'size-4',
          isEmpty && 'text-destructive',
          isLow && !isEmpty && 'text-warning'
        )} />
      )}
      <span className="num">{credits}</span>
      {size === 'md' && <span className="text-muted-foreground">credits</span>}
    </div>
  );
};

interface CreditWarningProps {
  credits: number;
  cost?: number;
  action?: 'apply' | 'boost';
  className?: string;
}

// Inline credit warning (no modal!)
export const CreditWarning = ({
  credits,
  cost = 1,
  action = 'apply',
  className
}: CreditWarningProps) => {
  const remaining = credits - cost;
  const isLow = remaining <= 1 && remaining >= 0;
  const isLast = remaining === 0;
  const isInsufficient = credits < cost;

  if (isInsufficient) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3",
        className
      )}>
        <AlertTriangle className="size-4 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">
            {CREDIT_MESSAGES.apply.insufficient}
          </p>
          <Link
            to="/subscription"
            className="text-xs text-destructive/85 underline underline-offset-2 hover:text-destructive"
          >
            Get more credits →
          </Link>
        </div>
      </div>
    );
  }

  if (isLast) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg border border-warning/25 bg-warning/10 p-3",
        className
      )}>
        <Zap className="size-4 shrink-0 text-warning" />
        <p className="text-sm font-medium text-warning">
          {CREDIT_MESSAGES.apply.low}
        </p>
      </div>
    );
  }

  if (isLow) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-muted p-2.5",
        className
      )}>
        <Coins className="size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {CREDIT_MESSAGES.apply.lastFew(credits)}
        </p>
      </div>
    );
  }

  // Normal state - subtle indicator
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg bg-muted p-2.5",
      className
    )}>
      <CreditCard className="size-4 shrink-0 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {CREDIT_MESSAGES.apply.normal}
      </p>
      <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
        <span className="num">{credits}</span> available
      </span>
    </div>
  );
};

interface InsufficientCreditsBlockProps {
  className?: string;
}

// Full block when credits are insufficient (replaces submit button area)
export const InsufficientCreditsBlock = ({ className }: InsufficientCreditsBlockProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/[0.07] p-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-5 text-destructive" />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-destructive">
            No credits available
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            You need at least 1 credit to apply. Upgrade your plan or wait for your monthly credit reset.
          </p>
        </div>
      </div>
      <Button variant="form" asChild className="w-full">
        <Link to="/subscription">
          <Zap />
          Get more credits
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
};

// Helper to check if user can apply
export const canApplyWithCredits = (credits: number, cost: number = 1): boolean => {
  return credits >= cost;
};

// Get appropriate button text based on credit state
export const getApplyButtonText = (
  credits: number,
  isSubmitting: boolean
): { text: string; disabled: boolean } => {
  if (isSubmitting) {
    return { text: 'Submitting...', disabled: true };
  }

  if (credits < 1) {
    return { text: 'Insufficient Credits', disabled: true };
  }

  if (credits === 1) {
    return { text: 'Apply (Last Credit)', disabled: false };
  }

  return { text: 'Submit Application', disabled: false };
};
