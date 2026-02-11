import { useState } from 'react';
import { X, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { supabase, type Report, type Employee } from '../../lib/supabase';
import { clsx } from 'clsx';

interface ReportDetailsModalProps {
    report: Report & { author?: Employee };
    onClose: () => void;
    onUpdate?: () => void;
    showAdminActions?: boolean;
}

const ReportDetailsModal = ({ report, onClose, onUpdate, showAdminActions = false }: ReportDetailsModalProps) => {
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: 'Approved' | 'Rejected') => {
        setUpdating(true);
        try {
            const { error: updateError } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', report.id);

            if (updateError) throw updateError;

            // Create notification
            await supabase.from('notifications').insert([
                {
                    user_id: report.author_id,
                    title: `Report ${newStatus}`,
                    message: `Your report "${report.title}" has been ${newStatus.toLowerCase()}.`,
                    type: 'ReportStatus',
                    link: '/app/history'
                }
            ]);

            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating report status:', error);
            alert('Failed to update report status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                    {showAdminActions && report.status === 'Pending' && (
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

export default ReportDetailsModal;
