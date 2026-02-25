import { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { $user } from '../../stores/authStore';
import { useStore } from '@nanostores/react';

const ApplyLeave = () => {
    const user = useStore($user);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const leaveTypes = [
        'Sick Leave',
        'Casual Leave',
        'Annual Leave',
        'Emergency Leave',
        'Maternity/Paternity Leave'
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const navigateTo = (path: string) => {
        window.location.href = path;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate dates
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alert('End date must be after start date');
            return;
        }

        setLoading(true);
        try {
            let approverId = null;

            // Only seek department TL if the requester is NOT a Team Leader themselves
            if (!user?.is_team_leader) {
                const { data: teamLeader, error: tlError } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('department', user?.department)
                    .eq('is_team_leader', true)
                    .single();

                if (tlError && tlError.code !== 'PGRST116') {
                    console.error('Error finding team leader:', tlError);
                }
                approverId = teamLeader?.id || null;
            }

            const { error } = await supabase
                .from('leave_requests')
                .insert([
                    {
                        employee_id: user?.id,
                        leave_type: formData.leaveType,
                        start_date: formData.startDate,
                        end_date: formData.endDate,
                        reason: formData.reason,
                        approver_id: approverId,
                        status: 'Pending'
                    }
                ]);

            if (error) throw error;

            setSuccess(true);
            setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });

            setTimeout(() => {
                navigateTo('/app');
            }, 2000);
        } catch (error) {
            console.error('Error submitting leave request:', error);
            alert('Failed to submit leave request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Leave Request Submitted!</h2>
                    <p className="text-gray-600 mb-4">Your leave request has been sent to the {user?.is_team_leader ? 'Admin' : 'Team Leader'} for approval.</p>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Apply for Leave</h2>
                <p className="text-gray-500 mt-1">Submit a leave request to the {user?.is_team_leader ? 'Admin' : 'Team Leader'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6">
                {/* Leave Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Leave Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.leaveType}
                        onChange={(e) => handleInputChange('leaveType', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow appearance-none bg-white"
                        required
                    >
                        <option value="">Select Leave Type</option>
                        {leaveTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                            required
                        />
                    </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        placeholder="Provide the reason for your leave request..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
                        required
                    />
                </div>

                {/* Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Approval Process</p>
                        <p className="text-blue-700 mt-1">Your leave request will be sent to the {user?.is_team_leader ? 'Admin' : 'department Team Leader'} for approval.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigateTo('/app')}
                        className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Calendar className="w-5 h-5" />
                        {loading ? 'Submitting...' : 'Submit Leave Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApplyLeave;
