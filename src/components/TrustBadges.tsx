import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Trust markers ride the Badge variants: `success` for verified, the lilac
   default tint for new members, and success/warning/destructive on the
   completion meter. No green-500/blue-500 tints, no dark: variants. */

interface TrustBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

// Email Verified Badge
export const EmailVerifiedBadge = ({ className, size = 'md' }: TrustBadgeProps) => {
  const iconSize = size === 'sm' ? 'size-3' : 'size-3.5';
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="success" className={cn(sizing, className)}>
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
  const iconSize = size === 'sm' ? 'size-3' : 'size-3.5';
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : '';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={cn(sizing, className)}>
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
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const iconSize = size === 'sm' ? 'size-3' : 'size-3.5';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-1.5">
              <Clock className={cn(iconSize, getColor())} />
              {showLabel && (
                <span className={cn("num", textSize, getColor())}>
                  {percentage}% complete
                </span>
              )}
            </div>
            <Progress
              value={percentage}
              className={cn("h-1.5 w-16 bg-muted", size === 'sm' && "h-1 w-12")}
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
