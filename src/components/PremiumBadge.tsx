import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/* The Pro marker: the `premium` badge variant (the violet→magenta signature gradient),
   replacing the primary→secondary gradient with white text. */

export interface PremiumBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PremiumBadge = ({ plan, size = 'md', showIcon = true, className = '' }: PremiumBadgeProps) => {
  if (plan.toLowerCase() !== 'pro') return null;

  const iconSize = size === 'sm' ? 'size-3' : size === 'md' ? 'size-3.5' : 'size-4';

  return (
    <Badge variant="premium" className={cn(size === 'sm' && 'px-2 py-0.5 text-[11px]', className)}>
      {showIcon && <Star className={iconSize} />}
      Pro
    </Badge>
  );
};
