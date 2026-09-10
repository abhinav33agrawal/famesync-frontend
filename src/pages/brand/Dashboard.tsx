import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBrandDashboard } from '@/hooks/useProfile';
import { useBrandCampaigns } from '@/hooks/useCampaigns';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import {
  CreditCard,
  Target,
  Users,
  TrendingUp,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { formatLabel } from '@/lib/utils';

// Floating Orb Component
const FloatingOrb = ({
  className,
  delay = 0
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      y: [0, -20, 0]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  />
);

// Stat Card Component
const StatCard = ({
  stat,
  index
}: {
  stat: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change: string;
    gradient: string;
    iconBg: string;
  };
  index: number;
}) => {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden group border-border/50 hover:border-primary/30 transition-all duration-300">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.gradient}`} />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`p-3 rounded-xl ${stat.iconBg} shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <Badge variant="secondary" className="text-xs font-medium bg-[hsl(240_65%_25%)] text-white">
              {stat.change}
            </Badge>
          </div>
          <motion.h3
            className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {stat.value}
          </motion.h3>
          <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BrandDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useBrandDashboard(user?.role === 'brand');
  const { data: campaigns = [], isLoading: campaignsLoading } = useBrandCampaigns(user?.role === 'brand');

  if (dashboardLoading || campaignsLoading) {
    return <DashboardSkeleton />;
  }

  const stats = dashboardData?.stats;
  const recentCampaigns = campaigns.slice(0, 3);

  const allApplications = campaigns
    .flatMap(c => c.applications || [])
    .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
    .slice(0, 4);

  const dashboardStats = [
    {
      title: 'Active Campaigns',
      value: stats?.active_campaigns || 0,
      icon: Target,
      change: `${stats?.total_campaigns || 0} total`,
      gradient: 'bg-gradient-to-br from-primary/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-primary to-primary/80',
    },
    {
      title: 'Total Applications',
      value: stats?.total_applications || 0,
      icon: Users,
      change: `${stats?.pending_applications || 0} pending`,
      gradient: 'bg-gradient-to-br from-secondary/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-secondary to-secondary/80',
    },
    {
      title: 'Credits Remaining',
      value: user?.credits || 0,
      icon: CreditCard,
      change: 'Renews monthly',
      gradient: 'bg-gradient-to-br from-accent/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-accent to-accent/80',
    },
    {
      title: 'Campaign Success Rate',
      value: stats?.total_campaigns ? `${((stats.active_campaigns / stats.total_campaigns) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      change: 'Active campaigns',
      gradient: 'bg-gradient-to-br from-green-500/10 to-transparent',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">Matched</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">Pending</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Brand Dashboard - FameSync</title>
        <meta name="description" content="Manage your campaigns, view applications, and connect with creators from your FameSync brand dashboard." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <FloatingOrb
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            delay={0}
          />
          <FloatingOrb
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
            delay={2}
          />
          <FloatingOrb
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl"
            delay={4}
          />
        </div>

        {/* Mesh Pattern */}
        <div className="fixed inset-0 -z-10 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="brand-dashboard-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brand-dashboard-grid)" />
          </svg>
        </div>

        <div className="p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back,{' '}
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      {user?.first_name || user?.username}
                    </span>
                  </h1>
                  <p className="text-muted-foreground">
                    Your campaigns and applications at a glance.
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => navigate('/brand/create-campaign')}
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create Campaign
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardStats.map((stat, index) => (
                <StatCard key={stat.title} stat={stat} index={index} />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Campaigns */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:col-span-2"
              >
                <Card className="border-border/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                  <CardHeader className="flex flex-row items-center justify-between relative">
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-primary" />
                      Recent Campaigns
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/brand/campaigns')}
                      className="group"
                    >
                      View All
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentCampaigns.length === 0 ? (
                      <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <Megaphone className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">No campaigns yet</p>
                        <Button variant="outline" onClick={() => navigate('/brand/create-campaign')}>
                          Create Your First Campaign
                        </Button>
                      </motion.div>
                    ) : (
                      recentCampaigns.map((campaign, index) => (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                          className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                          onClick={() => navigate(`/brand/campaigns/${campaign.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                {campaign.category.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold group-hover:text-primary transition-colors">
                                  {campaign.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {campaign.applications_count || 0} applications
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={campaign.status === 'active'
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-muted text-muted-foreground"
                              }
                            >
                              {campaign.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {formatLabel(campaign.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {campaign.budget_type === 'barter' ? "Item Worth" : "Budget"}: <span className="font-medium text-foreground">₹{campaign.budget.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              Status: Ongoing
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Applications */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-secondary" />
                      Recent Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {allApplications.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No applications yet</p>
                    ) : (
                      allApplications.map((app, index) => (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/brand/campaigns/${app.campaign.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(app.status)}
                              <h4 className="font-semibold text-sm">
                                {app.influencer.first_name} {app.influencer.last_name}
                              </h4>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                            {app.campaign.title}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>@{app.influencer.username}</span>
                            <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                          </div>
                          {app.status === 'accepted' && (
                            <p className="text-xs text-primary mt-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              View their full profile
                            </p>
                          )}
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {user?.subscription_plan !== 'pro' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
                      <CardContent className="p-6 text-center relative">
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Crown className="w-12 h-12 mx-auto mb-4 text-primary" />
                        </motion.div>
                        <h3 className="font-semibold mb-2">Boost Your Reach</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upgrade to Pro and get access to premium influencers
                        </p>
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25"
                          onClick={() => navigate('/subscription')}
                        >
                          Upgrade Now
                          <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Quick Action CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary via-secondary to-accent">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <CardContent className="p-8 relative">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-white text-center md:text-left">
                      <motion.h3
                        className="text-2xl md:text-3xl font-bold mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        Ready to launch your next campaign?
                      </motion.h3>
                      <motion.p
                        className="opacity-90 text-white/80"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                      >
                        Create a campaign in minutes and connect with thousands of influencers.
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="secondary"
                        className="shrink-0 shadow-xl group bg-white text-primary hover:bg-white/90"
                        onClick={() => navigate('/brand/create-campaign')}
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Campaign
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandDashboard;
