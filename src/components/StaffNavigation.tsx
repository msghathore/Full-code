import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ShoppingCart, Package, Settings, Palette, LogOut, Users } from 'lucide-react';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import ColorLegendPopover from './ColorLegendPopover';

interface StaffNavigationProps {
    children: React.ReactNode;
}

const StaffNavigation: React.FC<StaffNavigationProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { staffName } = useStaffAuth();

    // Get staff initials from name
    const getInitials = (name: string | null) => {
        if (!name) return 'SM';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Handle complete logout - clear all staff session data
    const handleLogout = () => {
        localStorage.removeItem('staff_auth_token');
        localStorage.removeItem('staff_id');
        localStorage.removeItem('staff_name');
        localStorage.removeItem('staff_role');
        localStorage.removeItem('staff_login_time');
        window.location.href = '/staff/login';
    };

    const tabs = [
        { name: 'Calendar', path: '/staff/calendar', icon: Calendar },
        { name: 'Groups', path: '/staff/group-bookings', icon: Users },
        { name: 'Checkout', path: '/staff/checkout', icon: ShoppingCart },
        { name: 'Inventory', path: '/staff/inventory', icon: Package },
        { name: 'Settings', path: '/staff/settings', icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Tabs */}
            <nav className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center space-x-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = isActive(tab.path);

                            return (
                                <button
                                    key={tab.path}
                                    onClick={() => navigate(tab.path)}
                                    className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  ${active
                                            ? 'text-black border-b-2 border-gray-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }
                `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Color Legend & Staff Profile Section */}
                    <div className="flex items-center gap-4">
                        {/* Color Legend Popover */}
                        <ColorLegendPopover />

                        {/* Staff Profile */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{staffName || 'Staff Member'}</p>
                                <p className="text-xs text-gray-500">Logged In</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 font-medium border border-slate-200">
                                    {getInitials(staffName)}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-3 w-3" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default StaffNavigation;
