import { useEffect, useState } from 'react';
import { Search, Filter, Eye, Calendar } from 'lucide-react';
import { supabase, type Report } from '../../lib/supabase';
import { $user } from '../../stores/authStore';
import { useStore } from '@nanostores/react';

const WorkHistory = () => {
    const user = useStore($user);
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user]);

    useEffect(() => {
        filterReports();
    }, [reports, searchTerm, statusFilter]);

    const fetchReports = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterReports = () => {
        let filtered = [...reports];

        // Filter by status
        if (statusFilter !== 'All') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredReports(filtered);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-700';
            case 'Rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Work History</h2>
                <p className="text-gray-500 mt-1">View all your submitted reports</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-white min-w-[150px]"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Title</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading reports...</td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm || statusFilter !== 'All'
                                            ? 'No reports match your filters.'
                                            : 'No reports found. Submit your first report!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                                {report.description && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                        {report.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{report.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                title="View Details"
                                                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-primary-600 transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50">
                    <span>Showing {filteredReports.length} of {reports.length} report(s)</span>
                    {statusFilter !== 'All' && (
                        <button
                            onClick={() => setStatusFilter('All')}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkHistory;
