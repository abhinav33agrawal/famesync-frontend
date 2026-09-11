import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/* Gating is a blur plus the `premium` badge — no crown, no glow. */

interface LockedFeatureProps {
  children: ReactNode;
  isLocked: boolean;
  message?: string;
  showUpgrade?: boolean;
}

export const LockedFeature = ({
  children,
  isLocked,
  message = "Upgrade to Premium to unlock this feature",
  showUpgrade = true
}: LockedFeatureProps) => {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-60 blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-[2px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center gap-2.5">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Lock className="size-4" />
                </span>
                {showUpgrade && (
                  <Button variant="form" size="sm" asChild>
                    <Link to="/pricing">Upgrade</Link>
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export const LockedText = ({
  text,
  isLocked,
  message = "Upgrade to view"
}: {
  text: string;
  isLocked: boolean;
  message?: string;
}) => {
  if (!isLocked) {
    return <span>{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Lock className="size-3" />
            <span className="select-none blur-[3.5px]">●●●●●</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const PremiumBadgeIndicator = () => (
  <Badge variant="premium">
    <Lock className="size-3" />
    Premium
  </Badge>
);
