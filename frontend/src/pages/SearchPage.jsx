import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { HiOutlineSearch, HiOutlineHashtag, HiOutlineFire, HiOutlineUser } from 'react-icons/hi';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], reels: [], hashtags: [] });
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    api.get('/search/trending-hashtags').then(r => setTrending(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults({ users: [], reels: [], hashtags: [] }); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results.users?.length > 0 || results.reels?.length > 0 || results.hashtags?.length > 0;

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 pt-4 pb-3 border-b border-dark-border">
        <h2 className="text-xl font-bold mb-3">Search</h2>
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search users, reels, hashtags..."
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {!query && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineFire size={18} className="text-accent" />
                <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Trending</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map(tag => (
                  <button
                    key={tag._id}
                    onClick={() => setQuery(tag._id)}
                    className="tag-pill hover:bg-primary/25 transition-colors"
                  >
                    #{tag._id}
                    <span className="text-gray-500 ml-1.5 text-xs">{tag.count}</span>
                  </button>
                ))}
                {trending.length === 0 && (
                  <p className="text-gray-500 text-sm">No trending hashtags yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && query && !hasResults && (
          <div className="text-center py-16 text-gray-500">
            <HiOutlineSearch size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No results for "{query}"</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        {results.users?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineUser size={16} className="text-gray-400" />
              <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">People</h3>
            </div>
            <div className="space-y-2">
              {results.users.map(u => (
                <Link
                  key={u._id}
                  to={`/profile/${u.username}`}
                  className="flex items-center gap-3 p-3 card hover:bg-dark-muted transition-all hover:border-dark-border/80 group"
                >
                  <div className="relative">
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=a855f7&color=fff`}
                      className="w-11 h-11 rounded-full object-cover"
                      alt=""
                    />
                    {u.isOnline && <span className="online-dot absolute -bottom-0.5 -right-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">@{u.username}</p>
                    {u.fullName && <p className="text-gray-400 text-xs">{u.fullName}</p>}
                    <p className="text-gray-600 text-xs">{u.followers?.length || 0} followers</p>
                  </div>
                  {u.isVerified && <span className="text-primary text-xs">✓</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {results.hashtags?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineHashtag size={16} className="text-gray-400" />
              <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Hashtags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.hashtags.map(tag => (
                <button key={tag._id} onClick={() => setQuery(tag._id)} className="tag-pill hover:bg-primary/25 transition-colors">
                  #{tag._id} <span className="text-gray-500 ml-1 text-xs">{tag.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {results.reels?.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider mb-3">Reels</h3>
            <div className="grid grid-cols-3 gap-1">
              {results.reels.map(reel => (
                <div key={reel._id} className="aspect-[9/16] bg-dark-muted rounded-xl overflow-hidden relative group cursor-pointer">
                  <video src={reel.videoUrl} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-medium truncate">@{reel.creator?.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
