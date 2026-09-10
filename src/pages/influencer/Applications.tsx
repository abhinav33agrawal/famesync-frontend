import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, FileCheck, Clock, CheckCircle, XCircle, Sparkles, ArrowRight, Calendar, IndianRupee, Mail, FileText } from 'lucide-react';
import { useInfluencerApplications } from '@/hooks/useApplications';
import { ProfileViewModal } from '@/components/ProfileViewModal';
import MatchCelebrationModal from '@/components/MatchCelebrationModal';
import { Link } from 'react-router-dom';
import type { Application } from '@/lib/api/types';

const CELEBRATED_MATCHES_KEY = 'celebrated_matches';

const getCelebratedMatches = (): number[] => {
  try {
    const stored = localStorage.getItem(CELEBRATED_MATCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addCelebratedMatch = (applicationId: number) => {
  const current = getCelebratedMatches();
  if (!current.includes(applicationId)) {
    localStorage.setItem(CELEBRATED_MATCHES_KEY, JSON.stringify([...current, applicationId]));
  }
};

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

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string | number; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ApplicationsSkeleton = () => (
  <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
    <FloatingOrb className="w-96 h-96 bg-primary -top-48 -left-48" delay={0} />
    <FloatingOrb className="w-80 h-80 bg-secondary top-1/3 -right-40" delay={2} />
    <FloatingOrb className="w-64 h-64 bg-accent bottom-20 left-1/4" delay={4} />

    <div className="relative z-10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted/50 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-muted/30 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-card/50 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>

        <div className="h-16 bg-card/50 rounded-2xl animate-pulse mb-6" />

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-card/50 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Next Steps Action Area for Accepted Applications
const NextStepsActionArea = ({ application }: { application: Application }) => {
  const brandEmail = application.campaign.brand_profile?.user?.email || application.campaign.brand?.email || application.campaign.contact_email || '';
  const campaignTitle = application.campaign.title;
  const creativeBriefUrl = (application.campaign as any).creative_brief_url;

  const mailtoLink = `mailto:${brandEmail}?subject=Campaign: ${encodeURIComponent(campaignTitle)} - Collaboration Kickoff`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-5 w-5 text-green-500" />
        </motion.div>
        <span className="font-semibold text-green-600 dark:text-green-400">Next Steps</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white group">
            <Mail className="h-4 w-4 mr-1.5" />
            Send Introduction Email
            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </a>
        {creativeBriefUrl && (
          <a href={creativeBriefUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="border-green-500/30 hover:bg-green-500/10">
              <FileText className="h-4 w-4 mr-1.5" />
              Download Creative Brief
            </Button>
          </a>
        )}
      </div>
      {brandEmail && (
        <p className="text-xs text-muted-foreground mt-2">
          Contact: {brandEmail}
        </p>
      )}
    </motion.div>
  );
};

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({ isOpen: false, application: null });

  const { data: applications = [], isLoading } = useInfluencerApplications();

  // Check for uncelebrated matches on load
  useEffect(() => {
    if (applications.length > 0) {
      const celebratedIds = getCelebratedMatches();
      const uncelebratedMatch = applications.find(
        (app) => app.status === 'accepted' && !celebratedIds.includes(app.id)
      );

      if (uncelebratedMatch) {
        setCelebrationModal({ isOpen: true, application: uncelebratedMatch });
      }
    }
  }, [applications]);

  const handleCloseCelebration = () => {
    if (celebrationModal.application) {
      addCelebratedMatch(celebrationModal.application.id);
    }
    setCelebrationModal({ isOpen: false, application: null });
  };

  const filteredApplications = applications.filter(app =>
    app.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.campaign.brand.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (isLoading) {
    return <ApplicationsSkeleton />;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: string; icon: any; className: string }> = {
      accepted: { variant: 'default', icon: CheckCircle, className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      pending: { variant: 'default', icon: Clock, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      rejected: { variant: 'default', icon: XCircle, className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    return variants[status] || { variant: 'secondary', icon: Clock, className: '' };
  };

  const getStatusText = (status: string) => {
    if (status === 'accepted') return 'Matched! 🎉';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Floating Orbs */}
      <FloatingOrb className="w-96 h-96 bg-primary -top-48 -left-48" delay={0} />
      <FloatingOrb className="w-80 h-80 bg-secondary top-1/3 -right-40" delay={2} />
      <FloatingOrb className="w-64 h-64 bg-accent bottom-20 left-1/4" delay={4} />

      {/* Mesh Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
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
                <FileCheck className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold">
                  My <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Applications</span>
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground ml-15">
              Track your campaign applications and connect with brands once matched.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={FileCheck}
              label="Total Applications"
              value={stats.total}
              color="bg-gradient-to-br from-primary to-primary/80"
              delay={0.1}
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              delay={0.2}
            />
            <StatCard
              icon={CheckCircle}
              label="Accepted"
              value={stats.accepted}
              color="bg-gradient-to-br from-green-500 to-green-600"
              delay={0.3}
            />
            <StatCard
              icon={XCircle}
              label="Rejected"
              value={stats.rejected}
              color="bg-gradient-to-br from-red-500 to-red-600"
              delay={0.4}
            />
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by campaign or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((app, index) => {
              const statusInfo = getStatusBadge(app.status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="group"
                >
                  <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="relative p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <motion.div
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-white font-bold">
                              {app.campaign.brand.username.charAt(0).toUpperCase()}
                            </span>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{app.campaign.title}</h3>
                              {app.status === 'accepted' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                  <Sparkles className="h-5 w-5 text-yellow-400" />
                                </motion.div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              @{app.campaign.brand.username}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                              </div>
                              <span className="text-border">•</span>
                              <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <IndianRupee className="h-4 w-4" />
                                <span>{app.campaign.budget.toLocaleString('en-IN')}</span>
                              </div>
                              <span className="text-border">•</span>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span>Status: Ongoing</span>
                              </div>
                            </div>

                            {/* Next Steps Action Area for Accepted Applications */}
                            {app.status === 'accepted' && <NextStepsActionArea application={app} />}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <Badge className={`${statusInfo.className} border flex items-center gap-1.5 px-3 py-1`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {getStatusText(app.status)}
                          </Badge>

                          <div className="flex gap-2">
                            <Link to={`/influencer/campaigns/${app.campaign.id}`}>
                              <Button variant="outline" size="sm" className="group/btn">
                                <Eye className="h-4 w-4 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                                View Campaign
                              </Button>
                            </Link>
                            {app.status === 'accepted' && app.campaign.brand_profile && (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white group/btn"
                                  onClick={() => setSelectedBrand(app.campaign.brand_profile!)}
                                >
                                  View Brand Profile
                                  <ArrowRight className="h-4 w-4 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredApplications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileCheck className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Start applying to campaigns to see them here'}
              </p>
              {!searchTerm && (
                <Link to="/influencer/campaigns">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white">
                    Browse Campaigns
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <ProfileViewModal
        isOpen={!!selectedBrand}
        onClose={() => setSelectedBrand(null)}
        profileType="brand"
        brandProfile={selectedBrand}
      />

      {/* Match Celebration Modal */}
      {celebrationModal.application && (
        <MatchCelebrationModal
          isOpen={celebrationModal.isOpen}
          onClose={handleCloseCelebration}
          brandName={celebrationModal.application.campaign.brand_profile?.company_name || celebrationModal.application.campaign.brand.username}
          brandEmail={celebrationModal.application.campaign.brand_profile?.user?.email || celebrationModal.application.campaign.brand?.email || celebrationModal.application.campaign.contact_email || ''}
          campaignTitle={celebrationModal.application.campaign.title}
        />
      )}
    </div>
  );
};

export default Applications;
