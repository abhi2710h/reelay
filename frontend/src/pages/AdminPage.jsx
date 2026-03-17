import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { HiOutlineChartBar, HiOutlineUsers, HiOutlineFlag, HiOutlineSearch, HiOutlineShieldCheck } from 'react-icons/hi';

const tabs = [
  { key: 'stats', label: 'Overview', icon: <HiOutlineChartBar size={16} /> },
  { key: 'users', label: 'Users', icon: <HiOutlineUsers size={16} /> },
  { key: 'reports', label: 'Reports', icon: <HiOutlineFlag size={16} /> },
];

export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reportedReels, setReportedReels] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'reports') loadReports();
  }, [tab]);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch {}
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?search=${userSearch}`);
      setUsers(data.users || []);
    } catch {}
    finally { setLoading(false); }
  };

  const loadReports = async () => {
    try {
      const { data } = await api.get('/admin/reported-reels');
      setReportedReels(data);
    } catch {}
  };

  const handleBan = async (userId, ban) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { ban });
      toast.success(ban ? 'User banned' : 'User unbanned');
      loadUsers();
    } catch { toast.error('Action failed'); }
  };

  const handleRemoveReel = async (reelId) => {
    try {
      await api.delete(`/admin/reels/${reelId}`);
      toast.success('Reel removed');
      loadReports();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <HiOutlineShieldCheck size={22} className="text-primary" />
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>
      </div>

      <div className="flex border-b border-dark-border sticky top-[61px] z-10 bg-dark">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-sm font-medium border-b-2 transition-all ${tab === t.key ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats ? [
                { label: 'Total Users', value: stats.totalUsers, color: 'text-primary' },
                { label: 'Total Reels', value: stats.totalReels, color: 'text-accent' },
                { label: 'Reported', value: stats.reportedReels, color: 'text-red-400' },
                { label: 'New Today', value: stats.newUsersToday, color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4 text-center">
                  <div className={`text-3xl font-black ${color} mb-1`}>{value ?? 0}</div>
                  <div className="text-gray-500 text-xs">{label}</div>
                </div>
              )) : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-4 h-20 skeleton" />
              ))}
            </div>

            {stats?.topReels?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-300 text-sm uppercase tracking-wider">Top Reels</h3>
                <div className="space-y-2">
                  {stats.topReels.map(reel => (
                    <div key={reel._id} className="card flex items-center gap-3 p-3">
                      <video src={reel.videoUrl} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" muted />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">@{reel.creator?.username}</p>
                        <p className="text-gray-500 text-xs truncate">{reel.caption || 'No caption'}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-400">▶ {reel.views}</span>
                          <span className="text-xs text-gray-400">♥ {reel.likes?.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers()}
                  placeholder="Search users..."
                  className="input-field pl-9 py-2.5 text-sm"
                />
              </div>
              <button onClick={loadUsers} className="btn-primary px-4 py-2.5 text-sm" style={{ width: 'auto' }}>Search</button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 skeleton" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u._id} className="card flex items-center gap-3 p-3">
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=a855f7&color=fff`} className="w-10 h-10 rounded-full flex-shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">@{u.username}</p>
                        {u.isAdmin && <span className="tag-pill text-[10px] px-2 py-0.5">Admin</span>}
                        {u.isBanned && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Banned</span>}
                      </div>
                      <p className="text-gray-500 text-xs truncate">{u.email}</p>
                    </div>
                    {!u.isAdmin && (
                      <button
                        onClick={() => handleBan(u._id, !u.isBanned)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0 ${u.isBanned ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'}`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </div>
                ))}
                {users.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    <HiOutlineUsers size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div className="space-y-3">
            {reportedReels.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <HiOutlineFlag size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No reported reels</p>
                <p className="text-sm mt-1 text-gray-600">All clear!</p>
              </div>
            ) : reportedReels.map(reel => (
              <div key={reel._id} className="card p-4">
                <div className="flex items-start gap-3">
                  <video src={reel.videoUrl} className="w-14 h-20 object-cover rounded-xl flex-shrink-0" muted />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">@{reel.creator?.username}</p>
                    <p className="text-gray-500 text-xs mb-2">{reel.reports?.length} report(s)</p>
                    <div className="space-y-1">
                      {reel.reports?.slice(0, 3).map((r, i) => (
                        <p key={i} className="text-xs text-gray-500 truncate">• {r.reason}</p>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveReel(reel._id)}
                    className="bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
