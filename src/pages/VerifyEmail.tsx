import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
  MailOpen,
  PartyPopper,
  ShieldAlert,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Rise } from '@/components/motion';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

/* Removed from the old VerifyEmail.tsx: the floating-orb blobs, the looping
   ring spinner, the pulsing success halo, the raw-palette gradient status
   tiles, the linear progress bar and the aubergine split panel with
   hard-coded white type. */

const PageSkeleton = () => (
  <div className="w-full max-w-md">
    <Card className="rounded-2xl shadow-e2">
      <CardHeader className="items-center pb-4 text-center">
        <Skeleton className="mb-4 size-16 rounded-2xl" />
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </CardContent>
    </Card>
  </div>
);

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      verifyToken(token);
    } else {
      setStatus('resend');
      setMessage('No verification token provided.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [status, countdown]);

  const verifyToken = async (token: string) => {
    try {
      const response = await authApi.verifyEmail(token);
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');

      if (response.access && response.refresh) {
        const tokens = { access: response.access, refresh: response.refresh };
        localStorage.setItem('famee_tokens', JSON.stringify(tokens));

        if (response.user) {
          localStorage.setItem('famee_user', JSON.stringify(response.user));
        }

        setTimeout(() => {
          const role = response.user?.role;
          navigate(role === 'influencer' ? '/influencer/setup' : '/brand/setup');
        }, 5000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed. The token may be invalid or expired.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    setResending(true);
    try {
      await authApi.resendVerification(email);
      setMessage('Verification email sent! Please check your inbox.');
      setStatus('success');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to resend verification email.');
      setStatus('error');
    } finally {
      setResending(false);
    }
  };

  /* one icon tile per state — tinted surface, never a saturated gradient */
  const statusTile = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <PartyPopper className="size-8" />
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </span>
        );
      case 'resend':
        return (
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
            <MailOpen className="size-8" />
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="font-display text-[1.25rem] font-semibold tracking-[-0.035em] text-foreground"
        >
          FameSync
        </Link>
        <Button asChild variant="ghost" size="sm" className="h-11">
          <Link to="/auth">
            <ArrowLeft />
            Back to sign in
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-8">
        <div className="relative w-full max-w-md">
          {/* the one decorative panel */}
          <div aria-hidden="true" className="wash absolute -inset-x-1 top-8 -bottom-5 rounded-2xl" />

          {status === 'loading' && !searchParams.get('token') ? (
            <div className="relative">
              <PageSkeleton />
            </div>
          ) : (
            <Rise className="relative">
              <Card className="rounded-2xl shadow-e2">
                <CardHeader className="items-center pb-4 text-center">
                  <span className="mb-4">{statusTile()}</span>

                  <CardTitle className="text-display-3">
                    {status === 'loading' && 'Verifying…'}
                    {status === 'success' && 'Email verified'}
                    {status === 'error' && 'Verification failed'}
                    {status === 'resend' && 'Resend verification'}
                  </CardTitle>

                  <CardDescription className="text-[0.9375rem]">
                    {status === 'loading' && 'Please wait while we verify your email.'}
                    {status === 'success' && 'Your email has been verified successfully.'}
                    {status === 'error' && "We couldn't verify your email address."}
                    {status === 'resend' && 'Enter your email to receive a new link.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {message && status !== 'loading' && (
                    <div
                      role="status"
                      className={cn(
                        'flex items-start gap-2.5 rounded-lg p-4 text-sm font-medium',
                        status === 'success'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive',
                      )}
                    >
                      {status === 'success' ? (
                        <CheckCircle2 className="mt-px size-4 shrink-0" />
                      ) : (
                        <XCircle className="mt-px size-4 shrink-0" />
                      )}
                      {message}
                    </div>
                  )}

                  {status === 'resend' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="group relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-11"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleResendEmail}
                        disabled={resending}
                        variant="form"
                        className="w-full"
                      >
                        {resending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <RefreshCw />
                            Resend verification email
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {status === 'success' && (
                    <p className="text-center text-sm text-muted-foreground">
                      Redirecting to profile setup in <span className="num">{countdown}</span>s…
                    </p>
                  )}

                  {status === 'error' && (
                    <Button onClick={() => setStatus('resend')} variant="outline" className="w-full">
                      Request new verification email
                    </Button>
                  )}

                  {(status === 'success' || status === 'error' || status === 'resend') && (
                    <Button asChild variant="ghost" className="w-full">
                      <Link to="/auth">Back to sign in</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Rise>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
