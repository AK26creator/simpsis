import { Mail, Briefcase, Shield, Calendar, Award, Camera, Loader2, FileText } from 'lucide-react';
import { $user, updateUser } from '../../stores/authStore';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '@nanostores/react';

const EmployeeProfile = () => {
    const user = useStore($user);
    const [stats, setStats] = useState({
        totalReports: 0,
        approvedReports: 0,
        pendingReports: 0
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('reports')
                .select('status')
                .eq('author_id', user.id);

            if (error) throw error;

            const total = data?.length || 0;
            const approved = data?.filter(r => r.status === 'Approved').length || 0;
            const pending = data?.filter(r => r.status === 'Pending').length || 0;

            setStats({ totalReports: total, approvedReports: approved, pendingReports: pending });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpload = async (file: File, type: 'avatar' | 'banner') => {
        if (!file || !user) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be less than 2MB');
            return;
        }

        const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBanner;
        const bucket = type === 'avatar' ? 'avatars' : 'banners';
        const field = type === 'avatar' ? 'avatar_url' : 'banner_url';

        try {
            setUploading(true);

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            // 3. Update employees table
            const { error: updateError } = await supabase
                .from('employees')
                .update({ [field]: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 4. Update local context/store
            updateUser({ [field]: publicUrl });

        } catch (error: any) {
            console.error(`Error uploading ${type}:`, error);
            alert(error.message || `Failed to upload ${type}`);
        } finally {
            setUploading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <p className="text-gray-500 mt-1">Manage your account and view your performance</p>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Banner Section */}
                <div className="relative group/banner h-48 w-full bg-gray-100">
                    {user.banner_url ? (
                        <img src={user.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-700"></div>
                    )}

                    <button
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all opacity-0 group-hover/banner:opacity-100 flex items-center gap-2 px-3"
                    >
                        {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        <span className="text-xs font-bold text-gray-700">Change Banner</span>
                    </button>

                    <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
                        {/* Avatar Section */}
                        <div className="relative group/avatar">
                            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-700 text-4xl font-bold">
                                        {user.full_name.charAt(0)}
                                    </div>
                                )}

                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute bottom-1 right-1 p-2 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-colors group-hover/avatar:scale-110"
                                title="Change profile picture"
                            >
                                <Camera className="w-4 h-4 text-gray-600" />
                            </button>

                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="text-center md:text-left pb-2">
                            <h3 className="text-2xl font-bold text-gray-800">{user.full_name}</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-full">{user.role}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{user.department}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-primary-500" />
                                <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Briefcase className="w-4 h-4 text-green-500" />
                                <p className="text-sm font-semibold text-gray-800">{user.department}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="w-4 h-4 text-amber-500" />
                                <p className="text-sm font-semibold text-gray-800">{user.status}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <p className="text-sm font-semibold text-gray-800">
                                    {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LinkedIn-style Achievement Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <Award className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Work Statistics</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="relative p-6 bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden">
                        <div className="relative z-10 text-center">
                            <p className="text-4xl font-extrabold text-blue-600 mb-1">{stats.totalReports}</p>
                            <p className="text-sm font-bold text-blue-900/60 uppercase tracking-wider">Reports Filed</p>
                        </div>
                        <FileText className="absolute -bottom-2 -right-2 w-16 h-16 text-blue-100 -rotate-12" />
                    </div>

                    <div className="relative p-6 bg-green-50/50 rounded-2xl border border-green-100 overflow-hidden">
                        <div className="relative z-10 text-center">
                            <p className="text-4xl font-extrabold text-green-600 mb-1">{stats.approvedReports}</p>
                            <p className="text-sm font-bold text-green-900/60 uppercase tracking-wider">Approved</p>
                        </div>
                        <Award className="absolute -bottom-2 -right-2 w-16 h-16 text-green-100 -rotate-12" />
                    </div>

                    <div className="relative p-6 bg-amber-50/50 rounded-2xl border border-amber-100 overflow-hidden">
                        <div className="relative z-10 text-center">
                            <p className="text-4xl font-extrabold text-amber-600 mb-1">{stats.pendingReports}</p>
                            <p className="text-sm font-bold text-amber-900/60 uppercase tracking-wider">Pending</p>
                        </div>
                        <Shield className="absolute -bottom-2 -right-2 w-16 h-16 text-amber-100 -rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
