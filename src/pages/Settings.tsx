import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bell, Lock, Trash2, Mail, Sparkles } from 'lucide-react';
import LinkGoogleAccountButton from '@/components/auth/LinkGoogleAccountButton';
import { getPreferredAccountEmail, hasUsableAccountEmail } from '@/lib/accountEmail';
import {
  fetchInstagramServiceUser,
  getInstagramServiceToken,
  type InstagramServiceUser,
} from '@/lib/instagramService';

const FloatingOrb = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      y: [0, -30, 0],
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.3, 0.2],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const Settings = () => {
  const { user, authSource } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);
  const [instagramServiceUser, setInstagramServiceUser] = useState<InstagramServiceUser | null>(null);
  const [instagramEmailLoading, setInstagramEmailLoading] = useState(false);

  const linkedEmail = getPreferredAccountEmail(user?.email, instagramServiceUser?.email);
  const displayEmail = linkedEmail || (instagramEmailLoading ? 'Loading linked email...' : 'No linked email');
  const hasStableEmail = hasUsableAccountEmail(linkedEmail);
  const accountRole: 'influencer' | 'brand' = user?.role === 'brand' ? 'brand' : 'influencer';
  const shouldShowGoogleLink = authSource === 'instagram' || !hasStableEmail;
  const canChangePassword = authSource === 'famee';
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User';

  useEffect(() => {
    let isMounted = true;
    const token = getInstagramServiceToken();
    if (!token) {
      setInstagramServiceUser(null);
      return;
    }

    setInstagramEmailLoading(true);
    fetchInstagramServiceUser(token)
      .then(({ user: connectedUser }) => {
        if (!isMounted) return;
        setInstagramServiceUser(connectedUser);
      })
      .catch(() => {
        if (!isMounted) return;
        setInstagramServiceUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setInstagramEmailLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authSource]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangePassword) {
      toast.error('Link Google first to enable password updates.');
      return;
    }
    toast.success('Password changed successfully!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion requested. We\'ll send you a confirmation email.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings - FameSync</title>
        <meta name="description" content="Manage your FameSync account settings, notifications, and preferences." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      {/* Floating Orbs - Hidden on mobile */}
      <FloatingOrb className="hidden sm:block w-96 h-96 bg-primary -top-48 -left-48" delay={0} />
      <FloatingOrb className="hidden sm:block w-80 h-80 bg-secondary top-1/3 -right-40" delay={2} />
      
      {/* Mesh Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem]" />

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  <span className="text-foreground">Settings</span>
                </h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account preferences and settings.
            </p>
          </motion.div>

          <div className="space-y-4 sm:space-y-6">
            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Your basic account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Email</Label>
                    <Input value={displayEmail} disabled className="bg-background/50 text-sm sm:text-base" />
                    <p className="text-xs text-muted-foreground">
                      {hasStableEmail
                        ? 'Primary linked account email'
                        : 'This looks like a temporary Instagram email. Link Google to use your Gmail here.'}
                    </p>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Name</Label>
                    <Input value={fullName} disabled className="bg-background/50 text-sm sm:text-base" />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Role</Label>
                    <Input value={user?.role || ''} disabled className="capitalize bg-background/50 text-sm sm:text-base" />
                  </div>
                  {shouldShowGoogleLink && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 sm:p-4 space-y-2">
                      <p className="text-sm font-medium">Link Google Account</p>
                      <p className="text-xs text-muted-foreground">
                        Connect your Google account so FameSync uses your Gmail as primary email and login.
                      </p>
                      <LinkGoogleAccountButton
                        role={accountRole}
                        label="Continue with Google to Link"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">Change Password</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="bg-background/50 text-sm sm:text-base"
                        disabled={!canChangePassword}
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-password" className="text-sm">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="bg-background/50 text-sm sm:text-base"
                        disabled={!canChangePassword}
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="bg-background/50 text-sm sm:text-base"
                        disabled={!canChangePassword}
                      />
                    </div>
                    {!canChangePassword && (
                      <p className="text-xs text-muted-foreground">
                        Link Google first to enable password-based account recovery and password updates.
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-primary"
                      disabled={!canChangePassword}
                    >
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">Notification Preferences</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="email-notifications" className="text-sm">Email Notifications</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="push-notifications" className="text-sm">Push Notifications</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get push notifications on your device
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="campaign-updates" className="text-sm">Campaign Updates</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive updates about campaigns you're interested in
                      </p>
                    </div>
                    <Switch
                      id="campaign-updates"
                      checked={campaignUpdates}
                      onCheckedChange={setCampaignUpdates}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-destructive/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                    <CardTitle className="text-destructive text-base sm:text-lg">Danger Zone</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 border border-destructive/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-sm sm:text-base">Delete Account</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Settings;
