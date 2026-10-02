import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { RootState } from '../../app/store';
import api from '../../lib/axios';

interface Notification {
    _id: string;
    type: 'LIKE' | 'COMMENT';
    isRead: boolean;
    sender: { name: string; avatarIndex: number };
    post: { title: string; slug: string; _id: string };
    createdAt: string;
}

export const NotificationDropdown = () => {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (!user || !user.id || !token) return;

        // Strip /api/v1 from the Vite URL to hit root socket server
        const socketUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');

        const newSocket = io(socketUrl, {
            query: { userId: user.id }
        });

        setSocket(newSocket);

        // Bootstrap historical notifications from REST
        api.get('/notifications').then(res => {
            setNotifications(res.data.data.notifications);
        }).catch(err => console.error("Notification load failed", err));

        // Connect real-time event listener
        newSocket.on('notification_received', (newNotif: Notification) => {
            setNotifications(prev => [newNotif, ...prev]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user, token]);

    const markAsRead = async (id: string, postId: string) => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        try {
            await api.patch(`/notifications/${id}/read`);
            setIsOpen(false);
            window.location.href = `/posts/${postId}`; // Navigate to context directly
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    if (!user) return null;

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100/50"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-[14px]">Notifications</h3>
                        <span className="text-[12px] font-medium text-slate-500">{unreadCount} New</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto w-full">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-[13px] font-medium">You have no new notifications.</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map(n => (
                                    <button
                                        key={n._id}
                                        onClick={() => markAsRead(n._id, n.post._id)}
                                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="flex-1 w-full overflow-hidden">
                                            <p className="text-[13px] text-slate-600 leading-snug">
                                                <span className="font-bold text-slate-900">{n.sender.name}</span>
                                                {n.type === 'LIKE' ? ' liked your article ' : ' commented on '}
                                                <span className="font-semibold italic text-slate-800">"{n.post.title}"</span>.
                                            </p>
                                            <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
