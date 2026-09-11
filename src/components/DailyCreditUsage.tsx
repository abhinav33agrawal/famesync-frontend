import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Rise } from '@/components/motion';
import { useDailyStats } from '@/hooks/useSubscription';

/* The amber tints, the gradient progress fill and the backdrop-blurred
   translucent card are now `warning` / `primary` on a plain white surface. */

interface DailyCreditUsageProps {
  className?: string;
}

export const DailyCreditUsage = ({ className }: DailyCreditUsageProps) => {
  const { data: dailyStats, isLoading, error } = useDailyStats();

  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-20 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !dailyStats) {
    return (
      <Card className={cn("border-destructive/25 bg-destructive/[0.07]", className)}>
        <div className="flex items-center gap-2.5 p-4 text-destructive">
          <Info className="size-4 shrink-0" />
          <span className="text-sm">Unable to load daily usage data</span>
        </div>
      </Card>
    );
  }

  // If user doesn't have daily limits (free users)
  if (!dailyStats.has_daily_limit) {
    return null;
  }

  const {
    daily_limit = 0,
    today_usage = 0,
    today_remaining = 0,
    today_percentage = 0,
  } = dailyStats;

  const isNearLimit = today_remaining <= 1 && today_remaining >= 0;
  const isExhausted = today_remaining <= 0;

  const tone = isExhausted ? 'destructive' : isNearLimit ? 'warning' : 'primary';

  return (
    <Rise className={cn("space-y-4", className)}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="eyebrow">Daily credit usage</span>
            <div className="num mt-3 text-[2rem] leading-none">
              {today_usage}
              <span className="text-muted-foreground">/{daily_limit}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">credits used today</p>
          </div>
          {isNearLimit && (
            <Badge variant={isExhausted ? 'destructive' : 'warning'}>
              <Info className="size-3" />
              Low today
            </Badge>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Daily progress</span>
            <span
              className={cn(
                "num",
                tone === 'destructive' && 'text-destructive',
                tone === 'warning' && 'text-warning',
                tone === 'primary' && 'text-primary',
              )}
            >
              {Math.round(today_percentage)}%
            </span>
          </div>
          <Progress
            value={Math.min(today_percentage, 100)}
            className="h-2 bg-muted"
            indicatorClassName={cn(
              tone === 'destructive' && 'bg-destructive',
              tone === 'warning' && 'bg-warning',
              tone === 'primary' && 'bg-primary',
            )}
          />
        </div>

        <div
          className={cn(
            "mt-4 flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium",
            tone === 'destructive' && 'bg-destructive/10 text-destructive',
            tone === 'warning' && 'bg-warning/10 text-warning',
            tone === 'primary' && 'bg-secondary text-secondary-foreground',
          )}
        >
          {isExhausted ? (
            <>
              <Clock className="size-3.5 shrink-0" />
              <span>Daily limit reached. Resets at midnight.</span>
            </>
          ) : isNearLimit ? (
            <>
              <TrendingUp className="size-3.5 shrink-0" />
              <span>{today_remaining} credit{today_remaining !== 1 ? 's' : ''} left today.</span>
            </>
          ) : (
            <>
              <Zap className="size-3.5 shrink-0" />
              <span>{today_remaining} credit{today_remaining !== 1 ? 's' : ''} available today.</span>
            </>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">
              Daily limits reset at midnight IST.
            </p>
            <p>
              Pro users get {daily_limit} credits per day to encourage regular usage. Unused daily credits don't carry over.
            </p>
          </div>
        </div>
      </Card>
    </Rise>
  );
};

export default DailyCreditUsage;
