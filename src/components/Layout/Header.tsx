import { Bell, Search, User, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import NotificationPanel from '../Notifications/NotificationPanel';

interface HeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Header = ({ isSidebarOpen, toggleSidebar }: HeaderProps) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 w-full">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors"
                    title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <div className="relative max-w-[200px] sm:max-w-md w-full ml-1 sm:ml-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-white"></span>
                    </button>
                    <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                <button
                    onClick={() => navigate('/admin/profile')}
                    className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors pr-1 sm:pr-3"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">{user?.full_name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500">{user?.role || 'Super Admin'}</p>
                    </div>
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 object-cover" />
                    ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-primary border border-brand-cyan/30">
                            <User className="w-4 h-4 sm:w-5 h-5" />
                        </div>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;
