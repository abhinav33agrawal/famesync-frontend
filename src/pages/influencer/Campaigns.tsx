import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import logo from '@/assets/logo.png';

import {
  Search,
  Filter,
  Calendar,
  Target,
  Loader2,
  Crown,
  Sparkles,
  MapPin,
  Compass,
  TrendingUp,
  Zap,
  ArrowRight,
  Send,
  Eye,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDateDMY } from '@/lib/utils';
import { useInfluencerCampaigns, useApplyToCampaign } from '@/hooks/useCampaigns';
import type { Campaign } from '@/lib/api/types';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { LockedText } from '@/components/LockedFeature';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { useCategories } from '@/hooks/useCategories';
import CampaignsSkeleton from '@/components/CampaignsSkeleton';

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
  delay = 0
}: {
  icon: any;
  label: string;
  value: string | number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 group">
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
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const InfluencerCampaigns = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showBrandNameUpgrade, setShowBrandNameUpgrade] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { categories: dynamicCategories, isLoading: categoriesLoading } = useCategories();

  const ITEMS_PER_PAGE = 9;

  const filterParams = {
    ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter })
  };

  const { data: campaigns = [], isLoading } = useInfluencerCampaigns(
    Object.keys(filterParams).length > 0 ? filterParams : undefined
  );

  // Debug: Log campaign data to see what's available
  if (campaigns.length > 0) {
    console.log('Campaign data:', campaigns[0]);
    console.log('Brand:', campaigns[0].brand);
    console.log('Brand Profile:', campaigns[0].brand_profile);
  }

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
        <div className="flex flex-wrap gap-1 items-center">
          {(d as string[]).map((item: string, idx: number, arr: string[]) => {
            // Map old database formats to new display format
            let displayText = item;
            const lowerItem = item.toLowerCase();

            // YouTube mappings
            if (lowerItem.includes('youtube') && lowerItem.includes('short')) {
              displayText = 'Shorts';
            } else if (lowerItem.includes('youtube') || lowerItem.includes('yt')) {
              displayText = 'YT video';
            }
            // Instagram mappings (remove IG/Instagram prefix)
            else if (lowerItem.includes('post')) {
              displayText = 'Post';
            } else if (lowerItem.includes('story') || lowerItem.includes('stories')) {
              displayText = 'Story';
            } else if (lowerItem.includes('reel')) {
              displayText = 'Reel';
            } else if (lowerItem.includes('video')) {
              displayText = 'Video';
            } else if (lowerItem.includes('short')) {
              displayText = 'Shorts';
            }

            return (
              <div key={idx} className="flex items-center">
                <span
                  className="text-sm font-medium text-foreground px-2 py-1 rounded-md bg-primary/5 border border-primary/10"
                >
                  {displayText}
                </span>
                {idx < arr.length - 1 && (
                  <span className="text-muted-foreground mx-1">,</span>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (typeof d === 'string') {
      return (
        <span className="text-sm font-medium text-foreground px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
          {capitalizeText(d)}
        </span>
      );
    }
    return null;
  };

  const { mutate: applyToCampaign, isPending: isApplying } = useApplyToCampaign();
  const { data: subscription } = useSubscription();

  const userPlan = subscription?.plan || 'free';
  const isPremium = userPlan === 'pro';

  // Helper function to get brand name
  const getBrandName = (campaign: Campaign): string => {
    // Priority: company_name > first_name + last_name > username > 'Brand'
    if (campaign.brand_profile?.company_name) {
      return campaign.brand_profile.company_name;
    }
    if (campaign.brand?.first_name && campaign.brand?.last_name) {
      return `${campaign.brand.first_name} ${campaign.brand.last_name}`;
    }
    if (campaign.brand?.first_name) {
      return campaign.brand.first_name;
    }
    if (campaign.brand?.username) {
      return campaign.brand.username;
    }
    return 'Brand';
  };

  const handleEventTypeToggle = (type: string) => {
    setEventTypeFilter(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    handleFilterChange();
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    // Search term filter
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Location filter
    const matchesLocation = !locationFilter ||
      (campaign.location && campaign.location.toLowerCase().includes(locationFilter.toLowerCase())) ||
      (campaign.target_cities && campaign.target_cities.some(city =>
        city.toLowerCase().includes(locationFilter.toLowerCase())
      ));

    // Payment type filter
    const matchesPaymentType = paymentTypeFilter === 'all' ||
      campaign.budget_type === paymentTypeFilter;

    // Event type filter (if no checkboxes selected, show all)
    const matchesEventType = eventTypeFilter.length === 0 ||
      (campaign.campaign_type && eventTypeFilter.includes(campaign.campaign_type));

    return matchesSearch && matchesLocation && matchesPaymentType && matchesEventType;
  });

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleApply = () => {
    if (!selectedCampaign) return;

    applyToCampaign(
      {
        campaign: selectedCampaign.id,
        message: applicationMessage,
      },
      {
        onSuccess: () => {
          setSelectedCampaign(null);
          setApplicationMessage('');
        },
        onError: (error: any) => {
          if (error?.response?.data?.limit_reached) {
            if (!isPremium) setShowUpgradePrompt(true);
          }
        },
      }
    );
  };

  const handleViewDetails = (campaign: Campaign) => {
    navigate(`/influencer/campaigns/${campaign.slug}`);
  };

  if (isLoading) {
    return <CampaignsSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 dotted-pattern opacity-30" />
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

      <div className="relative z-10 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <motion.div
                  className="flex items-center gap-2 sm:gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Discover <span className="gradient-text">Campaigns</span>
                  </h1>
                </motion.div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Browse available campaigns and apply to ones that fit your style
                </p>
              </div>
              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Crown className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Free Plan</p>
                          <p className="text-xs text-muted-foreground">
                            5 applications/month
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
            <StatCard
              icon={Compass}
              label="Available Campaigns"
              value={totalCampaigns}
              delay={0.1}
            />
            <StatCard
              icon={Zap}
              label="Active Campaigns"
              value={activeCampaigns}
              delay={0.2}
            />
            <StatCard
              icon={TrendingUp}
              label="New This Week"
              value={campaigns.filter(c => {
                const created = new Date(c.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created > weekAgo;
              }).length}
              delay={0.3}
            />
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="glass border-border/50">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns or brands..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange(); }}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="Filter by location..."
                      value={locationFilter}
                      onChange={(e) => { setLocationFilter(e.target.value); handleFilterChange(); }}
                      className="w-full md:w-44 pl-10 bg-background/50"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); handleFilterChange(); }}>
                    <SelectTrigger className="w-full md:w-44 bg-background/50 justify-between">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {dynamicCategories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={paymentTypeFilter} onValueChange={(value) => { setPaymentTypeFilter(value); handleFilterChange(); }}>
                    <SelectTrigger className="w-full md:w-44 bg-background/50">
                      <SelectValue placeholder="Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Types</SelectItem>
                      <SelectItem value="fixed">Fixed Payment</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                      <SelectItem value="barter">Barter/Product Exchange</SelectItem>
                      <SelectItem value="sourcing">Sourcing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Type Checkboxes and Results Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-3">
                  {/* Results Count - Left Side */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-sm text-muted-foreground">
                      Showing
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {filteredCampaigns.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'}
                    </span>
                    {(searchTerm || locationFilter || categoryFilter !== 'all' || paymentTypeFilter !== 'all' || eventTypeFilter.length > 0) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setLocationFilter('');
                          setCategoryFilter('all');
                          setPaymentTypeFilter('all');
                          setEventTypeFilter([]);
                          handleFilterChange();
                        }}
                        className="ml-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  {/* Event Type - Right Side */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 rounded-md border border-input bg-background/50">
                    <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Event Type:</Label>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="online"
                          checked={eventTypeFilter.includes('online')}
                          onCheckedChange={() => handleEventTypeToggle('online')}
                        />
                        <label
                          htmlFor="online"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer whitespace-nowrap"
                        >
                          Online
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onfield"
                          checked={eventTypeFilter.includes('onfield')}
                          onCheckedChange={() => handleEventTypeToggle('onfield')}
                        />
                        <label
                          htmlFor="onfield"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer whitespace-nowrap"
                        >
                          On Field
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {paginatedCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full glass border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col group">
                  <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {/* Brand Initial Avatar */}
                        <motion.div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-border/50 group-hover:scale-110 transition-transform relative flex items-center justify-center gradient-instagram flex-shrink-0"
                          whileHover={{ rotate: 5 }}
                        >
                          <span className={`text-xl sm:text-2xl font-bold text-white ${!isPremium ? 'blur-sm' : ''}`}>
                            {getBrandName(campaign).charAt(0).toUpperCase()}
                          </span>
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">
                            {isPremium ? (
                              getBrandName(campaign)
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowBrandNameUpgrade(true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowBrandNameUpgrade(true);
                                  }
                                }}
                                className="cursor-pointer bg-transparent p-0 border-0 hover:opacity-80 transition-opacity"
                                aria-label="Upgrade to see brand name"
                              >
                                <LockedText
                                  text={getBrandName(campaign)}
                                  isLocked={true}
                                  message="Upgrade to see brand name"
                                />
                              </button>
                            )}
                          </h3>
                          <Badge variant="secondary" className="mt-1 bg-gradient-to-r from-primary to-secondary text-white capitalize text-xs">
                            {campaign.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Status Badge - Moved to top right */}
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs flex-shrink-0 ${campaign.has_applied ? 'opacity-60' : ''} ${campaign.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border-green-500/30'
                          : ''
                          }`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>

                    <h4 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {campaign.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-1 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.5em',
                      maxHeight: '3em'
                    }}>
                      {campaign.description}
                    </p>

                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">₹</span>
                        </div>
                        <span className="font-semibold text-primary">
                          {isPremium && campaign.budget ? (
                            `₹${campaign.budget.toLocaleString('en-IN')}`
                          ) : (
                            <LockedText
                              text={campaign.budget_type === 'barter' ? "Item Worth" : "Budget"}
                              isLocked={!isPremium}
                              message="Upgrade to see exact detail"
                            />
                          )}
                        </span>
                        {campaign.budget_type && campaign.budget_type !== 'fixed' && (
                          <Badge variant="outline" className="text-xs">
                            {campaign.budget_type.charAt(0).toUpperCase() + campaign.budget_type.slice(1).toLowerCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1">
                          {renderDeliverables(campaign.deliverables_required as unknown)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <span className="text-muted-foreground">
                          Status: Ongoing
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50">
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(campaign)}
                        disabled={campaign.has_applied}
                        size="sm"
                        className="group/btn hover:bg-primary hover:text-primary-foreground transition-all w-full text-xs sm:text-sm"
                      >
                        {campaign.has_applied ? (
                          'Already Applied'
                        ) : (
                          <>
                            <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            View Details
                            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {filteredCampaigns.length > 0 && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center gap-2 mt-8 mb-4"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1 hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>

              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-3 py-1.5 text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[2.5rem] transition-all ${currentPage === page
                        ? 'gradient-instagram text-white shadow-lg scale-105'
                        : 'hover:bg-primary/10 hover:border-primary/50'
                        }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1 hover:bg-primary/10 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
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
              <Card className="glass border-border/50 max-w-md mx-auto p-8">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Compass className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </Card>
            </motion.div>
          )}

          {/* Campaign Detail Modal */}
          <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass border-border/50">
              {selectedCampaign && (
                <>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {selectedCampaign.brand_profile?.profile_picture ? (
                          <motion.div
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-border/50"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            <img
                              src={selectedCampaign.brand_profile.profile_picture.startsWith('http')
                                ? selectedCampaign.brand_profile.profile_picture
                                : `${import.meta.env.VITE_API_URL.replace("/api", "")}${selectedCampaign.brand_profile.profile_picture}`}
                              alt={selectedCampaign.brand_profile.company_name || 'Brand'}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            className="w-16 h-16 rounded-xl gradient-instagram flex items-center justify-center text-4xl font-bold text-white"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                          >
                            {selectedCampaign.brand_profile?.company_name
                              ? selectedCampaign.brand_profile.company_name.charAt(0).toUpperCase()
                              : selectedCampaign.brand?.username
                                ? selectedCampaign.brand.username.charAt(0).toUpperCase()
                                : '?'}
                          </motion.div>
                        )}
                        <div>
                          <DialogTitle className="text-2xl">{selectedCampaign.title}</DialogTitle>
                          <p className="text-muted-foreground">
                            {isPremium ? (
                              getBrandName(selectedCampaign)
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowBrandNameUpgrade(true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowBrandNameUpgrade(true);
                                  }
                                }}
                                className="cursor-pointer bg-transparent p-0 border-0 hover:opacity-80 transition-opacity"
                                aria-label="Upgrade to see brand name"
                              >
                                <LockedText
                                  text={getBrandName(selectedCampaign)}
                                  isLocked={true}
                                  message="Upgrade to see brand name"
                                />
                              </button>
                            )}
                          </p>
                        </div>
                      </div>
                      {!isPremium && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-primary/5">
                          <Crown className="h-3 w-3" />
                          Limited View
                        </Badge>
                      )}
                    </div>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {/* Campaign Overview */}
                    <div>
                      <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Campaign Overview
                      </h3>
                      <p className="text-muted-foreground">{selectedCampaign.description}</p>
                    </div>

                    {/* Key Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="glass border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg gradient-instagram flex items-center justify-center">
                              <span className="text-white font-bold">₹</span>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Budget</p>
                              <p className="text-xl font-bold text-primary">
                                {isPremium && selectedCampaign.budget ? (
                                  `₹${selectedCampaign.budget.toLocaleString('en-IN')}`
                                ) : (
                                  <LockedText
                                    text="Budget"
                                    isLocked={!isPremium}
                                    message="Upgrade to see exact budget"
                                  />
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>


                      <Card className="glass border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg gradient-instagram flex items-center justify-center">
                              <Target className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-2">Deliverables</p>
                              <div>{renderDeliverables(selectedCampaign.deliverables_required as unknown)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg gradient-instagram flex items-center justify-center">
                              <span className="text-white text-lg">🎯</span>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Objective</p>
                              <p className="font-semibold capitalize">{selectedCampaign.objective || 'N/A'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Category Badge */}
                    <div>
                      <h3 className="font-semibold mb-2">Category</h3>
                      <Badge variant="secondary" className="text-base px-4 py-1 bg-secondary/10">
                        {selectedCampaign.category}
                      </Badge>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="font-semibold mb-2 text-lg">Requirements</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedCampaign.requirements}
                      </p>
                    </div>

                    {/* Premium Info */}
                    {isPremium && selectedCampaign.hashtags && (
                      <div>
                        <h3 className="font-semibold mb-2">Hashtags</h3>
                        <p className="text-muted-foreground">{selectedCampaign.hashtags}</p>
                      </div>
                    )}

                    {!isPremium && (
                      <Card className="glass border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <Crown className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold mb-1">Unlock Full Campaign Details</p>
                              <p className="text-sm text-muted-foreground mb-3">
                                Upgrade to Pro to see brand name, exact budget, contact info, and more.
                              </p>
                              <Button
                                size="sm"
                                className="gradient-instagram"
                                onClick={() => setShowUpgradePrompt(true)}
                              >
                                View Plans
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Application Message */}
                    <div>
                      <Label htmlFor="message" className="flex items-center gap-2 mb-2">
                        <Send className="h-4 w-4" />
                        Application Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell the brand why you're a good fit for this campaign..."
                        rows={4}
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        disabled={selectedCampaign.has_applied}
                        className="bg-background/50"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedCampaign(null)}
                      >
                        Close
                      </Button>
                      <Button
                        className="flex-1 gradient-instagram"
                        onClick={handleApply}
                        disabled={isApplying || selectedCampaign.has_applied || !applicationMessage.trim()}
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : selectedCampaign.has_applied ? (
                          'Already Applied'
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Apply to Campaign
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {!isPremium && (
            <UpgradePrompt
              open={showUpgradePrompt}
              onClose={() => setShowUpgradePrompt(false)}
              title="Application Limit Reached"
              description={`You've reached the 5 application limit for ${userPlan} plan.`}
              limitType="applications"
              currentPlan={userPlan}
            />
          )}

          {/* Brand Name Upgrade Modal */}
          <Dialog open={showBrandNameUpgrade} onOpenChange={setShowBrandNameUpgrade}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl">Upgrade to see brand's name</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-center text-muted-foreground">
                  Unlock brand details and access premium features to grow your influencer career
                </p>
                <Button
                  onClick={() => {
                    setShowBrandNameUpgrade(false);
                    navigate('/subscription');
                  }}
                  className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:opacity-90 transition-opacity"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default InfluencerCampaigns;
