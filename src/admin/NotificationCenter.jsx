import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead } from '../api/admin';
import { Bell, Check, ExternalLink, Inbox, MessageSquare, AlertCircle, Info } from 'lucide-react';

export default function NotificationCenter({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail
    }
  };

  const handleMarkRead = async (id, link) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link && onNavigate) {
        setOpen(false);
        onNavigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LEAD':
        return <Inbox size={14} className="text-emerald-400" />;
      case 'REVIEW':
        return <MessageSquare size={14} className="text-amber-400" />;
      case 'SYSTEM':
        return <AlertCircle size={14} className="text-red-400" />;
      default:
        return <Info size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
        title="Admin Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
            <span className="font-semibold text-white text-xs uppercase tracking-wider">Notifications</span>
            <span className="text-[11px] text-neutral-500">{unreadCount} unread</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-900 text-xs">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">No recent notifications</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id, notif.link)}
                  className={`p-3 cursor-pointer hover:bg-neutral-900 transition flex items-start gap-2.5 ${
                    !notif.isRead ? 'bg-neutral-900/40' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate">{notif.title}</span>
                      <span className="text-[10px] text-neutral-500 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5 line-clamp-2">{notif.message}</p>
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

