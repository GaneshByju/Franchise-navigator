import React, { useState, useEffect, useRef } from 'react';
import { User, FranchiseListing, Conversation, MessageItem } from '../../types';
import { api } from '../../services/api';
import {
  MessageSquare,
  Send,
  PlusCircle,
  Search,
  User as UserIcon,
  Store,
  Calendar,
  Lock,
  Clock,
  CheckCircle2,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Video
} from 'lucide-react';

interface DirectMessagingViewProps {
  currentUser: User;
  franchises: FranchiseListing[];
  initialPartnerId?: number;
  initialFranchiseId?: number;
  onOpenMeetingModal?: (franchise: FranchiseListing) => void;
  onViewFranchise?: (franchise: FranchiseListing) => void;
}

export const DirectMessagingView: React.FC<DirectMessagingViewProps> = ({
  currentUser,
  franchises,
  initialPartnerId,
  initialFranchiseId,
  onOpenMeetingModal,
  onViewFranchise,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatFranchiseId, setNewChatFranchiseId] = useState<number | ''>(
    initialFranchiseId || franchises[0]?.id || ''
  );
  const [newChatInitialMessage, setNewChatInitialMessage] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isInvestor = currentUser.role === 'investor';

  // 1. Fetch Conversations
  const fetchConversations = async (autoSelectId?: number) => {
    try {
      const res = await api.getConversations(currentUser?.id);
      if (res.success && res.data) {
        setConversations(res.data);
        if (autoSelectId) {
          const match = res.data.find((c) => c.id === autoSelectId);
          if (match) setSelectedConv(match);
        } else if (!selectedConv && res.data.length > 0) {
          setSelectedConv(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  // 2. Fetch Messages for Selected Conversation
  const fetchMessages = async (convId: number) => {
    try {
      const res = await api.getMessages(convId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);

  // When selected conversation changes, load messages
  useEffect(() => {
    if (selectedConv) {
      setLoadingMessages(true);
      fetchMessages(selectedConv.id).finally(() => setLoadingMessages(false));
    } else {
      setMessages([]);
    }
  }, [selectedConv?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto-polling for live chat synchronization (every 2.5 seconds)
  useEffect(() => {
    if (!selectedConv) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConv.id);
      fetchConversations(selectedConv.id);
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedConv?.id]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConv || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const receiverId = isInvestor ? selectedConv.franchiser_id : selectedConv.investor_id;
      const res = await api.sendMessage({
        conversation_id: selectedConv.id,
        sender_id: currentUser.id,
        receiver_id: receiverId,
        franchise_id: selectedConv.franchise_id,
        message_text: text,
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        fetchConversations(selectedConv.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Start New Chat with Brand
  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatFranchiseId) {
      alert('Please select a brand to chat with.');
      return;
    }

    setStartingChat(true);
    try {
      const matchedF = franchises.find((f) => f.id === Number(newChatFranchiseId));
      const res = await api.startConversation({
        franchise_id: Number(newChatFranchiseId),
        partner_id: matchedF?.franchiser_id,
        user_id: currentUser?.id,
        sender_id: currentUser?.id,
        message_text: newChatInitialMessage.trim() || 'Hello! I am interested in learning more about your franchise opportunity.',
      });

      if (res.success) {
        setShowNewChatModal(false);
        setNewChatInitialMessage('');
        await fetchConversations(res.conversation_id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const partnerName = isInvestor ? c.franchiser_name : c.investor_name;
    const franchiseName = c.franchise_name || '';
    const q = searchQuery.toLowerCase();
    return partnerName.toLowerCase().includes(q) || franchiseName.toLowerCase().includes(q);
  });

  const getPartnerDisplayName = (c: Conversation) => {
    return isInvestor ? c.franchiser_name : c.investor_name;
  };

  const quickPrompts = isInvestor
    ? [
        'Can we schedule a 15-minute video call to discuss unit economics?',
        'Could you provide details on the franchise payback timeline?',
        'Is territory exclusivity guaranteed for my preferred city zone?',
        'What are the mandatory setup & equipment specifications?',
      ]
    : [
        'Thank you for reaching out! When would you like to review the franchise agreement?',
        'We would be delighted to arrange a brief call regarding your investment criteria.',
        'The territorial slot for this region is currently open for formal reservation.',
      ];

  return (
    <div className="space-y-6 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isInvestor ? 'Franchise Direct Messages & Deal Chat' : 'Investor Inquiries & Prospect Chat'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isInvestor
              ? 'Chat directly with verified franchise expansion officers, discuss unit parameters, and coordinate private meetings.'
              : 'Directly communicate with vetted accredited investors reviewing your franchise opportunity and answer commercial inquiries.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchConversations(selectedConv?.id)}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1 shadow-2xs"
            title="Refresh Conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loadingConvs ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {isInvestor && (
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Start Chat with Brand</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Pane Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] max-h-[750px]">
        {/* Left Column: Conversations List (4.5 Cols) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/60">
          {/* Search Box */}
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isInvestor ? 'Search brands or franchisers...' : 'Search investors...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-indigo-600"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConvs ? (
              <div className="p-8 text-center text-xs font-bold text-slate-500">
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">No Active Conversations</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {isInvestor
                    ? 'Start a direct chat with any brand owner from the marketplace.'
                    : 'When prospective investors contact your franchise, conversations appear here.'}
                </p>
                {isInvestor && (
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
                  >
                    + Start First Chat
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedConv?.id === c.id;
                const partnerName = getPartnerDisplayName(c);
                const franchiseName = c.franchise_name;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConv(c)}
                    className={`p-4 transition cursor-pointer flex items-start gap-3 text-xs ${
                      isSelected
                        ? 'bg-indigo-50/90 border-l-4 border-indigo-600 shadow-2xs'
                        : 'hover:bg-slate-100/80 bg-white'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs text-sm">
                      {partnerName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-slate-900 truncate text-xs">
                          {partnerName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {c.last_message_time
                            ? new Date(c.last_message_time).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>

                      {franchiseName && (
                        <div className="text-[11px] font-bold text-indigo-700 truncate flex items-center gap-1">
                          <Store className="w-3 h-3 shrink-0" />
                          <span>{franchiseName}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 truncate font-sans">
                        {c.last_message || 'No messages yet. Say hello!'}
                      </p>
                    </div>

                    {(c.unread_count || 0) > 0 && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 self-center" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Stream & Message Input (7.5 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                    {getPartnerDisplayName(selectedConv).charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {getPartnerDisplayName(selectedConv)}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                        {isInvestor ? 'Brand Franchiser' : 'Accredited Investor'}
                      </span>
                    </div>
                    {selectedConv.franchise_name && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Store className="w-3 h-3 text-indigo-600" />
                        <span>Representing <strong>{selectedConv.franchise_name}</strong></span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Encrypted DSS Chat</span>
                  </span>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
                {loadingMessages ? (
                  <div className="p-12 text-center text-xs font-bold text-slate-500">
                    <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin mx-auto mb-2" />
                    Loading message thread...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-10 text-center space-y-2 bg-white rounded-2xl border border-slate-200 max-w-sm mx-auto my-auto">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-xs">Start the Conversation</h4>
                    <p className="text-[11px] text-slate-500">
                      Send a message to introduce yourself, discuss investment requirements, or request financial disclosures.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === currentUser.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
                          <span>{isMe ? 'You' : m.sender_name || 'Partner'}</span>
                          <span>•</span>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed shadow-2xs whitespace-pre-line ${
                            isMe
                              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                          }`}
                        >
                          {m.message_text}
                        </div>

                        {isMe && (
                          <div className="flex items-center gap-0.5 text-[10px] text-slate-400 font-mono pr-1">
                            <Check className="w-3 h-3 text-indigo-600" />
                            <span>Delivered</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2 border-t border-slate-200 bg-white overflow-x-auto flex items-center gap-1.5 scrollbar-none text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-widest">
                  Quick:
                </span>
                {quickPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-medium whitespace-nowrap transition border border-slate-200/80 shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
              >
                <input
                  type="text"
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Type a message to ${getPartnerDisplayName(selectedConv)}...`}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-sans text-slate-800 focus:outline-indigo-600 shadow-2xs"
                />

                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-16 text-center my-auto space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-black text-slate-800 text-base">Select a Conversation</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose a conversation from the left to read messages and chat directly with brand expansion teams or investor candidates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: START NEW CHAT WITH BRAND */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden relative my-auto max-h-[90vh] flex flex-col text-xs font-sans">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Start Chat with Brand Franchiser</h3>
                  <p className="text-[11px] text-slate-500">
                    Connect directly with the authorized brand expansion owner.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block font-black text-slate-800 mb-1">Select Franchise Brand</label>
                <select
                  value={newChatFranchiseId}
                  onChange={(e) => setNewChatFranchiseId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-indigo-600"
                >
                  {franchises.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — Owned by {f.franchiser_name || 'Franchise Owner'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">Your Initial Message</label>
                <textarea
                  rows={4}
                  required
                  value={newChatInitialMessage}
                  onChange={(e) => setNewChatInitialMessage(e.target.value)}
                  placeholder="Hello, I am reviewing the feasibility score for your brand and would like to discuss unit economics and territory reservation..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-sans text-slate-800 focus:outline-indigo-600 leading-relaxed text-xs"
                />
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startingChat}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{startingChat ? 'Connecting...' : 'Start Conversation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
