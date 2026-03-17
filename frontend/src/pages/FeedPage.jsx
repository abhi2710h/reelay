import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/axios';
import ReelCard from '../components/ReelCard';
import StoriesBar from '../components/StoriesBar';

export default function FeedPage() {
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const fetchReels = useCallback(async (p = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const { data } = await api.get(`/feed?page=${p}&limit=10`);
      setReels(prev => p === 1 ? (data.reels || []) : [...prev, ...(data.reels || [])]);
      setHasMore(data.hasMore);
      pageRef.current = p;
      setPage(p);
    } catch {}
    finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReels(1); }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const items = container.querySelectorAll('[data-reel-index]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.reelIndex);
            setActiveIndex(idx);
            if (idx >= reels.length - 3 && hasMore && !loadingRef.current) {
              fetchReels(pageRef.current + 1);
            }
          }
        });
      },
      { threshold: 0.6, root: container }
    );

    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [reels.length, hasMore]);

  if (reels.length === 0 && !loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="md:hidden"><StoriesBar /></div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-5xl mb-4">🎬</div>
            <p className="font-semibold text-lg">No reels yet</p>
            <p className="text-sm mt-1 text-gray-600">Follow people or upload your first reel</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="md:hidden flex-shrink-0"><StoriesBar /></div>
      <div ref={containerRef} className="reel-container flex-1">
        {reels.map((reel, index) => (
          <div key={reel._id} data-reel-index={index} className="reel-item">
            <ReelCard reel={reel} isActive={index === activeIndex} />
          </div>
        ))}
        {loading && (
          <div className="h-20 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
