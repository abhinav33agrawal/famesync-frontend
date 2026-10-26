import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, LockOpen, Zap } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useUnlockCampaign } from '@/hooks/useCampaigns';
import { useCreditUsageInfo } from '@/hooks/useSubscription';
import type { Campaign, CampaignUnlockResponse } from '@/lib/api/types';

const WHAT_YOU_GET = [
  'Brand name and profile',
  'Exact budget',
  'Contact details and creative brief',
  'Free application — no second credit',
];

/** The one place a creator spends a credit: confirm, unlock, done.
 *
 *  Credits buy the brief, not the application. Out of credits, or over the
 *  plan's monthly/daily unlock cap, it says so and points at Subscription
 *  instead of pretending the button works. */
export const UnlockCampaignDialog = ({
  campaign,
  open,
  onOpenChange,
  onUnlocked,
}: {
  campaign: Pick<Campaign, 'slug' | 'title'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked?: (campaign: CampaignUnlockResponse) => void;
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate, isPending, error, reset } = useUnlockCampaign();

  // a fresh dialog shouldn't show the last campaign's error
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const { data: usage } = useCreditUsageInfo();

  const credits = user?.credits ?? 0;
  // Free allows 1 unlock a day, Pro 3; known before the click, not after.
  const outForToday = usage?.credits_remaining_today === 0 && credits > 0;
  const errorData = (error as { response?: { data?: { error?: string; limit_reached?: boolean; insufficient_credits?: boolean } } } | null)
    ?.response?.data;
  const limited = outForToday || errorData?.limit_reached;
  const blocked = credits < 1 || errorData?.insufficient_credits || limited;

  const unlock = () => {
    if (!campaign) return;
    mutate(campaign.slug, {
      onSuccess: (unlocked) => {
        onOpenChange(false);
        onUnlocked?.(unlocked);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <span className="mb-1 inline-flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            {blocked ? <Zap className="size-5" /> : <LockOpen className="size-5" />}
          </span>
          <AlertDialogTitle className="font-display text-2xl tracking-[-0.03em]">
            {blocked
              ? outForToday
                ? "That's today's unlock"
                : limited
                  ? 'Unlock limit reached'
                  : "You're out of credits"
              : 'Unlock this brief?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[0.9375rem] leading-relaxed">
            {blocked ? (
              errorData?.error ||
              (outForToday
                ? `Your plan allows ${usage?.daily_limit} unlock${usage?.daily_limit === 1 ? '' : 's'} a day. Your ${credits} credit${credits === 1 ? '' : 's'} will still be here tomorrow — or go Pro for up to 3 a day.`
                : 'Each unlock uses 1 credit. Get more with Pro, or wait for your monthly reset.')
            ) : (
              <>
                <span className="font-semibold text-foreground">{campaign?.title}</span> — uses{' '}
                <span className="font-semibold text-foreground">1 credit</span>. You have{' '}
                <span className="num text-foreground">{credits}</span>.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!blocked && (
          <ul className="grid gap-2 rounded-lg bg-muted p-4">
            {WHAT_YOU_GET.map((line) => (
              <li key={line} className="flex items-center gap-2.5 text-sm">
                <Check className="size-4 shrink-0 text-success" strokeWidth={3} />
                {line}
              </li>
            ))}
          </ul>
        )}

        {errorData?.error && !blocked && <p className="text-sm text-destructive">{errorData.error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Not now</AlertDialogCancel>
          {blocked ? (
            <Button variant="form" onClick={() => navigate('/subscription')}>
              <Zap />
              {outForToday ? 'See Pro' : 'Get more credits'}
            </Button>
          ) : (
            <Button variant="form" onClick={unlock} disabled={isPending || !campaign}>
              {isPending ? <Loader2 className="animate-spin" /> : <LockOpen />}
              Unlock · 1 credit
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
