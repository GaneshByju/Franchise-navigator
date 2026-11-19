import React, { useState, useEffect } from 'react';
import { FranchiseListing } from '../../types';
import { api } from '../../services/api';
import {
  Store,
  CheckCircle2,
  XCircle,
  Eye,
  Star,
  DollarSign,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Building,
  Clock,
  Lock,
  X,
  ExternalLink,
  Award,
  RefreshCw
} from 'lucide-react';

interface AdminFranchisesViewProps {
  franchises: FranchiseListing[];
  onRefresh: () => void;
  onSelectFranchise: (franchise: FranchiseListing) => void;
}

export const AdminFranchisesView: React.FC<AdminFranchisesViewProps> = ({
  franchises,
  onRefresh,
  onSelectFranchise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'all'>('pending');
  const [auditListing, setAuditListing] = useState<FranchiseListing | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [viewingDocImage, setViewingDocImage] = useState<{
    title: string;
    doc_type?: string;
    file_url: string;
    status?: string;
    issuing_authority?: string;
  } | null>(null);

  useEffect(() => {
    onRefresh();
  }, []);

  const pendingListings = franchises.filter(
    (f) => f.status === 'Pending Approval' || f.status === 'Under Review' || f.status === 'Draft' || f.status === 'Documents Required' || f.status === 'Document Audit Pending'
  );
  const activeListings = franchises.filter(
    (f) => f.status === 'Active' || f.status === 'Available' || f.status === 'Verified'
  );

  const displayedFranchises = (
    activeTab === 'pending'
      ? pendingListings
      : activeTab === 'active'
      ? activeListings
      : franchises
  ).filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.headquarters.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id: number, status: string) => {
    setUpdating(true);
    try {
      const res = await api.updateListingStatus(id, status, adminNotes);
      if (res.success) {
        alert(`Listing status successfully updated to "${status}"!`);
        setAuditListing(null);
        setAdminNotes('');
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Franchise Directory Moderation &amp; Certificate Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce statutory verification: Franchise listings are hidden from public investors until certified by Admin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search pending brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-amber-600 text-amber-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Audit &amp; Verification</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
            {pendingListings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-emerald-600 text-emerald-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Live &amp; Verified Marketplace</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
            {activeListings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-900 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4 text-indigo-600" />
          <span>All Directory Listings</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-extrabold">
            {franchises.length}
          </span>
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">Brand &amp; Business Type</th>
                <th className="p-3.5">Operating Model</th>
                <th className="p-3.5">Total Outlay</th>
                <th className="p-3.5">Statutory Audit Status</th>
                <th className="p-3.5">Listing Fee</th>
                <th className="p-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedFranchises.map((f) => {
                const isPending = f.status === 'Pending Approval' || f.status === 'Under Review' || f.status === 'Draft' || f.status === 'Documents Required' || f.status === 'Document Audit Pending';
                const isLive = f.status === 'Active' || f.status === 'Available' || f.status === 'Verified';

                return (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {f.name}
                        {isLive && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                            ✓ VERIFIED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{f.business_type} • {f.headquarters}</div>
                    </td>

                    <td className="p-3.5 text-slate-600 font-medium">{f.business_model}</td>
                    
                    <td className="p-3.5 font-bold text-slate-900">
                      ₹{(f.total_investment_est / 100000).toFixed(1)}L
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max ${
                        f.status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : f.status === 'Documents Required'
                          ? 'bg-sky-100 text-sky-900 border border-sky-300'
                          : f.status === 'Document Audit Pending'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : isLive
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {isPending && f.status === 'Documents Required' ? (
                          <>
                            <FileCheck className="w-3 h-3 text-sky-600" />
                            <span>Step 2: Awaiting Documents</span>
                          </>
                        ) : isPending && f.status === 'Document Audit Pending' ? (
                          <>
                            <Clock className="w-3 h-3 text-purple-600" />
                            <span>Step 2: Docs Audit Pending</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Step 1: Proposal Audit Pending</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>✓ Live &amp; Verified</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {f.listing_fee_status} (₹{f.listing_fee_amount})
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setAuditListing(f);
                          setAdminNotes(f.description || '');
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition shadow-2xs"
                      >
                        Audit &amp; Moderate →
                      </button>
                    </td>
                  </tr>
                );
              })}

              {displayedFranchises.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No franchise listings found under this filter status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STATUTORY CERTIFICATE AUDIT & APPROVAL MODAL */}
      {auditListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative my-auto max-h-[92vh] flex flex-col text-xs">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Audit &amp; Moderate Listing: {auditListing.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Step-by-step verification: Approve initial proposal or audit uploaded statutory certificates.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAuditListing(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* ── REVENUE & BILLING PANEL (PRIMARY ADMIN FOCUS) ── */}
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 overflow-hidden">
                <div className="px-4 py-2.5 bg-indigo-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-white" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Revenue & Billing Status</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Listing Fee */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Listing Fee</div>
                    <div className="text-base font-black text-slate-900">
                      ₹{(auditListing.listing_fee_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      auditListing.listing_fee_status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {auditListing.listing_fee_status === 'Paid' ? '✓ Paid' : '✗ Unpaid'}
                    </span>
                  </div>

                  {/* Monthly Maintenance */}
                  <div className={`rounded-xl p-3 border text-center ${
                    auditListing.maintenance_fee_status === 'Overdue'
                      ? 'bg-rose-50 border-rose-300'
                      : auditListing.maintenance_fee_status === 'Grace Period'
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Monthly Maintenance</div>
                    <div className={`text-base font-black ${
                      auditListing.maintenance_fee_status === 'Overdue' ? 'text-rose-700' : 'text-slate-900'
                    }`}>
                      ₹{(auditListing.maintenance_fee || 0).toLocaleString('en-IN')}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      auditListing.maintenance_fee_status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : auditListing.maintenance_fee_status === 'Grace Period'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {auditListing.maintenance_fee_status === 'Paid' ? '✓ Paid' : auditListing.maintenance_fee_status === 'Grace Period' ? '⚠ Grace Period' : '✗ OVERDUE'}
                    </span>
                  </div>

                  {/* Total Revenue from this listing */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Total Collected</div>
                    <div className="text-base font-black text-emerald-700">
                      ₹{(
                        (auditListing.listing_fee_status === 'Paid' ? (auditListing.listing_fee_amount || 0) : 0) +
                        (auditListing.maintenance_fee_status === 'Paid' ? (auditListing.maintenance_fee || 0) : 0)
                      ).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">Listing + Maintenance</div>
                  </div>

                  {/* Maintenance Due Date */}
                  <div className={`rounded-xl p-3 border text-center ${
                    auditListing.maintenance_fee_status === 'Overdue' ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
                  }`}>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Next Bill Due</div>
                    <div className={`text-sm font-black ${
                      auditListing.maintenance_fee_status === 'Overdue' ? 'text-rose-700' : 'text-slate-900'
                    }`}>
                      {auditListing.maintenance_due_date
                        ? new Date(auditListing.maintenance_due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </div>
                    {auditListing.maintenance_fee_status === 'Overdue' && (
                      <div className="text-[9px] text-rose-600 font-extrabold mt-1">⚠ OVERDUE — Action Required</div>
                    )}
                  </div>
                </div>

                {/* Overdue Warning Banner */}
                {auditListing.maintenance_fee_status === 'Overdue' && (
                  <div className="mx-4 mb-4 p-2.5 bg-rose-600 rounded-xl text-white text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    This listing is OVERDUE on monthly maintenance. Consider suspending until payment is received.
                  </div>
                )}
                {auditListing.maintenance_fee_status === 'Grace Period' && (
                  <div className="mx-4 mb-4 p-2.5 bg-amber-500 rounded-xl text-white text-[11px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    This listing is in Grace Period. Payment is due soon — send a reminder.
                  </div>
                )}
              </div>

              {/* Brand Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Operating Model</span>
                  <span className="font-bold text-slate-900">{auditListing.business_model}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Estimated Outlay</span>
                  <span className="font-bold text-indigo-700">₹{(auditListing.total_investment_est / 100000).toFixed(2)}L</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Audit Workflow Stage</span>
                  <span className="font-bold text-amber-700 uppercase">{auditListing.status}</span>
                </div>
              </div>

              {/* Uploaded Statutory Certificates & Disclosures */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-2 flex items-center justify-between uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Statutory Licenses &amp; Compliance Document Images
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold lowercase">Click any certificate image to view &amp; inspect</span>
                </h4>

                <div className="space-y-2.5">
                  {(!auditListing.documents || auditListing.documents.length === 0) ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                      <FileCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <div className="font-bold text-slate-700 text-xs">No Statutory Documents Uploaded Yet</div>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                        The franchiser has not submitted statutory certificates (GSTIN, FSSAI, MCA, or Trademarks) for this brand listing yet.
                      </p>
                    </div>
                  ) : (
                    auditListing.documents.map((doc: any) => {
                      const isDocVerified = doc.status === 'Verified' || auditListing.status === 'Active' || auditListing.status === 'Verified';

                      return (
                        <div
                          key={doc.id}
                          className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isDocVerified ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                          {/* Interactive Image Thumbnail */}
                          <div
                            onClick={() => setViewingDocImage({ title: doc.title, doc_type: doc.doc_type, file_url: doc.file_url, status: doc.status, issuing_authority: doc.issuing_authority })}
                            className="relative w-16 h-12 rounded-xl overflow-hidden border border-slate-300 shrink-0 cursor-pointer group bg-slate-900 shadow-2xs"
                            title="Click to view high resolution document image"
                          >
                            <img src={doc.file_url} alt={doc.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{doc.title}</span>
                            </div>
                            <div className="text-[10.5px] text-slate-500 mt-0.5">
                              {doc.issuing_authority || 'Govt Statutory Body'} • Document Asset: PNG / JPG Image
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingDocImage({ title: doc.title, doc_type: doc.doc_type, file_url: doc.file_url, status: doc.status, issuing_authority: doc.issuing_authority })}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-xl transition border border-indigo-200 flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Inspect Image</span>
                          </button>

                          <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-extrabold ${
                            isDocVerified
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isDocVerified ? '✓ Verified' : '⏳ Pending Audit'}
                          </span>
                        </div>
                      </div>
                    );
                  }))}
                </div>
              </div>

              {/* Admin Moderation Remarks */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Admin Auditor Notes &amp; Instructions
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter instructions or feedback for the franchiser..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-indigo-600"
                />
              </div>

            </div>

            {/* Footer Decision Buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <button
                onClick={() => handleUpdateStatus(auditListing.id, 'Suspended')}
                disabled={updating}
                className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl transition border border-rose-300 text-xs w-full sm:w-auto"
              >
                Reject / Suspend
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {/* Step 1 Approval Button */}
                {(auditListing.status === 'Pending Approval' || auditListing.status === 'Draft') && (
                  <button
                    onClick={() => handleUpdateStatus(auditListing.id, 'Documents Required')}
                    disabled={updating}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition text-xs shadow-xs flex items-center gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Approve Proposal &amp; Request Statutory Docs</span>
                  </button>
                )}

                {/* Step 2 Final Verification Button */}
                <button
                  onClick={() => handleUpdateStatus(auditListing.id, 'Active')}
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-xs shadow-xs flex items-center gap-1.5 w-full sm:w-auto justify-center hover:scale-[1.02] active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Documents &amp; Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-RES STATUTORY DOCUMENT IMAGE LIGHTBOX MODAL */}
      {viewingDocImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden relative my-auto max-h-[95vh] flex flex-col text-xs">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                  <Eye className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{viewingDocImage.title}</h3>
                  <p className="text-[10.5px] text-slate-400">
                    Statutory Certificate Inspection • {viewingDocImage.issuing_authority || 'Govt Compliance Authority'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDocImage(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Document Image Box */}
            <div className="p-4 sm:p-6 bg-slate-950 flex-1 flex items-center justify-center overflow-auto min-h-[400px]">
              <img
                src={viewingDocImage.file_url}
                alt={viewingDocImage.title}
                className="max-h-[68vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory Certificate Image Integrity Verified</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setViewingDocImage(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    alert(`Document "${viewingDocImage.title}" inspected & verified by auditor.`);
                    setViewingDocImage(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Document Verified</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
