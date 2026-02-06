import { useEffect, useState } from 'react';
import { Bell, Trash2, X } from 'lucide-react';
import { supabase, type Notification } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const NotificationPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && isOpen) {
            fetchNotifications();

            // Subscribe to real-time notifications
            const channel = supabase
                .channel(`user-notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        setNotifications(prev => [payload.new as Notification, ...prev]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, isOpen]);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false);

            if (error) throw error;
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[500px] animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full">
                            {unreadCount} NEW
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-400 font-medium">Checking for updates...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                            <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">We'll alert you when something happens.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={clsx(
                                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative flex gap-3",
                                    !notification.read && "bg-primary-50/30"
                                )}
                            >
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
                                    notification.type === 'Announcement' ? 'bg-indigo-100 text-indigo-600' :
                                        notification.type === 'ReportStatus' ? 'bg-blue-100 text-blue-600' :
                                            notification.type === 'LeaveRequest' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                                )}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <h4 className={clsx(
                                        "text-sm font-semibold text-gray-900 truncate",
                                        !notification.read && "text-primary-700"
                                    )}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                        {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => deleteNotification(notification.id, e)}
                                        className="p-1.5 bg-white shadow-sm border border-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {!notification.read && (
                                    <div className="absolute top-4 right-2 w-2 h-2 bg-primary-600 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button className="text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors">
                    View full history
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;
