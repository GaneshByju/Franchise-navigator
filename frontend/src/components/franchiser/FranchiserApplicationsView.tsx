import React, { useState } from 'react';
import { Application } from '../../types';
import { api } from '../../services/api';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  MapPin,
  DollarSign,
  Briefcase,
  Award
} from 'lucide-react';

interface FranchiserApplicationsViewProps {
  applications: Application[];
  onRefresh: () => void;
}

export const FranchiserApplicationsView: React.FC<FranchiserApplicationsViewProps> = ({
  applications,
  onRefresh,
}) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleUpdateStatus = async (appId: number, status: 'Approved' | 'Rejected') => {
    setProcessingId(appId);
    try {
      const res = await api.updateApplicationStatus(appId, status);
      if (res.success) {
        if (status === 'Approved') {
          alert('Application Approved! Master Franchise Agreement has been automatically drafted and dispatched to the investor for digital e-signature.');
        } else {
          alert('Application marked as rejected.');
        }
        onRefresh();
      }
    } catch (e: any) {
      alert(e.message || 'Status update failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Investor Due Diligence Inquiries & Proposals ({applications.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review accredited investor qualifications, capital commitments, target territories, and issue approved digital contracts.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Pending Applications</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When accredited investors submit interest in your franchise brands, their proposals will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isApproved = app.status === 'Approved';
            const isPending = app.status === 'Submitted' || app.status === 'Under Review';
            const isRejected = app.status === 'Rejected';

            return (
              <div
                key={app.id}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {app.investor_name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        {isRejected && <XCircle className="w-3.5 h-3.5" />}
                        <span>{app.status}</span>
                      </span>

                      {/* Compliance indicators: Contract E-Sign & Fee Payment */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                        app.is_contract_signed || app.contract_status === 'Signed'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        <FileCheck className="w-3 h-3 text-emerald-600" />
                        <span>{app.is_contract_signed || app.contract_status === 'Signed' ? 'E-Signed by Investor' : 'Awaiting E-Sign'}</span>
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                        app.is_payment_completed || app.is_contract_signed || app.contract_status === 'Signed'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        <DollarSign className="w-3 h-3 text-amber-600" />
                        <span>{app.is_payment_completed || app.is_contract_signed || app.contract_status === 'Signed' ? 'Fee Paid' : 'Fee Pending'}</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>Brand: <strong className="text-slate-800">{app.franchise_name}</strong></span>
                      <span>•</span>
                      <span>Target Location: <strong className="text-slate-800">{app.target_location}</strong></span>
                      <span>•</span>
                      <span>Proposed Capital: <strong className="text-indigo-700">₹{(app.proposed_budget / 100000).toFixed(1)} Lakhs</strong></span>
                      <span>•</span>
                      <span>Submitted: {app.submitted_at}</span>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      {!(app.is_contract_signed || app.contract_status === 'Signed') ? (
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 block mb-1">
                            ⚠️ Approval Locked: Awaiting Investor E-Sign & Fee Payment
                          </span>
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5"
                          >
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Accept (Locked Until E-Sign)</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'Approved')}
                          disabled={processingId === app.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Accept Proposal</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                        disabled={processingId === app.id}
                        className="px-3 py-2 bg-white border border-slate-300 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs rounded-xl transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Contract Dispatched to Investor</span>
                    </div>
                  )}
                </div>

                {app.message && (
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 leading-relaxed">
                    <strong className="text-slate-900 block mb-0.5">Investor Proposal Statement:</strong>
                    "{app.message}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
