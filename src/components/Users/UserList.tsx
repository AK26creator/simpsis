import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Shield, Edit2, Trash2 } from 'lucide-react';
import { supabase, type Employee } from '../../lib/supabase';

const UserList = () => {
    const [users, setUsers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('employees')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setUsers((prev) => prev.filter((u) => u.id !== id));
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter((user) =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const navigateTo = (path: string) => {
        window.location.href = path;
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage employees and system access</p>
                </div>
                <button
                    onClick={() => navigateTo('/admin/users/create')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Create User
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">User</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Role</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Status</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Department</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 text-xs sm:text-base">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <span className="flex items-center gap-1.5 text-[10px] sm:text-sm text-gray-600 bg-gray-100 px-2 py-0.5 sm:py-1 rounded inline-flex">
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <span className={
                                                `px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`
                                            }>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                                            {user.department}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4 sm:w-5 h-5" />
                                                </button>

                                                {activeDropdown === user.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveDropdown(null)}
                                                        />
                                                        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl border border-gray-100 py-1 z-20 overflow-hidden ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                            <button
                                                                onClick={() => {
                                                                    navigateTo(`/admin/users/edit/${user.id}`);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4 text-gray-400" />
                                                                Edit User
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteUser(user.id, user.full_name);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                                Delete User
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserList;
