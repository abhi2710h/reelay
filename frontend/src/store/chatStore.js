import { create } from 'zustand';
import api from '../lib/axios';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  typingUsers: {},

  fetchConversations: async () => {
    const { data } = await api.get('/messages/conversations');
    set({ conversations: data });
  },

  openConversation: async (userId) => {
    const { data } = await api.get(`/messages/conversations/${userId}/open`);
    set({ activeConversation: data });
    return data;
  },

  fetchMessages: async (conversationId) => {
    const { data } = await api.get(`/messages/${conversationId}`);
    set({ messages: data });
  },

  sendMessage: async (conversationId, payload) => {
    const { data } = await api.post(`/messages/${conversationId}`, payload);
    set((state) => ({ messages: [...state.messages, data] }));
    return data;
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping }
    }));
  },

  setActiveConversation: (conv) => set({ activeConversation: conv })
}));
