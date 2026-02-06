import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const SubmitReport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        description: '',
        proofUrl: ''
    });

    const reportTypes = [
        'Daily Report',
        'Weekly Report',
        'Incident Report',
        'Progress Update',
        'Issue Report'
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.type || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('reports')
                .insert([
                    {
                        title: formData.title,
                        type: formData.type,
                        description: formData.description,
                        proof_url: formData.proofUrl || null,
                        author_id: user?.id,
                        status: 'Pending'
                    }
                ]);

            if (error) throw error;

            setSuccess(true);
            setFormData({ title: '', type: '', description: '', proofUrl: '' });

            setTimeout(() => {
                navigate('/app/history');
            }, 2000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted Successfully!</h2>
                    <p className="text-gray-600 mb-4">Your report has been submitted for review.</p>
                    <p className="text-sm text-gray-500">Redirecting to work history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Submit New Report</h2>
                <p className="text-gray-500 mt-1">Fill out the form below to submit a new report</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                {/* Report Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Report Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow appearance-none bg-white"
                        required
                    >
                        <option value="">Select Report Type</option>
                        {reportTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Report Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Weekly Progress Report - Jan 2026"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Provide detailed information about your report..."
                        rows={6}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-none"
                        required
                    />
                </div>

                {/* Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Review Process</p>
                        <p className="text-blue-700 mt-1">Your report will be reviewed by your department manager. You'll be notified once it's been processed.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/app')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText className="w-5 h-5" />
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitReport;
