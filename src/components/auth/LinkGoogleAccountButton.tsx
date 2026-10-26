import { useState } from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, GoogleButton } from '@/components/auth/GoogleButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface LinkGoogleAccountButtonProps {
  role: 'influencer' | 'brand';
  /** Unused: Google's official button supplies its own wording. */
  label?: string;
  className?: string;
}

const LinkGoogleAccountButton = ({
  role,
  className = '',
}: LinkGoogleAccountButtonProps) => {
  const { loginWithGoogle } = useAuth();
  const [isLinking, setIsLinking] = useState(false);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    const idToken = `${response.credential || ''}`.trim();
    if (!idToken) {
      toast.error('Google response is missing credentials.');
      return;
    }

    setIsLinking(true);
    try {
      await loginWithGoogle(idToken, role);
      toast.success('Google account linked successfully.');
    } catch {
      // AuthContext already raised a toast with the server's message.
    } finally {
      setIsLinking(false);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button type="button" variant="outline" className={`w-full ${className}`} disabled>
        Google OAuth is not configured
      </Button>
    );
  }

  if (isLinking) {
    return (
      <Button type="button" variant="outline" className={`h-10 w-full rounded-full ${className}`} disabled>
        Linking Google...
      </Button>
    );
  }

  return <GoogleButton onCredential={handleGoogleSuccess} text="continue_with" className={className} />;
};

export default LinkGoogleAccountButton;
