import { useEffect } from 'react';
import { Clock, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/Stat';
import { Rise } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* Removed from the old WaitingForApproval.tsx: the blurred halo, the pulsing
   clock, the raw palette colours behind it, the heavy tile shadow and `lift`
   on a button (lift belongs to cards). */

const WaitingForApproval = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.is_approved) {
            navigate(`/${user.role}/dashboard`);
        }
    }, [user, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-5 py-14 sm:px-8">
            <div className="relative w-full max-w-md">
                {/* the one decorative panel */}
                <div aria-hidden="true" className="wash absolute -inset-x-1 top-24 -bottom-5 rounded-2xl" />

                <Rise className="relative">
                    <div className="text-center">
                        <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                            <Clock className="size-8" />
                        </span>
                        <p className="eyebrow mt-6">Account review</p>
                        <h1 className="mt-2.5 font-display text-display-2">Review in progress</h1>
                        <p className="mt-4 leading-relaxed text-muted-foreground">
                            Hi{' '}
                            <span className="font-semibold text-foreground">
                                {user?.first_name || user?.username}
                            </span>
                            , we&apos;ve received your registration.
                        </p>
                    </div>

                    <Card className="mt-8 rounded-2xl shadow-e2">
                        <CardContent className="divide-y divide-border pt-5 sm:pt-6">
                            <div className="flex items-start gap-3.5 pb-4">
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.9375rem] font-semibold">Account created</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Your details are saved and secure.
                                    </p>
                                </div>
                                <StatusBadge status="completed" />
                            </div>

                            <div className="flex items-start gap-3.5 py-4">
                                <Clock className="mt-0.5 size-5 shrink-0 text-warning" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.9375rem] font-semibold">Waiting for admin approval</p>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        Our team is reviewing your profile to make sure it meets our quality
                                        standards. This usually takes 24&ndash;48 hours.
                                    </p>
                                </div>
                                <StatusBadge status="pending" />
                            </div>

                            <div className="flex items-start gap-3.5 pt-4 opacity-55">
                                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.9375rem] font-semibold text-muted-foreground">
                                        Access platform features
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Unlocked as soon as you&apos;re approved.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card intent="tinted" className="mt-4 rounded-2xl">
                        <CardContent className="flex items-start gap-3.5 pt-5 sm:pt-6">
                            <Mail className="mt-0.5 size-5 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm">We&apos;ll email you once approved at</p>
                                <p className="mt-1 break-all text-[0.9375rem] font-semibold">{user?.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button variant="secondary" onClick={() => logout()}>
                            Log out
                        </Button>
                        <Button onClick={() => window.location.reload()}>Check status</Button>
                    </div>
                </Rise>
            </div>
        </div>
    );
};

export default WaitingForApproval;
