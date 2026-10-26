import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/context/AuthContext';

/* The crown-in-a-glowing-ring header is replaced by the `premium` badge and
   a display-face title. */

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  limitType?: 'campaigns' | 'applications';
  currentPlan?: string;
}

export const UpgradePrompt = ({
  open,
  onClose,
  title = "Upgrade to Premium",
  description = "You've reached your free plan limit. Upgrade to continue.",
  limitType = 'campaigns',
  currentPlan = 'free'
}: UpgradePromptProps) => {
  const { user } = useAuth();
  const { plans } = usePlans();
  const proPlan = plans.find(p => p.slug === 'pro');

  // Default fallbacks based on context if no dynamic features available
  const fallbackBenefits = limitType === 'campaigns' ? [
    'Create up to 10 campaigns per month (Pro)',
    'Access full influencer profiles',
    'AI-based matching',
    'Advanced analytics',
    'Direct messaging'
  ] : [
    '30 credits a month to unlock briefs (Pro)',
    'Up to 3 unlocks a day',
    'Priority in brand searches',
    'Advanced analytics',
    'Profile views tracking'
  ];

  const benefits = proPlan?.features && proPlan.features.length > 0 ? proPlan.features : fallbackBenefits;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md rounded-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <AlertDialogHeader>
          <Badge variant="premium" className="mx-auto">Pro</Badge>
          <AlertDialogTitle className="text-center font-display text-display-3">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-2 rounded-xl border border-border bg-muted/60 p-4">
          <p className="eyebrow mb-3">What Pro adds</p>
          <ul className="space-y-2.5">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="mt-[0.4rem] size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button variant="form" className="w-full" asChild>
            <Link to="/pricing">View pricing plans</Link>
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe later
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
