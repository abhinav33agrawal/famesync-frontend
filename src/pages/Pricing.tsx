import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Rise } from '@/components/motion';
import { Check, Loader2, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { usePlans } from '@/hooks/usePlans';
import { cn } from '@/lib/utils';

/* Removed: FloatingOrb (looping animation), the mesh/radial background stack,
   the gradient tier cards, the blurred hover glow, the gradient "Most
   Popular" badge, the gradient clip-text prices and every `text-white`.
   The recommended tier is now the one aubergine `feature` card and the
   creator upgrade CTA is the page's single citrus button. */

type Tier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
};

const INFLUENCER_TIERS: { free: Tier; pro: Tier } = {
  free: {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started with influencer marketing',
    features: [
      '5 credits per month',
      '1 credit unlocks a full brief',
      'Apply free to briefs you unlock',
      'Up to 1 unlock per day',
      'Email support',
      'Access to community',
    ],
  },
  pro: {
    name: 'Pro',
    price: '₹400',
    period: 'per month',
    description: 'For influencers ready to scale their brand partnerships',
    features: [
      '30 credits per month',
      '1 credit unlocks a full brief',
      'Up to 3 unlocks per day',
      'Priority email support',
      'Higher visibility to brands',
      'Basic campaign insights',
      'Direct brand contact',
    ],
  },
};

const BRAND_TIERS: { free: Tier; pro: Tier } = {
  free: {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Test FameSync with your first campaign',
    features: [
      '3 credits per month',
      'Basic profile setup',
      'Create 1 campaign per month',
      'Email support',
      'Access to influencer database',
    ],
  },
  pro: {
    name: 'Pro',
    price: '₹400',
    period: 'per month',
    description: 'For brands ready to scale their influencer marketing',
    features: [
      '10 credits per month',
      'Max 1 campaign per day',
      'Advanced campaign analytics',
      'Priority email support',
      'Featured brand status',
      'Detailed influencer insights',
      'Bulk influencer outreach',
    ],
  },
};

const FAQS = [
  {
    q: 'What are credits?',
    a: 'Credits let you apply to campaigns. Each application costs 1 credit. You get a fresh batch each month based on your plan.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel anytime with no questions asked. Your plan stays active until the billing period ends.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'No, credits reset monthly. Pro users have daily limits to encourage regular usage.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept major credit/debit cards, UPI, and net banking through Razorpay, our secure payment provider.',
  },
];

/* ------------------------------------------------------------- tier card ---- */

type TierCardProps = {
  tier: Tier;
  recommended?: boolean;
  children: React.ReactNode;
};

const TierCard = ({ tier, recommended = false, children }: TierCardProps) => (
  <Card
    intent={recommended ? 'feature' : 'default'}
    className="flex h-full flex-col rounded-2xl p-7 sm:p-8"
  >
    <div className="flex items-start justify-between gap-3">
      <span className={cn('eyebrow', recommended && 'text-primary-foreground/60')}>
        {tier.name}
      </span>
      {recommended && (
        <Badge className="bg-primary-foreground/15 text-primary-foreground">Most Popular</Badge>
      )}
    </div>

    <div className="mt-5 flex items-baseline gap-1.5">
      <span className="num text-[2.75rem] leading-none">{tier.price}</span>
      <span className={cn('text-sm', recommended ? 'text-primary-foreground/65' : 'text-muted-foreground')}>
        / {tier.period}
      </span>
    </div>

    <p
      className={cn(
        'mt-4 max-w-[38ch] text-sm leading-relaxed',
        recommended ? 'text-primary-foreground/75' : 'text-muted-foreground',
      )}
    >
      {tier.description}
    </p>

    <ul className="mb-8 mt-7 grid gap-3">
      {tier.features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-[0.9375rem]">
          <span
            className={cn(
              'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full',
              recommended ? 'bg-primary-foreground/15' : 'bg-secondary',
            )}
          >
            <Check className={cn('size-3', recommended ? '' : 'text-secondary-foreground')} />
          </span>
          <span className={recommended ? 'text-primary-foreground/90' : undefined}>{feature}</span>
        </li>
      ))}
    </ul>

    <div className="mt-auto">{children}</div>
  </Card>
);

