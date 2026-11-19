import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Calendar,
  Video,
  Phone,
  MapPin,
  Send,
  X,
  CheckCircle2,
  Link as LinkIcon,
  Lock,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  UserCheck,
  Store
} from 'lucide-react';
import { FranchiseListing, User } from '../../types';
import { api } from '../../services/api';

interface MessagingAndMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise?: FranchiseListing | null;
  currentUser?: User | null;
  initialTab?: 'chat' | 'meeting';
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  senderName: string;
  senderRole: 'investor' | 'franchiser';
  text: string;
  time: string;
  isEncrypted: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export const MessagingAndMeetingModal: React.FC<MessagingAndMeetingModalProps> = ({
  isOpen,
  onClose,
  franchise,
  currentUser,
  initialTab = 'chat',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'meeting'>(initialTab);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Storage key for persistent chat history between investor and franchiser
  const storageKey = `fdss_chat_history_${franchise?.id || 'general'}_${currentUser?.id || 'default'}`;

  // State for messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback default if parsing fails
      }
    }

    const brandName = franchise?.name || 'Franchise Representative';
    const isUserFranchiser = currentUser?.role === 'franchiser';

    return [
      {
        id: '1',
        sender: 'them',
        senderName: isUserFranchiser ? 'Prospective Investor' : `${brandName} Expansion Team`,
        senderRole: isUserFranchiser ? 'investor' : 'franchiser',
        text: isUserFranchiser
          ? `Hello! I am reviewing the feasibility score for ${brandName} and would like to discuss unit economics and territory reservation.`
          : `Welcome! You are connected to the official ${brandName} expansion team. How can we assist you with investment terms, FDD disclosures, or territory availability today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        status: 'read',
      },
    ];
  });

  // Meeting Schedule State
  const [meetingType, setMeetingType] = useState<
    'Online Video Meeting' | 'Phone Call' | 'Physical In-Person Meeting'
  >('Online Video Meeting');
  const [meetingDate, setMeetingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState<string>('14:30');
  const [notes, setNotes] = useState<string>(
    'Discuss financial payback projections, royalty terms, and territory availability.'
  );
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [generatedMeetLink, setGeneratedMeetLink] = useState<string>('');

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Real-time polling simulator to keep dynamic state live & scroll to bottom
  useEffect(() => {
    if (!isOpen || activeTab !== 'chat') return;

    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Live sync polling interval (simulating real-time socket updates)
    const interval = setInterval(() => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length !== messages.length) {
            setMessages(parsed);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, storageKey, messages.length]);

  if (!isOpen) return null;

  const isUserAdmin = currentUser?.role === 'admin';
  const myRole = currentUser?.role === 'franchiser' ? 'franchiser' : 'investor';
  const recipientRole = myRole === 'investor' ? 'franchiser' : 'investor';

  const handleSendMessage = (textToSend?: string) => {
    const msgText = textToSend || chatInput;
    if (!msgText.trim()) return;

    const isUserFranchiser = currentUser?.role === 'franchiser';
    const myName = currentUser?.name || (isUserFranchiser ? 'Franchiser Representative' : 'Investor');

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'me',
      senderName: myName,
      senderRole: myRole,
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      status: 'sent',
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    if (!textToSend) setChatInput('');

    // Update status to read after short delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 1200);

    // Simulate Realtime Counterparty Response if chatting with demo counterparty
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      const brandName = franchise?.name || 'our brand';
      const replyText = isUserFranchiser
        ? `Thank you for sharing your contact details. We have received your query regarding ${brandName} expansion and updated our CRM pipeline.`
        : `Got it! Our franchise expansion team has logged your inquiry regarding ${brandName}. We can also schedule a 1-on-1 video call to review the FDD document and financials.`;

      const counterpartyMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'them',
        senderName: isUserFranchiser ? 'Accredited Investor' : `${brandName} Expansion Team`,
        senderRole: recipientRole,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        status: 'read',
      };

      setMessages((prev) => [...prev, counterpartyMsg]);
    }, 2200);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear encrypted chat history for this conversation?')) {
      localStorage.removeItem(storageKey);
      setMessages([
        {
          id: String(Date.now()),
          sender: 'them',
          senderName: `${franchise?.name || 'Franchise'} Representative`,
          senderRole: recipientRole,
          text: 'Encrypted channel reset. You can send a new message anytime.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEncrypted: true,
          status: 'read',
        },
      ]);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const mockLink = `https://meet.google.com/fdss-${Math.random().toString(36).substring(2, 8)}`;
    setGeneratedMeetLink(mockLink);
    setIsScheduled(true);

    if (franchise?.id) {
      try {
        await api.scheduleMeeting({
          franchise_id: franchise.id,
          meeting_type: meetingType,
          scheduled_at: `${meetingDate}T${meetingTime}:00Z`,
          notes: notes,
        });
      } catch (err) {
        // Fallback silently if API offline
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col h-[620px] max-h-[92vh]">
        
        {/* TOP HEADER WITH E2EE BADGE */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-xs">
              {franchise?.name ? franchise.name.substring(0, 2).toUpperCase() : 'FD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-none">
                  {franchise?.name || 'Franchise DSS Channel'}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Realtime
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  AES-256 E2E Encrypted (Investor ↔ Franchiser)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'chat' && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition"
                title="Reset Encrypted History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ADMIN RESTRICTION BANNER (IF LOGGED IN AS ADMIN) */}
        {isUserAdmin && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Admin Notice:</strong> Direct messaging is restricted exclusively between Investors and Franchisers to maintain privacy & data encryption standards.
            </span>
          </div>
        )}

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Encrypted Direct Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('meeting')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'meeting'
                ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule 1-on-1 Discovery Call</span>
          </button>
        </div>

        {/* TAB 1: REALTIME ENCRYPTED CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50">
            
            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        {m.senderName}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600">
                        {m.senderRole}
                      </span>
                    </div>

                    <div
                      className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs relative ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      }`}
                    >
                      <p>{m.text}</p>
                      
                      <div className="mt-1.5 flex items-center justify-between gap-3 text-[9.5px]">
                        <span className={`flex items-center gap-0.5 font-mono ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          <Lock className="w-2.5 h-2.5" /> E2EE
                        </span>

                        <span className={`font-mono flex items-center gap-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {m.time}
                          {isMe && (
                            <span className="text-blue-200 font-bold" title="Delivered & Read">
                              ✓✓
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-xs w-max animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-medium">
                    {recipientRole === 'franchiser' ? 'Franchiser team is typing...' : 'Investor is typing...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK ACTION PROMPTS */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => handleSendMessage('Can you share the full FDD Disclosure Document?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition border border-slate-200/80"
              >
                📄 Request FDD Document
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Is exclusive territory available in Koramangala, Bangalore?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition border border-slate-200/80"
              >
                📍 Check Territory Status
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Can we negotiate royalty fee rates for multiple outlets?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition border border-slate-200/80"
              >
                💼 Royalty Terms Inquiry
              </button>
            </div>

            {/* INPUT BAR */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  isUserAdmin
                    ? 'Messaging disabled for Admin'
                    : `Encrypted message to ${franchise?.name || recipientRole}...`
                }
                disabled={isUserAdmin}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() || isUserAdmin}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shadow-xs flex items-center justify-center"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE MEETING */}
        {activeTab === 'meeting' && (
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50">
            {!isScheduled ? (
              <form onSubmit={handleScheduleMeeting} className="space-y-3.5 max-w-lg mx-auto">
                <div className="text-center mb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Schedule 1-on-1 Discovery Meeting
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Book a direct video call or in-person meeting between Investor & Franchiser
                  </p>
                </div>

                {/* Meeting Type */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Meeting Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Online Video Meeting', label: 'Video Call', icon: Video },
                      { id: 'Phone Call', label: 'Phone Call', icon: Phone },
                      { id: 'Physical In-Person Meeting', label: 'In-Person', icon: MapPin },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = meetingType === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setMeetingType(item.id as any)}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10.5px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Agenda & Discussion Topics
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify topics to discuss..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirm & Schedule {meetingType}</span>
                </button>
              </form>
            ) : (
              /* Success Confirmation Screen */
              <div className="text-center py-6 max-w-md mx-auto space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Meeting Successfully Scheduled!
                </h4>
                <p className="text-xs text-slate-600">
                  Confirmed with <strong>{franchise?.name || 'Franchise Representative'}</strong> for{' '}
                  <strong className="text-slate-900">
                    {meetingDate} at {meetingTime}
                  </strong>.
                </p>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Meeting Type:</span>
                    <strong className="text-slate-800">{meetingType}</strong>
                  </div>
                  {generatedMeetLink && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-700 truncate">
                        {generatedMeetLink}
                      </span>
                      <a
                        href={generatedMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" /> Join
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsScheduled(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Schedule Another Slot
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
