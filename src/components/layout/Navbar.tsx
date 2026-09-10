import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Target,
  FileText,
  PlusCircle,
  Settings,
  CreditCard,
  Info,
  Mail,
  DollarSign,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PremiumBadge } from '@/components/PremiumBadge';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { useBrandProfile, useInfluencerProfile } from '@/hooks/useProfile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Public navigation links for unauthenticated users
const publicNavLinks = [
  { label: 'About', path: '/about', icon: Info },
  { label: 'Pricing', path: '/pricing', icon: DollarSign },
  { label: 'Contact', path: '/contact', icon: Mail },
];

const Navbar = () => {
  const { user, logout, isAuthenticated, authSource } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isInstagramSession = authSource === 'instagram';

  const influencerProfile = useInfluencerProfile(user?.role === 'influencer' && !isInstagramSession);
  const brandProfile = useBrandProfile(user?.role === 'brand');

  const profileDetails = user?.role === 'brand' ? brandProfile : influencerProfile;



  const getProfilePictureUrl = () => {
    if (!profileDetails?.data?.profile_picture) return undefined;
    if (profileDetails.data.profile_picture.startsWith('http')) return profileDetails.data.profile_picture;

    return `${import.meta.env.VITE_API_URL.replace("/api", "")}${profileDetails.data.profile_picture}`;
  };

  const profilePicture = getProfilePictureUrl();

  const getUserInitials = () => {
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const influencerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/influencer/dashboard' },
    { icon: Target, label: 'Discover Campaigns', path: '/influencer/campaigns' },
    { icon: FileText, label: 'My Applications', path: '/influencer/applications' },
    { icon: User, label: 'Profile', path: '/influencer/profile' },
  ];

  const brandLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/brand/dashboard' },
    { icon: PlusCircle, label: 'Create Campaign', path: '/brand/create-campaign' },
    { icon: Target, label: 'My Campaigns', path: '/brand/campaigns' },
    { icon: User, label: 'Profile', path: '/brand/profile' },
  ];

  const sharedLinks = [
    { icon: CreditCard, label: 'Subscription', path: '/subscription' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const links = user?.role === 'influencer' ? influencerLinks : brandLinks;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      {/* Subtle gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
        <Link to="/" className="flex items-center group">
          <span className="brand text-foreground text-xl sm:text-2xl">FameSync</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {isAuthenticated ? (
            <>
              <div className="-mr-1 sm:-mr-2">
                <NotificationsDropdown />
              </div>

              {/* Desktop User Menu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profilePicture} alt={user?.username} />
                        <AvatarFallback className="gradient-instagram text-white text-sm font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">{user?.first_name || user?.username}</span>
                      {user?.subscription_plan && (
                        <PremiumBadge plan={user.subscription_plan} size="sm" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate(`/${user?.role}/dashboard`)}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${user?.role}/profile`)}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      Subscription ({user?.credits} credits)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-4 border-b border-border/40">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profilePicture} alt={user?.username} />
                          <AvatarFallback className="gradient-instagram text-white font-semibold text-lg">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{user?.first_name || user?.username}</p>
                          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                          {user?.subscription_plan && (
                            <PremiumBadge plan={user.subscription_plan} size="sm" className="mt-1" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Menu Links */}
                    <div className="flex-1 overflow-y-auto py-4">
                      <div className="px-3 space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Navigation
                        </p>
                        {links.map((link) => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.path;

                          return (
                            <button
                              key={link.path}
                              onClick={() => handleNavClick(link.path)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                                isActive
                                  ? 'gradient-instagram text-white shadow-lg'
                                  : 'hover:bg-muted text-foreground'
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="font-medium">{link.label}</span>
                            </button>
                          );
                        })}

                        <div className="pt-4 mt-4 border-t border-border/40">
                          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Account
                          </p>
                          {sharedLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;

                            return (
                              <button
                                key={link.path}
                                onClick={() => handleNavClick(link.path)}
                                className={cn(
                                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                                  isActive
                                    ? 'gradient-instagram text-white shadow-lg'
                                    : 'hover:bg-muted text-foreground'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{link.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Menu Footer */}
                    <div className="p-4 border-t border-border/40">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                {publicNavLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(link.path)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Button>
                ))}
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-3 ml-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth?mode=login')}
                  className="text-sm font-medium"
                >
                  Log In
                </Button>
                <Button
                  className="gradient-instagram hover-glow text-sm px-5 group"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Create Account
                  <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>

              {/* Mobile Menu for Unauthenticated */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[300px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-4 border-b border-border/40">
                      <span className="brand text-foreground text-xl">FameSync</span>
                    </div>

                    {/* Mobile Menu Links */}
                    <div className="flex-1 overflow-y-auto py-4">
                      <div className="px-3 space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Explore
                        </p>
                        {publicNavLinks.map((link) => {
                          const isActive = location.pathname === link.path;

                          return (
                            <button
                              key={link.path}
                              onClick={() => handleNavClick(link.path)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                                isActive
                                  ? 'gradient-instagram text-white shadow-lg'
                                  : 'hover:bg-muted text-foreground'
                              )}
                            >
                              <span className="font-medium">{link.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile Menu Footer - Auth Actions */}
                    <div className="p-4 border-t border-border/40 space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigate('/auth?mode=login');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Log In
                      </Button>
                      <Button
                        className="w-full gradient-instagram"
                        onClick={() => {
                          navigate('/auth?mode=signup');
                          setMobileMenuOpen(false);
                        }}
                      >
                        Create Account
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
