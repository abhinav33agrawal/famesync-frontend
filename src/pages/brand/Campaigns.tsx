import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stat } from '@/components/Stat';
import { CampaignCard } from '@/components/CampaignCard';
import { Rise, listItemMotion } from '@/components/motion';
import { useBrandCampaigns, useUpdateCampaignStatus, useDeleteCampaign } from '@/hooks/useCampaigns';
import { CampaignStatusDialog } from '@/components/CampaignStatusDialog';
import CampaignsSkeleton from '@/components/CampaignsSkeleton';
import type { CampaignStatus } from '@/lib/api/campaigns';
import { formatINR } from '@/lib/format';

/* Removed from the old page: FloatingOrb x3, the local StatCard, the
   getStatusBadgeClasses colour map, the ~90-line renderDeliverables()
   (now deliverableChips inside CampaignCard), the pulsing status dot and
   the floating empty-state icon. */

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
    campaignId: string;
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

  const handleStatusAction = (action: 'publish' | 'complete' | 'cancel' | 'delete', campaignId: string, campaignSlug: string, campaignTitle: string) => {
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
      <div className="container py-16">
        <Card className="mx-auto max-w-md border-destructive/30 p-8 text-center">
          <h2 className="font-display text-display-3">Couldn&apos;t load your campaigns</h2>
          <p className="mb-6 mt-2 leading-relaxed text-muted-foreground">
            Something went wrong on our side. Please try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const TABS: { value: string; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: campaigns.length },
    { value: 'active', label: 'Live', count: activeCampaigns },
    { value: 'draft', label: 'Drafts', count: draftCampaigns },
    { value: 'completed', label: 'Completed', count: completedCampaigns },
  ];

  return (
    <div className="container space-y-8 py-10 md:py-14">
      {/* ------------------------------------------------------ page header */}
      <Rise>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Your briefs</p>
            <h1 className="font-display text-display-2">Campaigns.</h1>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">
              Manage, track and publish the briefs creators apply to.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/brand/create-campaign">
              <Plus />
              Create campaign
            </Link>
          </Button>
        </div>
      </Rise>

      {/* ------------------------------------------------------------ stats */}
      <Rise>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Live" value={activeCampaigns} note={`${campaigns.length} total`} />
          <Stat label="Drafts" value={draftCampaigns} note="Not visible yet" />
          <Stat label="Applications" value={totalApplications} note="Across all briefs" />
          {/* guard: a crore-scale total mustn't widen the grid at 375px */}
          <Stat
            label="Committed budget"
            value={formatINR(totalBudget)}
            note="Sum of all briefs"
            className="min-w-0 [&>div]:truncate"
          />
        </div>
      </Rise>

      {/* ------------------------------------------------------ filter rail */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-6 overflow-x-auto px-6 pb-1 lg:mx-0 lg:px-0 lg:pb-0">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              handleFilterChange();
            }}
          >
            <TabsList className="h-auto w-max gap-1 p-1">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="min-h-11 gap-2 rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                  <span className="num text-xs opacity-70">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="relative lg:w-[22rem]">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or category"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFilterChange();
            }}
            className="pl-11"
          />
        </div>
      </div>

      {/* ---------------------------------------------------- campaign grid */}
      {filteredCampaigns.length === 0 ? (
        <Card intent="dashed" className="mx-auto max-w-md p-10 text-center">
          <h3 className="font-display text-display-3">No campaigns found</h3>
          <p className="mx-auto mb-6 mt-2 max-w-[32ch] leading-relaxed text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : 'Create your first campaign to start connecting with creators.'}
          </p>
          <Button variant="form" asChild>
            <Link to="/brand/create-campaign">
              <Plus />
              Create your first campaign
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {paginatedCampaigns.map((campaign) => (
              <motion.div key={campaign.id} {...listItemMotion}>
                <CampaignCard
                  campaign={campaign}
                  state="owned"
                  className="h-full"
                  onView={() => navigate(`/brand/campaigns/${campaign.slug}`)}
                  onPublish={
                    campaign.status === 'draft'
                      ? () => handleStatusAction('publish', campaign.id, campaign.slug, campaign.title)
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ------------------------------------------------------- pagination */}
      {filteredCampaigns.length > ITEMS_PER_PAGE && (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          <Button
            variant="outline"
            className="h-11 px-4 text-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
            Prev
          </Button>

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                aria-current={currentPage === page ? 'page' : undefined}
                onClick={() => handlePageChange(page as number)}
                className="num text-sm"
              >
                {page}
              </Button>
            )
          ))}

          <Button
            variant="outline"
            className="h-11 px-4 text-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight />
          </Button>
        </nav>
      )}

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
