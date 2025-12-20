import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

const UserDropdown = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full h-11 w-11 p-0.5 bg-black/50 backdrop-blur-sm border-2 border-white/40 hover:bg-black/70 hover:border-white/60">
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.imageUrl || '/images/client-1.jpg'}
              alt={user?.firstName || 'User'}
              className="object-cover"
              style={{ opacity: 1 }}
            />
            <AvatarFallback className="bg-white/20 text-white text-lg">
              {user?.firstName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48 bg-black/90 border-white/20 backdrop-blur-xl" align="end">
        <DropdownMenuItem
          className="cursor-pointer focus:bg-white/10 focus:text-white text-white hover:bg-white/10"
          onClick={() => navigate('/dashboard')}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer focus:bg-white/10 focus:text-white text-red-400 hover:bg-white/10 hover:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;