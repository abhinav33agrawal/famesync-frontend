import { Info } from 'lucide-react';

interface ApprovalBannerProps {
    isSetup?: boolean;
}

const ApprovalBanner = ({ isSetup }: ApprovalBannerProps) => {
    return (
        <div className="sticky top-0 z-[100] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-500/20 py-3 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Info className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-900">
                            {isSetup ? 'Complete Your Profile' : 'Account Under Review'}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            {isSetup
                                ? 'Please finish setting up your profile. Our team will review your account once submitted.'
                                : 'Your account is currently waiting for admin approval. Some features may be restricted until yours is whitelisted.'}
                        </p>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {isSetup ? 'Setup Required' : 'Pending Approval'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ApprovalBanner;
