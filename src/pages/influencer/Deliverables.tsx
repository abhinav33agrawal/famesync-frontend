import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/Stat';
import { Avatar } from '@/components/Avatar';
import { Rise, listItemMotion } from '@/components/motion';
import { deliverableChips } from '@/lib/format';
import { formatDateDMY } from '@/lib/utils';
import { useInfluencerDeliverables } from '@/hooks/useDeliverables';

/* Removed from the old screen: getStatusConfig()'s icon + variant map (now
   `StatusBadge`) and the full-page spinner (now a skeleton list). */

const DeliverablesSkeleton = () => (
  <div className="container py-10 md:py-14">
    <div className="mb-10 md:mb-12">
      <Skeleton className="mb-4 h-3 w-28" />
      <Skeleton className="h-11 w-64 max-w-full" />
      <Skeleton className="mt-4 h-5 w-80 max-w-full" />
    </div>
    <Skeleton className="mb-6 h-12 rounded-lg" />
    <div className="grid gap-4">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  </div>
);

const Deliverables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: deliverables = [], isLoading } = useInfluencerDeliverables();

  const filteredDeliverables = deliverables.filter(del =>
    del.application.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    del.application.campaign.brand.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <DeliverablesSkeleton />;
  }

  const handleUpload = (deliverableId: number) => {
    toast.success('Deliverable upload initiated');
  };

  return (
    <div className="container py-10 md:py-14">
      {/* -------------------------------------------------------- page header */}
      <Rise>
        <header className="mb-10 md:mb-12">
          <p className="eyebrow mb-3">Your work</p>
          <h1 className="font-display text-display-2">Deliverables.</h1>
          <p className="mt-3 max-w-[52ch] text-muted-foreground">
            Manage and track the content you owe each brand.
          </p>
        </header>
      </Rise>

      {/* ------------------------------------------------------------- search */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search deliverables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11"
          aria-label="Search deliverables"
        />
      </div>

      {/* --------------------------------------------------------------- list */}
      {filteredDeliverables.length > 0 && (
        <ul className="grid gap-4">
          <AnimatePresence initial={false}>
            {filteredDeliverables.map((deliverable) => (
              <motion.li key={deliverable.id} {...listItemMotion}>
                <Card className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <Avatar name={deliverable.application.campaign.brand.username} size={46} />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-display text-[1.1875rem] font-semibold tracking-[-0.02em]">
                          {deliverable.application.campaign.title}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          @{deliverable.application.campaign.brand.username}
                        </p>

                        <ul className="mt-3.5 flex flex-wrap items-center gap-1.5">
                          {deliverableChips(deliverable.deliverable_type).map((chip) => (
                            <li key={chip} className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium">
                              {chip}
                            </li>
                          ))}
                          <li className="text-xs text-muted-foreground">
                            Submitted{' '}
                            <span className="num">{formatDateDMY(deliverable.submitted_at) || '—'}</span>
                          </li>
                        </ul>

                        {deliverable.link && (
                          <a
                            href={deliverable.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                          >
                            <ExternalLink className="size-4" />
                            View content
                          </a>
                        )}

                        {deliverable.feedback && (
                          <div className="mt-3 rounded-lg bg-muted p-3.5">
                            <p className="eyebrow mb-1.5">Brand feedback</p>
                            <p className="text-sm leading-relaxed">{deliverable.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">
                      <StatusBadge
                        status={deliverable.status === 'pending' ? 'not_submitted' : deliverable.status}
                      />

                      {deliverable.status === 'pending' && (
                        <Button variant="form" size="sm" onClick={() => handleUpload(deliverable.id)}>
                          <Upload />
                          Upload now
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* -------------------------------------------------------- empty state */}
      {filteredDeliverables.length === 0 && (
        <Card intent="dashed" className="p-10 text-center sm:p-14">
          <p className="eyebrow mb-3">Nothing to deliver</p>
          <h2 className="font-display text-display-3">No deliverables found</h2>
          <p className="mx-auto mt-2.5 max-w-[38ch] leading-relaxed text-muted-foreground">
            {searchTerm
              ? 'Try a different search term.'
              : 'Once a brand accepts you, the content you owe shows up here.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default Deliverables;
