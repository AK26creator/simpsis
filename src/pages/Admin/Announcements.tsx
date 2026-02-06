import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Calendar, User, Search, X } from 'lucide-react';
import { supabase, type Announcement } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ title: '', content: '', type: 'General' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            // 1. Create Announcement
            const { data: newAnnouncement, error: createError } = await supabase
                .from('announcements')
                .insert([{
                    ...formData,
                    created_by: user.id
                }])
                .select()
                .single();

            if (createError) throw createError;

            // 2. Fetch all employees to notify
            const { data: employees, error: fetchError } = await supabase
                .from('employees')
                .select('id')
                .eq('status', 'Active');

            if (fetchError) throw fetchError;

            // 3. Create Notifications in bulk
            if (employees && employees.length > 0) {
                const notifications = employees.map(emp => ({
                    user_id: emp.id,
                    title: 'New Announcement',
                    message: formData.title,
                    type: 'Announcement',
                    link: '/app' // Direct to department feed
                }));

                const { error: notifError } = await supabase.from('notifications').insert(notifications);
                if (notifError) console.error('Error creating notifications:', notifError);
            }

            setAnnouncements([newAnnouncement, ...announcements]);
            setShowModal(false);
            setFormData({ title: '', content: '', type: 'General' });
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to create announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const { error } = await supabase.from('announcements').delete().eq('id', id);
            if (error) throw error;
            setAnnouncements(announcements.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Failed to delete announcement');
        }
    };

    const filtered = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-primary-600" />
                        Company Announcements
                    </h2>
                    <p className="text-gray-500 mt-1">Manage global updates and news for all employees</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 font-bold active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Announcement
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse">Loading announcements...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No announcements found. Click "New Announcement" to create one.</div>
                    ) : (
                        filtered.map((announcement) => (
                            <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors group relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={clsx(
                                                "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                                                announcement.type === 'Important' ? 'bg-red-100 text-red-700' :
                                                    announcement.type === 'Event' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            )}>
                                                {announcement.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{announcement.title}</h3>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                                        <div className="flex items-center gap-4 pt-2 text-xs text-gray-400 font-medium tracking-tight">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                Admin Post
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-red-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <h3 className="text-2xl font-bold text-gray-900">Push Announcement</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Annual Office Party 2024"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium appearance-none bg-white"
                                >
                                    <option value="General">General News</option>
                                    <option value="Important">Important Alert</option>
                                    <option value="Event">Upcoming Event</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Write your message here..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium resize-none shadow-inner"
                                />
                            </div>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Pushing to everyone...
                                    </>
                                ) : 'Broadcast Announcement'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
