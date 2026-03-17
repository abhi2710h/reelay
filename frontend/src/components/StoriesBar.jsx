import { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function StoriesBar() {
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/stories').then(r => setStoryGroups(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeGroup) { setProgress(0); return; }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); nextStory(); return 100; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeGroup, activeStoryIndex]);

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('media', file);
    try {
      await api.post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 0 });
      toast.success('Story posted!');
      const r = await api.get('/stories');
      setStoryGroups(r.data);
    } catch {
      toast.error('Failed to post story');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openStory = (group) => {
    setActiveGroup(group);
    setActiveStoryIndex(0);
    api.post(`/stories/${group.stories[0]._id}/view`).catch(() => {});
  };

  const nextStory = () => {
    if (activeStoryIndex < activeGroup.stories.length - 1) {
      const next = activeStoryIndex + 1;
      setActiveStoryIndex(next);
      api.post(`/stories/${activeGroup.stories[next]._id}/view`).catch(() => {});
    } else {
      setActiveGroup(null);
    }
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
  };

  return (
    <>
      <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-dark-border bg-dark-card/50">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div className="w-14 h-14 rounded-full bg-dark-muted border-2 border-dashed border-dark-border flex items-center justify-center hover:border-primary/50 transition-colors">
            {uploading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <HiOutlinePlus size={20} className="text-gray-400" />}
          </div>
          <span className="text-[11px] text-gray-500 truncate w-14 text-center">{uploading ? 'Posting...' : 'Your story'}</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />

        {storyGroups.map(group => (
          <button key={group.creator._id} onClick={() => openStory(group)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="story-ring w-14 h-14">
              <div className="w-full h-full rounded-full p-0.5 bg-dark">
                <img
                  src={group.creator.avatar || `https://ui-avatars.com/api/?name=${group.creator.username}&background=a855f7&color=fff`}
                  className="w-full h-full rounded-full object-cover"
                  alt={group.creator.username}
                />
              </div>
            </div>
            <span className="text-[11px] text-gray-400 truncate w-14 text-center">{group.creator.username}</span>
          </button>
        ))}
      </div>

      {activeGroup && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full max-w-sm h-full md:h-[90vh] md:rounded-2xl overflow-hidden">
            {activeGroup.stories[activeStoryIndex].mediaType === 'video' ? (
              <video src={activeGroup.stories[activeStoryIndex].mediaUrl} className="w-full h-full object-cover" autoPlay muted />
            ) : (
              <img src={activeGroup.stories[activeStoryIndex].mediaUrl} className="w-full h-full object-cover" alt="" />
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />

            <div className="absolute top-3 left-3 right-3 flex gap-1">
              {activeGroup.stories.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-none"
                    style={{ width: i < activeStoryIndex ? '100%' : i === activeStoryIndex ? `${progress}%` : '0%' }}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-8 left-4 flex items-center gap-2">
              <img src={activeGroup.creator.avatar || `https://ui-avatars.com/api/?name=${activeGroup.creator.username}&background=a855f7&color=fff`} className="w-9 h-9 rounded-full border-2 border-white/50" alt="" />
              <div>
                <p className="text-white font-semibold text-sm">{activeGroup.creator.username}</p>
                <p className="text-white/60 text-xs">Just now</p>
              </div>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setActiveGroup(null); }} className="absolute top-8 right-4 text-white/80 hover:text-white text-xl w-8 h-8 flex items-center justify-center">✕</button>

            {activeGroup.creator._id === user?._id && (
              <>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!window.confirm('Delete this story?')) return;
                    try {
                      await api.delete(`/stories/${activeGroup.stories[activeStoryIndex]._id}`);
                      toast.success('Story deleted');
                      const updated = activeGroup.stories.filter((_, i) => i !== activeStoryIndex);
                      if (updated.length === 0) {
                        setActiveGroup(null);
                        setStoryGroups(prev => prev.filter(g => g.creator._id !== activeGroup.creator._id));
                      } else {
                        setActiveGroup({ ...activeGroup, stories: updated });
                        setActiveStoryIndex(Math.min(activeStoryIndex, updated.length - 1));
                      }
                    } catch { toast.error('Failed to delete'); }
                  }}
                  className="absolute top-8 right-14 text-white/80 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center"
                >
                  <HiOutlineTrash size={18} />
                </button>
                <HighlightButton storyId={activeGroup.stories[activeStoryIndex]._id} />
              </>
            )}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
              <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HighlightButton({ storyId }) {
  const [open, setOpen] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  async function openPanel(e) {
    e.stopPropagation();
    setOpen(true);
    try {
      const { data } = await api.get('/highlights/user/' + user._id);
      setHighlights(data);
    } catch {}
  }

  async function addToExisting(highlightId) {
    setLoading(true);
    try {
      await api.post(`/highlights/${highlightId}/stories`, { storyId });
      toast.success('Added to highlight');
      setOpen(false);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  }

  async function createNew(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await api.post('/highlights', { name: newName.trim(), storyId });
      toast.success('Highlight created');
      setOpen(false);
      setNewName('');
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  }

  return (
    <>
      <button
        onClick={openPanel}
        className="absolute bottom-24 right-4 glass text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-white/20 transition-colors"
      >
        <HiOutlinePlus size={13} /> Highlight
      </button>

      {open && (
        <div className="absolute bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border rounded-t-2xl p-4 z-10" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Add to Highlight</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white"><HiOutlineX size={16} /></button>
          </div>
          {highlights.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-3">
              {highlights.map(h => (
                <button key={h._id} onClick={() => addToExisting(h._id)} disabled={loading} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-muted border border-primary/30">
                    {h.cover ? <img src={h.cover} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg">✨</div>}
                  </div>
                  <span className="text-[10px] text-gray-400 w-12 text-center truncate">{h.name}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={createNew} className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="New highlight name..."
              maxLength={30}
              className="flex-1 bg-dark-muted border border-dark-border rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
              onClick={e => e.stopPropagation()}
            />
            <button type="submit" disabled={!newName.trim() || loading} className="px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold disabled:opacity-50">
              Create
            </button>
          </form>
        </div>
      )}
    </>
  );
}
