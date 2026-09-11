import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, ArrowRight, Check } from 'lucide-react';
import Confetti from './Confetti';

/* Confetti is the whole celebration. The three looping gradient icon tiles,
   the glow layers and the corner gradient washes are gone — nothing pulses
   here any more. */

interface MatchCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandEmail: string;
  campaignTitle: string;
}

const NEXT_STEPS = (brandEmail: string) => [
  <>Email the brand at <strong className="font-semibold text-foreground">{brandEmail}</strong> to confirm</>,
  <>Review the campaign brief again</>,
  <>Prepare your content concept</>,
];

const MatchCelebrationModal = ({
  isOpen,
  onClose,
  brandName,
  brandEmail,
  campaignTitle,
}: MatchCelebrationModalProps) => {
  const mailtoLink = `mailto:${brandEmail}?subject=Campaign: ${encodeURIComponent(campaignTitle)} - Collaboration Kickoff`;

  const handleSendEmail = () => {
    window.open(mailtoLink, '_blank');
    onClose();
  };

  return (
    <>
      <Confetti isActive={isOpen} duration={4000} />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-2xl bg-card p-6 sm:max-w-md sm:rounded-2xl sm:p-8">
          <DialogHeader className="text-center sm:text-center">
            <Badge variant="success" className="mx-auto">Accepted</Badge>
            <DialogTitle className="mt-3 font-display text-[2rem] leading-tight tracking-[-0.03em]">
              It&apos;s a match
            </DialogTitle>
            <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{brandName}</span> wants to work with you.
            </p>
          </DialogHeader>

          <div className="mt-2 rounded-xl bg-muted p-4 text-left">
            <p className="eyebrow mb-3">Next steps</p>
            <ul className="space-y-2.5">
              {NEXT_STEPS(brandEmail).map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="min-w-0 break-words">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <Button variant="form" onClick={handleSendEmail} className="flex-1">
              <Mail />
              Send intro email
              <ArrowRight />
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchCelebrationModal;
