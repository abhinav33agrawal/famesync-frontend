import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Calendar, CheckCircle2, Loader2, Shield, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { usePayment } from '@/hooks/usePayment';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Rise } from '@/components/motion';
import { Stat } from '@/components/Stat';

/* Removed from the old Subscription.tsx: the FloatingOrb pair (repeat: Infinity),
   the mesh-pattern and radial background stack, the aubergine-to-lilac gradient
   hero with white text, the gradient clip-text price, the gradient progress bar
   and the rotate-on-hover crown tiles. */

const SubscriptionSkeleton = () => (
  <div className="container py-10 md:py-14">
    <div className="mb-10">
      <div className="mb-3 h-4 w-32 animate-pulse rounded-sm bg-muted" />
      <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
    </div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="h-44 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
  </div>
);

const Subscription = () => {
  const { user } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { plans, isLoading: plansLoading } = usePlans();
  const { startRazorpayCheckout: createCheckoutSession, isLoading: checkoutLoading } = usePayment();
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Invalidate everything to be sure
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      window.history.replaceState({}, '', '/subscription');
    }
  }, [queryClient]);

  const currentPlan = subscription?.plan || 'free';
  const planConfig = plans.find(p => p.slug === currentPlan) || plans.find(p => p.slug === 'free');
  const totalCredits = subscription?.credit_limit || user?.credits || 10;
  const creditsUsed = totalCredits - (user?.credits || 0);
  const creditsPercentage = ((user?.credits || 0) / totalCredits) * 100;

  if (subLoading || plansLoading) {
    return <SubscriptionSkeleton />;
  }

  const roleBenefits = planConfig?.features || [];

  const proBenefits = plans.find(p => p.slug === 'pro')?.features || [];

  const renewalLabel = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="container py-10 md:py-14">
      <Rise>
        <header className="mb-10">
          <p className="eyebrow mb-3">Billing</p>
          <h1 className="font-display text-display-2">Subscription &amp; credits</h1>
          <p className="mt-3 text-muted-foreground">
            Manage your subscription and track your credit usage.
          </p>
        </header>
      </Rise>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ----------------------------------------- plan + usage */}
        <div className="space-y-5 lg:col-span-2">
          <Rise>
            <Card intent="feature" className="rounded-2xl p-8">
              <span className="eyebrow text-accent">Current plan</span>
              <h2 className="mt-4 font-display text-[2.5rem] leading-none tracking-[-0.03em]">
                {planConfig?.name || 'Free'}
              </h2>
              <p className="mt-3 max-w-[44ch] leading-relaxed text-primary-foreground/75">
                {currentPlan === 'free'
                  ? 'Upgrade to unlock premium features and more credits.'
                  : 'Enjoy all premium features and benefits.'}
              </p>

              <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-primary-foreground/15 bg-primary-foreground/15">
                <div className="bg-primary p-4">
                  <dt className="eyebrow text-primary-foreground/60">Credits left</dt>
                  <dd className="num mt-2 text-2xl">{user?.credits || 0}</dd>
                </div>
                <div className="bg-primary p-4">
                  <dt className="eyebrow text-primary-foreground/60">Total</dt>
                  <dd className="num mt-2 text-2xl">{totalCredits}</dd>
                </div>
                <div className="bg-primary p-4">
                  <dt className="eyebrow text-primary-foreground/60">Used</dt>
                  <dd className="num mt-2 text-2xl">{creditsUsed}</dd>
                </div>
              </dl>
            </Card>
          </Rise>

          <Rise delay={0.06}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="size-[18px] text-primary" />
                  Credit usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {user?.credits || 0} of {totalCredits} credits remaining
                    </span>
                    <span className="num text-sm text-muted-foreground">
                      {Math.round(creditsPercentage)}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={Math.round(creditsPercentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Credits remaining"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500 ease-soft"
                      style={{ width: `${creditsPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg bg-muted p-3">
                  <Calendar className="size-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {renewalLabel ? `Credits reset on ${renewalLabel}` : 'Credits reset monthly'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Rise>

          {currentPlan === 'pro' && (
            <Rise delay={0.12}>
              <Card>
                <CardHeader>
                  <CardTitle>Your Pro benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {roleBenefits.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                        <span className="text-sm leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Rise>
          )}
        </div>

        {/* --------------------------------------------- upgrade */}
        <div className="space-y-5">
          {currentPlan === 'free' ? (
            <Rise delay={0.06}>
              <Card className="lg:sticky lg:top-24">
                <CardContent className="p-6 pt-6">
                  <Badge variant="premium" className="mb-4">
                    Recommended
                  </Badge>

                  <h3 className="font-display text-display-3">Pro plan</h3>
                  <p className="mt-2 flex items-baseline gap-2">
                    <span className="num text-[2.5rem] leading-none">₹400</span>
                    <span className="text-muted-foreground">/ month</span>
                  </p>

                  <p className="mb-6 mt-4 text-sm leading-relaxed text-muted-foreground">
                    Unlock all premium features and grow your influence faster.
                  </p>

                  <ul className="mb-6 grid gap-3">
                    {proBenefits.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="form"
                    className="w-full"
                    onClick={() => createCheckoutSession({
                      name: 'FameSync Pro',
                      description: 'Monthly Pro Subscription',
                      prefill: {
                        name: `${user?.first_name} ${user?.last_name}`,
                        email: user?.email
                      }
                    })}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? <Loader2 className="animate-spin" /> : <Zap />}
                    Upgrade to Pro
                  </Button>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="size-3" />
                    Secure payment via Razorpay
                  </p>
                </CardContent>
              </Card>
            </Rise>
          ) : (
            <Rise delay={0.06}>
              <Stat
                label="Plan"
                value="Pro"
                note={`${totalCredits} credits every month`}
                tone="feature"
              />
              <Card className="mt-5">
                <CardContent className="p-6 pt-6">
                  <p className="eyebrow">Next billing date</p>
                  <p className="num mt-2 text-lg">
                    {subscription?.renewal_date
                      ? new Date(subscription.renewal_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </CardContent>
              </Card>
            </Rise>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
