import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { HiOutlineBell } from 'react-icons/hi';

const typeConfig = {
  like: { label: 'liked your reel', color: 'text-red-400', bg: 'bg-red-500/10' },
  comment: { label: 'commented on your reel', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  follow: { label: 'started following you', color: 'text-green-400', bg: 'bg-green-500/10' },
  mention: { label: 'mentioned you', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  message: { label: 'sent you a message', color: 'text-primary', bg: 'bg-primary/10' },
  reel_share: { label: 'shared your reel', color: 'text-accent', bg: 'bg-accent/10' },
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    markAllRead();
  }, []);

  const today = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return now - d < 86400000;
  });
  const older = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return now - d >= 86400000;
  });

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 border-b border-dark-border">
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="w-16 h-16 rounded-2xl bg-dark-muted flex items-center justify-center mb-4">
            <HiOutlineBell size={28} className="opacity-40" />
          </div>
          <p className="font-semibold">No notifications yet</p>
          <p className="text-sm mt-1 text-gray-600">When someone interacts with you, it'll show here</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {today.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Today</p>
              {today.map(n => <NotifItem key={n._id} n={n} />)}
            </div>
          )}
          {older.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earlier</p>
              {older.map(n => <NotifItem key={n._id} n={n} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifItem({ n }) {
  const config = typeConfig[n.type] || { label: n.type, color: 'text-gray-400', bg: 'bg-dark-muted' };
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-dark-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}>
      <Link to={`/profile/${n.sender?.username}`} className="relative flex-shrink-0">
        <img
          src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender?.username}&background=a855f7&color=fff`}
          className="w-11 h-11 rounded-full object-cover"
          alt=""
        />
        <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${config.bg} flex items-center justify-center text-[10px]`}>
          {n.type === 'like' ? '♥' : n.type === 'comment' ? '💬' : n.type === 'follow' ? '👤' : '•'}
        </span>
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <Link to={`/profile/${n.sender?.username}`} className="font-semibold hover:text-primary transition-colors">
            @{n.sender?.username}
          </Link>
          {' '}
          <span className="text-gray-300">{config.label}</span>
        </p>
        <p className="text-gray-600 text-xs mt-0.5">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </p>
      </div>
      {n.reel?.thumbnailUrl && (
        <img src={n.reel.thumbnailUrl} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" alt="" />
      )}
      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
    </div>
  );
}
