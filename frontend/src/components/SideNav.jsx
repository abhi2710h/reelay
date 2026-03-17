import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  HiOutlineHome, HiHome, HiOutlineFilm,
  HiOutlinePaperAirplane,
  HiOutlineSearch, HiOutlineGlobe,
  HiOutlineHeart, HiHeart, HiOutlinePlusCircle,
  HiOutlineMenuAlt3
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import MoreMenu from './MoreMenu';

export default function SideNav() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showMore, setShowMore] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: <HiOutlineHome size={22} />, activeIcon: <HiHome size={22} />, exact: true },
    { to: '/reels', label: 'Reels', icon: <HiOutlineFilm size={22} /> },
    { to: '/messages', label: 'Messages', icon: <HiOutlinePaperAirplane size={22} />, badge: unreadCount },
    { to: '/search', label: 'Search', icon: <HiOutlineSearch size={22} /> },
    { to: '/explore', label: 'Explore', icon: <HiOutlineGlobe size={22} /> },
    { to: '/notifications', label: 'Notifications', icon: <HiOutlineHeart size={22} />, activeIcon: <HiHeart size={22} />, badge: unreadCount },
    { to: '/upload', label: 'Create', icon: <HiOutlinePlusCircle size={22} />, special: true },
  ];

  return (
    <>
      <nav className="hidden md:flex flex-col w-64 h-screen bg-dark-card border-r border-dark-border py-5 sticky top-0 z-40 flex-shrink-0">
        <Link to="/" className="px-5 mb-8 mt-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <span className="text-white font-black text-base">R</span>
          </div>
          <h1 className="text-xl font-black brand-text tracking-tight">ReelAY</h1>
        </Link>

        <div className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon, activeIcon, exact, badge, special }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''} ${special ? 'mt-1' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex-shrink-0">
                    {special ? (
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-gradient shadow-glow-sm">
                        <HiOutlinePlusCircle size={18} className="text-white" />
                      </span>
                    ) : (
                      isActive && activeIcon ? activeIcon : icon
                    )}
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} mt-1`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=a855f7&color=fff`}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-dark-border"
                alt=""
              />
              {user?.isOnline && <span className="online-dot absolute -bottom-0.5 -right-0.5" />}
            </div>
            <span>Profile</span>
          </NavLink>
        </div>

        <div className="px-3 mt-2 border-t border-dark-border pt-3">
          <button
            onClick={() => setShowMore(true)}
            className="nav-item w-full"
          >
            <HiOutlineMenuAlt3 size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {showMore && <MoreMenu onClose={() => setShowMore(false)} />}
    </>
  );
}
