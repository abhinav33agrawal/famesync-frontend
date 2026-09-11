import { Skeleton } from '@/components/ui/skeleton';

/* Route-level loader. The old version was a mesh of floating orbs, a glowing
   logo and five looping framer animations — replaced by the wordmark and
   `animate-pulse` skeleton blocks on paper. */

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container flex min-h-screen flex-col items-center justify-center py-16">
      <p
        className="font-display text-[1.4375rem] font-semibold tracking-[-0.035em] text-foreground"
        role="status"
        aria-live="polite"
      >
        FameSync
      </p>
      <span className="eyebrow mt-2">Loading</span>

      <div className="mt-10 w-full max-w-md space-y-3">
        <Skeleton className="mx-auto h-9 w-3/4 rounded-lg" />
        <Skeleton className="mx-auto h-4 w-1/2 rounded-lg" />
      </div>

      <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
