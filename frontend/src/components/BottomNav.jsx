import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome, HiHome, HiOutlineSearch,
  HiOutlinePlusCircle, HiOutlineHeart, HiHeart,
  HiOutlineMenuAlt3
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import MoreMenu from './MoreMenu';

export default function BottomNav() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-dark-border">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
            {({ isActive }) => (
              <>
                {isActive ? <HiHome size={24} /> : <HiOutlineHome size={24} />}
                <span className="text-[10px]">Home</span>
              </>
            )}
          </NavLink>

          <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
            <HiOutlineSearch size={24} />
            <span className="text-[10px]">Search</span>
          </NavLink>

          <NavLink to="/upload" className="flex flex-col items-center gap-0.5 p-1">
            <div className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
              <HiOutlinePlusCircle size={24} className="text-white" />
            </div>
          </NavLink>

          <NavLink to="/notifications" className={({ isActive }) => `flex flex-col items-center gap-0.5 p-2 rounded-xl relative transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
            {({ isActive }) => (
              <>
                {isActive ? <HiHeart size={24} /> : <HiOutlineHeart size={24} />}
                <span className="text-[10px]">Activity</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          <button onClick={() => setShowMore(true)} className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-gray-500 hover:text-white transition-colors">
            <HiOutlineMenuAlt3 size={24} />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {showMore && <MoreMenu onClose={() => setShowMore(false)} />}
    </>
  );
}
