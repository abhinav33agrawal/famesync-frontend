import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { XCircle, HelpCircle } from 'lucide-react';
import { useDeclineReasons } from '@/hooks/useDeclineReasons';

interface DeclineReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  influencerName: string;
  campaignTitle: string;
  isLoading?: boolean;
}

export const DeclineReasonDialog = ({
  isOpen,
  onClose,
  onConfirm,
  influencerName,
  campaignTitle,
  isLoading = false,
}: DeclineReasonDialogProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const { reasons, isLoading: isLoadingReasons } = useDeclineReasons();

  const handleConfirm = () => {
    onConfirm(selectedReason || undefined);
    setSelectedReason('');
  };

  const handleClose = () => {
    setSelectedReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Decline Application
          </DialogTitle>
          <DialogDescription>
            You're about to decline <span className="font-medium text-foreground">{influencerName}</span>'s
            application for <span className="font-medium text-foreground">{campaignTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-1.5">
              Reason for declining
              <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Select
              value={selectedReason}
              onValueChange={(value) => setSelectedReason(value)}
            >
              <SelectTrigger id="reason" className="bg-background">
                <SelectValue placeholder="Select a reason (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {reasons.map((reason) => (
                  <SelectItem key={reason.code} value={reason.code}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              The influencer will receive a polite, professional notification.
              Your specific reason helps us improve matching but won't be shared directly with them.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Declining...' : 'Decline Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
