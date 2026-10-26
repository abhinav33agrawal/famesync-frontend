import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rise } from '@/components/motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  User,
  Building2,
  Instagram,
  ArrowLeft,
  Mail,
  Lock,
  UserCircle,
  MailCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import type { CredentialResponse } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, GoogleButton } from '@/components/auth/GoogleButton';
import { useAvailabilityCheck } from '@/hooks/useAvailabilityCheck';
import { AvailabilityIndicator } from '@/components/AvailabilityIndicator';
import { getInstagramErrorMessage, startInstagramAuth } from '@/lib/instagram';
import { INSTAGRAM_LOGIN_ENABLED } from '@/lib/features';
import { FACTS, STEPS } from '@/data/landing';

/* Ink brand panel on the left in the landing page's language; the form sits
   straight on the page (no card), social sign-in first, email below. */

/* The ink side panel follows the person: creator steps, brand steps, or a
   plain welcome back. Steps restate the landing page — no new claims. */
const PANEL = {
  influencer: {
    eyebrow: 'For creators',
    title: 'Get paid',
    highlight: 'to post.',
    steps: STEPS.map(({ title, body }) => ({ title, body })),
  },
  brand: {
    eyebrow: 'For brands',
    title: 'Hire creators',
    highlight: 'who fit.',
    steps: [
      {
        title: 'Post a brief',
        body: 'Budget, deliverables and creative direction in one place. Every brand is checked by hand before a brief goes live.',
      },
      {
        title: 'Review verified applicants',
        body: 'Real Instagram reach and engagement on every application, side by side.',
      },
      {
        title: 'Track to approval',
        body: 'Accept creators, collect post links and approve deliverables in one place.',
      },
    ],
  },
} as const;

/* Blank in any build without VITE_GOOGLE_CLIENT_ID (local dev with no .env,
   a Vercel environment missing it). Rendering GoogleLogin with an empty id
   sends people to Google's "Missing required parameter: client_id" page,
   so the button is hidden instead — and shown disabled in dev as a hint. */
const SHOW_GOOGLE = Boolean(GOOGLE_CLIENT_ID) || import.meta.env.DEV;
const HAS_SOCIAL = INSTAGRAM_LOGIN_ENABLED || SHOW_GOOGLE;

const ROLES = [
  { key: 'influencer', label: 'Creator', note: 'Find paid briefs', Icon: User },
  { key: 'brand', label: 'Brand', note: 'Hire creators', Icon: Building2 },
] as const;

