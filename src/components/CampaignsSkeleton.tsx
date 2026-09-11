import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/* Mirrors the Discover grid: a filter rail followed by six CampaignCard
   silhouettes. Removed the FloatingOrb pair, the mesh gradient and the
   per-card entrance stagger — `animate-pulse` is the only motion here. */

const CampaignCardSkeleton = () => (
  <Card className="h-full p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <Skeleton className="h-3.5 w-24 rounded-sm" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>

    <div className="mb-4 flex items-center gap-3">
      <Skeleton className="size-[42px] shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded-sm" />
        <Skeleton className="h-3 w-24 rounded-sm" />
      </div>
    </div>

    <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
      {[0, 1].map((i) => (
        <div key={i} className="min-w-0 space-y-2 bg-card p-3">
          <Skeleton className="h-2.5 w-12 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
      ))}
    </div>

    <div className="mb-4 flex flex-wrap gap-1.5">
      <Skeleton className="h-6 w-16 rounded-sm" />
      <Skeleton className="h-6 w-20 rounded-sm" />
      <Skeleton className="h-6 w-14 rounded-sm" />
    </div>

    <Skeleton className="h-10 w-full rounded-lg" />
  </Card>
);

const CampaignsSkeleton = () => (
  <div className="container py-10">
    {/* header */}
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-28 rounded-sm" />
        <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full rounded-sm" />
      </div>
      <Skeleton className="h-12 w-40 rounded-full" />
    </div>

    {/* filter rail */}
    <Card className="mb-6 p-5 sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row">
        <Skeleton className="h-12 flex-1 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg md:w-48" />
        <Skeleton className="h-12 w-full rounded-lg md:w-48" />
      </div>
    </Card>

    {/* grid */}
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default CampaignsSkeleton;
