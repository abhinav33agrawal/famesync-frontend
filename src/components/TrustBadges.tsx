import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

// Email Verified Badge
export const EmailVerifiedBadge = ({ className, size = 'md' }: TrustBadgeProps) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
              padding,
              textSize,
              className
            )}
          >
            <CheckCircle2 className={iconSize} />
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Email address has been verified</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// New on FameSync Badge (accounts < 30 days old)
export const NewMemberBadge = ({ className, size = 'md' }: TrustBadgeProps) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1 border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
              padding,
              textSize,
              className
            )}
          >
            <Sparkles className={iconSize} />
            New
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">New on FameSync (joined less than 30 days ago)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Profile Completion Indicator
interface ProfileCompletionProps extends TrustBadgeProps {
  percentage: number;
  showLabel?: boolean;
}

export const ProfileCompletionBadge = ({ 
  percentage, 
  className, 
  size = 'md',
  showLabel = true 
}: ProfileCompletionProps) => {
  const getColor = () => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-1.5">
              <Clock className={cn(iconSize, getColor())} />
              {showLabel && (
                <span className={cn("font-medium", textSize, getColor())}>
                  {percentage}% Complete
                </span>
              )}
            </div>
            <Progress 
              value={percentage} 
              className={cn("h-1.5 w-16", size === 'sm' && "w-12 h-1")}
              indicatorClassName={getProgressColor()}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {percentage >= 100 
              ? 'Profile is complete!' 
              : `Complete your profile to build trust (${percentage}% done)`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Combined Trust Layer Display
interface TrustLayerProps {
  emailVerified?: boolean;
  isNewMember?: boolean;
  profileCompletion?: number;
  size?: 'sm' | 'md';
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export const TrustLayer = ({
  emailVerified = false,
  isNewMember = false,
  profileCompletion,
  size = 'md',
  className,
  layout = 'horizontal',
}: TrustLayerProps) => {
  const hasAnyBadge = emailVerified || isNewMember || (profileCompletion !== undefined);
  
  if (!hasAnyBadge) return null;

  return (
    <div 
      className={cn(
        "flex gap-2",
        layout === 'vertical' ? 'flex-col items-start' : 'flex-wrap items-center',
        className
      )}
    >
      {emailVerified && <EmailVerifiedBadge size={size} />}
      {isNewMember && <NewMemberBadge size={size} />}
      {profileCompletion !== undefined && (
        <ProfileCompletionBadge 
          percentage={profileCompletion} 
          size={size}
          showLabel={layout === 'horizontal'}
        />
      )}
    </div>
  );
};

// Helper function to calculate if user is new (< 30 days)
export const isNewUser = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
};

// Helper to calculate influencer profile completion
export const calculateInfluencerCompletion = (profile: {
  bio?: string;
  niche?: string;
  category?: string;
  instagram_handle?: string;
  follower_count?: number;
  profile_picture?: string;
}): number => {
  const fields = [
    { value: profile.bio, weight: 15 },
    { value: profile.niche, weight: 15 },
    { value: profile.category, weight: 10 },
    { value: profile.instagram_handle, weight: 25 },
    { value: profile.follower_count && profile.follower_count > 0, weight: 20 },
    { value: profile.profile_picture, weight: 15 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = fields.reduce((sum, f) => {
    const hasValue = typeof f.value === 'boolean' ? f.value : Boolean(f.value);
    return sum + (hasValue ? f.weight : 0);
  }, 0);

  return Math.round((completedWeight / totalWeight) * 100);
};

// Helper to calculate brand profile completion
export const calculateBrandCompletion = (profile: {
  company_name?: string;
  industry?: string;
  website?: string;
  description?: string;
  profile_picture?: string;
}): number => {
  const fields = [
    { value: profile.company_name, weight: 25 },
    { value: profile.industry, weight: 20 },
    { value: profile.website, weight: 15 },
    { value: profile.description, weight: 25 },
    { value: profile.profile_picture, weight: 15 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = fields.reduce((sum, f) => sum + (f.value ? f.weight : 0), 0);

  return Math.round((completedWeight / totalWeight) * 100);
};
