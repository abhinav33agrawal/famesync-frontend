import { CreditCard, AlertTriangle, Coins, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        isEmpty ? 'text-destructive' : isLow ? 'text-amber-500' : 'text-muted-foreground',
        className
      )}
    >
      {showIcon && (
        <Coins className={cn(
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
          isEmpty && 'text-destructive',
          isLow && !isEmpty && 'text-amber-500'
        )} />
      )}
      <span>{credits}</span>
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
        "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20",
        className
      )}>
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-destructive font-medium">
            {CREDIT_MESSAGES.apply.insufficient}
          </p>
          <Link 
            to="/subscription" 
            className="text-xs text-destructive/80 hover:text-destructive underline"
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
        "flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20",
        className
      )}>
        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {CREDIT_MESSAGES.apply.low}
        </p>
      </div>
    );
  }
  
  if (isLow) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50",
        className
      )}>
        <Coins className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          {CREDIT_MESSAGES.apply.lastFew(credits)}
        </p>
      </div>
    );
  }
  
  // Normal state - subtle indicator
  return (
    <div className={cn(
      "flex items-center gap-2 p-2.5 rounded-lg bg-muted/30",
      className
    )}>
      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
      <p className="text-sm text-muted-foreground">
        {CREDIT_MESSAGES.apply.normal}
      </p>
      <span className="ml-auto text-xs text-muted-foreground">
        {credits} available
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
      <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-destructive">
            No credits available
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You need at least 1 credit to apply. Upgrade your plan or wait for your monthly credit reset.
          </p>
        </div>
      </div>
      <Button asChild className="w-full">
        <Link to="/subscription">
          <Zap className="mr-2 h-4 w-4" />
          Get More Credits
          <ArrowRight className="ml-2 h-4 w-4" />
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
