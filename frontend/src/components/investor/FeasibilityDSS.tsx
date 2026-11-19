import React, { useState, useEffect } from 'react';
import { FranchiseListing, FeasibilityResult, FeasibilityHistoryItem, User } from '../../types';
import { api } from '../../services/api';
import { FeasibilityDossierExport } from '../common/FeasibilityDossierExport';
import { FinancialSensitivitySimulator } from './FinancialSensitivitySimulator';
import { GISLocationHeatmap } from '../common/GISLocationHeatmap';
import {
  Calculator,
  Sparkles,
  TrendingUp,
  MapPin,
  Briefcase,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Printer,
  History as HistoryIcon,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';

interface FeasibilityDSSProps {
  currentUser?: User | null;
  franchises: FranchiseListing[];
  preSelectedFranchise?: FranchiseListing | null;
  onOpenReportModal?: (data: any) => void;
  onApplyFranchise?: (franchise: FranchiseListing) => void;
}

export const FeasibilityDSS: React.FC<FeasibilityDSSProps> = ({
  currentUser,
  franchises,
  preSelectedFranchise,
  onOpenReportModal,
  onApplyFranchise,
}) => {
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(
    preSelectedFranchise?.id || (franchises[0]?.id ?? 1)
  );
  const [budget, setBudget] = useState<number>(3500000);
  const [location, setLocation] = useState<string>('Bangalore Urban (Indiranagar / Koramangala)');
  const [experienceLevel, setExperienceLevel] = useState<string>('Intermediate (1-3 yrs retail/ops)');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FeasibilityResult | null>(null);
  const [history, setHistory] = useState<FeasibilityHistoryItem[]>([]);

  const userId = currentUser?.id || 1;
  const activeFranchise = franchises.find((f) => f.id === Number(selectedFranchiseId)) || franchises[0];

  const userPlan = (currentUser?.profile as any)?.plan_type || 'Free';
  const isInvestor = currentUser?.role === 'investor';
  const isPremiumInvestor = isInvestor && (userPlan === 'Premium' || userPlan === 'Professional');

  useEffect(() => {
    if (activeFranchise) {
      setBudget(activeFranchise.total_investment_est);
    }
  }, [activeFranchise]);

  useEffect(() => {
    if (isPremiumInvestor) {
      api.getFeasibilityHistory(userId)
        .then((res) => {
          if (res.success && res.data) {
            setHistory(res.data);
          }
        })
        .catch((e) => console.error('Failed to load history', e));
    }
  }, [userId, isPremiumInvestor]);

  if (!currentUser || !isPremiumInvestor) {
    return (
      <div className="max-w-4xl mx-auto my-6 p-8 sm:p-12 bg-white rounded-3xl border border-amber-200 shadow-xl text-center space-y-6 animate-fade-scale font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 font-extrabold flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <Calculator className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <span className="px-3.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
            🔒 PREMIUM INVESTOR EXCLUSIVE FEATURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Decision Support System (DSS) Feasibility Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            Personalized 5-Factor algorithmic feasibility scoring (Financial Outlays, Target Location Dynamics, Local Sector Competition, Industry Market Trends, &amp; Entrepreneurial Experience Matching) is reserved exclusively for **Premium Investor** subscribers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-2 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              5-Factor Audit
            </div>
            <p className="text-slate-500 text-[11px]">Personalized 0–100 feasibility rating tailored to your exact capital &amp; city.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Payback Projections
            </div>
            <p className="text-slate-500 text-[11px]">Precision monthly cash flow, pre-tax ROI, and breakeven month calculations.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Risk Mitigations
            </div>
            <p className="text-slate-500 text-[11px]">Customized recommendations and sector challenges breakdown for risk reduction.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-semibold text-amber-900 max-w-md">
            <span>⚡ Upgrade your subscription plan to <strong>Premium</strong> in your Investor Profile to unlock the Feasibility DSS Engine.</span>
          </div>
        </div>
      </div>
    );
  }

  const handleComputeFeasibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFranchise) return;
    setLoading(true);

    try {
      const res = await api.calculateFeasibility({
        investor_id: userId,
        franchise_id: activeFranchise.id,
        budget: Number(budget),
        location,
        experience_level: experienceLevel,
        duration_months: 36,
      });

      if (res.success && res.data) {
        setResult(res.data);
        const histRes = await api.getFeasibilityHistory(userId);
        if (histRes.success) setHistory(histRes.data);
      }
    } catch (err: any) {
      alert(err.message || 'Error running feasibility model');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Algorithmic Decision Support System (DSS)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
          Feasibility &amp; Risk Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Evaluate capital adequacy, territory footfall, competitive density, and operational variance to calculate a predictive 0–100 suitability rating.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT PARAMETERS */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Model Inputs
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Config</span>
          </div>

          <form onSubmit={handleComputeFeasibility} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Franchise Opportunity
              </label>
              <select
                value={selectedFranchiseId}
                onChange={(e) => setSelectedFranchiseId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Est: ₹{(f.total_investment_est / 100000).toFixed(1)}L • ROI: {f.est_roi}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Available Investment Capital</span>
                <span className="text-blue-600">₹{(budget / 100000).toFixed(1)} Lakhs</span>
              </div>
              <input
                type="number"
                min="500000"
                max="30000000"
                step="100000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                Franchiser Base Requirement: ₹{(activeFranchise?.total_investment_est / 100000).toFixed(1)} Lakhs
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Proposed Target Territory / City
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Indiranagar, Bangalore"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Operating Experience
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Beginner (First-time business owner)">Beginner (First-time business owner)</option>
                <option value="Intermediate (1-3 yrs retail/ops)">Intermediate (1-3 yrs retail/ops)</option>
                <option value="Experienced (3-5 yrs multi-unit)">Experienced (3-5 yrs multi-unit)</option>
                <option value="Veteran Investor (5+ yrs commercial enterprise)">Veteran Investor (5+ yrs commercial enterprise)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider uppercase"
            >
              {loading ? (
                <span>Executing Mathematical Matrix...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Compute DSS Feasibility Score</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              Normalized vector weighing capital liquidity surplus, local spending density, CAGR trends, and ops complexity.
            </div>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-scale">
              {/* Score Dial */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    DSS Overall Feasibility Score
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                    {result.overall_score} <span className="text-sm font-bold text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black border ${getScoreColor(result.overall_score)}`}>
                      {result.suitability_label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="text-xs text-slate-500 sm:text-right">
                    Brand: <span className="font-bold text-slate-900">{activeFranchise?.name}</span>
                    <br />
                    Territory: <span className="font-bold text-blue-600">{location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FeasibilityDossierExport
                      franchise={activeFranchise}
                      investor={currentUser}
                      dssResult={result}
                      location={location}
                      capitalAvailable={budget}
                    />
                    {onApplyFranchise && activeFranchise && (
                      <button
                        onClick={() => onApplyFranchise(activeFranchise)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Multi-Factor Diligence Vectors
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Liquidity</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">{result.financial_score}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${result.financial_score}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Location</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">{result.location_score}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${result.location_score}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Sector</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">{result.market_score}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${result.market_score}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Competition</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">{result.competition_score}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${result.competition_score}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500 font-bold">Experience</div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">{result.experience_score}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${result.experience_score}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Algorithmic Strategy Narrative
                </h3>
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  {result.recommendations}
                </div>
              </div>

              {/* Financial Return Summary */}
              {result.breakdown && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Est. Monthly Profit</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{(result.breakdown.est_monthly_profit / 100000).toFixed(2)}L
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Annual ROI</span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {result.breakdown.est_roi}% p.a.
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Payback Horizon</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {result.breakdown.payback_months} Months
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Breakeven</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      Month {result.breakdown.breakeven_months}
                    </span>
                  </div>
                </div>
              )}

              {/* Sensitivity Simulator */}
              {activeFranchise && (
                <div className="pt-4 border-t border-slate-200">
                  <FinancialSensitivitySimulator franchise={activeFranchise} />
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-base">
                Ready to Calculate Feasibility
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Select a franchise from the left, set your capital and target city, then click compute score to view full mathematical projections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
