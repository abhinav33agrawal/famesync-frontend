import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { hasUsableAccountEmail } from '@/lib/accountEmail';
import { authApi } from '@/lib/api';

/** The API's own message when it sent one, else the fallback. */
const apiError = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: { error?: string; detail?: string } } })?.response?.data;
  return data?.error || data?.detail || fallback;
};

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
  const { user, endSession } = useAuth();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);
  const linkedEmail = `${user?.email || ''}`.trim();
  const displayEmail = linkedEmail || 'No linked email';
  const hasStableEmail = hasUsableAccountEmail(linkedEmail);
  const accountRole: 'influencer' | 'brand' = user?.role === 'brand' ? 'brand' : 'influencer';
  const shouldShowGoogleLink = !hasStableEmail;
  // Accounts created through Instagram or Google have no password to change
  // until they link one; the API reports this rather than us guessing from
  // how the current session happened to start.
  const canChangePassword = user?.has_usable_password !== false;
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User';

  const notificationState = {
    'email-notifications': [emailNotifications, setEmailNotifications],
    'push-notifications': [pushNotifications, setPushNotifications],
    'campaign-updates': [campaignUpdates, setCampaignUpdates],
  } as const;


  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [setupLinkSending, setSetupLinkSending] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSecret, setDeleteSecret] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords don’t match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated.');
    } catch (error) {
      setPasswordError(apiError(error, 'Could not update your password. Please try again.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  // Instagram and Google signups have no password. The reset email sets
  // one, and proves the inbox is theirs on the way.
  const handleSendSetupLink = async () => {
    setSetupLinkSending(true);
    try {
      await authApi.forgotPassword(linkedEmail);
      toast.success(`We’ve emailed a link to ${linkedEmail} to set your password.`);
    } catch (error) {
      toast.error(apiError(error, 'Could not send the email. Please try again.'));
    } finally {
      setSetupLinkSending(false);
    }
  };

  const openDelete = () => {
    setDeleteSecret('');
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleting(true);
    try {
      await authApi.deleteAccount(
        canChangePassword ? { password: deleteSecret } : { confirm: deleteSecret },
      );
      setDeleteOpen(false);
      endSession();
      toast.success('Your account and its data have been deleted.');
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteError(apiError(error, 'Could not delete your account. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  const deleteReady = canChangePassword
    ? deleteSecret.length > 0
    : deleteSecret.trim().toUpperCase() === 'DELETE';

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
                {canChangePassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 8 characters, not all numbers, and not too close to your name or email.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    {passwordError && (
                      <p role="alert" className="text-sm text-destructive">
                        {passwordError}
                      </p>
                    )}
                    <Button
                      type="submit"
                      variant="form"
                      className="w-full sm:w-auto"
                      disabled={passwordSaving}
                    >
                      {passwordSaving ? 'Updating…' : 'Update Password'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      You sign in with Instagram or Google, so your account doesn&apos;t have a
                      password yet.
                      {hasStableEmail
                        ? ` We can email a link to ${linkedEmail} to set one, so you can also sign in with your email.`
                        : ' Link Google under Account Information to add a real email first, then you can set one.'}
                    </p>
                    {hasStableEmail && (
                      <Button
                        type="button"
                        variant="form"
                        className="w-full sm:w-auto"
                        onClick={handleSendSetupLink}
                        disabled={setupLinkSending}
                      >
                        {setupLinkSending ? 'Sending…' : 'Email me a link'}
                      </Button>
                    )}
                  </div>
                )}
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
                    onClick={openDelete}
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

      <AlertDialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
        <AlertDialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (deleteReady && !deleting) handleDeleteAccount();
            }}
            className="space-y-4"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your profile, credits, notifications and connected
                Instagram data,{' '}
                {accountRole === 'brand'
                  ? 'and every campaign you created along with the applications creators sent to them.'
                  : 'and every campaign application you have sent.'}{' '}
                It can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="delete-secret">
                {canChangePassword ? 'Enter your password to confirm' : 'Type DELETE to confirm'}
              </Label>
              <Input
                id="delete-secret"
                type={canChangePassword ? 'password' : 'text'}
                autoComplete={canChangePassword ? 'current-password' : 'off'}
                value={deleteSecret}
                onChange={(e) => setDeleteSecret(e.target.value)}
                autoFocus
              />
            </div>

            {deleteError && (
              <p role="alert" className="text-sm text-destructive">
                {deleteError}
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={deleting}>
                Cancel
              </AlertDialogCancel>
              {/* A plain button, not AlertDialogAction: that closes the dialog
                  on click, before we know whether the delete worked. */}
              <Button type="submit" variant="destructive" disabled={!deleteReady || deleting}>
                <Trash2 />
                {deleting ? 'Deleting…' : 'Delete my account'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;
