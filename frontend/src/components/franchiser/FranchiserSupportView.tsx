import React, { useState, useEffect } from 'react';
import { User, FranchiseListing, SupportTicket } from '../../types';
import { api } from '../../services/api';
import {
  Mail,
  Send,
  PlusCircle,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Building2,
  ChevronRight,
  Filter,
  UserCheck,
  Reply,
  Lock,
  ArrowRight,
  Check
} from 'lucide-react';

interface FranchiserSupportViewProps {
  currentUser: User;
  listings: FranchiseListing[];
  initialCategory?: string;
  initialListing?: FranchiseListing | null;
  onRefreshListings?: () => void;
}

export const FranchiserSupportView: React.FC<FranchiserSupportViewProps> = ({
  currentUser,
  listings,
  initialCategory,
  initialListing,
  onRefreshListings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'quota'>('inbox');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Compose Modal State (Like an Email Composer)
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeCategory, setComposeCategory] = useState(initialCategory || 'General Support');
  const [composeBody, setComposeBody] = useState('');
  const [composePriority, setComposePriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Inline Reply State
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Quota Calculator State
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | ''>(
    initialListing ? initialListing.id : listings[0]?.id || ''
  );
  const [requestedUnits, setRequestedUnits] = useState<number>(
    initialListing ? initialListing.total_units + 3 : (listings[0]?.total_units || 5) + 3
  );
  const [quotaJustification, setQuotaJustification] = useState('');
  const [submittingQuota, setSubmittingQuota] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getSupportTickets(currentUser.id, currentUser.role);
      if (res.success && res.data) {
        setTickets(res.data);
        if (selectedTicket) {
          const updated = res.data.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        } else if (res.data.length > 0) {
          setSelectedTicket(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  // Handle pre-selected listing for quota revision
  useEffect(() => {
    if (initialListing) {
      setActiveSubTab('quota');
      setSelectedFranchiseId(initialListing.id);
      setRequestedUnits(initialListing.total_units + 3);
    }
  }, [initialListing]);

  // Send New Message (Email-style)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeBody.trim()) {
      alert('Please provide both subject and message body.');
      return;
    }

    setSendingMessage(true);
    try {
      const res = await api.createSupportTicket({
        subject: composeSubject.trim(),
        category: composeCategory,
        description: composeBody.trim(),
        priority: composePriority,
        user_id: currentUser.id,
      });

      if (res.success) {
        setShowComposeModal(false);
        setComposeSubject('');
        setComposeBody('');
        fetchTickets();
        if (res.data) setSelectedTicket(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Send Follow-up Reply in Thread
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await api.replyUserSupportTicket(selectedTicket.id, replyText.trim());
      if (res.success) {
        setReplyText('');
        fetchTickets();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Submit Fast-Track Quota Revision
  const handleSubmitQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const matched = listings.find((l) => l.id === Number(selectedFranchiseId));
    if (!matched) {
      alert('Please select an active franchise listing.');
      return;
    }

    setSubmittingQuota(true);
    try {
      const subj = `Quota Expansion Request for ${matched.name} (+${Math.max(1, requestedUnits - matched.total_units)} units)`;
      const body =
        `[FRANCHISE_ID:${matched.id}][REQUESTED_UNITS:${requestedUnits}]\n` +
        `Dear Platform Administration,\n\n` +
        `We are requesting a statutory quota expansion for "${matched.name}".\n\n` +
        `• Current Units: ${matched.available_units} Available / ${matched.total_units} Total Units\n` +
        `• Proposed New Total Units: ${requestedUnits} Units\n` +
        `• Expansion Rationale: ${quotaJustification || 'High investor demand across target expansion zones and verified operational infrastructure.'}\n` +
        `• Compliance Status: Statutory registrations and MCA/tax filings remain active.`;

      const res = await api.createSupportTicket({
        subject: subj,
        category: 'Quota Revision Request',
        description: body,
        priority: 'High',
        user_id: currentUser.id,
      });

      if (res.success) {
        alert(`Quota Revision Request #${res.data?.ticket_number || ''} submitted to Administration!`);
        setQuotaJustification('');
        setActiveSubTab('inbox');
        fetchTickets();
        if (onRefreshListings) onRefreshListings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quota request');
    } finally {
      setSubmittingQuota(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterCategory === 'All') return true;
    return t.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs">
              <Mail className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Administration Messaging &amp; Helpdesk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official encrypted messaging between brand franchisers and the FDSS Platform Administration (<span className="font-mono text-indigo-700 font-bold">admin@fdss.com</span>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1 shadow-2xs"
            title="Refresh Messages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>✉️ Compose Message to Admin</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'inbox'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Message Inbox ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quota')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'quota'
                ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>⚡ Quota Revision Fast-Track</span>
          </button>
        </div>

        {activeSubTab === 'inbox' && (
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 mr-1">Filter:</span>
            {['All', 'Quota', 'Verification', 'General'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  filterCategory === cat
                    ? 'bg-slate-900 text-white font-extrabold'
                    : 'text-slate-600 hover:bg-slate-200/70 font-semibold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===================== VIEW 1: EMAIL-STYLE TWO-PANE INBOX ===================== */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Email Thread List (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {loading ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Checking message inbox...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Inbox is Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  You have not exchanged messages with Platform Administration yet.
                </p>
                <button
                  onClick={() => setShowComposeModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send First Message</span>
                </button>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const hasAdminReply = Boolean(t.admin_response);
                const isResolved = t.status === 'Resolved';
                const isQuota = t.category.includes('Quota');

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2 relative ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 shadow-sm ring-1 ring-indigo-400/30'
                        : 'bg-white border-slate-200 hover:border-indigo-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                          {t.ticket_number}
                        </span>
                        {hasAdminReply && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Admin Replied</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 line-clamp-1 text-sm">{t.subject}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-sans">
                        {t.description.replace(/\[FRANCHISE_ID:\d+\]\[REQUESTED_UNITS:\d+\]\n?/, '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-md font-bold border ${
                        isQuota
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {t.category}
                      </span>
                      <span className={`font-black uppercase tracking-wider ${
                        isResolved
                          ? 'text-emerald-700'
                          : t.status === 'Open'
                          ? 'text-amber-700'
                          : 'text-blue-700'
                      }`}>
                        ● {t.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Reading & Thread Pane (Right 7 Cols) */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col text-xs font-sans">
                {/* Email Header Bar */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                      {selectedTicket.ticket_number}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        selectedTicket.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        Status: {selectedTicket.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {selectedTicket.priority} Priority
                      </span>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 text-lg tracking-tight">
                    {selectedTicket.subject}
                  </h3>

                  {/* Sender & Recipient Metadata */}
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">From:</span>
                        <strong className="text-slate-900">{selectedTicket.user_name || currentUser.name}</strong>
                        <span className="text-slate-500 font-mono text-[11px]">&lt;{selectedTicket.user_email || currentUser.email}&gt;</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(selectedTicket.created_at).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">To:</span>
                      <strong className="text-slate-900">FDSS Platform Administration</strong>
                      <span className="text-indigo-700 font-mono text-[11px]">&lt;admin@fdss.com&gt;</span>
                      <span className="ml-auto px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Verified Platform Channel</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Content Body */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Original Message Body
                    </div>
                    <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-xs sm:text-[13px] text-slate-800 font-sans whitespace-pre-line leading-relaxed">
                      {selectedTicket.description.replace(/\[FRANCHISE_ID:\d+\]\[REQUESTED_UNITS:\d+\]\n?/, '')}
                    </div>
                  </div>

                  {/* Official Administration Reply Card */}
                  {selectedTicket.admin_response ? (
                    <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50 rounded-2xl border-2 border-emerald-300 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                            ✓
                          </div>
                          <div>
                            <div className="font-black text-emerald-950 text-sm">
                              Platform Administration Ruling &amp; Response
                            </div>
                            <div className="text-[11px] text-emerald-700 font-mono">
                              From: Platform Administrator &lt;admin@fdss.com&gt;
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-200/70 text-emerald-900 text-[10px] font-black rounded-full uppercase tracking-wider">
                          Official Reply
                        </span>
                      </div>

                      <div className="text-xs sm:text-[13px] text-emerald-950 leading-relaxed font-sans whitespace-pre-line">
                        {selectedTicket.admin_response}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <strong>Awaiting Administrator Response:</strong> Your message has been received by platform governance. Normal statutory and listing inquiries receive answers within 4–12 business hours.
                      </div>
                    </div>
                  )}

                  {/* Follow-up Reply Box (Email Reply Form) */}
                  <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                      <Reply className="w-4 h-4 text-indigo-600" />
                      <span>Send Follow-Up Message / Reply to Admin</span>
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your follow-up reply to Platform Administration..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl font-sans text-xs text-slate-800 focus:outline-indigo-600 leading-relaxed"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sendingReply}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer text-xs"
                      >
                        <Send className="w-4 h-4" />
                        <span>{sendingReply ? 'Sending Reply...' : 'Send Reply'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Mail className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-black text-slate-800 text-base">Select a Message to Read</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click any communication thread from the left column to view the complete email memorandum and administration rulings.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: QUOTA REVISION FAST-TRACK ===================== */}
      {activeSubTab === 'quota' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-xs">
          <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-black text-[10px] uppercase tracking-widest">
                  Statutory Capacity Engine
                </span>
                <span className="text-xs font-bold text-slate-400">Locked Inventory Safeguard</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Request Franchise Unit Quota Revision
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                FDSS mathematically enforces regional unit quotas to eliminate duplicate overselling. Use this fast-track tool to submit expansion capacity for statutory administrative certification.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitQuota} className="space-y-5">
            {listings.length > 0 && (
              <div>
                <label className="block font-black text-slate-800 mb-1.5">Select Franchise Brand</label>
                <select
                  value={selectedFranchiseId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedFranchiseId(id);
                    const matched = listings.find((l) => l.id === id);
                    if (matched) setRequestedUnits(matched.total_units + 3);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-purple-600"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — Current: {l.available_units} Available / {l.total_units} Total ({l.sold_units || 0} Sold)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Visual Quota Slider */}
            {(() => {
              const matched = listings.find((l) => l.id === Number(selectedFranchiseId));
              const currentTotal = matched?.total_units || 0;
              const currentAvailable = matched?.available_units || 0;
              const expansion = Math.max(0, requestedUnits - currentTotal);

              return (
                <div className="p-5 bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50 rounded-2xl border-2 border-purple-200/80 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Current Total</div>
                      <div className="text-xl font-black text-slate-900 font-mono">{currentTotal}</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Available Unsold</div>
                      <div className="text-xl font-black text-emerald-700 font-mono">{currentAvailable}</div>
                    </div>
                    <div className="p-3 bg-purple-600 text-white rounded-xl shadow-xs">
                      <div className="text-[10px] text-purple-200 font-bold uppercase">Proposed Total</div>
                      <div className="text-xl font-black text-white font-mono">{requestedUnits} Units</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between font-bold text-xs text-purple-950">
                      <span>Adjust Proposed Authorized Units:</span>
                      <span className="font-mono text-purple-700 font-black">+{expansion} Additional Units</span>
                    </div>
                    <input
                      type="range"
                      min={currentTotal}
                      max={50}
                      value={requestedUnits}
                      onChange={(e) => setRequestedUnits(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Min: {currentTotal} Units</span>
                      <span>Target: {requestedUnits} Units</span>
                      <span>Max Platform Cap: 50 Units</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block font-black text-slate-800 mb-1.5">
                Statutory Justification &amp; Infrastructure Capacity
              </label>
              <textarea
                rows={4}
                required
                value={quotaJustification}
                onChange={(e) => setQuotaJustification(e.target.value)}
                placeholder="Explain why your brand requires quota expansion: e.g., expanded territory coverage, new central warehouse setup, additional municipal licenses obtained..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-sans text-xs text-slate-800 focus:outline-purple-600 leading-relaxed"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Statutory Review Notice</span>
              </div>
              <p>
                Submitting this request creates an official administrative ticket for Platform Governance. Once approved, the new unit quota is automatically released to prospective accredited investors in the marketplace.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('inbox')}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
              >
                Back to Inbox
              </button>
              <button
                type="submit"
                disabled={submittingQuota}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-300" />
                <span>{submittingQuota ? 'Submitting Quota Request...' : 'Submit Quota Revision to Admin'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== COMPOSE NEW EMAIL MODAL ===================== */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden relative my-auto max-h-[92vh] flex flex-col text-xs font-sans">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Compose Message to Admin</h3>
                  <p className="text-[11px] text-slate-500">
                    Direct email-style message to FDSS Platform Administration.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition"
              >
                ✕
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendMessage} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* To: Field */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 w-12">To:</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Platform Administration (admin@fdss.com)</span>
                </span>
              </div>

              {/* From: Field */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 w-12">From:</span>
                <span className="font-bold text-slate-800">
                  {currentUser.name} <span className="font-mono text-slate-500 font-normal">({currentUser.email})</span>
                </span>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-black text-slate-800 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Inquiry regarding my brand listing / territory rights"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">Topic / Category</label>
                  <select
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-indigo-600"
                  >
                    <option value="General Support">General Platform Inquiries</option>
                    <option value="Listing Verification">Listing &amp; Brand Approval</option>
                    <option value="Statutory Compliance">Compliance Vault &amp; Legal Permits</option>
                    <option value="Territory Inquiries">Territory Boundary &amp; Exclusivity</option>
                    <option value="Billing & Fees">Maintenance Fee &amp; Billing Records</option>
                    <option value="Quota Revision Request">Franchise Quota Expansion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">Priority</label>
                  <select
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-indigo-600"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent / Time-Sensitive</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block font-black text-slate-800 mb-1">Message Body</label>
                <textarea
                  rows={6}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Dear Platform Administration,&#10;&#10;Write your message here, just like an email..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-sans text-xs text-slate-800 focus:outline-indigo-600 leading-relaxed"
                />
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingMessage ? 'Sending Email...' : 'Send Message to Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
