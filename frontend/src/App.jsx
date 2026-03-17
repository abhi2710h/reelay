import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { connectSocket } from './lib/socket';
import { useChatStore } from './store/chatStore';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import ActivityPage from './pages/ActivityPage';
import SavedPage from './pages/SavedPage';
import ExplorePage from './pages/ExplorePage';
import ReelsPage from './pages/ReelsPage';
import ReportPage from './pages/ReportPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useAuthStore();
  return accessToken ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { accessToken } = useAuthStore();
  return !accessToken ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { accessToken, refreshUser, updateUser } = useAuthStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();
  const { addMessage } = useChatStore();

  useEffect(() => {
    if (!accessToken) return;
    const socket = connectSocket(accessToken);
    fetchUnreadCount();
    refreshUser();

    socket.on('notification', addNotification);
    socket.on('message:new', addMessage);
    socket.on('user:online', () => {
      updateUser({ isOnline: true });
    });
    socket.on('user:offline', ({ lastSeen }) => {
      updateUser({ isOnline: false, lastSeen });
    });

    return () => {
      socket.off('notification', addNotification);
      socket.off('message:new', addMessage);
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [accessToken]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#0f0f1a', color: '#fff', border: '1px solid #1e1e2e', borderRadius: '14px', fontSize: '14px', fontWeight: 500 },
          success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ec4899', secondary: '#fff' } },
          duration: 3000
        }}
      />
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<FeedPage />} />
          <Route path="reels" element={<ReelsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </>
  );
}
