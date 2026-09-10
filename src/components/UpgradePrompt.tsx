import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Crown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/context/AuthContext';

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
    'Apply to 30 campaigns per month (Pro)',
    'See full campaign details',
    'Priority in brand searches',
    'Advanced analytics',
    'Profile views tracking'
  ];

  const benefits = proPlan?.features && proPlan.features.length > 0 ? proPlan.features : fallbackBenefits;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>

        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-4">
          <p className="text-sm font-semibold text-center">Unlock Premium Benefits:</p>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Link to="/pricing" className="w-full">
            <Button className="w-full gradient-instagram">
              <Crown className="mr-2 h-4 w-4" />
              View Pricing Plans
            </Button>
          </Link>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe Later
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
