import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReelCard from '../components/ReelCard';
import api from '../lib/axios';

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/feed?page=1&limit=10`);
        setReels(data.reels || []);
        setHasMore(data.hasMore);
        if (targetId) {
          const idx = (data.reels || []).findIndex(r => r._id === targetId);
          if (idx !== -1) setActiveIndex(idx);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    try {
      const { data } = await api.get(`/feed?page=${nextPage}&limit=10`);
      setReels(prev => [...prev, ...(data.reels || [])]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {}
  }, [hasMore, loading, page]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.index);
            setActiveIndex(idx);
            if (idx >= reels.length - 3) loadMore();
          }
        });
      },
      { threshold: 0.6, root: container }
    );

    const slides = container.querySelectorAll('[data-index]');
    slides.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [reels, loadMore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500 gap-3">
        <p className="text-4xl">🎬</p>
        <p className="font-medium">No reels yet</p>
        <p className="text-sm">Upload the first one!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {reels.map((reel, i) => (
        <div
          key={reel._id}
          data-index={i}
          className="h-screen w-full snap-start snap-always flex-shrink-0"
        >
          <ReelCard reel={reel} isActive={i === activeIndex} />
        </div>
      ))}
      {!hasMore && reels.length > 0 && (
        <div className="h-20 flex items-center justify-center text-gray-500 text-sm">
          You're all caught up
        </div>
      )}
    </div>
  );
}
