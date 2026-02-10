import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const AdminLayout = () => {
    const { user, isAdmin } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Simple protection: if not logged in, go to login. If logged in but not admin, go to app.
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/app" replace />;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className={clsx(
                "transition-all duration-300 min-h-screen flex flex-col",
                isSidebarOpen ? "lg:ml-64" : "ml-0"
            )}>
                <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="p-4 sm:p-6 lg:p-8 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
