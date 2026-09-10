import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export interface PremiumBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PremiumBadge = ({ plan, size = 'md', showIcon = true, className = '' }: PremiumBadgeProps) => {
  if (plan.toLowerCase() !== 'pro') return null;

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <Badge
      className={`bg-gradient-to-r from-primary to-secondary text-white gap-1 border-0 ${className}`}
    >
      {showIcon && <Star className={iconSize} />}
      Pro
    </Badge>
  );
};