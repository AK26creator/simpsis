import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, History, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import NotificationPanel from '../Notifications/NotificationPanel';

const EmployeeLayout = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    // Redirect admins away from employee portal
    if (isAdmin) {
        navigate('/admin');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: FileText, label: 'Department Feed', path: '/app' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
        { icon: FileText, label: 'Submit Report', path: '/app/submit' },
        { icon: FileText, label: 'Apply Leave', path: '/app/leave' },
        { icon: History, label: 'Work History', path: '/app/history' },
        { icon: User, label: 'Profile', path: '/app/profile' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4 sm:gap-8">
                            <h1 className="text-lg sm:text-xl font-bold text-primary-600 cursor-pointer" onClick={() => navigate('/app')}>SynopGen</h1>

                            <nav className="hidden lg:flex items-center gap-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/app'}
                                        className={({ isActive }) =>
                                            clsx(
                                                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm',
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                            )
                                        }
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                                <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                            </div>

                            <div className="flex items-center gap-3 mr-2 sm:mr-4 pl-4 border-l border-gray-100">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold border border-primary-200">
                                        {user?.full_name?.charAt(0)}
                                    </div>
                                )}
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-700">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500">{user?.department}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-2 sm:px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 bg-white">
                        <nav className="px-4 py-4 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/app'}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm',
                                            isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                        )
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default EmployeeLayout;
