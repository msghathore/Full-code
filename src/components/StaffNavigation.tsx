import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ShoppingCart, Package, Settings } from 'lucide-react';

interface StaffNavigationProps {
    children: React.ReactNode;
}

const StaffNavigation: React.FC<StaffNavigationProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Calendar', path: '/staff/calendar', icon: Calendar },
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
                                            ? 'text-blue-600 border-b-2 border-blue-600'
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

                    {/* Staff Profile Section */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">Staff Member</p>
                            <p className="text-xs text-gray-500">Logged In</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium border border-blue-200">
                                SM
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('staff_auth_token');
                                    window.location.href = '/staff/login';
                                }}
                                className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                            >
                                Logout
                            </button>
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
