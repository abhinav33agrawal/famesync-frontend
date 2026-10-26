import { Link } from 'react-router-dom';
import { Check, Upload } from 'lucide-react';
import { Rise } from '@/components/motion';
import { cn } from '@/lib/utils';

/* The profile-setup pages in the Auth page's language: an ink panel on the
   left with the headline, a live preview of what the other side will see,
   and a checklist; the form sits straight on the page on the right. Below
   lg the panel folds into a compact progress strip above the form. */

type ChecklistItem = { label: string; done: boolean };

type OnboardingShellProps = {
  firstName?: string;
  eyebrow: string;
  title: string;
  highlight: string;
  intro: string;
  previewLabel: string;
  preview: React.ReactNode;
  checklist: ChecklistItem[];
  reviewNote: string;
  children: React.ReactNode;
};

export const OnboardingShell = ({
  firstName,
  eyebrow,
  title,
  highlight,
  intro,
  previewLabel,
  preview,
  checklist,
  reviewNote,
  children,
}: OnboardingShellProps) => {
  const done = checklist.filter((item) => item.done).length;

  return (
    <div className="flex min-h-screen bg-background">
      {/* ------------------------------------------------ ink panel (lg) */}
      <aside className="sticky top-0 hidden h-screen w-[44%] flex-col overflow-y-auto bg-ink p-12 text-ink-foreground lg:flex xl:p-14">
        <Link to="/" className="w-fit font-display text-[1.75rem] font-black tracking-[-0.04em]">
          FameSync
        </Link>

        <div className="my-auto py-10">
          <p className="eyebrow mb-5 text-ink-muted">{eyebrow}</p>
          <h2 className="font-display text-[clamp(40px,4vw,64px)] font-black uppercase leading-[0.92] tracking-[-0.045em]">
            {title}
            <br />
            <span className="brand-gradient-text">{highlight}</span>
          </h2>
          <p className="mt-5 max-w-[42ch] leading-relaxed text-ink-muted">{intro}</p>

          <p className="eyebrow mb-3 mt-10 text-ink-muted">{previewLabel}</p>
          <div className="max-w-[340px] text-foreground">{preview}</div>

          <div className="mt-10 max-w-[420px]">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="eyebrow text-ink-muted">Your profile</p>
              <p className="num text-sm text-ink-muted">
                {done}/{checklist.length}
              </p>
            </div>
            <ul className="grid gap-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      'inline-flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                      item.done ? 'bg-primary text-primary-foreground' : 'border border-ink-border',
                    )}
                  >
                    {item.done && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className={item.done ? 'text-ink-foreground' : 'text-ink-muted'}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-ink-muted">{reviewNote}</p>
      </aside>

      {/* ------------------------------------------------------ form side */}
      <div className="flex w-full flex-col lg:w-[56%]">
        <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="font-display text-[1.25rem] font-black tracking-[-0.04em] lg:invisible">
            FameSync
          </Link>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{firstName || 'there'}</span>
          </p>
        </header>

        <div className="flex flex-1 justify-center px-5 pb-16 pt-4 sm:px-8 lg:pt-10">
          <div className="w-full max-w-xl">
            {/* the ink panel's checklist, folded down for small screens */}
            <div className="mb-8 lg:hidden">
              <p className="eyebrow mb-2 text-primary">{eyebrow}</p>
              <div className="flex items-center gap-3">
                <div className="flex flex-1 gap-1">
                  {checklist.map((item) => (
                    <span
                      key={item.label}
                      className={cn('h-1.5 flex-1 rounded-full', item.done ? 'bg-primary' : 'bg-border')}
                    />
                  ))}
                </div>
                <span className="num text-sm text-muted-foreground">
                  {done}/{checklist.length}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{reviewNote}</p>
            </div>

            <Rise>{children}</Rise>
          </div>
        </div>
      </div>
    </div>
  );
};

/** A numbered form section: "01  Where you post" over a hairline. */
export const SetupSection = ({
  index,
  title,
  hint,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <section className="border-t border-border pt-7">
    <div className="mb-5 flex items-baseline gap-4">
      <span className="num w-6 shrink-0 text-sm text-primary">{String(index).padStart(2, '0')}</span>
      <div>
        <h2 className="font-display text-xl font-extrabold tracking-[-0.025em]">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
    </div>
    <div className="space-y-5 sm:pl-10">{children}</div>
  </section>
);

/** Photo/logo picker as an avatar row instead of a dashed drop box.
 *  The hidden <input type=file> stays in the page that owns the cropper. */
export const AvatarPicker = ({
  inputId,
  previewUrl,
  fallback,
  shape = 'circle',
  label,
  hint,
}: {
  inputId: string;
  previewUrl?: string;
  fallback: string;
  shape?: 'circle' | 'square';
  label: string;
  hint: string;
}) => (
  <div className="flex items-center gap-5">
    <span
      className={cn(
        'inline-flex size-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary font-display text-2xl font-black text-secondary-foreground',
        shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
      )}
    >
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : fallback}
    </span>
    <div>
      <label
        htmlFor={inputId}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-border px-4 text-sm font-semibold transition-colors hover:border-primary hover:bg-muted focus-within:ring-2 focus-within:ring-ring"
      >
        <Upload className="size-4" />
        {previewUrl ? `Change ${label}` : `Upload ${label}`}
      </label>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  </div>
);