/* ------------------------------------------------------------------ page ---- */

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startRazorpayCheckout: createCheckoutSession, isLoading } = usePayment();
  const { data: subscription } = useSubscription();
  const currentPlan = subscription?.plan || 'free';

  /* NOTE: the backend plan list is fetched here but the tier cards below
     render the hardcoded tiers above — pre-existing behaviour, left alone
     deliberately (this is a visual rework only). */
  const { plans: backendPlans } = usePlans();
  void backendPlans;

  const [activeTab, setActiveTab] = useState<'influencer' | 'brand'>('influencer');

  // Auto-select tab based on user role
  useEffect(() => {
    if (user?.role) {
      setActiveTab(user.role === 'influencer' ? 'influencer' : 'brand');
    }
  }, [user?.role]);

  const upgrade = (description: string) =>
    createCheckoutSession({
      name: 'FameSync Pro',
      description,
      prefill: {
        name: `${user?.first_name} ${user?.last_name}`,
        email: user?.email,
      },
    });

  const proCtaLabel = isLoading ? (
    <Loader2 className="animate-spin" />
  ) : currentPlan === 'pro' ? (
    'Current Plan'
  ) : (
    'Upgrade to Pro'
  );

  return (
    <>
      <Helmet>
        <title>Pricing - FameSync | Choose Your Plan</title>
        <meta name="description" content="Explore FameSync pricing plans. Start free or upgrade to Pro for advanced features, more campaigns, and priority support. Flexible pricing for creators and brands." />
        <meta name="keywords" content="famesync pricing, influencer marketing plans, subscription plans, creator pricing, brand pricing" />
        <link rel="canonical" href="https://famesync.com/pricing" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://famesync.com/pricing" />
        <meta property="og:title" content="Pricing - FameSync | Choose Your Plan" />
        <meta property="og:description" content="Start free or upgrade to Pro. Flexible pricing for creators and brands." />
        <meta property="og:image" content="https://famesync.com/og-image.png" />
        <meta property="og:site_name" content="FameSync" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://famesync.com/pricing" />
        <meta name="twitter:title" content="Pricing - FameSync | Choose Your Plan" />
        <meta name="twitter:description" content="Start free or upgrade to Pro. Flexible pricing for creators and brands." />
        <meta name="twitter:image" content="https://famesync.com/og-image.png" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "FameSync Pricing",
            "description": "Explore FameSync pricing plans for creators and brands",
            "url": "https://famesync.com/pricing",
            "mainEntity": {
              "@type": "Product",
              "name": "FameSync Pro",
              "offers": {
                "@type": "Offer",
                "price": "400",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="container py-16 sm:py-20">
        {/* ------------------------------------------------------------ head */}
        <Rise className="max-w-[42ch]">
          <p className="eyebrow mb-5">Simple, transparent pricing</p>
          <h1 className="font-display text-display-1">Choose your plan.</h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Start free and upgrade as you grow. All plans include our core features with no
            hidden fees.
          </p>
        </Rise>

        {/* ----------------------------------------------------------- tiers */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'influencer' | 'brand')}
          className="mt-12 w-full"
        >
          <TabsList className="mx-auto grid h-14 w-full max-w-sm grid-cols-2 gap-1 rounded-full bg-muted p-1.5">
            <TabsTrigger
              value="influencer"
              className="h-11 gap-2 rounded-full text-sm data-[state=active]:bg-card data-[state=active]:shadow-e1"
            >
              <Users className="size-4" />
              Creators
            </TabsTrigger>
            <TabsTrigger
              value="brand"
              className="h-11 gap-2 rounded-full text-sm data-[state=active]:bg-card data-[state=active]:shadow-e1"
            >
              <Building2 className="size-4" />
              Brands
            </TabsTrigger>
          </TabsList>

          {/* ------------------------------------------------------ creators */}
          <TabsContent value="influencer" className="mt-10">
            <div className="grid gap-5 md:grid-cols-2">
              <Rise>
                <TierCard tier={INFLUENCER_TIERS.free}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={currentPlan === 'free'}
                    onClick={() => {
                      if (user) {
                        navigate('/influencer/dashboard');
                      } else {
                        navigate('/auth');
                      }
                    }}
                  >
                    {currentPlan === 'free' ? 'Current Plan' : 'Start Free'}
                  </Button>
                </TierCard>
              </Rise>

              <Rise delay={0.06}>
                <TierCard tier={INFLUENCER_TIERS.pro} recommended>
                  {/* the page's single citrus CTA — creator facing */}
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || currentPlan === 'pro'}
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                      } else if (currentPlan === 'pro') {
                        navigate('/subscription');
                      } else {
                        upgrade('Monthly Pro Subscription for Influencers');
                      }
                    }}
                  >
                    {proCtaLabel}
                  </Button>
                </TierCard>
              </Rise>
            </div>
          </TabsContent>

          {/* -------------------------------------------------------- brands */}
          <TabsContent value="brand" className="mt-10">
            <div className="grid gap-5 md:grid-cols-2">
              <Rise>
                <TierCard tier={BRAND_TIERS.free}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={currentPlan === 'free'}
                    onClick={() => {
                      if (user) {
                        navigate('/brand/dashboard');
                      } else {
                        navigate('/auth');
                      }
                    }}
                  >
                    {currentPlan === 'free' ? 'Current Plan' : 'Start Free'}
                  </Button>
                </TierCard>
              </Rise>

              <Rise delay={0.06}>
                <TierCard tier={BRAND_TIERS.pro} recommended>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || currentPlan === 'pro'}
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                      } else if (currentPlan === 'pro') {
                        navigate('/subscription');
                      } else {
                        upgrade('Monthly Pro Subscription for Brands');
                      }
                    }}
                  >
                    {proCtaLabel}
                  </Button>
                </TierCard>
              </Rise>
            </div>
          </TabsContent>
        </Tabs>

        {/* ------------------------------------------------------------- faq */}
        <section className="mt-20 border-t border-border pt-14">
          <Rise className="max-w-[52ch]">
            <h2 className="font-display text-display-3">Frequently asked questions</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </Rise>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {FAQS.map((faq) => (
              <Rise key={faq.q}>
                <Card className="h-full p-6">
                  <h3 className="mb-2.5 font-display text-[1.0625rem] font-semibold tracking-[-0.015em]">
                    {faq.q}
                  </h3>
                  <p className="max-w-[52ch] leading-relaxed text-muted-foreground">{faq.a}</p>
                </Card>
              </Rise>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
