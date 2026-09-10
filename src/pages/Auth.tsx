import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle2,
  Star,
  Sparkles
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAvailabilityCheck } from '@/hooks/useAvailabilityCheck';
import { AvailabilityIndicator } from '@/components/AvailabilityIndicator';
import {
  fetchInstagramServiceProvidersStatus,
  getInstagramServiceLoginUrl,
  isInstagramServiceConfigured,
} from '@/lib/instagramService';

// Floating orb component
const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Animated input wrapper
const AnimatedInput = ({
  children,
  index
}: {
  children: React.ReactNode;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * index, duration: 0.4 }}
  >
    {children}
  </motion.div>
);

// Password strength indicator
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
  const colors = ['bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2"
    >
      <div className="flex gap-1 mb-1">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? colors[strength - 1] : 'bg-muted'
              }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
      <p className={`text-xs ${strength > 2 ? 'text-success' : 'text-muted-foreground'}`}>
        {labels[strength - 1] || 'Too short'}
      </p>
    </motion.div>
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
  const [instagramServiceAvailable, setInstagramServiceAvailable] = useState(false);
  const [instagramServiceStatusMessage, setInstagramServiceStatusMessage] = useState('');

  // Real-time availability checks with debouncing
  const usernameAvailability = useAvailabilityCheck('username', signUpData.username, 400);
  const emailAvailability = useAvailabilityCheck('email', signUpData.email, 400);
  const instagramServiceReady = isInstagramServiceConfigured();
  const instagramLoginUrl = getInstagramServiceLoginUrl();

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

  useEffect(() => {
    let isMounted = true;

    if (!instagramServiceReady) {
      setInstagramServiceAvailable(false);
      setInstagramServiceStatusMessage('Instagram login will be enabled once the service URL is configured.');
      return () => {
        isMounted = false;
      };
    }

    fetchInstagramServiceProvidersStatus()
      .then((status) => {
        if (!isMounted) {
          return;
        }

        const instagramReady = Boolean(status.instagram.configured && status.instagram.ready);
        setInstagramServiceAvailable(instagramReady);
        const databaseHelp = !status.database.configured
          ? 'Instagram login needs the websocket backend to be connected to MySQL.'
          : !status.database.ready
            ? 'Instagram login is waiting for the websocket backend to reconnect to MySQL.'
            : '';
        setInstagramServiceStatusMessage(
          status.instagram.disabledReason ||
            databaseHelp ||
            status.database.message ||
            (instagramReady ? '' : 'Instagram login is temporarily unavailable.')
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setInstagramServiceAvailable(false);
        setInstagramServiceStatusMessage('Instagram login is temporarily unavailable.');
      });

    return () => {
      isMounted = false;
    };
  }, [instagramServiceReady]);

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

  const handleInstagramLogin = () => {
    if (!instagramServiceReady || !instagramLoginUrl) {
        toast.error('Instagram service is not configured yet.');
        return;
    }

    if (!instagramServiceAvailable) {
        toast.error(instagramServiceStatusMessage || 'Instagram login is temporarily unavailable.');
        return;
    }

    localStorage.setItem('famee_instagram_role', selectedRole);
    window.location.href = instagramLoginUrl;
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
        disabled={!instagramServiceReady || !instagramServiceAvailable}
        className="w-full h-12 border-2 border-border/50 hover:border-primary/50 bg-background/50 hover:bg-background text-base font-medium rounded-xl transition-all"
      >
        <Instagram className="w-5 h-5 mr-2" />
        Continue with Instagram
      </Button>
      {(!instagramServiceReady || !instagramServiceAvailable) && (
        <p className="text-xs text-muted-foreground text-center">
          {instagramServiceStatusMessage || 'Instagram login is temporarily unavailable.'}
        </p>
      )}
    </div>
  );

  const GoogleLoginButton = () => (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="relative h-12 flex items-center justify-center group overflow-hidden rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all bg-background/50">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="font-medium">Continue with Google</span>
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
      <div className="min-h-screen relative overflow-hidden flex">
        {/* Left Panel - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0 opacity-40" />

          {/* Floating orbs */}
          <FloatingOrb className="w-[400px] h-[400px] bg-white/10 top-0 -left-40" delay={0} />
          <FloatingOrb className="w-[500px] h-[500px] bg-white/10 -bottom-20 -right-40" delay={2} />
          <FloatingOrb className="w-[300px] h-[300px] bg-white/5 top-1/3 right-1/4" delay={4} />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            <Link to="/" className="flex items-center group w-fit">
              <span className="font-display font-semibold tracking-[-0.035em] text-white text-4xl">FameSync</span>
            </Link>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h2 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
                  Where creators
                  <br />
                  <span className="text-white/80">and brands meets</span>
                </h2>
                <p className="text-xl text-white/70 max-w-md leading-relaxed">
                  We're building a simple way to connect micro-creators with brands. Join our early community.
                </p>
              </motion.div>

              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4"
              >
                {[
                  'Simple campaign discovery',
                  'Direct brand communication',
                  'No complicated setup'
                ].map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Early Access Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-sm">Early Access</span>
              </div>
              <p className="text-white/90 mb-4">
                We're currently in beta, working closely with our first users to improve the platform. Your feedback helps shape what we build next.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                  🚀
                </div>
                <div>
                  <p className="font-semibold text-sm">Join the Beta</p>
                  <p className="text-xs text-white/60">Help us build something great</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 relative">
          {/* Mobile background */}
          <div className="absolute inset-0 opacity-30 lg:opacity-0" />
          <FloatingOrb className="w-[300px] h-[300px] bg-primary/10 top-0 right-0 lg:hidden" delay={0} />
          <FloatingOrb className="w-[250px] h-[250px] bg-accent/10 bottom-20 left-0 lg:hidden" delay={2} />

          {/* Header for mobile */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden relative z-20 p-4"
          >
            <Link to="/" className="flex items-center">
              <span className="font-display font-semibold tracking-[-0.035em] text-foreground">FameSync</span>
            </Link>
          </motion.header>

          {/* Back button for desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:block absolute top-6 right-6 z-20"
          >
            <Link to="/">
              <Button variant="ghost" className="gap-2 hover:bg-primary hover:text-white transition-all">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </motion.div>

          {/* Main form area */}
          <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen p-6 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <AnimatePresence mode="wait">
                {showVerificationMessage ? (
                  <motion.div
                    key="verification"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
                      <CardHeader className="text-center pb-6">
                        <motion.div
                          className="flex justify-center mb-4"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative bg-gradient-to-br from-primary to-accent p-5 rounded-full">
                              <MailCheck className="h-10 w-10 text-white" />
                            </div>
                          </div>
                        </motion.div>
                        <CardTitle className="text-3xl font-bold">Check Your Email</CardTitle>
                        <CardDescription className="mt-2 text-base">
                          We've sent a verification link to
                          <br />
                          <strong className="text-foreground">{registeredEmail}</strong>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert className="bg-primary/5 border-primary/20">
                          <AlertDescription className="text-sm">
                            Click the link in your email to activate your account.
                            The link expires in 24 hours.
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2 pt-2">
                          <Button
                            onClick={() => navigate('/verify-email')}
                            variant="outline"
                            className="w-full h-11"
                          >
                            Resend Verification Email
                          </Button>
                          <Button
                            onClick={() => {
                              setShowVerificationMessage(false);
                              setActiveTab('signin');
                            }}
                            variant="ghost"
                            className="w-full h-11"
                          >
                            Back to Sign In
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-8">
                      <motion.h1
                        className="text-3xl lg:text-4xl font-bold mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeTab}
                      >
                        {activeTab === 'signin' ? 'Welcome back' : 'Create account'}
                      </motion.h1>
                      <p className="text-muted-foreground">
                        {activeTab === 'signin'
                          ? 'Sign in to continue to FameSync'
                          : 'Start your journey with FameSync'}
                      </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="relative mb-8">
                      <div className="flex bg-muted rounded-xl p-1">
                        {(['signin', 'signup'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all relative z-10 ${activeTab === tab
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                          </button>
                        ))}
                        <motion.div
                          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg shadow-lg"
                          animate={{ x: activeTab === 'signin' ? 4 : 'calc(100% + 4px)' }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      </div>
                    </div>

                    {/* Role Selector for Signup */}
                    <AnimatePresence>
                      {activeTab === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <p className="text-sm font-medium mb-3">I am a...</p>
                          <div className="grid grid-cols-2 gap-3">
                            {(['influencer', 'brand'] as const).map((role) => {
                              const Icon = role === 'influencer' ? User : Building2;
                              const isSelected = selectedRole === role;
                              return (
                                <motion.button
                                  key={role}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedRole(role)}
                                  className={`relative p-4 rounded-xl border-2 transition-all ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/30'
                                    }`}
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={`p-2 rounded-lg ${isSelected
                                      ? 'bg-primary text-white'
                                      : 'bg-muted text-muted-foreground'
                                      }`}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`font-medium capitalize ${isSelected ? 'text-primary' : ''
                                      }`}>
                                      {role}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      layoutId="role-check"
                                      className="absolute top-2 right-2"
                                    >
                                      <CheckCircle2 className="w-5 h-5 text-primary" />
                                    </motion.div>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                      {activeTab === 'signin' ? (
                        <motion.form
                          key="signin-form"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onSubmit={handleSignIn}
                          className="space-y-5"
                        >
                          <AnimatedInput index={0}>
                            <div className="space-y-2">
                              <Label htmlFor="signin-identifier" className="text-sm font-medium">
                                Username or Email
                              </Label>
                              <div className="relative group">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="signin-identifier"
                                  type="text"
                                  placeholder="Enter username or email"
                                  className="pl-10 h-12 focus:border-primary bg-background/50 transition-all"
                                  value={signInData.identifier}
                                  onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                          </AnimatedInput>

                          <AnimatedInput index={1}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="signin-password" className="text-sm font-medium">
                                  Password
                                </Label>
                                <Link
                                  to="/forgot-password"
                                  className="text-sm text-primary hover:underline font-medium"
                                >
                                  Forgot?
                                </Link>
                              </div>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="signin-password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter your password"
                                  className="pl-10 pr-10 h-12 focus:border-primary bg-background/50 transition-all"
                                  value={signInData.password}
                                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </div>
                          </AnimatedInput>

                          <AnimatedInput index={2}>
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <Button
                                type="submit"
                                className="w-full h-12 bg-primary text-white font-semibold text-base shadow-lg shadow-primary/25"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                  />
                                ) : (
                                  <span className="flex items-center gap-2">
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                  </span>
                                )}
                              </Button>
                            </motion.div>
                          </AnimatedInput>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border/50"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <InstagramLoginButton />
                            <GoogleLoginButton />
                          </div>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="signup-form"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={handleSignUp}
                          className="space-y-4"
                        >
                          <AnimatedInput index={0}>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="signup-firstname" className="text-sm font-medium">
                                  First Name
                                </Label>
                                <Input
                                  id="signup-firstname"
                                  type="text"
                                  placeholder="John"
                                  className="h-11 focus:border-primary bg-background/50"
                                  value={signUpData.firstName}
                                  onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="signup-lastname" className="text-sm font-medium">
                                  Last Name
                                </Label>
                                <Input
                                  id="signup-lastname"
                                  type="text"
                                  placeholder="Doe"
                                  className="h-11 focus:border-primary bg-background/50"
                                  value={signUpData.lastName}
                                  onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                          </AnimatedInput>

                          <AnimatedInput index={1}>
                            <div className="space-y-2">
                              <Label htmlFor="signup-username" className="text-sm font-medium">
                                Username
                              </Label>
                              <div className="relative group">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="signup-username"
                                  type="text"
                                  placeholder="Choose a username"
                                  className="pl-10 h-11 focus:border-primary bg-background/50"
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
                          </AnimatedInput>

                          <AnimatedInput index={2}>
                            <div className="space-y-2">
                              <Label htmlFor="signup-email" className="text-sm font-medium">
                                Email
                              </Label>
                              <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="signup-email"
                                  type="email"
                                  placeholder="you@example.com"
                                  className="pl-10 h-11 focus:border-primary bg-background/50"
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
                          </AnimatedInput>

                          <AnimatedInput index={3}>
                            <div className="space-y-2">
                              <Label htmlFor="signup-password" className="text-sm font-medium">
                                Password
                              </Label>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="signup-password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Create a strong password"
                                  className="pl-10 pr-10 h-11 focus:border-primary bg-background/50"
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
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              <PasswordStrength password={signUpData.password} />
                            </div>
                          </AnimatedInput>

                          <AnimatedInput index={4}>
                            <div className="space-y-2">
                              <Label htmlFor="signup-confirm-password" className="text-sm font-medium">
                                Confirm Password
                              </Label>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="signup-confirm-password"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm your password"
                                  className={`pl-10 pr-10 h-11 bg-background/50 transition-all ${passwordError
                                    ? 'border-destructive focus:border-destructive'
                                    : 'focus:border-primary'
                                    }`}
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
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {passwordError && (
                                <motion.p
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-sm text-destructive flex items-center gap-1"
                                >
                                  {passwordError}
                                </motion.p>
                              )}
                            </div>
                          </AnimatedInput>

                          <AnimatedInput index={5}>
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className="pt-2"
                            >
                              <Button
                                type="submit"
                                className="w-full h-12 bg-primary text-white font-semibold text-base shadow-lg shadow-primary/25"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                  />
                                ) : (
                                  <span className="flex items-center gap-2">
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                  </span>
                                )}
                              </Button>
                            </motion.div>
                          </AnimatedInput>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border/50"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <InstagramLoginButton />
                            <GoogleLoginButton />
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Footer */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-sm text-muted-foreground mt-8"
                    >
                      By continuing, you agree to our{' '}
                      <Link to="/terms" className="text-primary hover:underline font-medium">
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
