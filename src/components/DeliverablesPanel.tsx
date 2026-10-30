import { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, PencilLine, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/Stat';
import {
  useBrandDeliverables,
  useInfluencerDeliverables,
  useReviewDeliverable,
  useSubmitDeliverable,
} from '@/hooks/useDeliverables';
import type { Application, Deliverable } from '@/lib/api/types';
import { formatDateDMY } from '@/lib/utils';

/* The end of a collaboration: the creator submits the live post's link, the
   brand approves it or asks for changes. Both sides get a notification
   (deliverables/views.py). Payment still happens between brand and creator. */

const DELIVERABLE_TYPES: { value: Deliverable['deliverable_type']; label: string }[] = [
  { value: 'reel', label: 'Instagram Reel' },
  { value: 'post', label: 'Instagram Post' },
  { value: 'story', label: 'Instagram Story' },
  { value: 'video', label: 'Instagram Video' },
  { value: 'youtube_video', label: 'YouTube video' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'mixed', label: 'Mixed content' },
];

const typeLabel = (t: string) => DELIVERABLE_TYPES.find((d) => d.value === t)?.label ?? t;

/** The campaign's first required deliverable, as a default for the form. */
const defaultType = (application: Application): Deliverable['deliverable_type'] => {
  const req = application.campaign.deliverables_required;
  const first = Array.isArray(req) ? req[0] : req;
  const raw = (typeof first === 'string' ? first : first?.type ?? '').toLowerCase();
  return (DELIVERABLE_TYPES.find((d) => raw.includes(d.value))?.value ?? 'reel') as Deliverable['deliverable_type'];
};

const SubmissionRow = ({ d, children }: { d: Deliverable; children?: React.ReactNode }) => (
  <li className="rounded-lg border border-border bg-card p-3.5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{typeLabel(d.deliverable_type)}</p>
        <p className="text-xs text-muted-foreground">
          Submitted <span className="num">{formatDateDMY(d.submitted_at)}</span>
        </p>
      </div>
      <StatusBadge status={d.status === 'rejected' ? 'changes_requested' : d.status} />
    </div>
    <a
      href={d.link}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex min-h-9 max-w-full items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
    >
      <ExternalLink className="size-3.5 shrink-0" />
      {d.link}
    </a>
    {d.description && <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>}
    {d.feedback && (
      <div className="mt-2.5 rounded-md bg-muted p-3">
        <p className="eyebrow mb-1">Brand feedback</p>
        <p className="text-sm leading-relaxed">{d.feedback}</p>
      </div>
    )}
    {children}
  </li>
);

/* ------------------------------------------------------------- creator */

export const CreatorDeliverables = ({ application }: { application: Application }) => {
  const { data: all = [], isLoading } = useInfluencerDeliverables();
  const submit = useSubmitDeliverable();
  const mine = all.filter((d) => String(d.application?.id) === String(application.id));
  const approved = mine.some((d) => d.status === 'approved');

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Deliverable['deliverable_type']>(defaultType(application));
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const validLink = /^https?:\/\/\S+\.\S+/i.test(link.trim());

  const send = () =>
    submit.mutate(
      { application: String(application.id), deliverable_type: type, link: link.trim(), description: note.trim() || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setLink('');
          setNote('');
        },
      }
    );

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Your content</p>
        {approved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" /> Approved by the brand
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      ) : mine.length > 0 ? (
        <ul className="mt-3 grid gap-2.5">
          {mine.map((d) => (
            <SubmissionRow key={d.id} d={d} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Once your post is live, submit its link here so the brand can approve it.
        </p>
      )}

      {!approved &&
        (open ? (
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <div className="space-y-1.5">
                <Label htmlFor={`dtype-${application.id}`}>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Deliverable['deliverable_type'])}>
                  <SelectTrigger id={`dtype-${application.id}`} className="h-11 rounded-lg bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERABLE_TYPES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`dlink-${application.id}`}>Link to the live post</Label>
                <Input
                  id={`dlink-${application.id}`}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://www.instagram.com/reel/…"
                  inputMode="url"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`dnote-${application.id}`}>Note for the brand (optional)</Label>
              <Textarea
                id={`dnote-${application.id}`}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything they should know: timing, extra stories, usage rights…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="form" size="sm" onClick={send} disabled={!validLink || submit.isPending}>
                {submit.isPending ? <Loader2 className="animate-spin" /> : <Send />}
                Submit for approval
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {link && !validLink && (
                <span className="self-center text-xs text-destructive">Paste the full link, starting with https://</span>
              )}
            </div>
          </div>
        ) : (
          <Button variant="form" size="sm" className="mt-3" onClick={() => setOpen(true)}>
            <Send />
            {mine.length ? 'Submit an updated link' : 'Submit your post'}
          </Button>
        ))}
    </div>
  );
};

/* --------------------------------------------------------------- brand */

const ReviewActions = ({ d }: { d: Deliverable }) => {
  const review = useReviewDeliverable();
  const [asking, setAsking] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (d.status === 'approved') return null;

  return asking ? (
    <div className="mt-3 grid gap-2">
      <Textarea
        rows={2}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="What should the creator change? e.g. Please tag @yourbrand in the caption"
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={!feedback.trim() || review.isPending}
          onClick={() => review.mutate({ id: d.id, status: 'rejected', feedback: feedback.trim() }, { onSuccess: () => setAsking(false) })}
        >
          Send request
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setAsking(false)}>
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button
        variant="form"
        size="sm"
        disabled={review.isPending}
        onClick={() => review.mutate({ id: d.id, status: 'approved' })}
      >
        {review.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        Approve
      </Button>
      {d.status !== 'rejected' && (
        <Button variant="outline" size="sm" onClick={() => setAsking(true)}>
          <PencilLine />
          Request changes
        </Button>
      )}
    </div>
  );
};

export const BrandDeliverables = ({ application, campaignId }: { application: Application; campaignId: string }) => {
  const { data: all = [], isLoading } = useBrandDeliverables(campaignId);
  const theirs = all.filter((d) => String(d.application?.id) === String(application.id));

  return (
    <div className="mt-3">
      <p className="eyebrow mb-2">Submitted content</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : theirs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing yet. The creator submits the live post&apos;s link here once it&apos;s up.
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {theirs.map((d) => (
            <SubmissionRow key={d.id} d={d}>
              <ReviewActions d={d} />
            </SubmissionRow>
          ))}
        </ul>
      )}
    </div>
  );
};
