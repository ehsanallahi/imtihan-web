'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Trophy, Flame, AlertCircle, Info, Calendar } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notificationActions";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.isRead).length);
  }

  async function handleMarkAsRead(id) {
    await markAsRead(id);
    fetchNotifications();
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead();
    fetchNotifications();
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'streak_warning': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'exam_reminder': return <Calendar className="w-4 h-4 text-indigo-500" />;
      default: return <Info className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-teal-50">
          <Bell className="h-5 w-5 text-teal-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-crimson-600 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-xl border-teal-50" align="end">
        <div className="flex items-center justify-between p-4 border-b border-teal-50 bg-teal-50/30">
          <h3 className="font-display font-bold text-teal-900">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-teal-50/50 flex gap-3 transition-colors hover:bg-teal-50/20 ${!n.isRead ? 'bg-white' : 'opacity-60'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-teal-950 truncate">{n.title}</p>
                  <p className="text-xs text-zinc-600 line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-zinc-400 mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n.id)}
                    className="flex-shrink-0 mt-1 h-5 w-5 rounded-full hover:bg-teal-100 flex items-center justify-center text-teal-600"
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
