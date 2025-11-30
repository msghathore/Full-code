import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Package,
  ShoppingCart,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import ScheduleSidebar from './ScheduleSidebar';
import AppointmentLegend from '@/components/AppointmentLegend';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showNavbar?: boolean;
  className?: string;
  isLegendOpen?: boolean;
  setIsLegendOpen?: (open: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigationItems: NavItem[] = [
  { name: 'Calendar', href: '/staff', icon: Calendar },
  { name: 'Checkout', href: '/checkout', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  showNavbar = true,
  className = '',
  isLegendOpen: externalIsLegendOpen,
  setIsLegendOpen: externalSetIsLegendOpen
}) => {
  const location = useLocation();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Legend state management
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Use external props if provided, otherwise use internal state
  const effectiveIsLegendOpen = externalIsLegendOpen !== undefined ? externalIsLegendOpen : isLegendOpen;
  const effectiveSetIsLegendOpen = externalSetIsLegendOpen || setIsLegendOpen;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // TODO: Implement actual logout logic
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "No new notifications at this time.",
    });
  };

  const handleCartClick = () => {
    toast({
      title: "Cart",
      description: "Cart is empty.",
    });
  };

  const handleTimeClockClick = () => {
    toast({
      title: "Time Clock",
      description: "Opening time tracking...",
    });
  };

  const isCurrentPage = (href: string) => {
    return location.pathname === href ||
      (href !== '/schedule' && location.pathname.startsWith(href));
  };

  return (
    <div className={`flex h-screen overflow-hidden ${className}`}>
      {/* Left Sidebar - Schedule Sidebar */}
      {showSidebar && (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200">
          <ScheduleSidebar />
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Black Top Navigation Bar - Remains at very top */}
        {showNavbar && (
          <header className="bg-black text-white shadow-lg flex-shrink-0">
            <div className="px-4">
              <div className="flex items-center justify-between h-16">
                {/* Left Navigation Links */}
                <nav className="flex items-center space-x-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isCurrentPage(item.href);

                    return (
                      <Link key={item.name} to={item.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`
                            h-10 px-3 text-sm font-medium transition-colors
                            ${isActive
                              ? 'bg-gray-800 text-white border-b-2 border-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                          {item.badge && (
                            <Badge
                              variant="destructive"
                              className="ml-2 h-4 w-4 p-0 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                {/* Center - Legend Icon */}
                <div className="flex items-center">
                  <AppointmentLegend
                    isLegendOpen={effectiveIsLegendOpen}
                    setIsLegendOpen={effectiveSetIsLegendOpen}
                  />
                </div>

                {/* Right Side - User Profile */}
                <div className="flex items-center space-x-3">
                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-10 px-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/images/client-1.jpg" alt="Sarah Johnson" />
                            <AvatarFallback className="bg-gray-600 text-white text-sm">
                              SJ
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">Sarah Johnson</span>
                            <span className="text-xs text-gray-400">Administrator</span>
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white shadow-lg border"
                    >
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="bg-white text-red-600 hover:bg-red-50 cursor-pointer font-semibold"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content Area */}
        <main className="flex-1 bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;