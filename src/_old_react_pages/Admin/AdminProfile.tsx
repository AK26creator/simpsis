import { Mail, Briefcase, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <p className="text-gray-500 mt-1">View your account information</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-32"></div>

                <div className="px-8 pb-8">
                    <div className="flex items-end gap-6 -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold border-2 border-primary-200">
                                {user.full_name.charAt(0)}
                            </div>
                        </div>

                        <div className="flex-1 pb-4">
                            <h3 className="text-2xl font-bold text-gray-800">{user.full_name}</h3>
                            <p className="text-gray-500">{user.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <Briefcase className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Department</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">{user.department}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <Shield className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Access Level</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {user.is_admin ? 'Administrator' : 'Employee'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">Member Since</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
