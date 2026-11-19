import React from 'react';
import { Contract } from '../../types';
import {
  Users,
  Award,
  CheckCircle2,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  FileText
} from 'lucide-react';

interface FranchiserPartnersViewProps {
  contracts: Contract[];
}

export const FranchiserPartnersView: React.FC<FranchiserPartnersViewProps> = ({ contracts }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Active Franchisee Network & Store Operators ({contracts.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Master contract holders, assigned exclusive territories, and operational compliance statuses.
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Active Partners Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once investor proposals are approved and contracts are signed, your network franchisees will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                    ACTIVE FRANCHISEE
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">
                    {c.investor_name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Brand: <strong className="text-slate-700">{c.franchise_name}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Committed Outlay</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{(c.total_investment / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Assigned Territory:</span>
                  <span className="font-semibold text-slate-900">{c.territory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agreement Term:</span>
                  <span className="font-semibold text-slate-900">{c.duration_years} Years (Renewable)</span>
                </div>
                <div className="flex justify-between">
                  <span>Royalty Structure:</span>
                  <span className="font-semibold text-indigo-700">{c.royalty_terms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">Signed & Legally Enforced</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
