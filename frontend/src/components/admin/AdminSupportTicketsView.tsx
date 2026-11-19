import React, { useState, useEffect } from 'react';
import { SupportTicket, FranchiseListing } from '../../types';
import { api } from '../../services/api';
import {
  Headphones,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Send,
  Shield,
  Layers,
  Building2,
  ArrowRight,
  Filter,
  UserCheck,
  Check,
  X
} from 'lucide-react';

interface AdminSupportTicketsViewProps {
  franchises: FranchiseListing[];
  onRefresh: () => void;
}

export const AdminSupportTicketsView: React.FC<AdminSupportTicketsViewProps> = ({
  franchises,
  onRefresh,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Response Form
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState<'In Progress' | 'Resolved' | 'Closed'>('Resolved');
  const [savingResponse, setSavingResponse] = useState(false);

  // Quota Adjustment override
  const [overrideUnits, setOverrideUnits] = useState<number>(0);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSupportTickets();
      if (res.success && res.data) {
        setTickets(res.data);
        if (selectedTicket) {
          const updated = res.data.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load admin support tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = (t: SupportTicket) => {
    setSelectedTicket(t);
    setResponseText(t.admin_response || '');
    setResponseStatus(t.status === 'Open' ? 'Resolved' : (t.status as any));

    // Parse requested units if Quota Revision
    const match = t.description.match(/\[FRANCHISE_ID:(\d+)\]\[REQUESTED_UNITS:(\d+)\]/);
    if (match) {
      setOverrideUnits(Number(match[2]));
    } else {
      setOverrideUnits(0);
    }
  };

  const handleSaveResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;

    setSavingResponse(true);
    try {
      // Check if Quota Revision
      const match = selectedTicket.description.match(/\[FRANCHISE_ID:(\d+)\]\[REQUESTED_UNITS:(\d+)\]/);
      const franchiseId = match ? Number(match[1]) : undefined;
      const isQuota = selectedTicket.category.includes('Quota');

      const payload: any = {
        status: responseStatus,
        admin_response: responseText || 'Your inquiry has been reviewed and processed by platform administration.',
      };

      if (isQuota && franchiseId && overrideUnits > 0 && responseStatus === 'Resolved') {
        payload.franchise_id = franchiseId;
        payload.new_total_units = overrideUnits;
      }

      const res = await api.updateSupportTicket(selectedTicket.id, payload);
      if (res.success) {
        alert(`Inquiry #${selectedTicket.ticket_number} updated to "${responseStatus}"!`);
        fetchTickets();
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update support ticket');
    } finally {
      setSavingResponse(false);
    }
  };

  const handleQuickApproveQuota = async (t: SupportTicket, fId: number, targetUnits: number) => {
    if (!confirm(`Approve quota expansion for this brand to ${targetUnits} total units?`)) return;

    setSavingResponse(true);
    try {
      const res = await api.updateSupportTicket(t.id, {
        status: 'Resolved',
        admin_response: `Quota Revision Approved: Authorized regional quota expanded to ${targetUnits} total units following administrative statutory review.`,
        franchise_id: fId,
        new_total_units: targetUnits,
      });

      if (res.success) {
        alert(`Quota successfully updated to ${targetUnits} units!`);
        fetchTickets();
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve quota');
    } finally {
      setSavingResponse(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'All') return true;
    return t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
              <Headphones className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Franchiser Inquiries &amp; Quota Revisions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review communications from brand owners, approve statutory quota expansions, and issue official administrative rulings.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <div className="flex items-center gap-1">
          {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition text-xs ${
                filterStatus === st
                  ? 'bg-purple-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Inquiries: <strong className="text-slate-900">{tickets.length}</strong> (
          <span className="text-amber-600 font-bold">{tickets.filter((t) => t.status === 'Open').length} Open</span>,{' '}
          <span className="text-purple-600 font-bold">
            {tickets.filter((t) => t.category.includes('Quota')).length} Quota Revisions
          </span>
          )
        </div>
      </div>

      {/* Two Column Layout: Ticket List & Resolution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500">No inquiries found in this status.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const isQuota = t.category.includes('Quota');
              const match = t.description.match(/\[FRANCHISE_ID:(\d+)\]\[REQUESTED_UNITS:(\d+)\]/);
              const targetFranchise = match ? franchises.find((f) => f.id === Number(match[1])) : null;

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2.5 ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-purple-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-black text-slate-800">
                      {t.ticket_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Open'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      From: <strong className="text-slate-700">{t.user_name || 'User'}</strong> ({t.user_email})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isQuota
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {t.category}
                    </span>
                    {targetFranchise && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-800">
                        {targetFranchise.name}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resolution Panel (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 font-mono text-[11px] font-black">
                    {selectedTicket.ticket_number}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-2">{selectedTicket.subject}</h3>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>Sender: <strong>{selectedTicket.user_name}</strong> ({selectedTicket.user_email})</span>
                    <span>•</span>
                    <span>Role: <strong className="uppercase">{selectedTicket.user_role}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedTicket.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Quota Revision Action Banner if Applicable */}
              {(() => {
                const match = selectedTicket.description.match(/\[FRANCHISE_ID:(\d+)\]\[REQUESTED_UNITS:(\d+)\]/);
                if (!match) return null;
                const fId = Number(match[1]);
                const reqUnits = Number(match[2]);
                const matchedFranchise = franchises.find((f) => f.id === fId);

                return (
                  <div className="p-4 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl border border-purple-400/40 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-300" />
                        <span className="font-extrabold text-sm text-purple-200">
                          Quota Revision Request: {matchedFranchise?.name || 'Brand'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 text-[10px] font-black rounded-full border border-purple-400/30 uppercase">
                        Statutory Approval Action
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-black/20 p-3 rounded-xl border border-white/10 text-center font-mono">
                      <div>
                        <div className="text-[10px] text-purple-300 uppercase">Current Total</div>
                        <div className="text-base font-black text-white">{matchedFranchise?.total_units || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-purple-300 uppercase">Available</div>
                        <div className="text-base font-black text-white">{matchedFranchise?.available_units || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-amber-300 uppercase">Requested Total</div>
                        <div className="text-base font-black text-amber-400">{reqUnits} Units</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-purple-200 font-bold">Approve Units:</label>
                        <input
                          type="number"
                          value={overrideUnits}
                          onChange={(e) => setOverrideUnits(Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-white text-slate-900 font-bold rounded-lg text-xs"
                          min={1}
                          max={100}
                        />
                      </div>
                      <button
                        onClick={() => handleQuickApproveQuota(selectedTicket, fId, overrideUnits)}
                        disabled={savingResponse}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Approve &amp; Update Quota (+{overrideUnits - (matchedFranchise?.total_units || 0)})</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Inquiry Content */}
              <div>
                <label className="block font-black text-slate-900 mb-1.5">Original Message / Justification</label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {selectedTicket.description.replace(/\[FRANCHISE_ID:\d+\]\[REQUESTED_UNITS:\d+\]\n?/, '')}
                </div>
              </div>

              {/* Administrative Response Form */}
              <form onSubmit={handleSaveResponse} className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900">
                    Official Administrative Ruling / Reply
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Update Status:</span>
                    <select
                      value={responseStatus}
                      onChange={(e) => setResponseStatus(e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 text-xs"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={4}
                  required
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type official administrative reply to franchiser..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-sans text-slate-800 focus:outline-purple-600 text-xs leading-relaxed"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingResponse}
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>{savingResponse ? 'Saving Reply...' : 'Dispatch Ruling & Save Status'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Headphones className="w-10 h-10 text-purple-300 mx-auto" />
              <h3 className="font-black text-slate-800 text-sm">Select an Inquiry to Review</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any ticket from the left column to view the franchiser's justification and issue an administrative ruling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
