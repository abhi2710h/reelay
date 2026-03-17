import { create } from 'zustand';
import api from '../lib/axios';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const { data } = await api.get('/notifications');
    set({ notifications: data });
  },

  fetchUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    set({ unreadCount: data.count });
  },

  markAllRead: async () => {
    await api.put('/notifications/read-all');
    set({ unreadCount: 0, notifications: get().notifications.map(n => ({ ...n, isRead: true })) });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));
