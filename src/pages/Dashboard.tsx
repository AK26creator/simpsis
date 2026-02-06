import { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase, type Employee, type Report } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, loading }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    {loading ? (
                        <div className="h-8 w-16 bg-gray-100 animate-pulse rounded"></div>
                    ) : value}
                </h3>
            </div>
            <div className={clsx('p-3 rounded-lg', color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Live Data</span>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalReports: 0,
        pendingReports: 0,
        totalLeaves: 0
    });
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [newEmployees, setNewEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Counts
            const [
                { count: empCount },
                { count: reportCount },
                { count: pendingCount },
                { count: leaveCount }
            ] = await Promise.all([
                supabase.from('employees').select('*', { count: 'exact', head: true }),
                supabase.from('reports').select('*', { count: 'exact', head: true }),
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
                supabase.from('leave_requests').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                totalEmployees: empCount || 0,
                totalReports: reportCount || 0,
                pendingReports: pendingCount || 0,
                totalLeaves: leaveCount || 0
            });

            // 2. Fetch Recent Reports
            const { data: reports } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentReports(reports || []);

            // 3. Fetch New Employees
            const { data: employees } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            setNewEmployees(employees || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { icon: Users, label: 'Total Employees', value: stats.totalEmployees, color: 'bg-blue-500' },
        { icon: FileText, label: 'Total Reports', value: stats.totalReports, color: 'bg-indigo-500' },
        { icon: AlertCircle, label: 'Pending Reviews', value: stats.pendingReports, color: 'bg-amber-500' },
        { icon: Calendar, label: 'Leave Requests', value: stats.totalLeaves, color: 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                    <TrendingUp className={clsx("w-5 h-5", loading && "animate-spin")} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} loading={loading} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Recent Reports Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800">Recent Reports</h3>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline"
                        >
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>
                            ))
                        ) : recentReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <FileText className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">No reports to show</p>
                            </div>
                        ) : (
                            recentReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 line-clamp-1">{report.title}</h4>
                                            <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()} • {report.status}</p>
                                        </div>
                                    </div>
                                    <span className={clsx(
                                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                                        report.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            report.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    )}>
                                        {report.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* New Employees Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800">New Employees</h3>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline"
                        >
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>
                            ))
                        ) : newEmployees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Users className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">No employees found</p>
                            </div>
                        ) : (
                            newEmployees.map((emp) => (
                                <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {emp.avatar_url ? (
                                            <img src={emp.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase">
                                                {emp.full_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-medium text-gray-900">{emp.full_name}</h4>
                                            <p className="text-xs text-gray-500">{emp.role} • {emp.department}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/users`)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                                    >
                                        View
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
