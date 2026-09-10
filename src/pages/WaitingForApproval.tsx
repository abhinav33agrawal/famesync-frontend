import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WaitingForApproval = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.is_approved) {
            navigate(`/${user.role}/dashboard`);
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-background border border-amber-500/20 w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl">
                            <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-3">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold tracking-tight text-foreground"
                    >
                        Review in Progress
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-muted-foreground text-lg"
                    >
                        Hi <span className="text-foreground font-medium">{user?.first_name || user?.username}</span>, we've received your registration!
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-muted/50 border border-border/50 rounded-2xl p-6 text-left space-y-4 shadow-sm"
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground/80">Account created successfully</p>
                    </div>
                    <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-4 py-1">
                        <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-foreground">Waiting for admin approval</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Our team is currently reviewing your profile to ensure it meets our quality standards. This usually takes 24-48 hours.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 opacity-50">
                        <ShieldCheck className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">Access platform features</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4 pt-4"
                >
                    <div className="bg-muted/30 border border-border/30 rounded-xl p-5">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We'll email you once approved at
                                </p>
                                <p className="font-medium text-foreground text-sm break-all px-2">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => logout()}
                            className="rounded-xl"
                        >
                            Log Out
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            className="gradient-instagram hover-glow rounded-xl"
                        >
                            Check Status
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default WaitingForApproval;
