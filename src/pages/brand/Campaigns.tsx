import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusCircle,
  Search,
  Users,
  Calendar,
  Eye,
  Sparkles,
  Target,
  TrendingUp,
  Megaphone,
  ArrowRight,
  Rocket,
  FileText,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrandCampaigns, useUpdateCampaignStatus, useDeleteCampaign } from '@/hooks/useCampaigns';
import { CampaignStatusDialog } from '@/components/CampaignStatusDialog';
import CampaignsSkeleton from '@/components/CampaignsSkeleton';
import type { CampaignStatus } from '@/lib/api/campaigns';
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
  icon: Icon,
  label,
  value,
  trend,
  delay = 0
}: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="bg-card border border-border border-border/50 hover:border-primary/30 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
            whileHover={{ rotate: 5 }}
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                  {trend}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Status badge styling
const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-500 border-green-500/30';
    case 'draft':
      return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    case 'completed':
      return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    default:
      return '';
  }
};

const Campaigns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    action: 'publish' | 'complete' | 'cancel' | 'delete';
    campaignId: number;
    campaignSlug: string;
    campaignTitle: string;
  } | null>(null);

  const { data: campaigns = [], isLoading, error, refetch } = useBrandCampaigns();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateCampaignStatus();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();

  // Refetch campaigns when navigating from create campaign page
  useEffect(() => {
    if (location.state?.refresh) {
      refetch();
      // Clear the state to prevent refetching on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const DELIVERABLE_LABELS: Record<string, string> = {
    POST: 'Post',
    STORY: 'Story',
    REEL: 'Reel',
    VIDEO: 'Video',
    YOUTUBE_VIDEO: 'YT video',
    YOUTUBE_SHORTS: 'Shorts',
    MIXED: 'Mixed content',
  };

  const capitalizeText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const renderDeliverables = (d: unknown) => {
    if (Array.isArray(d)) {
      if (d.length && typeof d[0] === 'object' && d[0] !== null) {
        return (
          <div className="flex flex-wrap gap-1 items-center">
            {(d as any[]).map((it: any, idx: number, arr: any[]) => {
              // Get label from mapping or apply string conversion for old formats
              let displayLabel = DELIVERABLE_LABELS[it.type];

              if (!displayLabel) {
                // Fallback for old database formats
                const typeStr = (it.type || '').toLowerCase();
                if (typeStr.includes('youtube') && typeStr.includes('short')) {
                  displayLabel = 'Shorts';
                } else if (typeStr.includes('youtube') || typeStr.includes('yt')) {
                  displayLabel = 'YT video';
                } else if (typeStr.includes('post')) {
                  displayLabel = 'Post';
                } else if (typeStr.includes('story') || typeStr.includes('stories')) {
                  displayLabel = 'Story';
                } else if (typeStr.includes('reel')) {
                  displayLabel = 'Reel';
                } else if (typeStr.includes('video')) {
                  displayLabel = 'Video';
                } else if (typeStr.includes('short')) {
                  displayLabel = 'Shorts';
                } else {
                  displayLabel = it.type;
                }
              }

              return (
                <div key={idx} className="flex items-center">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
                    <span className="text-sm font-medium text-foreground">
                      {displayLabel}
                    </span>
                    {(it.count && it.count > 0) && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0 h-4 font-semibold">
                        {it.count}
                      </Badge>
                    )}
                  </div>
                  {idx < arr.length - 1 && (
                    <span className="text-muted-foreground mx-1">,</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {(d as string[]).map((item: string, idx: number) => (
            <Badge
              key={idx}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1.5 text-sm font-medium"
            >
              {capitalizeText(item)}
            </Badge>
          ))}
        </div>
      );
    }
    if (typeof d === 'string') {
      return (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1.5 text-sm font-medium"
        >
          {capitalizeText(d)}
        </Badge>
      );
    }
    return null;
  };

  // Filter campaigns by status and search
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 3;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > showPages) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - showPages + 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const totalApplications = campaigns.reduce((sum, c) => sum + (c.applications_count || 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => {
    const budget = typeof c.budget === "number"
      ? c.budget
      : parseFloat(c.budget ?? "0");
    return sum + (isNaN(budget) ? 0 : budget);
  }, 0);

  const handleStatusAction = (action: 'publish' | 'complete' | 'cancel' | 'delete', campaignId: number, campaignSlug: string, campaignTitle: string) => {
    setDialogState({ open: true, action, campaignId, campaignSlug, campaignTitle });
  };

  const handleConfirmAction = () => {
    if (!dialogState) return;

    if (dialogState.action === 'delete') {
      deleteCampaign(dialogState.campaignSlug, {
        onSuccess: () => setDialogState(null),
      });
    } else {
      const statusMap: Record<string, CampaignStatus> = {
        publish: 'active',
        complete: 'completed',
        cancel: 'cancelled',
      };
      updateStatus(
        { slug: dialogState.campaignSlug, status: statusMap[dialogState.action] },
        { onSuccess: () => setDialogState(null) }
      );
    }
  };

  if (isLoading) {
    return <CampaignsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8 flex items-center justify-center">
        <Card className="bg-card border border-border border-destructive/50 p-8 text-center">
          <p className="text-destructive mb-4">Failed to load campaigns. Please try again.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 opacity-30" />
      <FloatingOrb
        className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        delay={0}
      />
      <FloatingOrb
        className="absolute bottom-40 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        delay={2}
      />
      <FloatingOrb
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
        delay={4}
      />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <motion.div
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Megaphone className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold">
                    My <span className="text-foreground">Campaigns</span>
                  </h1>
                </motion.div>
                <p className="text-muted-foreground">
                  Manage, track, and optimize your influencer campaigns
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/brand/create-campaign">
                  <Button className="bg-primary group">
                    <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    Create Campaign
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Target}
              label="Active Campaigns"
              value={activeCampaigns}
              delay={0.1}
            />
            <StatCard
              icon={FileText}
              label="Drafts"
              value={draftCampaigns}
              delay={0.15}
            />
            <StatCard
              icon={Users}
              label="Total Applications"
              value={totalApplications}
              delay={0.2}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Budget"
              value={`₹${totalBudget.toLocaleString('en-IN')}`}
              delay={0.25}
            />
          </div>

          {/* Status Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-4"
          >
            <Tabs value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              handleFilterChange();
            }}>
              <TabsList className="bg-card border border-border border-border/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All
                  <Badge className={`ml-2 text-xs px-2 font-semibold ${statusFilter === 'all'
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-primary/20 text-primary border-primary/30'
                    }`}>
                    {campaigns.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-600">
                  Active
                  <Badge className={`ml-2 text-xs px-2 font-semibold ${statusFilter === 'active'
                    ? 'bg-green-600/30 text-green-700 border-green-600/50'
                    : 'bg-green-500/20 text-green-600 border-green-500/30'
                    }`}>
                    {activeCampaigns}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="draft" className="data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-600">
                  Drafts
                  <Badge className={`ml-2 text-xs px-2 font-semibold ${statusFilter === 'draft'
                    ? 'bg-gray-600/30 text-gray-700 border-gray-600/50'
                    : 'bg-gray-500/20 text-gray-600 border-gray-500/30'
                    }`}>
                    {draftCampaigns}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-600">
                  Completed
                  <Badge className={`ml-2 text-xs px-2 font-semibold ${statusFilter === 'completed'
                    ? 'bg-blue-600/30 text-blue-700 border-blue-600/50'
                    : 'bg-blue-500/20 text-blue-600 border-blue-500/30'
                    }`}>
                    {completedCampaigns}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-card border border-border border-border/50">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns by title or category..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleFilterChange();
                    }}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-card border border-border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClasses(campaign.status)}
                      >
                        <motion.div
                          animate={campaign.status === 'active' ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-2 h-2 rounded-full bg-current mr-2"
                        />
                        {formatLabel(campaign.status)}
                      </Badge>
                      <Badge variant="outline" className="bg-secondary/80 border-transparent text-secondary-foreground">
                        {formatLabel(campaign.category)}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                      {campaign.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">₹</span>
                          </div>
                          <span>{campaign.budget_type === 'barter' ? "Item Worth" : "Budget"}</span>
                        </div>
                        <span className="font-semibold text-primary">
                          ₹{campaign.budget.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-secondary" />
                          </div>
                          <span>Applications</span>
                        </div>
                        <span className="font-semibold">{campaign.applications_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-accent-foreground" />
                          </div>
                          <span>Timeline</span>
                        </div>
                        <span className="font-semibold">
                          Ongoing
                        </span>
                      </div>
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Deliverables
                        </p>
                        <div className="text-sm">
                          {renderDeliverables(campaign.deliverables_required as unknown)}
                        </div>
                      </div>

                      {/* Action Buttons based on status */}
                      <div className="pt-3 border-t border-border/50 space-y-2">
                        {campaign.status === 'draft' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.preventDefault();
                                handleStatusAction('publish', campaign.id, campaign.slug, campaign.title);
                              }}
                            >
                              <Rocket className="mr-1 h-3 w-3" />
                              Publish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/brand/campaigns/${campaign.slug}`);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {campaign.status === 'active' && (
                          <div className="flex gap-2">
                            <Link to={`/brand/campaigns/${campaign.slug}`} className="flex-1">
                              <Button variant="outline" className="w-full group/btn hover:bg-primary hover:text-primary-foreground transition-all">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                              </Button>
                            </Link>
                          </div>
                        )}
                        {(campaign.status === 'completed' || campaign.status === 'cancelled') && (
                          <Link to={`/brand/campaigns/${campaign.slug}`}>
                            <Button variant="outline" className="w-full group/btn">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {filteredCampaigns.length > ITEMS_PER_PAGE && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center items-center gap-2 flex-wrap"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-background/80 disabled:hover:border-primary/20 transition-all duration-200 font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-foreground/60 font-semibold">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className={`min-w-[2.5rem] font-semibold transition-all duration-200 ${currentPage === page
                      ? 'bg-primary text-white border-transparent shadow-lg shadow-primary/20 scale-105 hover:scale-110'
                      : 'bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105'
                      }`}
                  >
                    {page}
                  </Button>
                )
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-background/80 disabled:hover:border-primary/20 transition-all duration-200 font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Empty State */}
          {filteredCampaigns.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Card className="bg-card border border-border border-border/50 max-w-md mx-auto p-8">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Megaphone className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create your first campaign to start connecting with influencers"}
                </p>
                <Link to="/brand/create-campaign">
                  <Button className="bg-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Campaign
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Change Dialog */}
      {dialogState && (
        <CampaignStatusDialog
          open={dialogState.open}
          onOpenChange={(open) => !open && setDialogState(null)}
          action={dialogState.action}
          campaignTitle={dialogState.campaignTitle}
          onConfirm={handleConfirmAction}
          isLoading={isUpdatingStatus || isDeleting}
        />
      )}
    </div>
  );
};

export default Campaigns;
