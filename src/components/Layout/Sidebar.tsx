import { LayoutDashboard, Users, FileText, UserPlus, LogOut, Bell, X } from 'lucide-react';
import { clsx } from 'clsx';
import { logout } from '../../stores/authStore';
import { useEffect, useState } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'View Reports', path: '/admin/reports' },
        { icon: FileText, label: 'Manage Leave', path: '/admin/leave' },
        { icon: Users, label: 'Manage Users', path: '/admin/users' },
        { icon: UserPlus, label: 'Create User', path: '/admin/users/create' },
        { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
    ];

    const isActive = (path: string) => {
        if (path === '/admin' && currentPath === '/admin') return true;
        if (path !== '/admin' && currentPath.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className={clsx(
            "fixed left-0 top-0 h-screen bg-gray-900 border-r border-white/5 transition-all duration-300 z-50 flex flex-col font-sans",
            isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
        )}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white truncate lowercase italic tracking-tight">SIMPSIS <span className="text-primary-500 not-italic">Admin</span></h1>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-primary-400 lg:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <a
                        key={item.path}
                        href={item.path}
                        className={clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium whitespace-nowrap',
                            isActive(item.path)
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        )}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
