import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, UserPlus, LogOut, Bell, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'View Reports', path: '/admin/reports' },
        { icon: FileText, label: 'Manage Leave', path: '/admin/leave' },
        { icon: Users, label: 'Manage Users', path: '/admin/users' },
        { icon: UserPlus, label: 'Create User', path: '/admin/users/create' },
        { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
    ];

    return (
        <aside className={clsx(
            "fixed left-0 top-0 h-screen bg-brand-dark border-r border-brand-bright/20 transition-all duration-300 z-50 flex flex-col",
            isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
        )}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white truncate">SynopGen Admin</h1>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-brand-cyan lg:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium whitespace-nowrap',
                                isActive
                                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-brand-light hover:bg-white/5 rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
