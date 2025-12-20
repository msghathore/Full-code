import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  BarChart3,
  Calendar,
  Users,
  Mail,
  MessageSquare,
  DollarSign,
  UserCheck,
  Settings,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const adminNavItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: Home
    },
    {
      path: '/admin/bookings',
      label: 'Bookings',
      icon: Calendar
    },
    {
      path: '/admin/customers',
      label: 'Customers',
      icon: Users
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      path: '/admin/revenue',
      label: 'Revenue',
      icon: DollarSign
    },
    {
      path: '/admin/campaigns',
      label: 'Campaigns',
      icon: Mail
    },
    {
      path: '/admin/feedback',
      label: 'Feedback',
      icon: MessageSquare
    },
    {
      path: '/admin/scheduling',
      label: 'Scheduling',
      icon: UserCheck
    }
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-24 px-4 md:px-8 flex gap-8">
        {/* Sidebar */}
        <div className="w-64 hidden lg:block">
          <Card className="frosted-glass border-white/10 sticky top-32">
            <div className="p-6">
              <h2 className="text-lg font-serif luxury-glow mb-6">Admin Panel</h2>
              <nav className="space-y-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start hover:bg-white/10 ${
                          isActive ? 'bg-white/10 border-white/20' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;