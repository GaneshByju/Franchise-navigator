import React, { useState } from 'react';
import { Application, FranchiseListing, User } from '../../types';
import { api } from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Send,
  Building,
  DollarSign
} from 'lucide-react';

interface InvestorApplicationsViewProps {
  currentUser: User;
  applications: Application[];
  onRefresh: () => void;
  onNavigateToContracts: () => void;
}

export const InvestorApplicationsView: React.FC<InvestorApplicationsViewProps> = ({
  currentUser,
  applications,
  onRefresh,
  onNavigateToContracts,
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Franchise Applications ({applications.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track express of interest, franchiser approvals, background reviews, and contract drafting statuses.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-2xs"
        >
          Refresh Status
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Browse through active franchises in the catalog and submit an application to express interest.
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
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {app.franchise_name}
                    </h3>
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
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Franchiser: {app.company_name || 'Verified Franchiser'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Target Territory: <strong className="text-slate-700">{app.target_location}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Proposed Capital: ₹{(app.proposed_budget / 100000).toFixed(1)}L
                    </span>
                  </div>

                  {app.message && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 max-w-2xl leading-relaxed">
                      "{app.message}"
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Application ID: #{app.id} • Submitted on {app.submitted_at}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  {isApproved && (
                    <button
                      onClick={onNavigateToContracts}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Review Contract & E-Sign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isPending && (
                    <span className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                      Under Franchiser Due Diligence
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
