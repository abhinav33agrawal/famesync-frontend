import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/* Mirrors the campaign detail page: back link, brief header with a four-up
   numeric strip, the tab rail and one content panel. FloatingOrb, the mesh
   gradient and the duplicated `bg-card border border-border` classes the
   codemod left behind are gone. */

const CampaignDetailSkeleton = () => (
  <div className="container py-10">
    <Skeleton className="mb-6 h-10 w-36 rounded-full" />

    {/* brief header */}
    <Card className="mb-6 p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3.5 w-24 rounded-sm" />
          <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-full max-w-xl rounded-sm" />
          <Skeleton className="h-4 w-3/4 rounded-sm" />
        </div>
        <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="min-w-0 space-y-2 bg-card p-4">
            <Skeleton className="h-2.5 w-14 rounded-sm" />
            <Skeleton className="h-5 w-20 rounded-sm" />
          </div>
        ))}
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />
    </Card>

    {/* tab rail */}
    <div className="mb-6 flex gap-2 overflow-x-auto">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-full" />
      ))}
    </div>

    {/* content panel */}
    <Card className="p-5 sm:p-6">
      <Skeleton className="mb-6 h-6 w-48 rounded-lg" />
      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="mb-3 h-3.5 w-32 rounded-sm" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default CampaignDetailSkeleton;
