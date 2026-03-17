import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { HiOutlinePlus } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export default function StoriesBar() {
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
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
          onClick={() => navigate('/upload')}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div className="w-14 h-14 rounded-full bg-dark-muted border-2 border-dashed border-dark-border flex items-center justify-center hover:border-primary/50 transition-colors">
            <HiOutlinePlus size={20} className="text-gray-400" />
          </div>
          <span className="text-[11px] text-gray-500 truncate w-14 text-center">Your story</span>
        </button>

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
