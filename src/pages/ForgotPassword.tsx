import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, MailCheck, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { Rise } from '@/components/motion';
import { authApi } from '@/lib/api/auth';
import { emailSchema } from '@/lib/validation/auth';
import { toast } from 'sonner';

/* Removed from the old ForgotPassword.tsx: the floating-orb blobs, the
   looping lock icon, the ping ring, the aubergine split panel with hard-coded
   white type, every gradient tile and the heavy card shadows. One wash panel
   is the only decoration left. */

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      const fieldErrors: { email?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') {
          fieldErrors.email = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
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
          <div
            aria-hidden="true"
            className="wash absolute -inset-x-1 top-10 -bottom-5 rounded-2xl"
          />

          {emailSent ? (
            <Rise className="relative">
              <Card className="rounded-2xl shadow-e2">
                <CardHeader className="items-center pb-4 text-center">
                  <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <MailCheck className="size-8" />
                  </span>
                  <CardTitle className="text-display-3">Check your email</CardTitle>
                  <CardDescription className="text-[0.9375rem]">
                    We&apos;ve sent reset instructions to
                    <br />
                    <strong className="font-semibold text-foreground">{email}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                    Click the link in your email to reset your password. The link expires in 1 hour.
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full">
                      Send again
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                      <Link to="/auth">Back to sign in</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Rise>
          ) : (
            <Rise className="relative">
              <div className="mb-7 text-center">
                <span className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-e1">
                  <KeyRound className="size-7" />
                </span>
                <h1 className="font-display text-display-2">Forgot password?</h1>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  No problem. We&apos;ll send you reset instructions.
                </p>
              </div>

              <Card className="rounded-2xl shadow-e2">
                <CardContent className="pt-5 sm:pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <div className="group relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          aria-invalid={Boolean(errors.email)}
                          className="pl-11"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors({});
                          }}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm font-medium text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <Button type="submit" variant="form" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          Send reset link
                          <ArrowRight />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/auth" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </Rise>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
