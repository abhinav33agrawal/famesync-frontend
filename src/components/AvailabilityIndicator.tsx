import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/* green-500 -> success, amber-500 -> warning. */

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface AvailabilityIndicatorProps {
  status: AvailabilityStatus;
  message: string;
  className?: string;
}

export function AvailabilityIndicator({ status, message, className }: AvailabilityIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn('mt-1.5 flex items-center gap-1.5 text-sm', className)}>
      {status === 'checking' && (
        <>
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">{message}</span>
        </>
      )}
      {status === 'available' && (
        <>
          <Check className="size-3.5 text-success" />
          <span className="font-medium text-success">{message}</span>
        </>
      )}
      {status === 'taken' && (
        <>
          <X className="size-3.5 text-destructive" />
          <span className="font-medium text-destructive">{message}</span>
        </>
      )}
      {status === 'invalid' && (
        <>
          <AlertCircle className="size-3.5 text-warning" />
          <span className="font-medium text-warning">{message}</span>
        </>
      )}
    </div>
  );
}
