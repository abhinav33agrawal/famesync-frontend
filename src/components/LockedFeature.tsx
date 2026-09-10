import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                {showUpgrade && (
                  <Link to="/pricing">
                    <Button size="sm" className="gradient-instagram text-xs">
                      Upgrade Now
                    </Button>
                  </Link>
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
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span className="blur-sm select-none">●●●●●</span>
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
  <Badge variant="default" className="gradient-instagram gap-1 text-xs">
    <Lock className="h-3 w-3" />
    Premium
  </Badge>
);
