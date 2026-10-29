'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRead = async (notification: any) => {
    await api.markNotificationAsRead(notification.id);
    setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n));
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  const handleReadAll = async () => {
    await api.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'WARNING': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'ALERT': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-slate-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleReadAll} className="text-xs text-violet-600 hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">No notifications.</p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => handleRead(n)}
                  className={`flex items-start gap-3 p-4 border-b hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-violet-50/50' : ''}`}
                >
                  {getIcon(n.type)}
                  <div>
                    <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''}`}>{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}