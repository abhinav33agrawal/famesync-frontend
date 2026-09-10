import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Zap, CheckCircle2, Loader2, Crown, Sparkles, Calendar, TrendingUp, Shield, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { usePayment } from '@/hooks/usePayment';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

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

const SubscriptionSkeleton = () => (
  <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
    <FloatingOrb className="w-96 h-96 bg-primary -top-48 -left-48 hidden md:block" delay={0} />
    <FloatingOrb className="w-80 h-80 bg-secondary top-1/3 -right-40 hidden md:block" delay={2} />

    <div className="relative z-10 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted/50 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-muted/30 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-card/50 rounded-2xl animate-pulse" />
            <div className="h-32 bg-card/50 rounded-2xl animate-pulse" />
          </div>
          <div className="h-96 bg-card/50 rounded-2xl animate-pulse" />
        </div>
      </div>
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

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Floating Orbs - Hidden on mobile */}
      <FloatingOrb className="w-96 h-96 bg-primary -top-48 -left-48 hidden md:block" delay={0} />
      <FloatingOrb className="w-80 h-80 bg-secondary top-1/3 -right-40 hidden md:block" delay={2} />

      {/* Mesh Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Subscription & <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Credits</span>
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground">
              Manage your subscription and track your credit usage.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Current Plan & Usage */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Plan Hero Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mb-32" />

                  <CardContent className="relative p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5" />
                          <span className="text-sm font-medium opacity-90">Current Plan</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-2">{planConfig?.name || 'Free'}</h2>
                        <p className="text-white/80 text-sm md:text-base">
                          {currentPlan === 'free'
                            ? 'Upgrade to unlock premium features and more credits'
                            : 'Enjoy all premium features and benefits'
                          }
                        </p>
                      </div>

                      <motion.div
                        className="flex items-center justify-center p-5 bg-white/20 rounded-2xl backdrop-blur"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Crown className="h-10 w-10 md:h-12 md:w-12" />
                      </motion.div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6 pt-6 border-t border-white/20">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur text-center">
                        <p className="text-xs md:text-sm opacity-80 mb-1">Credits Left</p>
                        <p className="text-xl md:text-2xl font-bold">{user?.credits || 0}</p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur text-center">
                        <p className="text-xs md:text-sm opacity-80 mb-1">Total Credits</p>
                        <p className="text-xl md:text-2xl font-bold">{totalCredits}</p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur text-center">
                        <p className="text-xs md:text-sm opacity-80 mb-1">Used</p>
                        <p className="text-xl md:text-2xl font-bold">{creditsUsed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Credit Usage Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-primary" />
                      Credit Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {user?.credits || 0} of {totalCredits} credits remaining
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(creditsPercentage)}%
                          </span>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${creditsPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {subscription?.renewal_date
                            ? `Credits reset on ${new Date(subscription.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : 'Credits reset monthly'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Plan Benefits - Only show for Pro users */}
              {currentPlan === 'pro' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Your Pro Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {roleBenefits.map((benefit: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column - Upgrade Card */}
            <div className="space-y-6">
              {currentPlan === 'free' ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-6"
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl -mr-16 -mt-16" />
                    <CardContent className="relative p-6">
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 mb-4">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>

                      <h3 className="text-2xl font-bold mb-1">Pro Plan</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">₹400</span>
                        <span className="text-muted-foreground">/ month</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-6">
                        Unlock all premium features and grow your influence faster.
                      </p>

                      <ul className="space-y-3 mb-6">
                        {proBenefits.map((feature: string, i: number) => (
                          <motion.li
                            key={i}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                          >
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-12 text-base"
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
                          {checkoutLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Zap className="mr-2 h-5 w-5" />
                          )}
                          Upgrade to Pro
                        </Button>
                      </motion.div>

                      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>Secure payment via Razorpay</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Crown className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold mb-2">You're on Pro!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enjoy all premium features and {totalCredits} credits per month.
                      </p>
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <p className="text-muted-foreground">Next billing date</p>
                        <p className="font-medium">
                          {subscription?.renewal_date
                            ? new Date(subscription.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;