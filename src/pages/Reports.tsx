import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { supabase, type Report } from '../lib/supabase';

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">All Reports</h2>
                    <p className="text-gray-500 mt-1">View and manage system reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>
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
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No reports found.</td></tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{report.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'Approved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-primary-600 transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>Showing {reports.length} report(s)</span>
                </div>
            </div>
        </div>
    );
};

export default Reports;
