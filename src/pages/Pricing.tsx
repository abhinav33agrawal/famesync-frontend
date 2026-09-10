import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Check, Sparkles, Loader2, ArrowRight, HelpCircle, Building2, Users, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { usePlans } from '@/hooks/usePlans';

const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.3, 0.2],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startRazorpayCheckout: createCheckoutSession, isLoading } = usePayment();
  const { data: subscription } = useSubscription();
  const currentPlan = subscription?.plan || 'free';

  const { plans: backendPlans, isLoading: isPlansLoading } = usePlans();

  const mapPlanToDisplay = (plan: { name: string; price_monthly: number; description: string; features: string[]; is_popular: boolean; slug: string }) => ({
    name: plan.name,
    price: `₹${Math.floor(Number(plan.price_monthly))}`,
    period: 'per month',
    description: plan.description,
    features: plan.features,
    cta: plan.name.toLowerCase() === 'free' ? 'Start Free' : 'Upgrade to Pro',
    popular: plan.is_popular,
    icon: plan.name.toLowerCase() === 'free' ? Star : TrendingUp,
    slug: plan.slug
  });

  const [activeTab, setActiveTab] = useState<'influencer' | 'brand'>('influencer');

  // Auto-select tab based on user role
  useEffect(() => {
    if (user?.role) {
      setActiveTab(user.role === 'influencer' ? 'influencer' : 'brand');
    }
  }, [user?.role]);

  const influencerPlans = backendPlans.length > 0
    ? backendPlans.map(mapPlanToDisplay)
    : [
        {
          name: 'Free',
          price: '₹0',
          period: 'forever',
          description: 'Perfect for getting started with influencer marketing',
          features: [
            '5 credits per month',
            'Basic profile setup',
            'Apply to campaigns',
            'Email support',
            'Access to community',
          ],
          cta: 'Start Free',
          popular: false,
          icon: Star,
          slug: 'free'
        },
        {
          name: 'Pro',
          price: '₹400',
          period: 'per month',
          description: 'For influencers ready to scale their brand partnerships',
          features: [
            '30 credits per month',
            'Max 3 applications per day',
            'See full campaign details',
            'Priority email support',
            'Higher visibility to brands',
            'Basic campaign insights',
            'Direct brand contact',
          ],
          cta: 'Upgrade to Pro',
          popular: true,
          icon: TrendingUp,
          slug: 'pro'
        },
      ];

  const brandPlans = backendPlans.length > 0
    ? backendPlans.map(mapPlanToDisplay)
    : [
        {
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
          cta: 'Start Free',
          popular: false,
          icon: Star,
          slug: 'free'
        },
        {
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
          cta: 'Upgrade to Pro',
          popular: true,
          icon: TrendingUp,
          slug: 'pro'
        },
      ];


  const faqs = [
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

      <div className="min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Floating Orbs - Hidden on mobile for performance */}
        <FloatingOrb className="hidden sm:block w-96 h-96 bg-primary -top-48 -left-48" delay={0} />
        <FloatingOrb className="hidden sm:block w-80 h-80 bg-secondary top-1/4 -right-40" delay={2} />
        <FloatingOrb className="hidden md:block w-64 h-64 bg-accent bottom-40 left-1/4" delay={4} />
        <FloatingOrb className="hidden md:block w-72 h-72 bg-primary/50 bottom-20 right-1/3" delay={3} />

        {/* Mesh Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem]" />

        <div className="relative z-10 py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 sm:mb-12 md:mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 mb-4 sm:mb-6"
              >
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Simple, Transparent Pricing
                </Badge>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Choose Your{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Plan
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Start free and upgrade as you grow. All plans include our core features with no hidden fees.
              </motion.p>
            </motion.div>

            {/* Role Selection Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 sm:mb-12"
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'influencer' | 'brand')} className="w-full max-w-sm mx-auto">
                <TabsList className="grid w-full grid-cols-2 h-12 sm:h-14">
                  <TabsTrigger value="influencer" className="flex items-center gap-2 text-xs sm:text-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Influencers</span>
                    <span className="xs:hidden">Creators</span>
                  </TabsTrigger>
                  <TabsTrigger value="brand" className="flex items-center gap-2 text-xs sm:text-sm">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Brands</span>
                    <span className="xs:hidden">Brands</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Pricing Cards */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'influencer' | 'brand')} className="w-full">
              <TabsContent value="influencer" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12">
                  {/* Free Plan Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative group"
                  >
                    <Card className="relative h-full bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/30">
                      <CardHeader className="text-center pb-6 sm:pb-8 pt-10 sm:pt-12 px-4 sm:px-6">
                        <motion.div
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 bg-muted"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Star className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                        </motion.div>

                        <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">Free</CardTitle>
                        <CardDescription className="mb-4 sm:mb-6 text-sm">Perfect for getting started with influencer marketing</CardDescription>

                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            ₹0
                          </span>
                          <span className="text-muted-foreground text-sm sm:text-base">/ forever</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          {[
                            '5 credits per month',
                            'Basic profile setup',
                            'Apply to campaigns',
                            'Email support',
                            'Access to community',
                          ].map((feature, i) => (
                            <motion.li
                              key={i}
                              className="flex items-start gap-2.5 sm:gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.05 }}
                            >
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-muted">
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                              </div>
                              <span className="text-xs sm:text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full h-10 sm:h-12 text-sm sm:text-base"
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
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Pro Plan Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative group"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 bg-gradient-to-r from-primary/40 to-secondary/40 opacity-50 group-hover:opacity-100" />

                    <Card className="relative h-full bg-card/80 backdrop-blur-sm overflow-visible transition-all duration-300 border-primary/50 shadow-xl">
                      {/* Popular badge */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 px-3 py-1 sm:px-4 sm:py-1.5 shadow-lg text-xs sm:text-sm whitespace-nowrap">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        </motion.div>
                      </div>

                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />

                      <CardHeader className="text-center pb-6 sm:pb-8 pt-10 sm:pt-12 px-4 sm:px-6">
                        <motion.div
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-br from-primary to-secondary"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </motion.div>

                        <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">Pro</CardTitle>
                        <CardDescription className="mb-4 sm:mb-6 text-sm">For influencers ready to scale their brand partnerships</CardDescription>

                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ₹400
                          </span>
                          <span className="text-muted-foreground text-sm sm:text-base">/ per month</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          {[
                            '30 credits per month',
                            'Max 3 applications per day',
                            'See full campaign details',
                            'Priority email support',
                            'Higher visibility to brands',
                            'Basic campaign insights',
                            'Direct brand contact',
                          ].map((feature, i) => (
                            <motion.li
                              key={i}
                              className="flex items-start gap-2.5 sm:gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.05 }}
                            >
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/20">
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                              </div>
                              <span className="text-xs sm:text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-10 sm:h-12 text-sm sm:text-base"
                            disabled={isLoading || currentPlan === 'pro'}
                            onClick={() => {
                              if (!user) {
                                navigate('/auth');
                              } else if (currentPlan === 'pro') {
                                navigate('/subscription');
                              } else {
                                createCheckoutSession({
                                  name: 'FameSync Pro',
                                  description: 'Monthly Pro Subscription for Influencers',
                                  prefill: {
                                    name: `${user?.first_name} ${user?.last_name}`,
                                    email: user?.email
                                  }
                                });
                              }
                            }}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            ) : currentPlan === 'pro' ? (
                              'Current Plan'
                            ) : (
                              'Upgrade to Pro'
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="brand" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12">
                  {/* Free Plan Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative group"
                  >
                    <Card className="relative h-full bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/30">
                      <CardHeader className="text-center pb-6 sm:pb-8 pt-10 sm:pt-12 px-4 sm:px-6">
                        <motion.div
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 bg-muted"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Star className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                        </motion.div>

                        <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">Free</CardTitle>
                        <CardDescription className="mb-4 sm:mb-6 text-sm">Test FameSync with your first campaign</CardDescription>

                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            ₹0
                          </span>
                          <span className="text-muted-foreground text-sm sm:text-base">/ forever</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          {[
                            '3 credits per month',
                            'Basic profile setup',
                            'Create 1 campaign per month',
                            'Email support',
                            'Access to influencer database',
                          ].map((feature, i) => (
                            <motion.li
                              key={i}
                              className="flex items-start gap-2.5 sm:gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.05 }}
                            >
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-muted">
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                              </div>
                              <span className="text-xs sm:text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full h-10 sm:h-12 text-sm sm:text-base"
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
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Pro Plan Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative group"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 bg-gradient-to-r from-primary/40 to-secondary/40 opacity-50 group-hover:opacity-100" />

                    <Card className="relative h-full bg-card/80 backdrop-blur-sm overflow-visible transition-all duration-300 border-primary/50 shadow-xl">
                      {/* Popular badge */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 px-3 py-1 sm:px-4 sm:py-1.5 shadow-lg text-xs sm:text-sm whitespace-nowrap">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        </motion.div>
                      </div>

                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />

                      <CardHeader className="text-center pb-6 sm:pb-8 pt-10 sm:pt-12 px-4 sm:px-6">
                        <motion.div
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-br from-primary to-secondary"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                        </motion.div>

                        <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">Pro</CardTitle>
                        <CardDescription className="mb-4 sm:mb-6 text-sm">For brands ready to scale their influencer marketing</CardDescription>

                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ₹400
                          </span>
                          <span className="text-muted-foreground text-sm sm:text-base">/ per month</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
                        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                          {[
                            '10 credits per month',
                            'Max 1 campaign per day',
                            'Advanced campaign analytics',
                            'Priority email support',
                            'Featured brand status',
                            'Detailed influencer insights',
                            'Bulk influencer outreach',
                          ].map((feature, i) => (
                            <motion.li
                              key={i}
                              className="flex items-start gap-2.5 sm:gap-3"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.05 }}
                            >
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/20">
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                              </div>
                              <span className="text-xs sm:text-sm">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-10 sm:h-12 text-sm sm:text-base"
                            disabled={isLoading || currentPlan === 'pro'}
                            onClick={() => {
                              if (!user) {
                                navigate('/auth');
                              } else if (currentPlan === 'pro') {
                                navigate('/subscription');
                              } else {
                                createCheckoutSession({
                                  name: 'FameSync Pro',
                                  description: 'Monthly Pro Subscription for Brands',
                                  prefill: {
                                    name: `${user?.first_name} ${user?.last_name}`,
                                    email: user?.email
                                  }
                                });
                              }
                            }}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            ) : currentPlan === 'pro' ? (
                              'Current Plan'
                            ) : (
                              'Upgrade to Pro'
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8 sm:mb-10">
                <motion.div
                  className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 sm:mb-4"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Frequently Asked{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Questions
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">Everything you need to know about our pricing</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base group-hover:text-primary transition-colors">
                          {faq.q}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{faq.a}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
