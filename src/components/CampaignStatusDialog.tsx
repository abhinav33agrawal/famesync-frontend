import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Rocket, CheckCircle, XCircle, Trash2 } from 'lucide-react';

type StatusAction = 'publish' | 'complete' | 'cancel' | 'delete';

interface CampaignStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: StatusAction;
  campaignTitle: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const actionConfig: Record<StatusAction, {
  title: string;
  description: string;
  confirmText: string;
  icon: React.ElementType;
  variant: 'default' | 'destructive';
}> = {
  publish: {
    title: 'Publish Campaign',
    description: 'This will make your campaign visible to influencers. This action will count toward your monthly campaign limit.',
    confirmText: 'Publish',
    icon: Rocket,
    variant: 'default',
  },
  complete: {
    title: 'Mark as Completed',
    description: 'This will mark your campaign as successfully completed. Influencers will no longer be able to apply.',
    confirmText: 'Complete',
    icon: CheckCircle,
    variant: 'default',
  },
  cancel: {
    title: 'Cancel Campaign',
    description: 'Are you sure you want to cancel this campaign? Pending applicants will be notified. This action cannot be undone.',
    confirmText: 'Cancel Campaign',
    icon: XCircle,
    variant: 'destructive',
  },
  delete: {
    title: 'Delete Draft',
    description: 'Are you sure you want to delete this draft campaign? This action cannot be undone.',
    confirmText: 'Delete',
    icon: Trash2,
    variant: 'destructive',
  },
};

export function CampaignStatusDialog({
  open,
  onOpenChange,
  action,
  campaignTitle,
  onConfirm,
  isLoading = false,
}: CampaignStatusDialogProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background border-border/50">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              config.variant === 'destructive' 
                ? 'bg-destructive/20' 
                : 'bg-primary/20'
            }`}>
              <Icon className={`h-5 w-5 ${
                config.variant === 'destructive' 
                  ? 'text-destructive' 
                  : 'text-primary'
              }`} />
            </div>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            <span className="font-semibold text-foreground">"{campaignTitle}"</span>
            <br /><br />
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={config.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="mr-2 h-4 w-4" />
                {config.confirmText}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
