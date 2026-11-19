import React from 'react';
import { User } from '../../types';
import {
  Briefcase,
  TrendingUp,
  MapPin,
  Calendar,
  Building,
  Award,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';

interface InvestorPortfolioViewProps {
  currentUser: User;
  portfolioData: any;
  onNavigateToContracts: () => void;
}

export const InvestorPortfolioView: React.FC<InvestorPortfolioViewProps> = ({
  currentUser,
  portfolioData,
  onNavigateToContracts,
}) => {
  const activeContracts = portfolioData?.contracts || [];
  const totalCapitalDeployed = portfolioData?.totalCapitalDeployed ?? portfolioData?.total_invested ?? 0;
  const estMonthlyProfits = portfolioData?.estMonthlyCashflow ?? portfolioData?.avg_monthly_returns ?? 0;
  const activeUnitsCount = activeContracts.length || portfolioData?.activeUnitsCount || 0;
  const avgRoi = portfolioData?.avg_roi ?? 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Franchise Portfolio & Operational Holdings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time oversight of acquired franchise units, invested capital, active contracts, and territory operations.
        </p>
      </div>

      {/* Aggregate Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Capital Committed</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1.5">
            ₹{(totalCapitalDeployed / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCapitalDeployed > 0 ? '100% Deployed in Active Units' : 'No capital deployed yet'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Est. Monthly Profit</div>
          <div className={`text-2xl font-extrabold mt-1.5 ${estMonthlyProfits > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
            ₹{(estMonthlyProfits / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {estMonthlyProfits > 0 ? `~${avgRoi}% Estimated Annual ROI` : 'Accrues upon unit activation'}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Active Units Owned</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1.5">
            {activeUnitsCount} Active Unit{activeUnitsCount !== 1 ? 's' : ''}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {(currentUser.profile as any)?.plan_type === 'Premium' ? 'Unlimited Multi-Unit Portfolio (Premium Plan)' : 'Standard Plan (Up to 5 Units)'}
          </div>
        </div>
      </div>

      {/* Holdings Listing */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Commercial Unit Holdings
        </h3>

        {activeContracts.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs text-slate-400">
            No signed franchise units yet. Complete contract e-signatures to activate your units.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeContracts.map((c: any) => (
              <div
                key={c.id}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                      ACTIVE OPERATING
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1.5">
                      {c.franchise_name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {c.company_name}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">Invested Outlay</span>
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
                    <span>Royalty Terms:</span>
                    <span className="font-semibold text-indigo-700">{c.royalty_terms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signed Date:</span>
                    <span className="font-mono text-slate-700">{c.investor_signed_at?.split('T')[0] || 'Active'}</span>
                  </div>
                </div>

                <button
                  onClick={onNavigateToContracts}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Full Signed Legal Instrument</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
