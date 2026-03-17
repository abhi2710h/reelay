import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlay, HiOutlineHeart, HiOutlineFire } from 'react-icons/hi';
import api from '../lib/axios';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/feed/trending').then(r => setReels(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <HiOutlineFire size={22} className="text-accent" />
          <h2 className="text-xl font-bold">Explore</h2>
        </div>
        <p className="text-gray-500 text-xs mt-0.5">Trending reels from the community</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] skeleton" />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <HiOutlineFire size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">Nothing trending yet</p>
          <p className="text-sm mt-1">Be the first to upload a reel</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {reels.map((reel, i) => (
            <div
              key={reel._id}
              onClick={() => navigate(`/reels?id=${reel._id}`)}
              className={`relative bg-dark-muted overflow-hidden cursor-pointer group ${i % 7 === 0 ? 'col-span-2 row-span-2' : ''} aspect-[9/16]`}
            >
              <video src={reel.videoUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" muted />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="flex items-center gap-2 text-white text-xs">
                  <span className="flex items-center gap-1"><HiOutlinePlay size={12} /> {reel.views || 0}</span>
                  <span className="flex items-center gap-1"><HiOutlineHeart size={12} /> {reel.likes?.length || 0}</span>
                </div>
                {reel.caption && <p className="text-white text-xs truncate mt-0.5 opacity-80">{reel.caption}</p>}
              </div>
              {i % 7 === 0 && (
                <div className="absolute top-2 left-2">
                  <span className="flex items-center gap-1 bg-accent/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <HiOutlineFire size={10} /> HOT
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
