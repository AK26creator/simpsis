import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const AdminLayout = () => {
    const { user, isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Simple protection: if not logged in, go to login. If logged in but not admin, go to app.
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/app" replace />;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} />

            <div className={clsx(
                "transition-all duration-300 min-h-screen flex flex-col",
                isSidebarOpen ? "ml-64" : "ml-0"
            )}>
                <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="p-8 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
