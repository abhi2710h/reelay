import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HiOutlineCog, HiOutlineLockClosed, HiOutlineCheck, HiOutlineX, HiArrowLeft, HiOutlineCamera } from "react-icons/hi";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: me, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState("none");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [connectionsModal, setConnectionsModal] = useState(null);
  const avatarInputRef = useRef(null);
  const isOwn = me?.username === username;

  useEffect(() => { loadProfile(); }, [username]);

  async function loadProfile() {
    setLoading(true);
    try {
      const { data } = await api.get("/users/" + username);
      setProfile(data);
      if (!isOwn) {
        if (data.isFollower) setFollowStatus("following");
        else if (data.hasRequested) setFollowStatus("requested");
        else setFollowStatus("none");
      }
      if (!data.isLocked) {
        const r = await api.get("/users/" + username + "/reels");
        setReels(r.data);
      }
    } catch {
      toast.error("Profile not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.put("/users/profile", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile(p => ({ ...p, avatar: data.avatar }));
      updateUser({ avatar: data.avatar });
      toast.success("Profile photo updated");
    } catch { toast.error("Failed to update photo"); }
    finally { setAvatarUploading(false); }
  }

  async function handleFollow() {
    if (followLoading || !profile) return;
    setFollowLoading(true);
    try {
      const { data } = await api.post("/users/" + profile._id + "/follow");
      if (data.status === "following") {
        setFollowStatus("following");
        setProfile(p => ({ ...p, followers: typeof p.followers === "number" ? p.followers + 1 : p.followers.length + 1 }));
        toast.success("Following");
      } else if (data.status === "requested") {
        setFollowStatus("requested");
        toast.success("Follow request sent");
      } else if (data.status === "unfollowed") {
        setFollowStatus("none");
        setProfile(p => ({ ...p, followers: typeof p.followers === "number" ? Math.max(0, p.followers - 1) : Math.max(0, p.followers.length - 1) }));
        toast.success("Unfollowed");
      } else if (data.status === "unrequested") {
        setFollowStatus("none");
        toast.success("Request cancelled");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setFollowLoading(false);
    }
  }

  const followerCount = typeof profile?.followers === "number" ? profile.followers : (profile?.followers?.length || 0);
  const followingCount = typeof profile?.following === "number" ? profile.following : (profile?.following?.length || 0);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  let followBtnClass = "px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ";
  if (followStatus === "following") followBtnClass += "border border-dark-border bg-dark-muted text-white hover:bg-dark-border";
  else if (followStatus === "requested") followBtnClass += "border border-primary/40 bg-primary/10 text-primary-light hover:bg-primary/20";
  else followBtnClass += "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90";

  const followBtnText = followLoading ? "..." : followStatus === "following" ? "Following" : followStatus === "requested" ? "Requested" : "Follow";

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 py-3 border-b border-dark-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-dark-muted flex items-center justify-center hover:bg-dark-border transition-colors">
          <HiArrowLeft size={18} />
        </button>
        <span className="font-bold text-lg">{profile.username}</span>
        {isOwn && (
          <Link to="/settings" className="ml-auto w-9 h-9 rounded-xl bg-dark-muted flex items-center justify-center hover:bg-dark-border transition-colors">
            <HiOutlineCog size={18} />
          </Link>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatar || ("https://ui-avatars.com/api/?name=" + profile.username + "&background=a855f7&color=fff&size=128")}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/40"
            />
            {profile.isOnline && <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-bg" />}
            {isOwn && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity disabled:opacity-60"
                >
                  {avatarUploading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <HiOutlineCamera size={22} className="text-white" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-bold text-xl">{profile.fullName || profile.username}</h1>
              {profile.isVerified && <span className="text-primary text-sm">checkmark</span>}
              {profile.isPrivate && <HiOutlineLockClosed size={14} className="text-gray-400" />}
            </div>
            <p className="text-gray-400 text-sm mb-3">@{profile.username}</p>

            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-lg leading-none">{reels.length}</p>
                <p className="text-gray-400 text-xs mt-0.5">Reels</p>
              </div>
              <button onClick={() => setConnectionsModal("followers")} className="text-center hover:opacity-70 transition-opacity">
                <p className="font-bold text-lg leading-none">{followerCount}</p>
                <p className="text-gray-400 text-xs mt-0.5">Followers</p>
              </button>
              <button onClick={() => setConnectionsModal("following")} className="text-center hover:opacity-70 transition-opacity">
                <p className="font-bold text-lg leading-none">{followingCount}</p>
                <p className="text-gray-400 text-xs mt-0.5">Following</p>
              </button>
            </div>

            {!isOwn && (
              <div className="flex gap-2">
                <button onClick={handleFollow} disabled={followLoading} className={followBtnClass}>
                  {followBtnText}
                </button>
                <Link to="/messages" className="px-5 py-2 rounded-xl text-sm font-semibold border border-dark-border bg-dark-muted text-white hover:bg-dark-border transition-colors">
                  Message
                </Link>
              </div>
            )}
            {isOwn && (
              <Link to="/settings" className="inline-block px-5 py-2 rounded-xl text-sm font-semibold border border-dark-border bg-dark-muted text-white hover:bg-dark-border transition-colors">
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {profile.bio && <p className="text-gray-300 text-sm mb-2 leading-relaxed">{profile.bio}</p>}
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-light text-sm hover:underline">
            {profile.website}
          </a>
        )}

        <div className="mt-6">
          {profile.isLocked ? (
            <LockedProfile hasRequested={followStatus === "requested"} />
          ) : reels.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">🎬</p>
              <p className="font-medium">{isOwn ? "Share your first reel" : "No reels yet"}</p>
              {isOwn && <Link to="/upload" className="mt-3 inline-block text-primary text-sm hover:underline">Upload now</Link>}
            </div>
          ) : (
            <ReelsGrid reels={reels} navigate={navigate} />
          )}
        </div>

        {isOwn && <FollowRequestsSection onAccepted={loadProfile} />}
      </div>

      {connectionsModal && (
        <ConnectionsModal
          username={profile.username}
          type={connectionsModal}
          onClose={() => setConnectionsModal(null)}
        />
      )}
    </div>
  );
}

function LockedProfile({ hasRequested }) {
  return (
    <div className="text-center py-16 border-t border-dark-border">
      <div className="w-16 h-16 rounded-full bg-dark-muted flex items-center justify-center mx-auto mb-4">
        <HiOutlineLockClosed size={28} className="text-gray-400" />
      </div>
      <p className="font-semibold text-lg mb-1">This account is private</p>
      <p className="text-gray-500 text-sm">{hasRequested ? "Your follow request is pending." : "Follow to see their reels."}</p>
    </div>
  );
}

function ReelsGrid({ reels, navigate }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {reels.map(reel => (
        <div key={reel._id} onClick={() => navigate("/reels")} className="aspect-square bg-dark-muted rounded-lg overflow-hidden relative group cursor-pointer">
          <video src={reel.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm">play</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConnectionsModal({ username, type, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/users/" + username + "/connections?type=" + type)
      .then(r => setList(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [username, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-t-3xl md:rounded-2xl max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border flex-shrink-0">
          <span className="font-bold text-base capitalize">{type}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-muted flex items-center justify-center text-gray-400 hover:text-white transition-colors">x</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-2xl mb-2">lock</p>
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && list.length === 0 && (
            <p className="text-center py-10 text-gray-400 text-sm">No {type} yet</p>
          )}
          <div className="space-y-1">
            {list.map(u => (
              <button
                key={u._id}
                onClick={() => { onClose(); navigate("/profile/" + u.username); }}
                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-dark-muted transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={u.avatar || ("https://ui-avatars.com/api/?name=" + u.username + "&background=a855f7&color=fff")}
                    className="w-11 h-11 rounded-full object-cover"
                    alt=""
                  />
                  {u.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{u.username}</p>
                  {u.fullName && <p className="text-gray-400 text-xs truncate">{u.fullName}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FollowRequestsSection({ onAccepted }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/users/follow-requests").then(r => setRequests(r.data)).catch(() => {});
  }, []);

  async function handle(requesterId, action) {
    setLoading(true);
    try {
      await api.post("/users/follow-request/handle", { requesterId, action });
      setRequests(prev => prev.filter(r => r._id !== requesterId));
      if (action === "accept") onAccepted();
    } catch { toast.error("Action failed"); }
    finally { setLoading(false); }
  }

  if (requests.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider mb-3">Follow Requests ({requests.length})</h3>
      <div className="space-y-2">
        {requests.map(r => (
          <div key={r._id} className="flex items-center gap-3 p-3 card">
            <img src={r.avatar || ("https://ui-avatars.com/api/?name=" + r.username + "&background=a855f7&color=fff")} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">@{r.username}</p>
              {r.fullName && <p className="text-gray-400 text-xs">{r.fullName}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handle(r._id, "accept")} disabled={loading} className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors disabled:opacity-50">
                <HiOutlineCheck size={16} />
              </button>
              <button onClick={() => handle(r._id, "decline")} disabled={loading} className="w-8 h-8 rounded-full bg-dark-muted text-gray-400 flex items-center justify-center hover:bg-dark-border transition-colors disabled:opacity-50">
                <HiOutlineX size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}