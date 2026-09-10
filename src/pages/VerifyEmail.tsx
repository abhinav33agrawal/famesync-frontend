import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Mail, 
  ArrowRight,
  RefreshCw,
  MailOpen,
  PartyPopper,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

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

// Loading skeleton for the page
const PageSkeleton = () => (
  <div className="w-full max-w-md">
    <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
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

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary" />
          </motion.div>
        );
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 bg-success/20 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-br from-success to-emerald-500 p-5 rounded-full">
              <PartyPopper className="h-10 w-10 text-white" />
            </div>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="bg-gradient-to-br from-destructive to-red-600 p-5 rounded-full">
              <ShieldAlert className="h-10 w-10 text-white" />
            </div>
          </motion.div>
        );
      case 'resend':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="bg-gradient-to-br from-primary to-accent p-5 rounded-full">
              <MailOpen className="h-10 w-10 text-white" />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-40" />
        
        <FloatingOrb className="w-[400px] h-[400px] bg-white/10 top-0 -left-40" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-white/10 -bottom-20 -right-40" delay={2} />
        <FloatingOrb className="w-[300px] h-[300px] bg-white/5 top-1/3 right-1/4" delay={4} />
        
        <div className="absolute inset-0 opacity-20" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center group w-fit">
            <span className="font-display font-semibold tracking-[-0.035em] text-white text-4xl">FameSync</span>
          </Link>
          
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Animated mail icon */}
              <motion.div
                className="mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Mail className="w-12 h-12" />
                </div>
              </motion.div>
              
              <h2 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
                Verify your
                <br />
                <span className="text-white/80">email address</span>
              </h2>
              <p className="text-xl text-white/70 max-w-md leading-relaxed">
                We need to confirm your email to keep your account secure and enable all features.
              </p>
            </motion.div>
          </div>
          
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-md"
          >
            <p className="font-semibold mb-2">Why verify?</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                Secure your account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                Receive important notifications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white/60" />
                Unlock all platform features
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 relative">
        <div className="absolute inset-0 opacity-30 lg:opacity-0" />
        <FloatingOrb className="w-[300px] h-[300px] bg-primary/10 top-0 right-0 lg:hidden" delay={0} />
        <FloatingOrb className="w-[250px] h-[250px] bg-accent/10 bottom-20 left-0 lg:hidden" delay={2} />
        
        {/* Mobile header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden relative z-20 p-4"
        >
          <Link to="/" className="flex items-center">
            <span className="font-display font-semibold tracking-[-0.035em] text-foreground">FameSync</span>
          </Link>
        </motion.header>

        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen p-6 lg:p-12">
          <AnimatePresence mode="wait">
            {status === 'loading' && !searchParams.get('token') ? (
              <PageSkeleton />
            ) : (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
              >
                <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      {getStatusIcon()}
                    </div>
                    
                    <CardTitle className="text-3xl font-bold">
                      {status === 'loading' && 'Verifying...'}
                      {status === 'success' && 'Email Verified!'}
                      {status === 'error' && 'Verification Failed'}
                      {status === 'resend' && 'Resend Verification'}
                    </CardTitle>
                    
                    <CardDescription className="mt-2 text-base">
                      {status === 'loading' && 'Please wait while we verify your email.'}
                      {status === 'success' && 'Your email has been verified successfully.'}
                      {status === 'error' && "We couldn't verify your email address."}
                      {status === 'resend' && 'Enter your email to receive a new link.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {message && status !== 'loading' && (
                      <Alert className={
                        status === 'success' 
                          ? 'bg-success/10 border-success/20' 
                          : 'bg-destructive/10 border-destructive/20'
                      }>
                        <AlertDescription className="flex items-center gap-2">
                          {status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          {message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {status === 'resend' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email Address
                          </Label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10 h-12 border-2 border-border/50 focus:border-primary bg-background/50"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={handleResendEmail}
                            disabled={resending}
                            className="w-full h-12 bg-primary text-white font-semibold shadow-lg shadow-primary/25"
                          >
                            {resending ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                            ) : (
                              <span className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Resend Verification Email
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {status === 'success' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="text-center text-sm text-muted-foreground">
                          Redirecting to profile setup in {countdown}s...
                        </div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 5, ease: "linear" }}
                          className="h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </motion.div>
                    )}

                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <Button
                          onClick={() => setStatus('resend')}
                          variant="outline"
                          className="w-full h-11"
                        >
                          Request New Verification Email
                        </Button>
                      </motion.div>
                    )}

                    {(status === 'success' || status === 'error' || status === 'resend') && (
                      <Link to="/auth" className="block">
                        <Button variant="ghost" className="w-full h-11">
                          Back to Sign In
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
