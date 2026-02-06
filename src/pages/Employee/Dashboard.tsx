import { useEffect, useState } from 'react';
import { FileText, Clock, Megaphone, Calendar, ArrowRight, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, type Report } from '../../lib/supabase';
import { clsx } from 'clsx';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalReports: 0,
        approvedReports: 0,
        pendingReports: 0,
        completionRate: 0
    });
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            const { data: reports, error } = await supabase
                .from('reports')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const total = reports?.length || 0;
            const approved = reports?.filter(r => r.status === 'Approved').length || 0;
            const pending = reports?.filter(r => r.status === 'Pending').length || 0;
            const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

            setStats({
                totalReports: total,
                approvedReports: approved,
                pendingReports: pending,
                completionRate: rate
            });

            setRecentReports(reports?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
            {/* Left Column: Short Profile Summary */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Banner/Cover Photo */}
                    <div className="h-20 w-full overflow-hidden">
                        {user?.banner_url ? (
                            <img src={user.banner_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-primary-400 to-primary-600"></div>
                        )}
                    </div>

                    <div className="px-4 pb-6 -mt-8 flex flex-col items-center text-center">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover bg-white" />
                        ) : (
                            <div className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-primary-50 flex items-center justify-center text-primary-700 text-2xl font-bold">
                                {user?.full_name?.charAt(0)}
                            </div>
                        )}
                        <h3 className="mt-3 font-bold text-gray-800 text-lg">{user?.full_name}</h3>
                        <p className="text-sm text-gray-500">{user?.role}</p>

                        <div className="w-full h-px bg-gray-100 my-4"></div>

                        <div className="w-full text-left space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-gray-500">Department</span>
                                <span className="text-gray-800">{user?.department}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="text-gray-500">Status</span>
                                <span className="text-green-600 font-bold bg-green-50 px-2 rounded-full">{user?.status}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/app/profile')}
                        className="w-full py-3 px-4 border-t border-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        View Profile
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                    <div className="space-y-1">
                        <button onClick={() => navigate('/app/submit')} className="w-full flex items-center gap-3 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group text-left">
                            <FileText className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
                            <span>Submit Report</span>
                        </button>
                        <button onClick={() => navigate('/app/leave')} className="w-full flex items-center gap-3 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group text-left">
                            <Calendar className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                            <span>Apply for Leave</span>
                        </button>
                        <button onClick={() => navigate('/app/history')} className="w-full flex items-center gap-3 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors group text-left">
                            <HistoryIcon className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                            <span>Work History</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Column: Main Content */}
            <div className="lg:col-span-6 space-y-6">
                {/* Announcement Card (LinkedIn Style Post) */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Company Announcements</h3>
                            <p className="text-xs text-gray-500">Stay updated with latest news</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-sm font-bold text-blue-900">System Update v2.0</p>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">New LinkedIn-style workspace is now live! Explore the updated dashboard design for better focus.</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-2 py-0.5 rounded">New Feature</span>
                                <span className="text-[10px] text-blue-400">2 hours ago</span>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
                            <p className="text-sm font-bold text-green-900">Quarterly All-Hands</p>
                            <p className="text-xs text-green-700 mt-1 leading-relaxed">Join us for the Q1 strategy meeting this Friday. Check your calendar for the meeting link.</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600 px-2 py-0.5 rounded">Event</span>
                                <span className="text-[10px] text-green-400">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity (Like Feed Items) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Your Recent Activity</h3>
                        <button onClick={() => navigate('/app/history')} className="text-xs font-bold text-primary-600 hover:text-primary-700">See all history</button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full mx-auto"></div>
                        </div>
                    ) : recentReports.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">No recent reports found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentReports.map((report) => (
                                <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{report.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{report.type} • {new Date(report.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={clsx(
                                            'px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter',
                                            report.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                report.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                        )}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Statistics & Info */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Your Impact</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-600">Total Created</span>
                            </div>
                            <span className="font-bold text-gray-800">{stats.totalReports}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="text-sm text-gray-600">Wait for Approval</span>
                            </div>
                            <span className="font-bold text-gray-800">{stats.pendingReports}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Department Network</h4>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700">AK</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">+8</div>
                        </div>
                        <span className="text-xs text-gray-500">10 colleagues online</span>
                    </div>
                    <button
                        onClick={() => navigate('/app')}
                        className="w-full py-2 px-4 border border-primary-600 text-primary-600 text-xs font-bold rounded-full hover:bg-primary-50 transition-colors"
                    >
                        View Colleagues
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
