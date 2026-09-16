import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Instagram, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rise } from "@/components/motion";

/* The API redirects here with a single-use `code`, never with tokens -- a
   JWT on a redirect URL ends up in history, referrer headers and proxy logs.
   We trade the code for a session over POST. */

const InstagramAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, completeInstagramLogin } = useAuth();
  const didHandleRef = useRef(false);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [code, setCode] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const role = (localStorage.getItem("famee_instagram_role") as "influencer" | "brand") || "influencer";

  useEffect(() => {
    if (loading || didHandleRef.current) return;
    didHandleRef.current = true;

    const query = new URLSearchParams(location.search);
    const error = `${query.get("error") || ""}`.trim();
    const callbackCode = `${query.get("code") || ""}`.trim();

    if (error) {
      toast.error(error);
      navigate("/auth?mode=login", { replace: true });
      return;
    }

    if (!callbackCode) {
      toast.error("Instagram did not return a sign-in code.");
      navigate("/auth?mode=login", { replace: true });
      return;
    }

    setCode(callbackCode);

    completeInstagramLogin(callbackCode, { role })
      .then((result) => {
        if (result === "needs_email") {
          setNeedsEmail(true);
          return;
        }
        localStorage.removeItem("famee_instagram_role");
        toast.success("Instagram connected successfully.");
        navigate(`/${result}/dashboard?instagram=connected`, { replace: true });
      })
      .catch((callbackError) => {
        const fallbackMessage = `${(callbackError as { message?: string })?.message || ""}`.trim();
        toast.error(fallbackMessage || "Instagram login failed. Please try again.");
        navigate("/auth?mode=login", { replace: true });
      });
  }, [loading, location.search, navigate, completeInstagramLogin, role]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error("Please enter an email address.");
      return;
    }

    setIsSubmittingEmail(true);
    setEmailError("");
    try {
      const result = await completeInstagramLogin(code, { email: emailInput, role });
      if (result !== "needs_email") {
        localStorage.removeItem("famee_instagram_role");
        toast.success("Account created and Instagram connected successfully.");
        navigate(`/${result}/dashboard?instagram=connected`, { replace: true });
      }
    } catch (error) {
      /* The context already raises a toast, but the common failure here is
         "that email belongs to an existing account, sign in and link from
         Settings" -- an instruction the user has to act on. A toast that
         disappears after a few seconds is the wrong place for it. */
      setEmailError(`${(error as { message?: string })?.message || ""}`.trim());
      setIsSubmittingEmail(false);
    }
  };

  if (needsEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-14 sm:px-8">
        <div className="relative w-full max-w-md">
          {/* the one decorative panel */}
          <div aria-hidden="true" className="wash absolute -inset-x-1 -inset-y-5 rounded-2xl" />

          <Rise className="relative">
            <Card className="rounded-2xl shadow-e2">
              <CardContent className="pt-6 text-center sm:pt-7">
                <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Mail className="size-7" />
                </span>
                <h1 className="mt-5 font-display text-display-3">Almost there</h1>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Instagram doesn&apos;t share an email address with us. Add one so we can
                  reach you about campaigns and payouts.
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-7 space-y-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your best email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                    />
                  </div>

                  {emailError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm leading-relaxed text-destructive"
                    >
                      {emailError}
                      <Link
                        to="/auth?mode=login"
                        className="mt-2 block font-semibold underline underline-offset-4"
                      >
                        Go to sign in
                      </Link>
                    </div>
                  )}

                  <Button type="submit" variant="form" className="w-full" disabled={isSubmittingEmail}>
                    {isSubmittingEmail ? <Loader2 className="animate-spin" /> : null}
                    {isSubmittingEmail ? "Completing…" : "Complete registration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Rise>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-14 sm:px-8">
      <div className="relative w-full max-w-md">
        {/* the one decorative panel */}
        <div aria-hidden="true" className="wash absolute -inset-x-1 -inset-y-5 rounded-2xl" />

        <Rise className="relative">
          <Card className="rounded-2xl shadow-e2">
            <CardContent className="pt-6 text-center sm:pt-7">
              <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Instagram className="size-7" />
              </span>
              <p className="eyebrow mt-6">Instagram</p>
              <h1 className="mt-2.5 font-display text-display-3">Finalising your login</h1>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                We&apos;re securely connecting your Instagram account.
              </p>
              <p className="mt-7 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Redirecting…
              </p>
            </CardContent>
          </Card>
        </Rise>
      </div>
    </div>
  );
};

export default InstagramAuthCallback;
