import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Calendar,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

const UserDropdown = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    loyaltyPoints: 0,
    bookings: 0,
    purchases: 0,
  });
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    email: '',
    avatar: '/images/client-1.jpg'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // Set profile information
        setUserProfile({
          name: profile?.full_name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          email: user.primaryEmailAddress?.emailAddress || 'No email',
          avatar: profile?.avatar_url || user.imageUrl || '/images/client-1.jpg'
        });
        
        // Mock stats - in a real app, these would be fetched from the database
        // These are just example values for demonstration purposes
        setUserStats({
          loyaltyPoints: 2847,
          bookings: 12,
          purchases: 23
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
        <div className="h-8 w-8 bg-white/20 rounded-full animate-pulse"></div>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full h-10 w-10 p-0 relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
            <AvatarFallback className="bg-white/20 text-white">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {/* Loyalty points badge */}
          {userStats.loyaltyPoints > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-yellow-500 text-black text-xs">
              {userStats.loyaltyPoints > 999 ? '∞' : userStats.loyaltyPoints}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 frosted-glass border-white/20" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="bg-white/20 text-white">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-medium text-white">{userProfile.name}</p>
                <p className="text-xs text-white/70 truncate max-w-[200px]">{userProfile.email}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-between mt-2">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-yellow-400">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="font-medium">{userStats.loyaltyPoints.toLocaleString()}</span>
                </div>
                <span className="text-xs text-white/70">Points</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center text-blue-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="font-medium">{userStats.bookings}</span>
                </div>
                <span className="text-xs text-white/70">Bookings</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center text-purple-400">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  <span className="font-medium">{userStats.purchases}</span>
                </div>
                <span className="text-xs text-white/70">Orders</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-white/10 focus:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-white/10 focus:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span>Bookings</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-white/10 focus:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>Orders</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-white/10 focus:text-white"
          onClick={() => navigate('/dashboard')}
        >
          <Award className="mr-2 h-4 w-4" />
          <span>Loyalty Program</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-white/10 focus:text-white"
          onClick={() => navigate('/profile-completion')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer focus:bg-white/10 focus:text-white text-red-400 focus:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;