import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowRight,
  ShieldCheck,
  PartyPopper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api/auth';
import { passwordResetSchema, type PasswordResetFormData } from '@/lib/validation/auth';
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
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-muted'
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

// Password requirement checker
const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 space-y-1.5"
    >
      {requirements.map((req, i) => (
        <motion.div
          key={req.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2 text-xs"
        >
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            req.met ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
          }`}>
            {req.met && <CheckCircle2 className="w-3 h-3" />}
          </div>
          <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
            {req.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
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
              {/* Animated shield icon */}
              <motion.div
                className="mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12" />
                </div>
              </motion.div>
              
              <h2 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
                Create a new
                <br />
                <span className="text-white/80">secure password</span>
              </h2>
              <p className="text-xl text-white/70 max-w-md leading-relaxed">
                Choose a strong password that you haven't used before. A good password includes letters, numbers, and special characters.
              </p>
            </motion.div>
          </div>
          
          {/* Security tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-md"
          >
            <p className="font-semibold mb-3">Password tips:</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Use a mix of letters, numbers & symbols
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Avoid personal information
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Don't reuse passwords from other sites
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <AnimatePresence mode="wait">
              {success ? (
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
                          <motion.div
                            className="absolute inset-0 bg-success/20 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <div className="relative bg-gradient-to-br from-success to-emerald-500 p-5 rounded-full">
                            <PartyPopper className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      </motion.div>
                      <CardTitle className="text-3xl font-bold">Password Reset!</CardTitle>
                      <CardDescription className="mt-2 text-base">
                        Your password has been successfully updated.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert className="bg-success/10 border-success/20">
                        <AlertDescription className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          Redirecting to sign in...
                        </AlertDescription>
                      </Alert>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="h-1 bg-gradient-to-r from-success to-emerald-500 rounded-full"
                      />
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
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">
                      Create a strong, secure password
                    </p>
                  </div>

                  <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="password" className="text-sm font-medium">
                            New Password
                          </Label>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter new password"
                              className={`pl-10 pr-10 h-12 border-2 bg-background/50 transition-all ${
                                errors.password 
                                  ? 'border-destructive focus:border-destructive' 
                                  : 'border-border/50 focus:border-primary'
                              }`}
                              value={formData.password}
                              onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                setErrors({});
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          <PasswordStrength password={formData.password} />
                          <PasswordRequirements password={formData.password} />
                          {errors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-destructive"
                            >
                              {errors.password}
                            </motion.p>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm Password
                          </Label>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm new password"
                              className={`pl-10 pr-10 h-12 border-2 bg-background/50 transition-all ${
                                errors.confirmPassword 
                                  ? 'border-destructive focus:border-destructive' 
                                  : 'border-border/50 focus:border-primary'
                              }`}
                              value={formData.confirmPassword}
                              onChange={(e) => {
                                setFormData({ ...formData, confirmPassword: e.target.value });
                                setErrors({});
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-success flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Passwords match
                            </motion.p>
                          )}
                          {errors.confirmPassword && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-destructive"
                            >
                              {errors.confirmPassword}
                            </motion.p>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="pt-2"
                        >
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary text-white font-semibold text-base shadow-lg shadow-primary/25"
                          >
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                            ) : (
                              <span className="flex items-center gap-2">
                                Reset Password
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>
                        </motion.div>

                        <Link to="/auth" className="block">
                          <Button variant="ghost" className="w-full h-11">
                            Back to Sign In
                          </Button>
                        </Link>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
