import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCog, HiOutlineClipboardList, HiOutlineBookmark,
  HiOutlineSun, HiOutlineExclamationCircle, HiOutlineLogout,
  HiOutlineSwitchHorizontal
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function MoreMenu({ onClose }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const go = (path) => { onClose(); navigate(path); };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-end md:justify-start" onClick={onClose}>
      <div
        className="md:ml-64 mb-20 md:mb-6 mx-3 md:mx-4 w-full md:w-72 glass rounded-2xl overflow-hidden shadow-card fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2">
          <MenuItem icon={<HiOutlineCog size={19} />} label="Settings" onClick={() => go('/settings')} />
          <MenuItem icon={<HiOutlineClipboardList size={19} />} label="Your activity" onClick={() => go('/activity')} />
          <MenuItem icon={<HiOutlineBookmark size={19} />} label="Saved" onClick={() => go('/saved')} />
          <MenuItem icon={<HiOutlineSun size={19} />} label="Switch appearance" onClick={() => { toast('Theme switching coming soon'); onClose(); }} />
          <MenuItem icon={<HiOutlineExclamationCircle size={19} />} label="Report a problem" onClick={() => go('/report')} />
        </div>
        <div className="border-t border-dark-border p-2">
          <MenuItem icon={<HiOutlineSwitchHorizontal size={19} />} label="Switch accounts" onClick={() => { toast('Coming soon'); onClose(); }} />
        </div>
        <div className="border-t border-dark-border p-2">
          <MenuItem icon={<HiOutlineLogout size={19} />} label="Log out" onClick={handleLogout} danger />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-gray-200 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={danger ? 'text-red-400' : 'text-gray-400'}>{icon}</span>
      {label}
    </button>
  );
}
