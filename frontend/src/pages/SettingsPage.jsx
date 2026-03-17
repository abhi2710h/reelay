import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUser, HiBell, HiOutlineLockClosed, HiOutlineBan,
  HiOutlinePaperAirplane, HiOutlineAtSymbol, HiOutlineChatAlt,
  HiOutlineEyeOff, HiOutlineHeart, HiOutlineQuestionMarkCircle,
  HiOutlineShieldCheck, HiOutlineChevronRight, HiOutlineArrowLeft,
  HiOutlineUserRemove, HiOutlineUsers
} from "react-icons/hi";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const sections = [
  {
    title: "Account",
    items: [
      { icon: <HiOutlineUser size={20} />, label: "Edit profile", action: "editProfile" },
      { icon: <HiBell size={20} />, label: "Notifications", action: "notifications" },
    ]
  },
  {
    title: "Privacy",
    items: [
      { icon: <HiOutlineLockClosed size={20} />, label: "Account privacy", action: "privacy" },
      { icon: <HiOutlinePaperAirplane size={20} />, label: "Messages", action: "messages" },
      { icon: <HiOutlineChatAlt size={20} />, label: "Comments", action: "comments" },
      { icon: <HiOutlineAtSymbol size={20} />, label: "Tags and mentions", action: "tags" },
      { icon: <HiOutlineHeart size={20} />, label: "Like counts", action: "likeCounts" },
    ]
  },
  {
    title: "Connections",
    items: [
      { icon: <HiOutlineUsers size={20} />, label: "Followers", action: "followers" },
      { icon: <HiOutlineBan size={20} />, label: "Blocked accounts", action: "blocked" },
      { icon: <HiOutlineEyeOff size={20} />, label: "Muted accounts", action: "muted" },
    ]
  },
  {
    title: "Support",
    items: [
      { icon: <HiOutlineQuestionMarkCircle size={20} />, label: "Help", action: "help" },
      { icon: <HiOutlineShieldCheck size={20} />, label: "Privacy Policy", action: "privacyPolicy" },
    ]
  }
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [activePanel, setActivePanel] = useState(null);

  const handleAction = (action) => {
    if (action === "editProfile") navigate("/profile/" + user?.username);
    else setActivePanel(action);
  };

  if (activePanel) {
    return <SettingsPanel action={activePanel} onBack={() => setActivePanel(null)} user={user} updateUser={updateUser} />;
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-4 overflow-y-auto h-screen">
      <div className="sticky top-0 bg-dark z-10 px-4 py-4 border-b border-dark-border">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      <div className="px-4 py-4 space-y-6">
        {sections.map(section => (
          <div key={section.title}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">{section.title}</p>
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item.action)}
                  className={"flex items-center justify-between w-full px-4 py-3.5 hover:bg-dark-muted transition-colors text-left" + (i < section.items.length - 1 ? " border-b border-dark-border" : "")}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{item.icon}</span>
                    <span className="text-sm text-white">{item.label}</span>
                  </div>
                  <HiOutlineChevronRight size={16} className="text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ action, onBack, user, updateUser }) {
  const panels = {
    privacy: <PrivacyPanel onBack={onBack} user={user} updateUser={updateUser} />,
    notifications: <NotificationsPanel onBack={onBack} user={user} updateUser={updateUser} />,
    messages: <MessagesPanel onBack={onBack} user={user} updateUser={updateUser} />,
    comments: <CommentsPanel onBack={onBack} user={user} updateUser={updateUser} />,
    tags: <TagsPanel onBack={onBack} user={user} updateUser={updateUser} />,
    likeCounts: <LikeCountsPanel onBack={onBack} />,
    followers: <FollowersPanel onBack={onBack} />,
    blocked: <BlockedPanel onBack={onBack} />,
    muted: <MutedPanel onBack={onBack} />,
    help: <HelpPanel onBack={onBack} />,
    privacyPolicy: <PrivacyPolicyPanel onBack={onBack} />,
  };
  return panels[action] || null;
}

function PanelWrapper({ title, onBack, children }) {
  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-4 overflow-y-auto h-screen">
      <div className="sticky top-0 bg-dark z-10 px-4 py-4 border-b border-dark-border flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <HiOutlineArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={"w-11 h-6 rounded-full transition-colors relative flex-shrink-0 " + (value ? "bg-primary" : "bg-dark-border")}
    >
      <span className={"absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow " + (value ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={"flex items-center justify-between w-full p-4 text-left transition-colors" + (i < options.length - 1 ? " border-b border-dark-border" : "") + (value === opt.value ? " bg-primary/10" : " hover:bg-dark-muted")}
        >
          <div>
            <p className="text-sm font-medium text-white">{opt.label}</p>
            {opt.desc && <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>}
          </div>
          {value === opt.value && <span className="w-4 h-4 rounded-full bg-primary flex-shrink-0" />}
        </button>
      ))}
    </div>
  );
}

function SaveBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
      {loading ? "Saving..." : "Save changes"}
    </button>
  );
}

function PrivacyPanel({ onBack, user, updateUser }) {
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [showOnline, setShowOnline] = useState(user?.settings?.showOnlineStatus ?? true);
  const [showActivity, setShowActivity] = useState(user?.settings?.showActivity ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (isPrivate !== (user?.isPrivate || false)) await api.post("/users/toggle-privacy");
      const { data } = await api.put("/users/settings", { showOnlineStatus: showOnline, showActivity });
      updateUser({ isPrivate, settings: data.settings });
      toast.success("Saved");
      onBack();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <PanelWrapper title="Account Privacy" onBack={onBack}>
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {[
          { label: "Private account", desc: "Only approved followers see your reels", value: isPrivate, onChange: setIsPrivate },
          { label: "Show online status", desc: "Let others see when you are active", value: showOnline, onChange: setShowOnline },
          { label: "Show activity status", desc: "Show when you were last active", value: showActivity, onChange: setShowActivity },
        ].map((row, i, arr) => (
          <div key={row.label} className={"flex items-center justify-between p-4" + (i < arr.length - 1 ? " border-b border-dark-border" : "")}>
            <div className="flex-1 pr-4">
              <p className="text-sm font-medium text-white">{row.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
            </div>
            <Toggle value={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>
      <SaveBtn onClick={save} loading={saving} />
    </PanelWrapper>
  );
}

function NotificationsPanel({ onBack, user, updateUser }) {
  const [email, setEmail] = useState(user?.settings?.emailNotifications ?? true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/settings", { emailNotifications: email });
      updateUser({ settings: data.settings });
      toast.success("Saved");
      onBack();
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  return (
    <PanelWrapper title="Notifications" onBack={onBack}>
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-white">Email notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Receive alerts via email</p>
          </div>
          <Toggle value={email} onChange={setEmail} />
        </div>
      </div>
      <SaveBtn onClick={save} loading={saving} />
    </PanelWrapper>
  );
}

function MessagesPanel({ onBack, user, updateUser }) {
  const [allowMessages, setAllowMessages] = useState(user?.settings?.allowMessages || "everyone");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/settings", { allowMessages });
      updateUser({ settings: data.settings });
      toast.success("Saved");
      onBack();
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  return (
    <PanelWrapper title="Messages" onBack={onBack}>
      <p className="text-sm text-gray-400">Control who can send you direct messages</p>
      <RadioGroup
        value={allowMessages}
        onChange={setAllowMessages}
        options={[
          { value: "everyone", label: "Everyone", desc: "Anyone can message you" },
          { value: "followers", label: "Followers only", desc: "Only people you follow back" },
          { value: "none", label: "No one", desc: "Turn off direct messages" },
        ]}
      />
      <SaveBtn onClick={save} loading={saving} />
    </PanelWrapper>
  );
}

function CommentsPanel({ onBack, user, updateUser }) {
  const [allow, setAllow] = useState("everyone");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/users/settings", {});
      toast.success("Saved");
      onBack();
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  return (
    <PanelWrapper title="Comments" onBack={onBack}>
      <p className="text-sm text-gray-400">Control who can comment on your reels</p>
      <RadioGroup
        value={allow}
        onChange={setAllow}
        options={[
          { value: "everyone", label: "Everyone" },
          { value: "followers", label: "Followers only" },
          { value: "none", label: "No one" },
        ]}
      />
      <SaveBtn onClick={save} loading={saving} />
    </PanelWrapper>
  );
}

function TagsPanel({ onBack }) {
  const [allow, setAllow] = useState("everyone");
  return (
    <PanelWrapper title="Tags and mentions" onBack={onBack}>
      <p className="text-sm text-gray-400">Control who can tag or mention you</p>
      <RadioGroup
        value={allow}
        onChange={setAllow}
        options={[
          { value: "everyone", label: "Everyone" },
          { value: "followers", label: "Followers only" },
          { value: "none", label: "No one" },
        ]}
      />
      <button onClick={() => { toast.success("Saved"); onBack(); }} className="w-full bg-primary text-white py-3 rounded-xl font-semibold">Save changes</button>
    </PanelWrapper>
  );
}

function LikeCountsPanel({ onBack }) {
  const [hide, setHide] = useState(false);
  return (
    <PanelWrapper title="Like counts" onBack={onBack}>
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <p className="text-sm font-medium text-white">Hide like counts</p>
          <p className="text-xs text-gray-400 mt-0.5">Others will not see how many likes your reels get</p>
        </div>
        <Toggle value={hide} onChange={setHide} />
      </div>
      <button onClick={() => { toast.success("Saved"); onBack(); }} className="w-full bg-primary text-white py-3 rounded-xl font-semibold">Save changes</button>
    </PanelWrapper>
  );
}

function FollowersPanel({ onBack }) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get("/users/followers").then(r => setFollowers(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleBlock = async (userId) => {
    setActionLoading(userId + "_block");
    try {
      await api.post("/users/" + userId + "/block");
      setFollowers(prev => prev.filter(f => f._id !== userId));
      toast.success("User blocked and removed from followers");
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  const handleRemove = async (userId) => {
    setActionLoading(userId + "_remove");
    try {
      await api.post("/users/" + userId + "/remove-follower");
      setFollowers(prev => prev.filter(f => f._id !== userId));
      toast.success("Follower removed");
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <PanelWrapper title={"Followers (" + followers.length + ")"} onBack={onBack}>
      {loading && <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
      {!loading && followers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineUsers size={36} className="mx-auto mb-3" />
          <p className="font-medium">No followers yet</p>
        </div>
      )}
      <div className="space-y-2">
        {followers.map(f => (
          <div key={f._id} className="flex items-center gap-3 p-3 bg-dark-card border border-dark-border rounded-xl">
            <img src={f.avatar || ("https://ui-avatars.com/api/?name=" + f.username + "&background=a855f7&color=fff")} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">@{f.username}</p>
              {f.fullName && <p className="text-gray-400 text-xs">{f.fullName}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRemove(f._id)}
                disabled={actionLoading === f._id + "_remove"}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dark-border bg-dark-muted text-gray-300 hover:bg-dark-border transition-colors disabled:opacity-50"
              >
                {actionLoading === f._id + "_remove" ? "..." : "Remove"}
              </button>
              <button
                onClick={() => handleBlock(f._id)}
                disabled={actionLoading === f._id + "_block"}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {actionLoading === f._id + "_block" ? "..." : "Block"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function BlockedPanel({ onBack }) {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get("/users/blocked").then(r => setBlocked(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (userId) => {
    setActionLoading(userId);
    try {
      await api.post("/users/" + userId + "/block");
      setBlocked(prev => prev.filter(u => u._id !== userId));
      toast.success("Unblocked");
    } catch { toast.error("Failed"); }
    finally { setActionLoading(null); }
  };

  return (
    <PanelWrapper title="Blocked accounts" onBack={onBack}>
      {loading && <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
      {!loading && blocked.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineBan size={36} className="mx-auto mb-3" />
          <p className="font-medium">No blocked accounts</p>
          <p className="text-sm mt-1">Blocked users cannot find your profile or content</p>
        </div>
      )}
      <div className="space-y-2">
        {blocked.map(u => (
          <div key={u._id} className="flex items-center gap-3 p-3 bg-dark-card border border-dark-border rounded-xl">
            <img src={u.avatar || ("https://ui-avatars.com/api/?name=" + u.username + "&background=a855f7&color=fff")} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">@{u.username}</p>
              {u.fullName && <p className="text-gray-400 text-xs">{u.fullName}</p>}
            </div>
            <button
              onClick={() => handleUnblock(u._id)}
              disabled={actionLoading === u._id}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-primary/40 text-primary-light hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {actionLoading === u._id ? "..." : "Unblock"}
            </button>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function MutedPanel({ onBack }) {
  return (
    <PanelWrapper title="Muted accounts" onBack={onBack}>
      <div className="text-center py-12 text-gray-400">
        <HiOutlineEyeOff size={36} className="mx-auto mb-3" />
        <p className="font-medium">No muted accounts</p>
        <p className="text-sm mt-1">Muted accounts will not know they have been muted</p>
      </div>
    </PanelWrapper>
  );
}

function HelpPanel({ onBack }) {
  const items = ["Help Center", "Report a problem", "Terms of Service", "Cookie Policy", "About ReelAY"];
  return (
    <PanelWrapper title="Help" onBack={onBack}>
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        {items.map((item, i) => (
          <button key={item} className={"flex items-center justify-between w-full px-4 py-3.5 hover:bg-dark-muted text-left" + (i < items.length - 1 ? " border-b border-dark-border" : "")}>
            <span className="text-sm text-white">{item}</span>
            <HiOutlineChevronRight size={16} className="text-gray-500" />
          </button>
        ))}
      </div>
    </PanelWrapper>
  );
}

function PrivacyPolicyPanel({ onBack }) {
  return (
    <PanelWrapper title="Privacy Policy" onBack={onBack}>
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3 text-sm text-gray-300 leading-relaxed">
        <p className="font-semibold text-white">ReelAY Privacy Policy</p>
        <p>We collect information you provide when creating an account, such as your username, email, and profile details.</p>
        <p>Your content (reels, stories, messages) is stored securely and only shared according to your privacy settings.</p>
        <p>We do not sell your personal data to third parties.</p>
        <p>You can delete your account and all associated data at any time from your settings.</p>
        <p className="text-gray-500 text-xs">Last updated: March 2026</p>
      </div>
    </PanelWrapper>
  );
}