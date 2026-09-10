import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface AvailabilityIndicatorProps {
  status: AvailabilityStatus;
  message: string;
  className?: string;
}

export function AvailabilityIndicator({ status, message, className }: AvailabilityIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn('flex items-center gap-1.5 text-sm mt-1.5', className)}>
      {status === 'checking' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">{message}</span>
        </>
      )}
      {status === 'available' && (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-500">{message}</span>
        </>
      )}
      {status === 'taken' && (
        <>
          <X className="h-3.5 w-3.5 text-destructive" />
          <span className="text-destructive">{message}</span>
        </>
      )}
      {status === 'invalid' && (
        <>
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-amber-500">{message}</span>
        </>
      )}
    </div>
  );
}
