import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineHeart, HiOutlineChatAlt, HiOutlineFilm, HiOutlinePlay } from 'react-icons/hi';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const tabs = [
  { key: 'reels', label: 'Your Reels', icon: <HiOutlineFilm size={16} /> },
  { key: 'likes', label: 'Likes', icon: <HiOutlineHeart size={16} /> },
  { key: 'comments', label: 'Comments', icon: <HiOutlineChatAlt size={16} /> },
];

export default function ActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('reels');
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${user.username}/reels`);
        setReels(data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalViews = reels.reduce((sum, r) => sum + (r.views || 0), 0);
  const totalLikes = reels.reduce((sum, r) => sum + (r.likes?.length || 0), 0);

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 border-b border-dark-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <HiOutlineArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-bold">Your activity</h2>
      </div>

      {activeTab === 'reels' && !loading && reels.length > 0 && (
        <div className="grid grid-cols-3 gap-3 px-4 py-4">
          {[
            { label: 'Total Reels', value: reels.length, icon: <HiOutlineFilm size={18} /> },
            { label: 'Total Views', value: totalViews, icon: <HiOutlinePlay size={18} /> },
            { label: 'Total Likes', value: totalLikes, icon: <HiOutlineHeart size={18} /> },
          ].map(stat => (
            <div key={stat.label} className="card p-3 text-center">
              <div className="text-primary mb-1 flex justify-center">{stat.icon}</div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-gray-500 text-[10px]">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex border-b border-dark-border sticky top-[61px] z-10 bg-dark">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-primary text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div>
        {loading ? (
          <div className="grid grid-cols-3 gap-0.5 mt-0.5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[9/16] skeleton" />)}
          </div>
        ) : activeTab === 'reels' ? (
          reels.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <HiOutlineFilm size={36} className="mx-auto mb-3 opacity-30" />
              <p>No reels yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
              {reels.map(reel => (
                <div key={reel._id} className="aspect-[9/16] bg-dark-muted relative overflow-hidden group cursor-pointer">
                  <video src={reel.videoUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" muted />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <span className="flex items-center gap-1"><HiOutlinePlay size={11} /> {reel.views}</span>
                      <span className="flex items-center gap-1"><HiOutlineHeart size={11} /> {reel.likes?.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="w-14 h-14 rounded-2xl bg-dark-muted flex items-center justify-center mb-3">
              {activeTab === 'likes' ? <HiOutlineHeart size={24} className="opacity-40" /> : <HiOutlineChatAlt size={24} className="opacity-40" />}
            </div>
            <p className="font-medium">No {activeTab} yet</p>
            <p className="text-sm mt-1 text-gray-600">Your {activeTab} activity will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
