import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyStats } from '@/hooks/useSubscription';

interface DailyCreditUsageProps {
  className?: string;
}

export const DailyCreditUsage = ({ className }: DailyCreditUsageProps) => {
  const { data: dailyStats, isLoading, error } = useDailyStats();

  if (isLoading) {
    return (
      <div className={cn("space-y-4 animate-pulse", className)}>
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error || !dailyStats) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <Info className="h-4 w-4" />
            <span className="text-sm">Unable to load daily usage data</span>
          </div>
        </CardContent>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Daily Credit Usage</h3>
        </div>
        {isNearLimit && (
          <Badge variant="secondary" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            Low Today
          </Badge>
        )}
      </div>

      {/* Progress Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Current Usage Display */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {today_usage}/{daily_limit}
                </p>
                <p className="text-xs text-muted-foreground">
                  credits used today
                </p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isExhausted ? "bg-destructive/10" : 
                isNearLimit ? "bg-amber-500/10" : "bg-primary/10"
              )}>
                <Zap className={cn(
                  "h-5 w-5",
                  isExhausted ? "text-destructive" : 
                  isNearLimit ? "text-amber-500" : "text-primary"
                )} />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Daily Progress</span>
                <span className={cn(
                  "font-medium",
                  isExhausted ? "text-destructive" : 
                  isNearLimit ? "text-amber-500" : "text-primary"
                )}>
                  {Math.round(today_percentage)}%
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                    isExhausted ? "bg-destructive" : 
                    isNearLimit ? "bg-amber-500" : "bg-gradient-to-r from-primary to-secondary"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(today_percentage, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Status Message */}
            <div className={cn(
              "p-2 rounded-lg text-xs",
              isExhausted ? "bg-destructive/10 text-destructive" : 
              isNearLimit ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
              "bg-primary/10 text-primary"
            )}>
              {isExhausted ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Daily limit reached. Resets at midnight.</span>
                </div>
              ) : isNearLimit ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>{today_remaining} credit{today_remaining !== 1 ? 's' : ''} left today.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span>{today_remaining} credit{today_remaining !== 1 ? 's' : ''} available today.</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">
                <strong>Daily limits reset at midnight IST.</strong>
              </p>
              <p>
                Pro users get {daily_limit} credits per day to encourage regular usage. Unused daily credits don't carry over.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyCreditUsage;
