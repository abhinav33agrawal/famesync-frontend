import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, CreditCard, LayoutDashboard, LogOut, Menu, Plus, Settings, User, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/Avatar";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { useAuth } from "@/context/AuthContext";
import { useBrandProfile, useInfluencerProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

/* 76px shell, paper at 92% with blur, one hairline.
   Removed: the gradient accent hairline, hover-glow, the Grand Hotel
   `.brand` wordmark, and the gradient avatar fallback. */

const MARKETING_LINKS = [
  { to: "/#value", label: "Why FameSync", hash: "value" },
  { to: "/#how", label: "How it works", hash: "how" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

const CREATOR_LINKS = [
  { to: "/influencer/dashboard", label: "Home" },
  { to: "/influencer/campaigns", label: "Discover" },
  { to: "/influencer/applications", label: "Applications" },
  { to: "/influencer/deliverables", label: "Deliverables" },
];

const BRAND_LINKS = [
  { to: "/brand/dashboard", label: "Home" },
  { to: "/brand/campaigns", label: "Campaigns" },
  { to: "/brand/discover", label: "Find creators" },
];

export const Navbar = () => {
  const { user, logout, authSource } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const role = user?.role;
  const isInstagramSession = authSource === "instagram";

  const influencerProfile = useInfluencerProfile(role === "influencer" && !isInstagramSession);
  const brandProfile = useBrandProfile(role === "brand");
  const profile = role === "brand" ? brandProfile : influencerProfile;

  // Uploaded pictures come back as a server-relative path; Instagram ones are absolute.
  const picture = (() => {
    const raw = profile?.data?.profile_picture;
    if (!raw) return undefined;
    if (raw.startsWith("http")) return raw;
    return `${import.meta.env.VITE_API_URL?.replace("/api", "") ?? ""}${raw}`;
  })();

  const displayName = user?.first_name || user?.username || "Account";
  const links = !user ? MARKETING_LINKS : role === "brand" ? BRAND_LINKS : CREATOR_LINKS;

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  /** Anchor links scroll in place when already on the landing page. */
  const handleLink = (e: React.MouseEvent, link: { to: string; hash?: string }) => {
    if (!link.hash) return;
    if (pathname !== "/") return; // let the router navigate to /#hash
    e.preventDefault();
    setOpen(false);
    document.getElementById(link.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-md">
      <nav className="container flex h-[76px] items-center justify-between gap-6">
        <div className="flex items-center gap-9">
          <Link
            to={user ? `/${role}/dashboard` : "/"}
            className="font-display text-[1.4375rem] font-semibold tracking-[-0.035em] text-foreground"
          >
            FameSync
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleLink(e, link)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-secondary font-semibold text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => go("/auth?mode=login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => go("/auth?mode=signup")}>
                Start free
              </Button>
            </>
          ) : (
            <>
              {role === "brand" && (
                <Button size="sm" className="hidden sm:inline-flex" onClick={() => go("/brand/create-campaign")}>
                  <Plus />
                  New campaign
                </Button>
              )}

              <button
                type="button"
                onClick={() => go("/subscription")}
                className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[0.8125rem] font-semibold transition-colors hover:bg-muted sm:inline-flex"
              >
                <Zap className="size-4 text-warning" />
                {user.credits ?? 0} credits
              </button>

              <NotificationsDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar src={picture} name={displayName} size={34} />
                  <span className="hidden text-sm font-semibold sm:inline">{displayName}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => go(`/${role}/dashboard`)}>
                    <LayoutDashboard className="mr-2 size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go(`/${role}/profile`)}>
                    <User className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/subscription")}>
                    <CreditCard className="mr-2 size-4" />
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("/settings")}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-md hover:bg-muted md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => {
                  handleLink(e, link);
                  setOpen(false);
                }}
                className="rounded-md px-2 py-3 text-[0.9375rem] font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <div className="my-2 h-px bg-border" />
                {role === "brand" && (
                  <Link
                    to="/brand/create-campaign"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-3 text-[0.9375rem] font-medium hover:bg-muted"
                  >
                    New campaign
                  </Link>
                )}
                <Link
                  to={`/${role}/profile`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-[0.9375rem] font-medium hover:bg-muted"
                >
                  Profile
                </Link>
                <Link
                  to="/subscription"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-[0.9375rem] font-medium hover:bg-muted"
                >
                  Subscription · {user.credits ?? 0} credits
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-[0.9375rem] font-medium hover:bg-muted"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="rounded-md px-2 py-3 text-left text-[0.9375rem] font-medium text-destructive hover:bg-muted"
                >
                  Log out
                </button>
              </>
            )}

            {!user && (
              <>
                <div className="my-2 h-px bg-border" />
                <Button className="mb-2" onClick={() => go("/auth?mode=signup")}>
                  Start free
                </Button>
                <Button variant="secondary" onClick={() => go("/auth?mode=login")}>
                  Log in
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
