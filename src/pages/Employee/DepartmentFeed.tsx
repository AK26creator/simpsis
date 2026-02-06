import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, type Report } from '../../lib/supabase';
import { Filter, Search, Eye, Calendar } from 'lucide-react';

const DepartmentFeed = () => {
    const { user, isAdmin } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        if (user) {
            fetchDepartmentReports();
        }
    }, [user, isAdmin]);

    useEffect(() => {
        filterReports();
    }, [reports, searchTerm, typeFilter]);

    const fetchDepartmentReports = async () => {
        if (!user) return;

        try {
            let query = supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            // If user is not admin, filter by department
            if (!isAdmin) {
                // Get all employees from the same department
                const { data: departmentEmployees, error: empError } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('department', user.department);

                if (empError) throw empError;

                const employeeIds = departmentEmployees?.map(emp => emp.id) || [];
                query = query.in('author_id', employeeIds);
            }

            const { data, error } = await query;

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching department reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterReports = () => {
        let filtered = [...reports];

        // Filter by type
        if (typeFilter !== 'All') {
            filtered = filtered.filter(r => r.type === typeFilter);
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
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const reportTypes = ['Daily Report', 'Weekly Report', 'Incident Report', 'Progress Update', 'Issue Report'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {isAdmin ? 'All Department Reports' : `${user?.department} Department Feed`}
                </h2>
                <p className="text-gray-500 mt-1">
                    {isAdmin
                        ? 'View reports from all departments across the organization'
                        : `View reports from your ${user?.department} department colleagues`}
                </p>
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
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none bg-white min-w-[180px]"
                        >
                            <option value="All">All Types</option>
                            {reportTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading department reports...</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">
                        {searchTerm || typeFilter !== 'All'
                            ? 'No reports match your filters.'
                            : isAdmin
                                ? 'No reports have been submitted yet.'
                                : `No reports from ${user?.department} department yet.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow p-6 space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2">{report.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{report.type}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>

                            {/* Description */}
                            {report.description && (
                                <p className="text-sm text-gray-600 line-clamp-3">{report.description}</p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(report.created_at).toLocaleDateString()}
                                </div>
                                <button
                                    title="View Details"
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-600 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results Count */}
            {!loading && filteredReports.length > 0 && (
                <div className="text-sm text-gray-500 text-center">
                    Showing {filteredReports.length} of {reports.length} report(s)
                    {typeFilter !== 'All' && (
                        <button
                            onClick={() => setTypeFilter('All')}
                            className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default DepartmentFeed;
