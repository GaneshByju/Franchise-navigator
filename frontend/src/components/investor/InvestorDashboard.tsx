import React from 'react';
import { FranchiseListing, Application, User } from '../../types';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Award,
  ChevronRight,
  DollarSign,
  MapPin,
  Sparkles
} from 'lucide-react';

interface InvestorDashboardProps {
  currentUser: User;
  franchises: FranchiseListing[];
  applications: Application[];
  portfolioData: any;
  onNavigate: (tab: string) => void;
  onSelectFranchise: (franchise: FranchiseListing) => void;
  onRunFeasibility: (franchise: FranchiseListing) => void;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  currentUser,
  franchises,
  applications,
  portfolioData,
  onNavigate,
  onSelectFranchise,
  onRunFeasibility,
}) => {
  const investorProfile = currentUser.profile as any;
  const activeInvestmentsCount = portfolioData?.activeUnitsCount ?? portfolioData?.active_franchises_count ?? 0;
  const totalCapitalDeployed = portfolioData?.totalCapitalDeployed ?? portfolioData?.total_invested ?? 0;
  const estMonthlyProfits = portfolioData?.estMonthlyCashflow ?? portfolioData?.avg_monthly_returns ?? 0;
  const avgRoi = portfolioData?.avg_roi ?? 0;
  const pendingAppsCount = applications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length;

  return (
    <div className="space-y-6 font-sans">
      {/* INVESTOR PASTEL BANNER - SKY & SLATE ACCENTS */}
      <div className="p-6 bg-gradient-to-r from-sky-50/90 via-slate-50 to-indigo-50/70 text-slate-900 rounded-3xl border border-sky-200/80 shadow-2xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-extrabold uppercase tracking-wider">
                {investorProfile?.plan_type || 'Accredited'} Investor
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • Max Portfolio Allocation: {investorProfile?.max_investments || 5} Units
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Decision Support Engine is active. Monitor cash flow across active commercial units, evaluate audited franchise disclosures, and calculate 0–100 feasibility scores.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('feasibility')}
              className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-2xs"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Feasibility DSS</span>
            </button>

            <button
              onClick={() => onNavigate('discover')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition border border-slate-200/80 shadow-2xs"
            >
              <span>Explore Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS CARDS - SOFT PASTEL ICON BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Operating Units</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {activeInvestmentsCount} Unit{activeInvestmentsCount !== 1 ? 's' : ''}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            {activeInvestmentsCount > 0 ? (
              <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Signed Contract
              </span>
            ) : (
              <span className="text-slate-400">No active acquisitions</span>
            )}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Capital Deployed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{(totalCapitalDeployed / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {totalCapitalDeployed > 0 ? 'CapEx Outlay + Working Capital' : '₹0 deployed • Explore opportunities'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Est. Monthly Net Yield</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${estMonthlyProfits > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
            ₹{(estMonthlyProfits / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {estMonthlyProfits > 0 ? `Avg Projected ROI: ~${avgRoi}% p.a.` : 'Yield generates post-acquisition'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Proposals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {pendingAppsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            <span className="text-amber-700 font-bold">{pendingAppsCount > 0 ? 'Under Brand Review' : 'All Settled'}</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT: RECOMMENDED FRANCHISES & RECENT APPLICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECOMMENDED FRANCHISES */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Matched Franchise Opportunities
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched against your target criteria (₹{(investorProfile?.min_budget || 1500000) / 100000}L–₹{(investorProfile?.max_budget || 5000000) / 100000}L).
              </p>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 transition"
            >
              Full Marketplace <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {franchises.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No active franchise listings in marketplace yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Verified franchise listings published by franchisers will appear here.</p>
              </div>
            ) : (
              franchises.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 font-extrabold text-base flex items-center justify-center border border-sky-100 shrink-0">
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => onSelectFranchise(f)}
                          className="font-extrabold text-slate-900 text-sm hover:text-sky-700 cursor-pointer transition"
                        >
                          {f.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-extrabold border border-emerald-200">
                          ✓ VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">
                        {f.business_type} • {f.headquarters.split(',')[0]}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-slate-700">
                          Outlay: <strong className="text-slate-900">₹{(f.total_investment_est / 100000).toFixed(1)}L</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-extrabold">
                          ROI: {f.est_roi}% p.a.
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-medium">
                          Payback: {f.payback_months} mo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onRunFeasibility(f)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Feasibility</span>
                    </button>
                    <button
                      onClick={() => onSelectFranchise(f)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR WIDGET: APPLICATIONS & QUICK FEASIBILITY */}
        <div className="space-y-5">
          {/* Quick DSS Card */}
          <div className="p-5 bg-gradient-to-br from-sky-50/80 via-slate-50 to-indigo-50/50 rounded-2xl border border-sky-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              DSS Feasibility Engine
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Calculate a mathematical 0–100 suitability rating based on financial outlays and location footfall index.
            </p>
            <button
              onClick={() => onNavigate('feasibility')}
              className="mt-2 w-full py-2 px-3 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Launch Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Applications */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Recent Proposals
              </h3>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs text-sky-700 hover:underline font-bold"
              >
                View All
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                No active franchise applications yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="font-bold text-slate-900 line-clamp-1">
                      {app.franchise_name}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Target: {app.target_location}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : app.status === 'Under Review'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {app.status}
                      </span>
                      {app.status === 'Approved' && (
                        <button
                          onClick={() => onNavigate('contracts')}
                          className="text-[11px] text-sky-700 font-bold hover:underline"
                        >
                          Contract →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
