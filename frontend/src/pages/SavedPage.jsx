import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineBookmark } from 'react-icons/hi';
import { HiOutlinePlay, HiOutlineHeart } from 'react-icons/hi';
import api from '../lib/axios';

export default function SavedPage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/saved-reels').then(r => setReels(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 border-b border-dark-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <HiOutlineArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-bold">Saved</h2>
        {reels.length > 0 && <span className="ml-auto text-xs text-gray-500">{reels.length} reels</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[9/16] skeleton" />)}
        </div>
      ) : reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <div className="w-16 h-16 rounded-2xl bg-dark-muted flex items-center justify-center mb-4">
            <HiOutlineBookmark size={28} className="opacity-40" />
          </div>
          <p className="font-semibold">No saved reels</p>
          <p className="text-sm mt-1 text-gray-600">Reels you save will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {reels.map(reel => (
            <div
              key={reel._id}
              onClick={() => navigate(`/reels?id=${reel._id}`)}
              className="aspect-[9/16] bg-dark-muted relative overflow-hidden cursor-pointer group"
            >
              <video src={reel.videoUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" muted />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <div className="flex items-center gap-2 text-white text-xs">
                  <span className="flex items-center gap-1"><HiOutlinePlay size={11} /> {reel.views || 0}</span>
                  <span className="flex items-center gap-1"><HiOutlineHeart size={11} /> {reel.likes?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
