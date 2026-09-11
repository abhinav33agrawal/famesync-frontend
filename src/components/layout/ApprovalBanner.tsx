import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ApprovalBannerProps {
    isSetup?: boolean;
}

/* Sits above the navbar on every signed-in surface, so it stays quiet:
   a warning-tinted hairline band, no gradient, no shadow. */
const ApprovalBanner = ({ isSetup }: ApprovalBannerProps) => {
    return (
        <div className="sticky top-0 z-[100] border-b border-warning/20 bg-warning/[0.07] py-3 backdrop-blur-md">
            <div className="container flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                        <Info className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {isSetup ? 'Complete your profile' : 'Account under review'}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {isSetup
                                ? 'Please finish setting up your profile. Our team will review your account once submitted.'
                                : 'Your account is currently waiting for admin approval. Some features may be restricted until yours is whitelisted.'}
                        </p>
                    </div>
                </div>
                <Badge variant="warning" className="hidden shrink-0 sm:inline-flex">
                    {isSetup ? 'Setup required' : 'Pending approval'}
                </Badge>
            </div>
        </div>
    );
};

export default ApprovalBanner;
