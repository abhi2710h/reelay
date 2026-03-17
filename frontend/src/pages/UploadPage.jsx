import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlineFilm, HiOutlineHashtag, HiOutlineCheckCircle } from 'react-icons/hi';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.mov'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024
  });

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleCaptionChange = (e) => {
    const val = e.target.value;
    setCaption(val);
    const matches = val.match(/#(\w+)/g);
    if (matches) {
      const newTags = matches.map(t => t.replace('#', '').toLowerCase());
      setTags(prev => [...new Set([...prev, ...newTags])]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a video first');
    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);
    formData.append('hashtags', tags.join(','));
    try {
      await api.post('/reels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      });
      setDone(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center scale-in">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Reel uploaded!</h2>
          <p className="text-gray-400 text-sm">Redirecting to feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 border-b border-dark-border">
        <h2 className="text-xl font-bold">Create Reel</h2>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleUpload} className="space-y-5">
          {!file ? (
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-dark-border hover:border-primary/40 hover:bg-dark-muted/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-dark-muted flex items-center justify-center">
                  <HiOutlineFilm size={28} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">
                    {isDragActive ? 'Drop it here' : 'Drop your video here'}
                  </p>
                  <p className="text-gray-500 text-sm">or click to browse</p>
                  <p className="text-gray-600 text-xs mt-2">MP4, WebM, MOV · Max 100MB</p>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-glow">
                  <HiOutlineCloudUpload size={18} />
                  Choose file
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[9/16] max-h-[60vh] mx-auto" style={{ maxWidth: '280px' }}>
              <video src={preview} className="w-full h-full object-cover" controls muted />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(''); }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
              >
                <HiOutlineX size={16} />
              </button>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="glass rounded-xl px-3 py-2 text-xs text-gray-300 truncate">
                  {file.name}
                </div>
              </div>
            </div>
          )}

          <div className="card p-4 space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption</label>
            <textarea
              value={caption}
              onChange={handleCaptionChange}
              placeholder="Write something about your reel... use #hashtags"
              rows={3}
              maxLength={2200}
              className="w-full bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none resize-none pt-1"
            />
            <p className="text-right text-xs text-gray-600">{caption.length}/2200</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <HiOutlineHashtag size={16} className="text-primary" />
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hashtags</label>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="tag-pill flex items-center gap-1.5">
                  #{tag}
                  <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} className="hover:text-white transition-colors">
                    <HiOutlineX size={11} />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag and press Enter..."
              className="w-full bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
            />
          </div>

          {uploading && (
            <div className="card p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uploading...</span>
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-dark-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={!file || uploading} className="btn-primary">
            {uploading ? 'Uploading...' : 'Share Reel'}
          </button>
        </form>
      </div>
    </div>
  );
}
