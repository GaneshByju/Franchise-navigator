import React, { useState } from 'react';
import { Sliders, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, RefreshCw, BarChart2, DollarSign } from 'lucide-react';
import { FranchiseListing } from '../../types';

interface FinancialSensitivitySimulatorProps {
  franchise: FranchiseListing;
}

export const FinancialSensitivitySimulator: React.FC<FinancialSensitivitySimulatorProps> = ({ franchise }) => {
  // Sliders state
  const [revenueChange, setRevenueChange] = useState<number>(0); // -30% to +30%
  const [expenseChange, setExpenseChange] = useState<number>(0); // -15% to +40%
  const [materialCostChange, setMaterialCostChange] = useState<number>(0); // -10% to +30%
  const [occupancyScale, setOccupancyScale] = useState<number>(100); // 50% to 150%

  // Baseline Financials
  const baseRevenue = franchise.est_monthly_revenue || 800000;
  const baseExpenses = franchise.est_monthly_expenses || 600000;
  const baseProfit = baseRevenue - baseExpenses;
  const basePayback = franchise.payback_months || 16;
  const totalInvestment = franchise.total_investment_est || 2000000;

  // Recalculated Stress Test Financials
  const adjustedRevenue = baseRevenue * (1 + revenueChange / 100) * (occupancyScale / 100);
  const adjustedExpenses = baseExpenses * (1 + expenseChange / 100) * (1 + (materialCostChange * 0.4) / 100);
  const adjustedProfit = adjustedRevenue - adjustedExpenses;
  const adjustedMargin = adjustedRevenue > 0 ? (adjustedProfit / adjustedRevenue) * 100 : 0;

  // Payback calculation under adjusted profit
  const adjustedAnnualProfit = Math.max(1, adjustedProfit * 12);
  const adjustedPaybackMonths = adjustedProfit > 0 
    ? Math.round((totalInvestment / adjustedAnnualProfit) * 12) 
    : 999; // Indefinite if unprofitable

  const paybackShift = adjustedPaybackMonths === 999 
    ? 999 
    : adjustedPaybackMonths - basePayback;

  // Determine Stress Resilience Rating
  let rating: { label: string; color: string; desc: string; icon: any } = {
    label: 'Resilient',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Business model absorbs financial shocks with healthy profit margins.',
    icon: ShieldCheck
  };

  if (adjustedProfit <= 0) {
    rating = {
      label: 'Critical Deficit Risk',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      desc: 'Operational expenses exceed revenue under this stress scenario.',
      icon: AlertTriangle
    };
  } else if (adjustedMargin < 12 || paybackShift > 8) {
    rating = {
      label: 'Vulnerable',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      desc: 'Significant margin compression. Payback extended substantially.',
      icon: AlertTriangle
    };
  } else if (revenueChange < 0 || expenseChange > 0) {
    rating = {
      label: 'Moderate Safety Buffer',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      desc: 'Profitable despite cost pressures. Manageable payback shift.',
      icon: ShieldCheck
    };
  }

  const applyPreset = (preset: 'slowdown' | 'peak' | 'inflation' | 'reset') => {
    if (preset === 'slowdown') {
      setRevenueChange(-20);
      setExpenseChange(10);
      setMaterialCostChange(15);
      setOccupancyScale(75);
    } else if (preset === 'peak') {
      setRevenueChange(25);
      setExpenseChange(5);
      setMaterialCostChange(0);
      setOccupancyScale(125);
    } else if (preset === 'inflation') {
      setRevenueChange(-5);
      setExpenseChange(25);
      setMaterialCostChange(20);
      setOccupancyScale(95);
    } else {
      setRevenueChange(0);
      setExpenseChange(0);
      setMaterialCostChange(0);
      setOccupancyScale(100);
    }
  };

  const RatingIcon = rating.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Sliders className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">
              Financial Sensitivity & "What-If" Stress Test Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Simulate market downturns, inflation, and footfall variances for <strong>{franchise.name}</strong>
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => applyPreset('slowdown')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-2xs font-semibold border border-slate-700 transition-all"
          >
            📉 Downturn Shock
          </button>
          <button
            onClick={() => applyPreset('inflation')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded text-2xs font-semibold border border-slate-700 transition-all"
          >
            💸 Cost Inflation
          </button>
          <button
            onClick={() => applyPreset('peak')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-2xs font-semibold border border-slate-700 transition-all"
          >
            🚀 High Season Peak
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-2xs border border-slate-700"
            title="Reset to Baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Sliders Area (Left 6 Cols) */}
        <div className="lg:col-span-6 p-5 space-y-5 bg-slate-50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Stress Test Parameter Controls
          </h4>

          {/* Slider 1: Revenue Variance */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Monthly Revenue Variance</span>
              <span className={`font-bold font-mono ${revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={revenueChange}
              onChange={e => setRevenueChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-2xs text-slate-400">
              <span>-30% Downturn</span>
              <span>Baseline</span>
              <span>+30% Boom</span>
            </div>
          </div>

          {/* Slider 2: Rent & Operational Costs */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Rent & Opex Variance</span>
              <span className={`font-bold font-mono ${expenseChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="40"
              step="5"
              value={expenseChange}
              onChange={e => setExpenseChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-2xs text-slate-400">
              <span>-15% Savings</span>
              <span>Baseline</span>
              <span>+40% Rent Spike</span>
            </div>
          </div>

          {/* Slider 3: Raw Material Inflation */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Raw Material / Supply Inflation</span>
              <span className={`font-bold font-mono ${materialCostChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {materialCostChange > 0 ? `+${materialCostChange}%` : `${materialCostChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="30"
              step="5"
              value={materialCostChange}
              onChange={e => setMaterialCostChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-2xs text-slate-400">
              <span>-10% Discount</span>
              <span>Baseline</span>
              <span>+30% Supply Surge</span>
            </div>
          </div>

          {/* Slider 4: Footfall Scale */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">Footfall & Customer Scale</span>
              <span className="font-bold font-mono text-blue-600">{occupancyScale}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="10"
              value={occupancyScale}
              onChange={e => setOccupancyScale(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-2xs text-slate-400">
              <span>50% Low Traffic</span>
              <span>100% Target</span>
              <span>150% Peak Traffic</span>
            </div>
          </div>
        </div>

        {/* Results & Comparison (Right 6 Cols) */}
        <div className="lg:col-span-6 p-5 flex flex-col justify-between">
          <div>
            {/* Status Rating Badge */}
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${rating.color} mb-5`}>
              <RatingIcon className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider">{rating.label}</h4>
                <p className="text-2xs opacity-90 mt-0.5">{rating.desc}</p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Baseline vs. Stress-Tested Financial Impact
            </h4>

            {/* Comparison Metrics Table */}
            <div className="space-y-2.5">
              
              {/* Revenue */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-semibold text-slate-500 uppercase block">Monthly Revenue</span>
                  <span className="text-xs font-bold text-slate-700">₹{(baseRevenue / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-semibold text-slate-500 uppercase block">Stress-Tested</span>
                  <span className={`text-sm font-black ${adjustedRevenue >= baseRevenue ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{(adjustedRevenue / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>

              {/* Expenses */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-semibold text-slate-500 uppercase block">Monthly Expenses</span>
                  <span className="text-xs font-bold text-slate-700">₹{(baseExpenses / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-semibold text-slate-500 uppercase block">Stress-Tested</span>
                  <span className={`text-sm font-black ${adjustedExpenses <= baseExpenses ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{(adjustedExpenses / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-semibold text-blue-900 uppercase block">Est. Net Profit</span>
                  <span className="text-xs font-bold text-blue-800">₹{(baseProfit / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-semibold text-blue-900 uppercase block">Adjusted Profit</span>
                  <span className={`text-base font-black ${adjustedProfit > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ₹{(adjustedProfit / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>

              {/* Payback Shift */}
              <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-2xs text-slate-400 uppercase block">Base Payback</span>
                  <span className="text-xs font-bold text-slate-200">{basePayback} Months</span>
                </div>
                <div className="text-right">
                  <span className="text-2xs text-slate-400 uppercase block">Stress Payback</span>
                  <span className="text-sm font-black text-amber-400">
                    {adjustedPaybackMonths === 999 ? 'Unviable (Deficit)' : `${adjustedPaybackMonths} Months`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-2xs text-slate-500 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Stress testing helps evaluate capital reserve needs prior to signing franchise agreements.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
