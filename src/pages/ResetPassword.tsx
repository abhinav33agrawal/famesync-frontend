import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Check,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Loader2,
} from 'lucide-react';
import { Rise } from '@/components/motion';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api/auth';
import { passwordResetSchema, type PasswordResetFormData } from '@/lib/validation/auth';
import { toast } from 'sonner';

/* Removed from the old ResetPassword.tsx: the floating-orb blobs, the looping
   shield, the pulsing success ring, the raw-palette success gradient, the
   linear progress bar and the aubergine split panel with hard-coded white
   type. */

/** Meter only — the real rule lives in passwordResetSchema. */
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const tones = ['bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'];

  if (!password) return null;

  return (
    <div className="mt-2.5">
      <div className="mb-1.5 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < strength ? tones[strength - 1] : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', strength > 2 ? 'text-success' : 'text-muted-foreground')}>
        {labels[strength - 1] || 'Too short'}
      </p>
    </div>
  );
};

const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="mt-3 grid gap-1.5">
      {requirements.map((req) => (
        <li key={req.label} className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              'inline-flex size-4 shrink-0 items-center justify-center rounded-full',
              req.met ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
            )}
          >
            {req.met && <Check className="size-3" />}
          </span>
          <span className={req.met ? 'font-medium text-success' : 'text-muted-foreground'}>
            {req.label}
          </span>
        </li>
      ))}
    </ul>
  );
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PasswordResetFormData>({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Invalid reset link');
      navigate('/auth');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = passwordResetSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'password' | 'confirmPassword';
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, formData.password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
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
          <div aria-hidden="true" className="wash absolute -inset-x-1 top-10 -bottom-5 rounded-2xl" />

          {success ? (
            <Rise className="relative">
              <Card className="rounded-2xl shadow-e2">
                <CardHeader className="items-center pb-4 text-center">
                  <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success">
                    <PartyPopper className="size-8" />
                  </span>
                  <CardTitle className="text-display-3">Password reset</CardTitle>
                  <CardDescription className="text-[0.9375rem]">
                    Your password has been successfully updated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2.5 rounded-lg bg-success/10 p-4 text-sm font-medium text-success">
                    <CheckCircle2 className="size-4 shrink-0" />
                    Redirecting to sign in…
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
                <h1 className="font-display text-display-2">Reset password</h1>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Create a strong, secure password.
                </p>
              </div>

              <Card className="rounded-2xl shadow-e2">
                <CardContent className="pt-5 sm:pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password">New password</Label>
                      <div className="group relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          aria-invalid={Boolean(errors.password)}
                          className="pl-11 pr-14"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            setErrors({});
                          }}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                      <PasswordStrength password={formData.password} />
                      <PasswordRequirements password={formData.password} />
                      {errors.password && (
                        <p className="text-sm font-medium text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <div className="group relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          aria-invalid={Boolean(errors.confirmPassword)}
                          className="pl-11 pr-14"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            setErrors({});
                          }}
                        />
                        <button
                          type="button"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-5" />
                          ) : (
                            <Eye className="size-5" />
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                          <CheckCircle2 className="size-3.5" />
                          Passwords match
                        </p>
                      )}
                      {errors.confirmPassword && (
                        <p className="text-sm font-medium text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button type="submit" variant="form" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            Reset password
                            <ArrowRight />
                          </>
                        )}
                      </Button>
                      <Button asChild variant="ghost" className="w-full">
                        <Link to="/auth">Back to sign in</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </Rise>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
