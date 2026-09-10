import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, MailCheck, KeyRound, ArrowRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api/auth';
import { emailSchema } from '@/lib/validation/auth';
import { toast } from 'sonner';

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
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-instagram" />
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        
        <FloatingOrb className="w-[400px] h-[400px] bg-white/10 top-0 -left-40" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-white/10 -bottom-20 -right-40" delay={2} />
        <FloatingOrb className="w-[300px] h-[300px] bg-white/5 top-1/3 right-1/4" delay={4} />
        
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center group w-fit">
            <span className="brand text-white text-4xl">FameSync</span>
          </Link>
          
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Animated lock icon */}
              <motion.div
                className="mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <KeyRound className="w-12 h-12" />
                </div>
              </motion.div>
              
              <h2 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
                Forgot your
                <br />
                <span className="text-white/80">password?</span>
              </h2>
              <p className="text-xl text-white/70 max-w-md leading-relaxed">
                No worries! Enter your email and we'll send you a secure link to reset your password.
              </p>
            </motion.div>
          </div>
          
          {/* Security note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass-card rounded-2xl p-6 max-w-md"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold mb-1">Secure Reset Process</p>
                <p className="text-sm text-white/70">
                  Reset links expire in 1 hour for your security. Never share your reset link with anyone.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 relative">
        <div className="absolute inset-0 mesh-gradient opacity-30 lg:opacity-0" />
        <FloatingOrb className="w-[300px] h-[300px] bg-primary/10 top-0 right-0 lg:hidden" delay={0} />
        <FloatingOrb className="w-[250px] h-[250px] bg-accent/10 bottom-20 left-0 lg:hidden" delay={2} />
        
        {/* Mobile header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden relative z-20 p-4"
        >
          <Link to="/" className="flex items-center">
            <span className="brand gradient-text">FameSync</span>
          </Link>
        </motion.header>
        
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:block absolute top-6 right-6 z-20"
        >
          <Link to="/auth">
            <Button variant="ghost" className="gap-2 hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </motion.div>

        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <AnimatePresence mode="wait">
              {emailSent ? (
                <motion.div
                  key="success"
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
                        We've sent reset instructions to
                        <br />
                        <strong className="text-foreground">{email}</strong>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert className="bg-primary/5 border-primary/20">
                        <AlertDescription className="text-sm">
                          Click the link in your email to reset your password.
                          The link expires in 1 hour.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2 pt-2">
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={() => setEmailSent(false)}
                            variant="outline"
                            className="w-full h-11"
                          >
                            Send Again
                          </Button>
                        </motion.div>
                        <Link to="/auth" className="block">
                          <Button variant="ghost" className="w-full h-11">
                            Back to Sign In
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="inline-flex mb-6"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <KeyRound className="w-8 h-8 text-primary" />
                      </div>
                    </motion.div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Forgot Password?</h1>
                    <p className="text-muted-foreground">
                      No problem. We'll send you reset instructions.
                    </p>
                  </div>

                  {/* Mobile back link */}
                  <Link to="/auth" className="lg:hidden block mb-6">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </Link>

                  <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email Address
                          </Label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              className={`pl-10 h-12 border-2 bg-background/50 transition-all ${
                                errors.email 
                                  ? 'border-destructive focus:border-destructive' 
                                  : 'border-border/50 focus:border-primary'
                              }`}
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({});
                              }}
                            />
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-destructive"
                            >
                              {errors.email}
                            </motion.p>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 gradient-instagram text-white font-semibold text-base shadow-lg shadow-primary/25 shimmer"
                          >
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                            ) : (
                              <span className="flex items-center gap-2">
                                Send Reset Link
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </CardContent>
                  </Card>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-sm text-muted-foreground mt-6"
                  >
                    Remember your password?{' '}
                    <Link to="/auth" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
