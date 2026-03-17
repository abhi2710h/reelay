import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../lib/socket';
import { formatDistanceToNow } from 'date-fns';
import { HiOutlinePaperAirplane, HiOutlineArrowLeft, HiOutlineSearch, HiOutlineChatAlt } from 'react-icons/hi';
import api from '../lib/axios';

export default function MessagesPage() {
  const { conversations, activeConversation, messages, fetchConversations, fetchMessages, sendMessage, setActiveConversation, typingUsers, setTyping } = useChatStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      const socket = getSocket();
      socket?.emit('join:conversation', activeConversation._id);
    }
  }, [activeConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('typing:start', ({ userId }) => setTyping(userId, true));
    socket.on('typing:stop', ({ userId }) => setTyping(userId, false));
    return () => { socket.off('typing:start'); socket.off('typing:stop'); };
  }, []);

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket || !activeConversation) return;
    socket.emit('typing:start', { conversationId: activeConversation._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: activeConversation._id });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;
    const msg = text;
    setText('');
    await sendMessage(activeConversation._id, { text: msg });
    const socket = getSocket();
    socket?.emit('typing:stop', { conversationId: activeConversation._id });
  };

  const handleUserSearch = async (q) => {
    setSearchUser(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const { data } = await api.get(`/search?q=${q}&type=users`);
    setSearchResults(data.users || []);
  };

  const openChat = async (userId) => {
    const { data } = await api.get(`/messages/conversations/${userId}/open`);
    setActiveConversation(data);
    setSearchUser('');
    setSearchResults([]);
    fetchConversations();
  };

  const other = (conv) => conv.participants?.find(p => p._id !== user?._id);
  const isTyping = activeConversation && Object.entries(typingUsers).some(([id, t]) => t && id !== user?._id);

  return (
    <div className="flex h-screen">
      <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-dark-border bg-dark-card flex-shrink-0`}>
        <div className="p-4 border-b border-dark-border">
          <h2 className="font-bold text-lg mb-3">Messages</h2>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={searchUser}
              onChange={e => handleUserSearch(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 card overflow-hidden">
              {searchResults.map(u => (
                <button key={u._id} onClick={() => openChat(u._id)} className="flex items-center gap-3 w-full p-3 hover:bg-dark-muted transition-colors text-left">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=a855f7&color=fff`} className="w-9 h-9 rounded-full" alt="" />
                  <div>
                    <p className="text-sm font-semibold">@{u.username}</p>
                    {u.fullName && <p className="text-xs text-gray-500">{u.fullName}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
              <HiOutlineChatAlt size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Search for a user to start chatting</p>
            </div>
          )}
          {conversations.map(conv => {
            const o = other(conv);
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`flex items-center gap-3 w-full p-4 hover:bg-dark-muted transition-colors text-left border-b border-dark-border/50 ${activeConversation?._id === conv._id ? 'bg-dark-muted' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={o?.avatar || `https://ui-avatars.com/api/?name=${o?.username}&background=a855f7&color=fff`} className="w-12 h-12 rounded-full object-cover" alt="" />
                  {o?.isOnline && <span className="online-dot absolute -bottom-0.5 -right-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">@{o?.username}</p>
                  <p className="text-gray-500 text-xs truncate mt-0.5">{conv.lastMessage?.text || 'Start a conversation'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-dark`}>
        {activeConversation ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-dark-border glass-dark">
              <button onClick={() => setActiveConversation(null)} className="md:hidden text-gray-400 hover:text-white mr-1">
                <HiOutlineArrowLeft size={20} />
              </button>
              {(() => {
                const o = other(activeConversation);
                return (
                  <>
                    <div className="relative">
                      <img src={o?.avatar || `https://ui-avatars.com/api/?name=${o?.username}&background=a855f7&color=fff`} className="w-10 h-10 rounded-full" alt="" />
                      {o?.isOnline && <span className="online-dot absolute -bottom-0.5 -right-0.5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">@{o?.username}</p>
                      <p className="text-xs text-gray-500">
                        {o?.isOnline ? <span className="text-green-400">Online</span> : o?.lastSeen ? `Last seen ${formatDistanceToNow(new Date(o.lastSeen), { addSuffix: true })}` : 'Offline'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'text-white rounded-br-sm'
                        : 'bg-dark-card border border-dark-border rounded-bl-sm text-gray-100'
                    }`}
                    style={isMe ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)' } : {}}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-dark-card border border-dark-border px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-dark-border flex gap-3 glass-dark">
              <input
                value={text}
                onChange={handleTyping}
                placeholder="Message..."
                className="flex-1 bg-dark-muted border border-dark-border rounded-2xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 text-sm transition-colors"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="w-10 h-10 rounded-2xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
              >
                <HiOutlinePaperAirplane size={18} className="text-white rotate-90" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-dark-muted flex items-center justify-center mx-auto mb-4">
                <HiOutlineChatAlt size={32} className="opacity-40" />
              </div>
              <p className="font-semibold text-lg">Your Messages</p>
              <p className="text-sm mt-1 text-gray-600">Search for a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
