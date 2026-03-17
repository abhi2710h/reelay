import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          connectSocket(data.accessToken);
          return data;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', payload);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          connectSocket(data.accessToken);
          return data;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const token = get().refreshToken;
        set({ user: null, accessToken: null, refreshToken: null });
        disconnectSocket();
        if (token) {
          try { await api.post('/auth/logout', { refreshToken: token }); } catch {}
        }
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {}
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } }))
    }),
    {
      name: 'reelay-auth',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user })
    }
  )
);
