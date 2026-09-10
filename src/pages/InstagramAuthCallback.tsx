import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Instagram, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { setInstagramServiceToken } from "@/lib/instagramService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InstagramAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, authSource, completeInstagramLogin } = useAuth();
  const didHandleRef = useRef(false);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [tokenToSubmit, setTokenToSubmit] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const role = (localStorage.getItem("famee_instagram_role") as "influencer" | "brand") || "influencer";

  useEffect(() => {
    if (loading || didHandleRef.current) return;
    didHandleRef.current = true;

    const query = new URLSearchParams(location.search);
    const error = `${query.get("error") || ""}`.trim();
    const token = `${query.get("token") || ""}`.trim();

    if (error) {
      toast.error(error);
      navigate("/auth?mode=login", { replace: true });
      return;
    }

    if (!token) {
      toast.error("Instagram callback token is missing.");
      navigate("/auth?mode=login", { replace: true });
      return;
    }

    if (isAuthenticated && authSource === "famee") {
      setInstagramServiceToken(token);
      toast.success("Instagram connected successfully.");

      if (user?.role === "brand") {
        navigate("/brand/dashboard", { replace: true });
        return;
      }

      navigate("/influencer/dashboard?instagram=connected", { replace: true });
      return;
    }

    setTokenToSubmit(token);
    
    completeInstagramLogin(token, role)
      .then((result) => {
        if (result === 'needs_email') {
          setNeedsEmail(true);
        } else {
          toast.success("Instagram connected successfully.");
          navigate(`/${result}/dashboard?instagram=connected`, { replace: true });
        }
      })
      .catch((callbackError) => {
        const fallbackMessage = `${(callbackError as { message?: string })?.message || ""}`.trim();
        toast.error(fallbackMessage || "Instagram login failed. Please try again.");
        navigate("/auth?mode=login", { replace: true });
      });
  }, [
    loading,
    location.search,
    navigate,
    isAuthenticated,
    user,
    authSource,
    completeInstagramLogin,
    role
  ]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error("Please enter an email address.");
      return;
    }
    
    setIsSubmittingEmail(true);
    try {
      const result = await completeInstagramLogin(tokenToSubmit, role, emailInput);
      if (result !== 'needs_email') {
         toast.success("Account created and Instagram connected successfully.");
         navigate(`/${result}/dashboard?instagram=connected`, { replace: true });
      }
    } catch (error) {
      // Error is handled in context
      setIsSubmittingEmail(false);
    }
  };

  if (needsEmail) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold mb-2 text-center">Almost there!</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Your Instagram account doesn't have a public email address. Please provide one to complete your registration.
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your best email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingEmail}>
              {isSubmittingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSubmittingEmail ? "Completing..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
          <Instagram className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Finalizing Instagram Login</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We are securely connecting your Instagram account.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting...
        </div>
      </div>
    </div>
  );
};

export default InstagramAuthCallback;
