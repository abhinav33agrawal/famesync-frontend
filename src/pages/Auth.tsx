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
  Check,
  Loader2,
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAvailabilityCheck } from '@/hooks/useAvailabilityCheck';
import { AvailabilityIndicator } from '@/components/AvailabilityIndicator';
import { getInstagramErrorMessage, startInstagramAuth } from '@/lib/instagram';

/* Removed from the old Auth.tsx: the floating-orb blobs, the AnimatedInput
   slide wrapper, the spring tab indicator, the ping ring behind the mail
   icon, the gradient icon tiles and every hard-coded white / heavy shadow. */

const PITCH_POINTS = [
  'Simple campaign discovery',
  'Direct brand communication',
  'No complicated setup',
];

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

    // Check username availability and validity
    if (usernameAvailability.status === 'invalid') {
      toast.error(usernameAvailability.message);
      return;
    }
    if (usernameAvailability.status === 'taken') {
      toast.error('Username is already taken. Please choose another one.');
      return;
    }
    if (usernameAvailability.status === 'checking') {
      toast.error('Please wait while we check username availability');
      return;
    }
    if (usernameAvailability.status !== 'available') {
      toast.error('Please enter a valid username');
      return;
    }

    // Check email availability and validity
    if (emailAvailability.status === 'invalid') {
      toast.error(emailAvailability.message);
      return;
    }
    if (emailAvailability.status === 'taken') {
      toast.error('This email is already registered. Please sign in or use a different email.');
      return;
    }
    if (emailAvailability.status === 'checking') {
      toast.error('Please wait while we check email availability');
      return;
    }
    if (emailAvailability.status !== 'available') {
      toast.error('Please enter a valid email address');
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
        className="h-12 w-full font-medium"
      >
        <Instagram />
        {instagramStarting ? 'Opening Instagram…' : 'Continue with Instagram'}
      </Button>
      {instagramStatusMessage && (
        <p className="text-center text-xs text-muted-foreground">{instagramStatusMessage}</p>
      )}
    </div>
  );

  const GoogleLoginButton = () => (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="relative flex h-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-muted">
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            {/* Google's mark keeps its brand colours by licence */}
            <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-[0.95rem] font-semibold">Continue with Google</span>
          </div>
        </div>
        <div className="absolute inset-0 z-20 opacity-[0.01]">
          <GoogleLogin
            onSuccess={googleResponse}
            onError={() =>
              toast.error("Google sign-in failed. Check that localhost:8080 is allowed in your Google client origins.")
            }
            useOneTap={false}
            width="400"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );

  const divider = (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="eyebrow bg-card px-3">Or continue with</span>
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
        <aside className="wash hidden w-1/2 flex-col justify-between border-r border-border p-12 lg:flex xl:p-14">
          <Link
            to="/"
            className="w-fit font-display text-[1.75rem] font-semibold tracking-[-0.035em] text-foreground"
          >
            FameSync
          </Link>

          <div>
            <span className="mb-7 inline-flex items-center gap-2.5 rounded-full bg-card py-1.5 pl-2.5 pr-3.5 shadow-e1">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-xs font-semibold tracking-wide text-primary">
                Early access — India first
              </span>
            </span>

            <h2 className="max-w-[16ch] font-display text-display-2">
              Where creators and brands meet.
            </h2>

            <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">
              A simple way to connect micro-creators with brands. Join the early community.
            </p>

            <ul className="mt-9 grid gap-3.5">
              {PITCH_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[0.9375rem]">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-e1">
                    <Check className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <Card className="max-w-md rounded-2xl p-6">
            <span className="eyebrow">Early access</span>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We&apos;re in beta, working closely with our first users. Your feedback shapes what we
              build next.
            </p>
          </Card>
        </aside>

        {/* -------------------------------------------------------- form side */}
        <div className="flex w-full flex-col lg:w-1/2">
          <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link
              to="/"
              className="font-display text-[1.25rem] font-semibold tracking-[-0.035em] text-foreground lg:invisible"
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
                    <p className="eyebrow mb-3">
                      {activeTab === 'signin' ? 'Sign in' : 'Create account'}
                    </p>
                    <h1 className="font-display text-display-2">
                      {activeTab === 'signin' ? 'Welcome back.' : 'Get started.'}
                    </h1>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {activeTab === 'signin'
                        ? 'Sign in to continue to FameSync.'
                        : 'Start your journey with FameSync.'}
                    </p>
                  </div>

                  {/* segmented control */}
                  <div
                    role="tablist"
                    aria-label="Authentication mode"
                    className="mb-7 flex gap-1 rounded-xl bg-muted p-1"
                  >
                    {(['signin', 'signup'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'h-11 flex-1 rounded-lg text-sm font-semibold transition-colors duration-200',
                          activeTab === tab
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {tab === 'signin' ? 'Sign in' : 'Sign up'}
                      </button>
                    ))}
                  </div>

                  <Card className="rounded-2xl shadow-e1">
                    <CardContent className="space-y-5 pt-5 sm:pt-6">
                      {activeTab === 'signup' && (
                        <fieldset>
                          <legend className="mb-3 text-sm font-semibold">I am a…</legend>
                          <div className="grid grid-cols-2 gap-3">
                            {(['influencer', 'brand'] as const).map((role) => {
                              const Icon = role === 'influencer' ? User : Building2;
                              const isSelected = selectedRole === role;
                              return (
                                <button
                                  key={role}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedRole(role)}
                                  className={cn(
                                    'relative flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-lg border p-4',
                                    'transition-[border-color,background-color] duration-200',
                                    isSelected
                                      ? 'border-primary bg-secondary'
                                      : 'border-border hover:bg-muted',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'inline-flex size-9 items-center justify-center rounded-md',
                                      isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                    )}
                                  >
                                    <Icon className="size-[18px]" />
                                  </span>
                                  <span
                                    className={cn(
                                      'text-sm font-semibold capitalize',
                                      isSelected ? 'text-primary' : 'text-foreground',
                                    )}
                                  >
                                    {role}
                                  </span>
                                  {isSelected && (
                                    <Check className="absolute right-2.5 top-2.5 size-4 text-primary" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      )}

                      {activeTab === 'signin' ? (
                        <form onSubmit={handleSignIn} className="space-y-5">
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
                                Forgot?
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

                          {divider}

                          <div className="space-y-3">
                            <InstagramLoginButton />
                            <GoogleLoginButton />
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleSignUp} className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="signup-firstname">First name</Label>
                              <Input
                                id="signup-firstname"
                                type="text"
                                placeholder="John"
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
                                placeholder="Doe"
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
                            className="mt-1 w-full"
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

                          {divider}

                          <div className="space-y-3">
                            <InstagramLoginButton />
                            <GoogleLoginButton />
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>

                  <p className="mt-7 text-center text-sm leading-relaxed text-muted-foreground">
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
