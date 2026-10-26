import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider, type CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const GOOGLE_CLIENT_ID = `${import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}`.trim();

type GoogleButtonProps = {
  onCredential: (credentialResponse: CredentialResponse) => void;
  /** Google's own wording: "Sign in with" / "Sign up with" / "Continue with". */
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  className?: string;
};

/** Google's official Sign-In button, sized to its container.
 *
 *  Replaces a custom-drawn button with the real GoogleLogin iframe laid over
 *  it at 1% opacity: the iframe was a fixed 400px, so clicks on part of the
 *  visible button did nothing, it couldn't be reached by keyboard, and it
 *  re-initialised on every keystroke because it was declared inside Auth.
 *
 *  GIS needs a pixel width (200–400), so the container is measured. The
 *  button is 40px tall (size "large"); sibling buttons use h-10 to match. */
export const GoogleButton = ({ onCredential, text = 'continue_with', className }: GoogleButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(200, Math.min(400, Math.floor(el.clientWidth))));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* When Google refuses to render (origin not in the client's Authorised
     JavaScript origins, a blocked third-party script) the iframe collapses
     to 0×0 and the button just vanishes. Give it a few seconds, then say so. */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const timer = window.setTimeout(() => {
      const frame = ref.current?.querySelector('iframe');
      if (!frame || frame.offsetHeight === 0) setUnavailable(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  if (unavailable) {
    return (
      <div className={cn('space-y-1.5', className)}>
        <Button type="button" variant="outline" className="h-10 w-full rounded-full" disabled>
          Google sign-in is unavailable right now
        </Button>
        {import.meta.env.DEV && (
          <p className="text-center text-xs text-muted-foreground">
            Add {window.location.origin} to the client&apos;s Authorised JavaScript origins in Google Cloud.
          </p>
        )}
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div ref={ref} className={cn('flex h-10 w-full justify-center', className)}>
        {width > 0 && (
          <GoogleLogin
            // GIS draws the button once at a fixed width; redraw on resize
            key={width}
            onSuccess={onCredential}
            onError={() => toast.error("Google sign-in didn't go through. Please try again, or use your email.")}
            text={text}
            theme="outline"
            size="large"
            shape="pill"
            logo_alignment="center"
            width={width}
            useOneTap={false}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};
