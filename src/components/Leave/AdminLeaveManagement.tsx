import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { supabase, type LeaveRequest, type Employee } from '../../lib/supabase';
import { $user, $isAdmin } from '../../stores/authStore';
import { useStore } from '@nanostores/react';
import { clsx } from 'clsx';

const AdminLeaveManagement = () => {
    const user = useStore($user);
    const isAdmin = useStore($isAdmin);
    const [requests, setRequests] = useState<(LeaveRequest & { employee?: Employee })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchLeaveRequests();
        }
    }, [user]);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('leave_requests')
                .select(`
                    *,
                    employee:employees(*)
                `)
                .order('created_at', { ascending: false });

            // If not admin, only show requests assigned to this team leader
            if (!isAdmin) {
                query = query.eq('approver_id', user?.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, employeeId: string, leaveType: string, newStatus: 'Approved' | 'Rejected') => {
        setUpdatingId(id);
        try {
            // 1. Update Leave Request
            const { error: updateError } = await supabase
                .from('leave_requests')
                .update({ status: newStatus, approver_id: user?.id })
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Create Notification for Employee
            await supabase.from('notifications').insert([
                {
                    user_id: employeeId,
                    title: `Leave Request ${newStatus}`,
                    message: `Your ${leaveType.toLowerCase()} request has been ${newStatus.toLowerCase()}.`,
                    type: 'LeaveRequest',
                    link: '/app' // Or where they view history
                }
            ]);

            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            console.error('Error updating leave request:', error);
            alert('Failed to update leave request status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.employee?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.leave_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary-600" />
                        Leave Management
                    </h2>
                    <p className="text-gray-500 mt-1">Review and approve employee leave requests</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={clsx(
                                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                statusFilter === status
                                    ? "bg-primary-600 text-white shadow-md shadow-primary-100"
                                    : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or leave type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                    <button onClick={fetchLeaveRequests} className="text-xs font-bold text-primary-600 hover:underline">
                        Refresh List
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Leave Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-12 bg-gray-50 rounded-lg"></div></td>
                                    </tr>
                                ))
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No leave requests found.</td></tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 flex-shrink-0">
                                                    {req.employee?.avatar_url ? (
                                                        <img src={req.employee.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : req.employee?.full_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{req.employee?.full_name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{req.employee?.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="font-bold text-gray-800">{req.leave_type}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 italic">"{req.reason}"</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-gray-600 flex flex-col">
                                                <span>{new Date(req.start_date).toLocaleDateString()}</span>
                                                <span className="text-gray-300 mx-auto">↓</span>
                                                <span>{new Date(req.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest border",
                                                req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            )}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'Pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        disabled={updatingId === req.id}
                                                        onClick={() => handleStatusUpdate(req.id, req.employee_id, req.leave_type, 'Rejected')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        disabled={updatingId === req.id}
                                                        onClick={() => handleStatusUpdate(req.id, req.employee_id, req.leave_type, 'Approved')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-gray-300">
                                                    <Clock className="w-5 h-5 ml-auto opacity-20" />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaveManagement;
