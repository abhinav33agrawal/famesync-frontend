import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/Avatar';
import { Rise } from '@/components/motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bell, Lock, Trash2, Mail } from 'lucide-react';
import LinkGoogleAccountButton from '@/components/auth/LinkGoogleAccountButton';
import { getPreferredAccountEmail, hasUsableAccountEmail } from '@/lib/accountEmail';
import {
  fetchInstagramServiceUser,
  getInstagramServiceToken,
  type InstagramServiceUser,
} from '@/lib/instagramService';

/* Signed-in app surface: the Navbar is the only chrome, no footer, no
   sidebar. Removed: FloatingOrb (looping animation), the mesh/radial
   background stack, the gradient icon tile, `text-white`, the
   `bg-card/50 backdrop-blur-sm border-border/50` panels and the
   competing `max-w-4xl` wrapper. */

const NOTIFICATION_ROWS = [
  {
    id: 'email-notifications',
    label: 'Email Notifications',
    description: 'Receive email updates about your account',
  },
  {
    id: 'push-notifications',
    label: 'Push Notifications',
    description: 'Get push notifications on your device',
  },
  {
    id: 'campaign-updates',
    label: 'Campaign Updates',
    description: "Receive updates about campaigns you're interested in",
  },
] as const;

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

  const notificationState = {
    'email-notifications': [emailNotifications, setEmailNotifications],
    'push-notifications': [pushNotifications, setPushNotifications],
    'campaign-updates': [campaignUpdates, setCampaignUpdates],
  } as const;

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

      <div className="container py-10 sm:py-12">
        {/* ---------------------------------------------------- page header */}
        <Rise>
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-9">
            <div>
              <p className="eyebrow mb-4">Account</p>
              <h1 className="font-display text-display-2">Settings</h1>
              <p className="mt-4 max-w-[52ch] leading-relaxed text-muted-foreground">
                Manage your account preferences and settings.
              </p>
            </div>

            <div className="flex items-center gap-3.5">
              <Avatar name={fullName} size={44} />
              <div>
                <div className="text-sm font-semibold">{fullName}</div>
                <Badge variant="neutral" className="mt-1.5 capitalize">
                  {accountRole}
                </Badge>
              </div>
            </div>
          </header>
        </Rise>

        <div className="mt-9 grid gap-5 lg:grid-cols-2 lg:items-start">
          {/* ------------------------------------------ account information */}
          <Rise>
            <Card>
              <CardHeader>
                <span className="eyebrow flex items-center gap-2">
                  <Mail className="size-3.5" />
                  Account
                </span>
                <CardTitle className="pt-1">Account Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input id="account-email" value={displayEmail} disabled />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {hasStableEmail
                      ? 'Primary linked account email'
                      : 'This looks like a temporary Instagram email. Link Google to use your Gmail here.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-name">Name</Label>
                  <Input id="account-name" value={fullName} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-role">Role</Label>
                  <Input id="account-role" value={user?.role || ''} disabled className="capitalize" />
                </div>

                {shouldShowGoogleLink && (
                  <div className="space-y-2.5 rounded-lg border border-border bg-muted p-4">
                    <p className="text-sm font-semibold">Link Google Account</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
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
          </Rise>

          {/* ----------------------------------------------- change password */}
          <Rise delay={0.06}>
            <Card>
              <CardHeader>
                <span className="eyebrow flex items-center gap-2">
                  <Lock className="size-3.5" />
                  Security
                </span>
                <CardTitle className="pt-1">Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" disabled={!canChangePassword} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" disabled={!canChangePassword} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" disabled={!canChangePassword} />
                  </div>
                  {!canChangePassword && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Link Google first to enable password-based account recovery and password updates.
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="form"
                    className="w-full sm:w-auto"
                    disabled={!canChangePassword}
                  >
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Rise>

          {/* ------------------------------------------------- notifications */}
          <Rise>
            <Card>
              <CardHeader>
                <span className="eyebrow flex items-center gap-2">
                  <Bell className="size-3.5" />
                  Notifications
                </span>
                <CardTitle className="pt-1">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {NOTIFICATION_ROWS.map((row) => {
                  const [checked, setChecked] = notificationState[row.id];
                  return (
                    <div
                      key={row.id}
                      className="flex min-h-[3.25rem] items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <Label htmlFor={row.id}>{row.label}</Label>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {row.description}
                        </p>
                      </div>
                      <Switch id={row.id} checked={checked} onCheckedChange={setChecked} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </Rise>

          {/* --------------------------------------------------- danger zone */}
          <Rise delay={0.06}>
            <Card className="border-destructive/30">
              <CardHeader>
                <span className="eyebrow flex items-center gap-2 text-destructive/80">
                  <Trash2 className="size-3.5" />
                  Danger zone
                </span>
                <CardTitle className="pt-1 text-destructive">Delete Account</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 rounded-lg border border-destructive/25 bg-destructive/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="w-full shrink-0 sm:w-auto"
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Rise>
        </div>
      </div>
    </>
  );
};

export default Settings;
