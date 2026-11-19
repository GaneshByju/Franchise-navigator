import React, { useState } from 'react';
import { FranchiseListing } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Scale,
  Users,
  Store,
  DollarSign
} from 'lucide-react';

interface RiskAssessmentViewProps {
  franchises: FranchiseListing[];
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({ franchises }) => {
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(franchises[0]?.id || 1);
  const activeFranchise = franchises.find((f) => f.id === Number(selectedFranchiseId)) || franchises[0];

  // Dynamic Risk Vectors based on business model & category
  const isFoco = activeFranchise?.business_model.includes('FOCO');
  const isHealthcare = activeFranchise?.category_slug === 'healthcare-pharmacy';
  const isEdtech = activeFranchise?.category_slug === 'education-training';

  const riskFactors = [
    {
      category: 'Financial & Capital Risk',
      icon: DollarSign,
      level: activeFranchise?.total_investment_est > 4000000 ? 'Moderate' : 'Low',
      description: 'Capital lock-in period and sensitivity to working capital buffer requirements.',
      mitigation: 'Franchiser maintains a 3-month working capital reserve included in upfront capital allocation.',
      status: 'Audited',
    },
    {
      category: 'Operational Complexity Risk',
      icon: Store,
      level: isFoco ? 'Low' : isHealthcare ? 'Moderate' : 'Low',
      description: 'Day-to-day operational execution, staff dependency, and quality control consistency.',
      mitigation: isFoco ? 'Company-operated model reduces direct investor operational exposure to near zero.' : 'Comprehensive 2-week training curriculum provided at Franchiser headquarters with SOP manual.',
      status: 'Verified',
    },
    {
      category: 'Regulatory & Statutory Compliance',
      icon: Scale,
      level: isHealthcare ? 'Moderate' : 'Low',
      description: 'Statutory licenses, municipal permits, environmental NOCs, and health standards.',
      mitigation: `Franchiser legal team coordinates ${activeFranchise?.licenses?.length || 2} mandatory statutory licenses before store handover.`,
      status: 'Audited',
    },
    {
      category: 'Territory Saturation & Cannibalization',
      icon: Users,
      level: activeFranchise?.available_territories_count && activeFranchise.available_territories_count > 1 ? 'Low' : 'Moderate',
      description: 'Risk of intra-brand proximity competition and territory exclusivity encroachment.',
      mitigation: 'Binding exclusive territory radius protection clause drafted into Master Franchise Contract.',
      status: 'Contractual',
    },
    {
      category: 'Supply Chain & Material Dependency',
      icon: AlertTriangle,
      level: 'Low',
      description: 'Dependence on centralized ingredients/inventory and pricing escalation clauses.',
      mitigation: 'Master supply agreement caps annual raw material price revisions at national wholesale inflation index.',
      status: 'Verified',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Comprehensive Risk Diligence Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Multi-vector qualitative and contractual risk breakdown across financial capital, regulatory compliance, operational dependencies, and territory exclusivity.
        </p>
      </div>

      {/* Franchise Selector */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-base flex items-center justify-center border border-indigo-100 shrink-0">
            {activeFranchise?.name.charAt(0)}
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Evaluating Risk For:
            </label>
            <select
              value={selectedFranchiseId}
              onChange={(e) => setSelectedFranchiseId(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer"
            >
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.business_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Composite Risk Profile: LOW TO MODERATE
          </span>
        </div>
      </div>

      {/* RISK FACTORS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskFactors.map((factor, idx) => {
          const Icon = factor.icon;
          const isLow = factor.level === 'Low';
          const isMod = factor.level === 'Moderate';

          return (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{factor.category}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{factor.status} Factor</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isLow
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isMod
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {factor.level} Risk
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {factor.description}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Contractual Mitigation: </strong>
                {factor.mitigation}
              </div>
            </div>
          );
        })}
      </div>

      {/* INVESTOR DUE DILIGENCE AUDIT CHECKLIST */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Pre-Disbursement Audit Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>MCA Company Incorporation Verified</span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Active GST Registration Verified by Admin</span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Registered Brand Trademark Filing Valid</span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Statutory Listing Fee (₹5,000) Fully Paid</span>
          </div>
        </div>
      </div>
    </div>
  );
};
