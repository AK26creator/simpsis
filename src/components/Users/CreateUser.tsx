import { useState } from 'react';
import { ArrowLeft, Save, User as UserIcon, Mail, Briefcase, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const CreateUser = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        department: 'Engineering',
        role: '',
        isAdmin: false,
        isTeamLeader: false,
        password: '',
        confirmPassword: ''
    });

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

    const navigateTo = (path: string) => {
        window.location.href = path;
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email || !formData.role) {
            alert('Please fill in all required fields');
            return;
        }

        if (!formData.password) {
            alert('Please enter a password for the user');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('employees')
                .insert([
                    {
                        full_name: formData.fullName,
                        email: formData.email,
                        department: formData.department,
                        role: formData.role,
                        is_admin: formData.isAdmin,
                        is_team_leader: formData.isTeamLeader,
                        password: formData.password,
                        status: 'Active'
                    }
                ]);

            if (error) throw error;

            navigateTo('/admin/users');
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button
                onClick={() => navigateTo('/admin/users')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Users
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Create New Employee</h2>
                    <p className="text-gray-500 mt-1">Add a new user to the system.</p>
                </div>
            </div>

            <form className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Role / Position</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow appearance-none bg-white"
                                value={formData.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
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
                    </div>
                    <div className="flex items-center gap-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="isAdmin"
                            checked={formData.isAdmin}
                            onChange={(e) => handleAdminCheckboxChange(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                            <strong>Grant Admin Privileges:</strong> User can access the Admin Dashboard.
                            {formData.role === 'Admin' && <span className="text-primary-600 ml-2">(Auto-enabled for Admin role)</span>}
                        </label>
                    </div>
                    <div className="flex items-center gap-2 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <input
                            type="checkbox"
                            id="isTeamLeader"
                            checked={formData.isTeamLeader}
                            onChange={(e) => setFormData(prev => ({ ...prev, isTeamLeader: e.target.checked }))}
                            className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <label htmlFor="isTeamLeader" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                            <strong>Grant Team Leader Privileges:</strong> User can approve leave requests in their department.
                        </label>
                    </div>
                </div>

                <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Security</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="Enter password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="Re-enter password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigateTo('/admin/users')}
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
                                Create Employee
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;
