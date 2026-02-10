import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User as UserIcon, Mail, Briefcase, Lock, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        department: 'Engineering',
        role: '',
        isAdmin: false,
        isTeamLeader: false,
        password: '',
        status: 'Active' as 'Active' | 'Inactive'
    });

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    fullName: data.full_name,
                    email: data.email,
                    department: data.department,
                    role: data.role,
                    isAdmin: data.is_admin || false,
                    isTeamLeader: data.is_team_leader || false,
                    password: data.password || '',
                    status: data.status
                });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            alert('Failed to fetch user data');
            navigate('/admin/users');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            role: value,
            isAdmin: value === 'Admin'
        }));
    }

    const handleAdminCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isAdmin: checked,
            role: checked ? 'Admin' : prev.role === 'Admin' ? '' : prev.role
        }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.role) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('employees')
                .update({
                    full_name: formData.fullName,
                    email: formData.email,
                    department: formData.department,
                    role: formData.role,
                    is_admin: formData.isAdmin,
                    is_team_leader: formData.isTeamLeader,
                    password: formData.password,
                    status: formData.status
                })
                .eq('id', id);

            if (error) throw error;

            alert('User updated successfully');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
                    <p className="text-gray-500 mt-1">Update information for {formData.fullName}.</p>
                </div>
            </div>

            <form className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="john@synopgen.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Job Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow appearance-none bg-white"
                                    value={formData.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                >
                                    <option>Engineering</option>
                                    <option>Design</option>
                                    <option>Marketing</option>
                                    <option>HR</option>
                                    <option>Management</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Role / Position</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow appearance-none bg-white"
                                value={formData.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Admin">Admin</option>
                                <option value="Team Leader">Team Leader</option>
                                <option value="Senior Developer">Senior Developer</option>
                                <option value="Developer">Developer</option>
                                <option value="Designer">Designer</option>
                                <option value="Marketing Manager">Marketing Manager</option>
                                <option value="HR Manager">HR Manager</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Account Status</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow appearance-none bg-white"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="isAdmin"
                                checked={formData.isAdmin}
                                onChange={(e) => handleAdminCheckboxChange(e.target.checked)}
                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                <strong>Admin Privileges:</strong> User can access Admin Dashboard.
                            </label>
                        </div>
                        <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <input
                                type="checkbox"
                                id="isTeamLeader"
                                checked={formData.isTeamLeader}
                                onChange={(e) => setFormData(prev => ({ ...prev, isTeamLeader: e.target.checked }))}
                                className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                            />
                            <label htmlFor="isTeamLeader" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                <strong>Team Leader:</strong> Can approve department leave.
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Security</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500">Note: Password is stored in plain text for this demo.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Update Employee
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUser;
