import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* One slim ink line above the navbar while an account waits for approval —
   the landing page's ink band, not a warning: nothing is wrong, it's a wait.
   It scrolls away with the page (the navbar is the sticky element), and it
   isn't shown on the setup pages, which carry their own review note. */
const ApprovalBanner = () => {
  const { user } = useAuth();
  // Creators are held on /waiting-for-approval (ProtectedRoute), so in
  // practice this is the brand's line: explore and draft, publish later.
  const brand = user?.role === "brand";
  const detail = brand
    ? "Explore and draft campaigns now. Publishing unlocks once our team approves your brand."
    : "Some features unlock once our team approves your account.";
  const short = brand ? "Publishing unlocks once approved." : "Some features unlock once approved.";

  return (
    <div className="bg-ink text-ink-foreground">
      <div className="container flex min-h-11 items-center justify-between gap-x-6 py-1 text-sm">
        <p className="flex min-w-0 items-center gap-2.5">
          <span className="size-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/25" />
          <span>
            <span className="font-semibold">Account under review.</span>{" "}
            <span className="text-ink-muted sm:hidden">{short}</span>
            <span className="hidden text-ink-muted sm:inline">{detail}</span>
          </span>
        </p>
        <Link
          to="/waiting-for-approval"
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink-foreground underline-offset-4 hover:underline"
        >
          <span className="hidden sm:inline">What happens next</span>
          <span className="sm:hidden">Details</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
};

export default ApprovalBanner;
