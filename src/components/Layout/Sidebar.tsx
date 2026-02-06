import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, UserPlus, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'View Reports', path: '/admin/reports' },
        { icon: Users, label: 'Manage Users', path: '/admin/users' },
        { icon: UserPlus, label: 'Create User', path: '/admin/users/create' },
    ];

    return (
        <aside className={clsx(
            "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-20 flex flex-col",
            isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
        )}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-600 truncate">SIMPSIS Admin</h1>
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
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
