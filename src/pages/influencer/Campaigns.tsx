import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { CampaignCard } from '@/components/CampaignCard';
import { Stat } from '@/components/Stat';
import { UnlockCampaignDialog } from '@/components/UnlockCampaignDialog';
import { Rise, listItemMotion } from '@/components/motion';
import { useInfluencerCampaigns } from '@/hooks/useCampaigns';
import type { Campaign } from '@/lib/api/types';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import CampaignsSkeleton from '@/components/CampaignsSkeleton';

/* Removed from the old screen: FloatingOrb, the gradient StatCard tiles, the
   ~100-line renderDeliverables() (now `deliverableChips`), the hand-rolled
   campaign card (now `CampaignCard`) and every gradient/glow surface.
   The filter rail is a sticky aside on lg+ and a sheet below it. */

const InfluencerCampaigns = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  // the campaign whose 1-credit unlock is being confirmed
  const [unlockTarget, setUnlockTarget] = useState<Campaign | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { categories: dynamicCategories, isLoading: categoriesLoading } = useCategories();

  const ITEMS_PER_PAGE = 9;

  const filterParams = {
    ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter })
  };

  const { data: campaigns = [], isLoading } = useInfluencerCampaigns(
    Object.keys(filterParams).length > 0 ? filterParams : undefined
  );

  const credits = user?.credits ?? 0;

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
  const newThisWeek = campaigns.filter(c => {
    const created = new Date(c.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length;

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

  const handleViewDetails = (campaign: Campaign) => {
    navigate(`/influencer/campaigns/${campaign.slug}`);
  };

  const hasActiveFilters =
    !!searchTerm || !!locationFilter || categoryFilter !== 'all' || paymentTypeFilter !== 'all' || eventTypeFilter.length > 0;

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter('all');
    setPaymentTypeFilter('all');
    setEventTypeFilter([]);
    handleFilterChange();
  };

  /** One filter rail, rendered twice: sticky aside on lg+, sheet below it.
   *  `idPrefix` keeps the checkbox ids unique between the two copies. */
  const renderFilters = (idPrefix: string) => (
    <div className="grid gap-5">
      <div>
        <label htmlFor={`${idPrefix}-location`} className="eyebrow mb-2 block">
          Location
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${idPrefix}-location`}
            placeholder="Any city"
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); handleFilterChange(); }}
            className="pl-11"
          />
        </div>
      </div>

      <div>
        <span className="eyebrow mb-2 block">Category</span>
        <Select value={categoryFilter} onValueChange={(value) => { setCategoryFilter(value); handleFilterChange(); }}>
          <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
            <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {dynamicCategories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <span className="eyebrow mb-2 block">Payment</span>
        <Select value={paymentTypeFilter} onValueChange={(value) => { setPaymentTypeFilter(value); handleFilterChange(); }}>
          <SelectTrigger className="h-12 rounded-lg border-input bg-card px-4 text-[0.95rem]">
            <SelectValue placeholder="Payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment types</SelectItem>
            <SelectItem value="fixed">Fixed payment</SelectItem>
            <SelectItem value="negotiable">Negotiable</SelectItem>
            <SelectItem value="barter">Barter / product exchange</SelectItem>
            <SelectItem value="sourcing">Sourcing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <span className="eyebrow mb-2 block">Event type</span>
        <div className="grid gap-1">
          {[
            { value: 'online', label: 'Online' },
            { value: 'onfield', label: 'On field' },
          ].map((option) => (
            <label
              key={option.value}
              htmlFor={`${idPrefix}-${option.value}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-[0.9375rem] font-medium hover:bg-muted"
            >
              <Checkbox
                id={`${idPrefix}-${option.value}`}
                checked={eventTypeFilter.includes(option.value)}
                onCheckedChange={() => handleEventTypeToggle(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="secondary" size="sm" className="h-11 justify-self-start" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return <CampaignsSkeleton />;
  }

  return (
    <div className="container py-10 md:py-14">
      {/* -------------------------------------------------------- page header */}
      <Rise>
        <header className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Discover</p>
            <h1 className="font-display text-display-2">Briefs open to you.</h1>
            <p className="mt-3 max-w-[48ch] text-muted-foreground">
              Browse available campaigns and apply to the ones that fit your style.
            </p>
          </div>

          <Card intent="tinted" className="shrink-0 p-4">
            <p className="eyebrow text-secondary-foreground/70">Your credits</p>
            <p className="num mt-1 text-[1.0625rem]">
              {credits} {credits === 1 ? 'credit' : 'credits'}
            </p>
            <p className="mt-0.5 text-xs text-secondary-foreground/80">1 credit unlocks a brief · applying is free</p>
          </Card>
        </header>
      </Rise>

      {/* -------------------------------------------------------------- stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Available campaigns" value={totalCampaigns} note="Matching your filters" />
        <Stat label="Live now" value={activeCampaigns} note="Accepting applications" noteTone={activeCampaigns ? 'success' : 'muted'} />
        <Stat label="New this week" value={newThisWeek} note="Posted in the last 7 days" />
      </div>

      {/* ------------------------------------------------ search + sheet trigger */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns or categories..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange(); }}
            className="pl-11"
            aria-label="Search campaigns"
          />
        </div>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" className="shrink-0 lg:hidden">
              <SlidersHorizontal />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display text-display-3">Filters</SheetTitle>
            </SheetHeader>
            {renderFilters('sheet')}
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- rail */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-5">
            <p className="eyebrow mb-5">Refine</p>
            {renderFilters('rail')}
          </Card>
        </aside>

        {/* -------------------------------------------------------- results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="num text-[1.0625rem]">{filteredCampaigns.length}</span>
            <span className="text-muted-foreground">
              {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Clear filters
              </button>
            )}
          </div>

          {paginatedCampaigns.length > 0 && (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {paginatedCampaigns.map((campaign) => (
                  <motion.li key={campaign.id} {...listItemMotion} className="h-full">
                    <CampaignCard
                      campaign={campaign}
                      state={campaign.has_applied ? 'applied' : campaign.is_unlocked ? 'open' : 'locked'}
                      className="h-full"
                      onApply={() => handleViewDetails(campaign)}
                      onView={() => handleViewDetails(campaign)}
                      onUnlock={() => setUnlockTarget(campaign)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* ------------------------------------------------- pagination */}
          {filteredCampaigns.length > 0 && totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft />
                Prev
              </Button>

              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="inline-flex size-11 items-center justify-center text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'form' : 'outline'}
                      size="icon"
                      aria-current={currentPage === page ? 'page' : undefined}
                      onClick={() => handlePageChange(page as number)}
                    >
                      <span className="num text-sm">{page}</span>
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-11"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight />
              </Button>
            </nav>
          )}

          {/* ------------------------------------------------ empty state */}
          {filteredCampaigns.length === 0 && (
            <Card intent="dashed" className="p-10 text-center sm:p-14">
              <p className="eyebrow mb-3">Nothing matched</p>
              <h2 className="font-display text-display-3">No campaigns found</h2>
              <p className="mx-auto mt-2.5 max-w-[38ch] leading-relaxed text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-7" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      <UnlockCampaignDialog
        campaign={unlockTarget}
        open={!!unlockTarget}
        onOpenChange={(open) => !open && setUnlockTarget(null)}
      />
    </div>
  );
};

export default InfluencerCampaigns;
