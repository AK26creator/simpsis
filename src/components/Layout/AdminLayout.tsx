import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { user, isAdmin } = useAuth();

    // Simple protection: if not logged in, go to login. If logged in but not admin, go to app.
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/app" replace />;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <Header />
            <main className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
