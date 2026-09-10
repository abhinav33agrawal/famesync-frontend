import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  User,
  PlusCircle,
  Settings,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const influencerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/influencer/dashboard' },
    { icon: Target, label: 'Discover Campaigns', path: '/influencer/campaigns' },
    { icon: FileText, label: 'My Applications', path: '/influencer/applications' },
    { icon: User, label: 'Profile', path: '/influencer/profile' },
  ];

  const brandLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/brand/dashboard' },
    { icon: Users, label: 'Discover Creators', path: '/brand/discover' },
    { icon: PlusCircle, label: 'Create Campaign', path: '/brand/create-campaign' },
    { icon: Target, label: 'My Campaigns', path: '/brand/campaigns' },
    { icon: User, label: 'Profile', path: '/brand/profile' },
  ];

  const sharedLinks = [
    { icon: CreditCard, label: 'Subscription', path: '/subscription' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const links = user?.role === 'influencer' ? influencerLinks : brandLinks;

  return (
    <aside className="w-64 border-r border-border/40 bg-background/50 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 hidden lg:block overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-1">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </h2>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth',
                isActive
                  ? 'gradient-instagram text-white shadow-lg'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 mt-6 border-t border-border/40">
          {sharedLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth',
                  isActive
                    ? 'gradient-instagram text-white shadow-lg'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