/** Meter only — the validation rule (8 chars) lives in handleSignUp. */
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

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, loginWithGoogle } = useAuth();

  // Initialize tab based on URL mode parameter (default to signin)
  const initialMode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    initialMode === 'signup' ? 'signup' : 'signin'
  );
  const [selectedRole, setSelectedRole] = useState<'influencer' | 'brand'>(
    (searchParams.get('role') as 'influencer' | 'brand') || 'influencer'
  );

  const [signInData, setSignInData] = useState({ identifier: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [instagramStarting, setInstagramStarting] = useState(false);
  const [instagramStatusMessage, setInstagramStatusMessage] = useState('');
  const panel = PANEL[selectedRole] ?? PANEL.influencer;

  // Real-time availability checks with debouncing
  const usernameAvailability = useAvailabilityCheck('username', signUpData.username, 400);
  const emailAvailability = useAvailabilityCheck('email', signUpData.email, 400);

  useEffect(() => {
    const instagramStatus = `${searchParams.get('instagram') || ''}`.trim().toLowerCase();
    const provider = `${searchParams.get('provider') || ''}`.trim().toLowerCase();
    const error = `${searchParams.get('error') || ''}`.trim();

    if (instagramStatus === 'connected') {
      toast.success('Instagram connected. Open your profile to view synced insights.');
    }

    if (provider === 'instagram' && error) {
      toast.error(error);
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userRole = await login(signInData.identifier, signInData.password);
      toast.success('Welcome back!');

      const savedUser = localStorage.getItem('famee_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      if (currentUser?.has_profile === false) {
        navigate(`/${userRole}/setup`);
      } else {
        navigate(`/${userRole}/dashboard`);
      }
    } catch (error) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    /* Block only on a definite answer. The live check is a convenience:
       when it is still debouncing, mid-flight or failed (network, CORS, a
       stale token), /auth/register/ validates username and email again and
       AuthContext shows the server's message. Requiring 'available' here
       used to reject perfectly good usernames whenever the check failed. */
    if (usernameAvailability.status === 'invalid') {
      toast.error(usernameAvailability.message);
      return;
    }
    if (usernameAvailability.status === 'taken') {
      toast.error('Username is already taken. Please choose another one.');
      return;
    }
    if (emailAvailability.status === 'invalid') {
      toast.error(emailAvailability.message);
      return;
    }
    if (emailAvailability.status === 'taken') {
      toast.error('This email is already registered. Please sign in or use a different email.');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (signUpData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signup(
        signUpData.username,
        signUpData.email,
        signUpData.password,
        signUpData.firstName,
        signUpData.lastName,
        selectedRole
      );
      setRegisteredEmail(signUpData.email);
      setShowVerificationMessage(true);
      toast.success('Account created successfully! Check your email.');
    } catch (error) {
      // Error is already handled in AuthContext with toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramLogin = async () => {
    setInstagramStarting(true);
    setInstagramStatusMessage('');

    // Remembered so the callback knows which role to create if this turns
    // out to be a signup.
    localStorage.setItem('famee_instagram_role', selectedRole);

    try {
      // Redirects the browser on success; nothing below runs.
      await startInstagramAuth(selectedRole);
    } catch (error) {
      const message = getInstagramErrorMessage(error, 'Instagram login is temporarily unavailable.');
      setInstagramStatusMessage(message);
      toast.error(message);
      setInstagramStarting(false);
    }
  };

  const googleResponse = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Invalid Google response");
      return;
    }

    setIsLoading(true);
    try {
      const userRole = await loginWithGoogle(idToken, selectedRole);

      const savedUser = localStorage.getItem('famee_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      if (currentUser?.has_profile === false) {
        navigate(`/${userRole}/setup`);
      } else {
        navigate(`/${userRole}/dashboard`);
      }
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoading(false);
    }
  };

  const InstagramLoginButton = () => (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleInstagramLogin}
        disabled={instagramStarting}
        className="h-10 w-full rounded-full font-medium"
      >
        <Instagram />
        {instagramStarting ? 'Opening Instagram…' : 'Continue with Instagram'}
      </Button>
      {instagramStatusMessage && (
        <p className="text-center text-xs text-muted-foreground">{instagramStatusMessage}</p>
      )}
    </div>
  );

  const GoogleLoginButton = () =>
    GOOGLE_CLIENT_ID ? (
      <GoogleButton
        onCredential={googleResponse}
        text={activeTab === 'signup' ? 'signup_with' : 'signin_with'}
      />
    ) : (
      <Button type="button" variant="outline" className="h-10 w-full rounded-full" disabled>
        Google sign-in needs VITE_GOOGLE_CLIENT_ID in .env
      </Button>
    );

  const divider = (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="eyebrow bg-background px-3">Or with email</span>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Sign In or Sign Up - FameSync</title>
        <meta name="description" content="Join FameSync to connect with brands or find creators for authentic collaborations. Sign up free or sign in to your account." />
        <meta name="keywords" content="famesync login, influencer signup, brand registration, creator account" />
        <link rel="canonical" href="https://famesync.com/auth" />
        <meta property="og:title" content="Sign In or Sign Up - FameSync" />
        <meta property="og:description" content="Join FameSync to connect with brands or find creators." />
        <meta property="og:url" content="https://famesync.com/auth" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        {/* ------------------------------------------- brand panel (lg only) */}
        <aside className="sticky top-0 hidden h-screen w-[46%] flex-col justify-between overflow-hidden bg-ink p-12 text-ink-foreground lg:flex xl:p-14">
          <Link to="/" className="w-fit font-display text-[1.75rem] font-black tracking-[-0.04em]">
            FameSync
          </Link>

          <div>
            <p className="eyebrow mb-5 text-ink-muted">{activeTab === 'signin' ? 'Welcome back' : panel.eyebrow}</p>
            <h2 className="font-display text-[clamp(44px,4.6vw,72px)] font-black uppercase leading-[0.92] tracking-[-0.045em]">
              {activeTab === 'signin' ? 'Good to' : panel.title}
              <br />
              <span className="brand-gradient-text">{activeTab === 'signin' ? 'see you.' : panel.highlight}</span>
            </h2>

            {activeTab === 'signin' ? (
              <p className="mt-7 max-w-[40ch] text-lg leading-relaxed text-ink-muted">
                Your briefs, applications and approvals are right where you left them.
              </p>
            ) : (
              <ol className="mt-10 max-w-[480px] border-t border-ink-border">
                {panel.steps.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[40px_1fr] border-b border-ink-border py-4">
                    <span className="num pt-0.5 text-sm text-primary">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <dl className="grid grid-cols-3 gap-6">
            {FACTS.slice(0, 3).map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="num block text-[2rem] leading-none">{fact.value}</span>
                  <span className="mt-2 block text-xs leading-relaxed text-ink-muted">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* -------------------------------------------------------- form side */}
        <div className="flex w-full flex-col lg:w-[54%]">
          <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link
              to="/"
              className="font-display text-[1.25rem] font-black tracking-[-0.04em] lg:invisible"
            >
              FameSync
            </Link>
            <Button asChild variant="ghost" size="sm" className="h-11">
              <Link to="/">
                <ArrowLeft />
                Back
              </Link>
            </Button>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-8">
            <div className="w-full max-w-md">
              {showVerificationMessage ? (
                <Rise>
                  <Card className="rounded-2xl shadow-e2">
                    <CardHeader className="items-center pb-4 text-center">
                      <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                        <MailCheck className="size-8" />
                      </span>
                      <CardTitle className="text-display-3">Check your email</CardTitle>
                      <CardDescription className="text-[0.9375rem]">
                        We&apos;ve sent a verification link to
                        <br />
                        <strong className="font-semibold text-foreground">{registeredEmail}</strong>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                        Click the link in your email to activate your account. The link expires in 24
                        hours.
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => navigate('/verify-email')}
                          variant="outline"
                          className="w-full"
                        >
                          Resend verification email
                        </Button>
                        <Button
                          onClick={() => {
                            setShowVerificationMessage(false);
                            setActiveTab('signin');
                          }}
                          variant="ghost"
                          className="w-full"
                        >
                          Back to sign in
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Rise>
              ) : (
                <Rise>
                  <div className="mb-8">
                    <h1 className="font-display text-[2.5rem] leading-[1.02] tracking-[-0.04em]">
                      {activeTab === 'signin'
                        ? 'Sign in'
                        : selectedRole === 'brand'
                          ? 'Create a brand account'
                          : 'Create a creator account'}
                    </h1>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {activeTab === 'signin' ? (
                        <>
                          New to FameSync?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('signup')}
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            Create an account
                          </button>
                        </>
                      ) : (
                        <>
                          Free to join. Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('signin')}
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="space-y-6">
                      {activeTab === 'signup' && (
                        <fieldset>
                          <legend className="mb-3 text-sm font-semibold">I&apos;m joining as a</legend>
                          <div className="grid grid-cols-2 gap-3">
                            {ROLES.map(({ key, label, note, Icon }) => {
                              const isSelected = selectedRole === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedRole(key)}
                                  className={cn(
                                    'flex items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left',
                                    'transition-[border-color,background-color] duration-200',
                                    isSelected
                                      ? 'border-primary bg-secondary'
                                      : 'border-border bg-card hover:border-muted-foreground/40',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'inline-flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10',
                                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                    )}
                                  >
                                    <Icon className="size-[18px]" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block font-semibold">{label}</span>
                                    <span className="block text-xs leading-snug text-muted-foreground">{note}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      )}

                      {activeTab === 'signin' ? (
                        <form onSubmit={handleSignIn} className="space-y-5">
                          {HAS_SOCIAL && (
                            <>
                              {/* capped at 400px: the widest Google's official button draws */}
                              <div className="mx-auto w-full max-w-[400px] space-y-3">
                                {INSTAGRAM_LOGIN_ENABLED && <InstagramLoginButton />}
                                {SHOW_GOOGLE && <GoogleLoginButton />}
                              </div>

                              {divider}
                            </>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="signin-identifier">Username or email</Label>
                            <div className="group relative">
                              <UserCircle className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                              <Input
                                id="signin-identifier"
                                type="text"
                                placeholder="Enter username or email"
                                className="pl-11"
                                value={signInData.identifier}
                                onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <Label htmlFor="signin-password">Password</Label>
                              <Link
                                to="/forgot-password"
                                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <div className="group relative">
                              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                              <Input
                                id="signin-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className="pl-11 pr-14"
                                value={signInData.password}
                                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                required
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
                          </div>

                          <Button type="submit" variant="form" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <>
                                Sign in
                                <ArrowRight />
                              </>
                            )}
                          </Button>

                        </form>
                      ) : (
                        <form onSubmit={handleSignUp} className="space-y-4">
                          {HAS_SOCIAL && (
                            <>
                              {/* capped at 400px: the widest Google's official button draws */}
                              <div className="mx-auto w-full max-w-[400px] space-y-3">
                                {INSTAGRAM_LOGIN_ENABLED && <InstagramLoginButton />}
                                {SHOW_GOOGLE && <GoogleLoginButton />}
                              </div>

                              {divider}
                            </>
                          )}

                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="signup-firstname">First name</Label>
                              <Input
                                id="signup-firstname"
                                type="text"
                                placeholder="Aarav"
                                value={signUpData.firstName}
                                onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="signup-lastname">Last name</Label>
                              <Input
                                id="signup-lastname"
                                type="text"
                                placeholder="Sharma"
                                value={signUpData.lastName}
                                onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-username">Username</Label>
                            <div className="group relative">
                              <UserCircle className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                              <Input
                                id="signup-username"
                                type="text"
                                placeholder="Choose a username"
                                className="pl-11"
                                value={signUpData.username}
                                onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                                required
                              />
                            </div>
                            <AvailabilityIndicator
                              status={usernameAvailability.status}
                              message={usernameAvailability.message}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="group relative">
                              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-11"
                                value={signUpData.email}
                                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                required
                              />
                            </div>
                            <AvailabilityIndicator
                              status={emailAvailability.status}
                              message={emailAvailability.message}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="group relative">
                              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                              <Input
                                id="signup-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                className="pl-11 pr-14"
                                value={signUpData.password}
                                onChange={(e) => {
                                  setSignUpData({ ...signUpData, password: e.target.value });
                                  setPasswordError('');
                                }}
                                required
                                minLength={8}
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
                            <PasswordStrength password={signUpData.password} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm-password">Confirm password</Label>
                            <div className="group relative">
                              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                              <Input
                                id="signup-confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                aria-invalid={Boolean(passwordError)}
                                className="pl-11 pr-14"
                                value={signUpData.confirmPassword}
                                onChange={(e) => {
                                  setSignUpData({ ...signUpData, confirmPassword: e.target.value });
                                  setPasswordError('');
                                }}
                                required
                                minLength={8}
                              />
                              <button
                                type="button"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                              </button>
                            </div>
                            {passwordError && (
                              <p className="text-sm font-medium text-destructive">{passwordError}</p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            variant="form"
                            className="mt-2 w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <>
                                Create account
                                <ArrowRight />
                              </>
                            )}
                          </Button>

                        </form>
                      )}
                  </div>

                  <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
                    By continuing, you agree to our{' '}
                    <Link to="/terms" className="font-semibold text-primary underline-offset-4 hover:underline">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="font-semibold text-primary underline-offset-4 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </Rise>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
