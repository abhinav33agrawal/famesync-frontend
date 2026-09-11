import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/* Mirrors the dashboard: four Stat tiles, a two-thirds activity list and a
   sidebar. The fixed orb layer, the per-card gradient overlays and the
   framer entrance stagger are gone. */

const StatSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-3 w-24 rounded-sm" />
    <Skeleton className="mt-5 h-9 w-28 rounded-lg" />
    <Skeleton className="mt-3 h-3.5 w-32 rounded-sm" />
  </Card>
);

const DashboardSkeleton = () => (
  <div className="container space-y-8 py-10">
    {/* header */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-28 rounded-sm" />
        <Skeleton className="h-10 w-72 max-w-full rounded-lg" />
        <Skeleton className="h-4 w-56 max-w-full rounded-sm" />
      </div>
      <Skeleton className="h-12 w-40 rounded-full" />
    </div>

    {/* stat row */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <StatSkeleton key={i} />
      ))}
    </div>

    {/* main + sidebar */}
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-5 sm:p-6 lg:col-span-2">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-40 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-[46px] shrink-0 rounded-md" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-40 max-w-full rounded-sm" />
                    <Skeleton className="h-3 w-24 rounded-sm" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-3.5 w-24 rounded-sm" />
                <Skeleton className="h-3.5 w-32 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <Skeleton className="mb-5 h-5 w-36 rounded-sm" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2 rounded-lg bg-muted p-3">
                <Skeleton className="h-3.5 w-full rounded-sm" />
                <Skeleton className="h-3 w-20 rounded-sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="mb-4 size-12 rounded-full" />
            <Skeleton className="mb-2 h-4 w-32 rounded-sm" />
            <Skeleton className="mb-4 h-3.5 w-44 max-w-full rounded-sm" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </Card>
      </div>
    </div>

    {/* CTA panel */}
    <Card className="rounded-2xl p-8">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-64 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full rounded-sm" />
        </div>
        <Skeleton className="h-12 w-44 shrink-0 rounded-full" />
      </div>
    </Card>
  </div>
);

export default DashboardSkeleton;
