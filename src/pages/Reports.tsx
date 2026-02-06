import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, X, ExternalLink } from 'lucide-react';
import { supabase, type Report, type Employee } from '../lib/supabase';
import { clsx } from 'clsx';

const ReportModal = ({ report, onClose, onUpdate }: { report: Report & { author?: Employee }, onClose: () => void, onUpdate: () => void }) => {
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: 'Approved' | 'Rejected') => {
        setUpdating(true);
        try {
            // 1. Update Report Status
            const { error: updateError } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', report.id);

            if (updateError) throw updateError;

            // 2. Create Notification for Employee
            await supabase.from('notifications').insert([
                {
                    user_id: report.author_id,
                    title: `Report ${newStatus}`,
                    message: `Your report "${report.title}" has been ${newStatus.toLowerCase()}.`,
                    type: 'ReportStatus',
                    link: '/app/history'
                }
            ]);

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating report status:', error);
            alert('Failed to update report status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Submitted by {report.author?.full_name || 'Unknown'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Type</span>
                            <p className="text-gray-900 font-medium">{report.type}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted On</span>
                            <p className="text-gray-900 font-medium">{new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {report.description || 'No description provided.'}
                        </div>
                    </div>

                    {report.proof_url && (
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachment</span>
                            <a
                                href={report.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-primary-50 text-primary-700 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors group"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-sm font-medium">View Submitted Proof</span>
                            </a>
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status:</span>
                        <span className={clsx(
                            "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest",
                            report.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                report.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        )}>
                            {report.status}
                        </span>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                    {report.status === 'Pending' && (
                        <>
                            <button
                                disabled={updating}
                                onClick={() => handleStatusUpdate('Rejected')}
                                className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <XCircle className="w-5 h-5" />
                                Reject
                            </button>
                            <button
                                disabled={updating}
                                onClick={() => handleStatusUpdate('Approved')}
                                className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <CheckCircle className="w-5 h-5" />
                                {updating ? 'Updating...' : 'Approve Report'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const Reports = () => {
    const [reports, setReports] = useState<(Report & { author?: Employee })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState<(Report & { author?: Employee }) | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    *,
                    author:employees(*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Report Review</h2>
                    <p className="text-gray-500 mt-1">Approve or reject employee performance reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Report Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-4"><div className="h-12 bg-gray-50 rounded-lg"></div></td>
                                    </tr>
                                ))
                            ) : filteredReports.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">No reports matching your search</td></tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                                                    {report.author?.avatar_url ? (
                                                        <img src={report.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : report.author?.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{report.author?.full_name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{report.author?.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 line-clamp-1">{report.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">{report.type}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border",
                                                report.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    report.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            )}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all text-sm font-bold active:scale-95"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onUpdate={fetchReports}
                />
            )}
        </div>
    );
};

export default Reports;
