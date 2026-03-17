import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiHeart, HiOutlineChat, HiOutlineShare, HiOutlineBookmark, HiVolumeOff, HiVolumeUp, HiOutlineDotsVertical, HiOutlineTrash, HiOutlineUser, HiOutlineFilm } from 'react-icons/hi';
import { BsBookmarkFill } from 'react-icons/bs';
import { BsMusicNote } from 'react-icons/bs';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ReelCard({ reel: initialReel, isActive, onDelete }) {
  const [reel, setReel] = useState(initialReel);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const videoRef = useRef(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const viewedRef = useRef(false);
  const isOwner = reel.creator?._id === user?._id || reel.creator?._id?.toString() === user?._id;

  useEffect(() => {
    setLiked(reel.likes?.includes(user?._id));
    const creatorFollowers = reel.creator?.followers || [];
    setFollowing(creatorFollowers.some(f => (f._id || f).toString() === user?._id));
  }, [reel._id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
      if (!viewedRef.current) {
        viewedRef.current = true;
        api.post(`/reels/${reel._id}/view`).catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isActive]);

  const handleLike = async () => {
    const prev = liked;
    setLiked(!prev);
    if (!prev) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400); }
    setReel(r => ({ ...r, likes: prev ? r.likes.filter(id => id !== user._id) : [...r.likes, user._id] }));
    try { await api.post(`/reels/${reel._id}/like`); }
    catch { setLiked(prev); }
  };

  const handleDoubleTap = () => {
    if (!liked) handleLike();
  };

  const handleShare = async () => {
    try {
      await api.post(`/reels/${reel._id}/share`);
      if (navigator.share) {
        await navigator.share({ title: reel.caption, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!');
      }
    } catch {}
  };

  const handleSave = async () => {
    setSaved(!saved);
    await api.post(`/reels/${reel._id}/save`).catch(() => setSaved(saved));
  };

  const handleFollow = async () => {
    const prev = following;
    try {
      const { data } = await api.post(`/users/${reel.creator._id}/follow`);
      const isNowFollowing = data.status === 'following';
      const isRequested = data.status === 'requested';
      setFollowing(isNowFollowing || isRequested);
      if (data.status === 'following') toast.success('Following');
      else if (data.status === 'requested') toast.success('Follow request sent');
      else if (data.status === 'unfollowed') { setFollowing(false); toast.success('Unfollowed'); }
      else if (data.status === 'unrequested') { setFollowing(false); toast.success('Request cancelled'); }
    } catch (err) {
      setFollowing(prev);
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reel? This cannot be undone.')) return;
    try {
      await api.delete(`/reels/${reel._id}`);
      toast.success('Reel deleted');
      onDelete?.(reel._id);
    } catch { toast.error('Failed to delete'); }
    setShowMenu(false);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        onDoubleClick={handleDoubleTap}
        onClick={() => setShowAvatarMenu(false)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

      {likeAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <HiHeart size={80} className="text-red-500 heart-pop opacity-90" />
        </div>
      )}

      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-4 right-4 z-10 w-9 h-9 glass rounded-full flex items-center justify-center"
      >
        {muted ? <HiVolumeOff size={18} className="text-white" /> : <HiVolumeUp size={18} className="text-white" />}
      </button>

      {isOwner && (
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => setShowMenu(m => !m)} className="w-9 h-9 glass rounded-full flex items-center justify-center">
            <HiOutlineDotsVertical size={18} className="text-white" />
          </button>
          {showMenu && (
            <div className="absolute top-11 left-0 glass-dark border border-dark-border rounded-xl overflow-hidden min-w-[140px]">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-4 py-3 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
              >
                <HiOutlineTrash size={16} />
                Delete reel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-20 md:bottom-6 left-4 right-16 z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <button onClick={() => setShowAvatarMenu(m => !m)} className="relative flex-shrink-0">
            <img
              src={reel.creator?.avatar || `https://ui-avatars.com/api/?name=${reel.creator?.username}&background=a855f7&color=fff`}
              alt={reel.creator?.username}
              className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
            />
          </button>
          {showAvatarMenu && (
            <div className="absolute bottom-28 md:bottom-14 left-4 glass-dark border border-dark-border rounded-2xl overflow-hidden z-30 min-w-[180px]" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { navigate(`/profile/${reel.creator?.username}`); setShowAvatarMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-white text-sm hover:bg-white/5 transition-colors border-b border-dark-border"
              >
                <HiOutlineUser size={17} className="text-gray-400" />
                View Profile
              </button>
              <button
                onClick={() => { navigate(`/profile/${reel.creator?.username}?stories=1`); setShowAvatarMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-white text-sm hover:bg-white/5 transition-colors"
              >
                <HiOutlineFilm size={17} className="text-gray-400" />
                View Stories
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => { navigate(`/profile/${reel.creator?.username}`); }} className="font-semibold text-white text-sm drop-shadow">
              @{reel.creator?.username}
            </button>
            {reel.creator?._id !== user?._id && (
              <button
                onClick={handleFollow}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${following ? 'border-white/50 text-white/80 bg-white/10' : 'bg-white text-black hover:bg-white/90'}`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        {reel.caption && <p className="text-white text-sm drop-shadow leading-relaxed line-clamp-2">{reel.caption}</p>}
        {reel.hashtags?.length > 0 && (
          <p className="text-primary-light text-sm mt-1 drop-shadow">{reel.hashtags.map(t => `#${t}`).join(' ')}</p>
        )}
        {reel.music && (
          <div className="flex items-center gap-1.5 mt-2 text-white/70 text-xs">
            <BsMusicNote size={11} />
            <span className="truncate">{reel.music.title} · {reel.music.artist}</span>
          </div>
        )}
      </div>

      <div className="absolute right-3 bottom-24 md:bottom-10 flex flex-col items-center gap-5 z-10">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          {liked
            ? <HiHeart size={28} className="text-red-500 drop-shadow" />
            : <HiOutlineHeart size={28} className="text-white drop-shadow group-hover:text-red-400 transition-colors" />
          }
          <span className="text-white text-xs font-medium drop-shadow">{reel.likes?.length || 0}</span>
        </button>
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
          <HiOutlineChat size={26} className="text-white drop-shadow group-hover:text-primary-light transition-colors" />
          <span className="text-white text-xs font-medium drop-shadow">{reel.comments?.length || 0}</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
          <HiOutlineShare size={26} className="text-white drop-shadow group-hover:text-primary-light transition-colors" />
          <span className="text-white text-xs font-medium drop-shadow">{reel.shares || 0}</span>
        </button>
        <button onClick={handleSave} className="group">
          {saved
            ? <BsBookmarkFill size={22} className="text-primary drop-shadow" />
            : <HiOutlineBookmark size={24} className="text-white drop-shadow group-hover:text-primary-light transition-colors" />
          }
        </button>
      </div>

      {showComments && <CommentsSheet reelId={reel._id} onClose={() => setShowComments(false)} />}
    </div>
  );
}

function CommentsSheet({ reelId, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    api.get(`/reels/${reelId}/comments`).then(r => setComments(r.data));
  }, [reelId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post(`/reels/${reelId}/comments`, { text });
    setComments(prev => [data, ...prev]);
    setText('');
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" onClick={onClose}>
      <div className="glass-dark rounded-t-3xl max-h-[70vh] flex flex-col slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
          <span className="font-bold text-base">Comments</span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-muted flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No comments yet. Be the first!</p>}
          {comments.map(c => (
            <div key={c._id} className="flex gap-3">
              <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.username}&background=a855f7&color=fff`} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
              <div className="flex-1 bg-dark-muted rounded-2xl rounded-tl-sm px-3 py-2">
                <span className="font-semibold text-xs text-primary-light">{c.user?.username}</span>
                <p className="text-gray-200 text-sm mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="px-4 py-3 border-t border-dark-border flex gap-3">
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=a855f7&color=fff`} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-dark-muted rounded-2xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button type="submit" disabled={!text.trim()} className="text-primary font-semibold text-sm disabled:opacity-40 transition-opacity">Post</button>
        </form>
      </div>
    </div>
  );
}
