import React, { useState } from 'react';
import { FranchiseListing } from '../../types';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Sliders,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface InvestmentAnalysisViewProps {
  franchises: FranchiseListing[];
  onSelectFranchise?: (franchise: FranchiseListing) => void;
}

export const InvestmentAnalysisView: React.FC<InvestmentAnalysisViewProps> = ({
  franchises,
  onSelectFranchise,
}) => {
  if (franchises.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dynamic Investment & ROI Sensitivity Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Stress-test footfall, ticket size, operational expense margins, and royalty structures to model monthly cash flows and capital payback horizon.
          </p>
        </div>
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Sliders className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Franchises Available to Simulate</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Once franchisers publish verified franchise listings in the marketplace, you will be able to run mathematical payback calculations, footfall simulations, and stress tests here.
          </p>
        </div>
      </div>
    );
  }

  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(franchises[0]?.id || 0);
  const activeFranchise = franchises.find((f) => f.id === Number(selectedFranchiseId)) || franchises[0];

  // Dynamic simulation inputs
  const [capitalInvested, setCapitalInvested] = useState<number>(activeFranchise?.total_investment_est || 2000000);
  const [dailyCustomers, setDailyCustomers] = useState<number>(120);
  const [avgTicketSize, setAvgTicketSize] = useState<number>(250);
  const [operatingExpenseRatio, setOperatingExpenseRatio] = useState<number>(60); // 60% of revenue

  // Sync capital when franchise changes
  const handleFranchiseChange = (id: number) => {
    setSelectedFranchiseId(id);
    const f = franchises.find((item) => item.id === id);
    if (f) {
      setCapitalInvested(f.total_investment_est);
      // Auto-tune ticket size based on sector
      if (f.category_slug === 'healthcare-pharmacy') {
        setDailyCustomers(45);
        setAvgTicketSize(850);
      } else if (f.category_slug === 'education-training') {
        setDailyCustomers(25);
        setAvgTicketSize(1500);
      } else if (f.category_slug === 'automobile-care') {
        setDailyCustomers(20);
        setAvgTicketSize(1800);
      } else {
        setDailyCustomers(120);
        setAvgTicketSize(250);
      }
    }
  };

  // Calculations
  const simulatedMonthlyRevenue = dailyCustomers * avgTicketSize * 30;
  const simulatedOperatingExpenses = simulatedMonthlyRevenue * (operatingExpenseRatio / 100);

  // Royalty calculation
  let simulatedRoyalty = 0;
  if (activeFranchise?.royalty_type === 'Fixed Royalty') {
    simulatedRoyalty = activeFranchise.royalty_value;
  } else if (activeFranchise?.royalty_type === 'Percentage Royalty') {
    simulatedRoyalty = (simulatedMonthlyRevenue * activeFranchise.royalty_value) / 100;
  } else if (activeFranchise?.royalty_type === 'Revenue Sharing') {
    simulatedRoyalty = (simulatedMonthlyRevenue * activeFranchise.royalty_value) / 100;
  } else {
    // Profit sharing
    const grossProfit = Math.max(0, simulatedMonthlyRevenue - simulatedOperatingExpenses);
    simulatedRoyalty = (grossProfit * (activeFranchise?.royalty_value || 30)) / 100;
  }

  const marketingFund = (simulatedMonthlyRevenue * (activeFranchise?.marketing_fee || 2)) / 100;
  const techFee = (simulatedMonthlyRevenue * (activeFranchise?.tech_fee || 1)) / 100;

  const totalDeductions = simulatedOperatingExpenses + simulatedRoyalty + marketingFund + techFee;
  const simulatedMonthlyNetProfit = Math.max(0, simulatedMonthlyRevenue - totalDeductions);
  const simulatedAnnualNetProfit = simulatedMonthlyNetProfit * 12;
  const simulatedRoi = capitalInvested > 0 ? (simulatedAnnualNetProfit / capitalInvested) * 100 : 0;
  const simulatedPaybackMonths = simulatedMonthlyNetProfit > 0 ? Math.ceil(capitalInvested / simulatedMonthlyNetProfit) : 99;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Dynamic Investment & ROI Sensitivity Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Stress-test footfall, ticket size, operational expense margins, and royalty structures to model monthly cash flows and capital payback horizon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: SIMULATION SLIDERS (5 COLS) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Scenario Control Parameters
            </h2>
            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
              Real-time
            </span>
          </div>

          {/* Franchise Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Franchise Model
            </label>
            <select
              value={selectedFranchiseId}
              onChange={(e) => handleFranchiseChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-indigo-600"
            >
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.business_type})
                </option>
              ))}
            </select>
          </div>

          {/* Capital Outlay Slider */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Capital Outlay (CapEx + Buffer)</span>
              <span className="font-bold text-indigo-600">₹{(capitalInvested / 100000).toFixed(1)}L</span>
            </div>
            <input
              type="range"
              min="1000000"
              max="10000000"
              step="200000"
              value={capitalInvested}
              onChange={(e) => setCapitalInvested(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Daily Customers Slider */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Daily Customers / Order Footfall</span>
              <span className="font-bold text-indigo-600">{dailyCustomers} orders/day</span>
            </div>
            <input
              type="range"
              min="10"
              max="400"
              step="5"
              value={dailyCustomers}
              onChange={(e) => setDailyCustomers(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Average Ticket Size Slider */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Average Ticket / Order Value (INR)</span>
              <span className="font-bold text-indigo-600">₹{avgTicketSize}</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={avgTicketSize}
              onChange={(e) => setAvgTicketSize(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* OpEx Ratio Slider */}
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Operating Expense Ratio (COGS + Staff)</span>
              <span className="font-bold text-amber-600">{operatingExpenseRatio}% of Revenue</span>
            </div>
            <input
              type="range"
              min="30"
              max="80"
              step="2"
              value={operatingExpenseRatio}
              onChange={(e) => setOperatingExpenseRatio(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
            Royalty Formula: <strong className="text-slate-700">{activeFranchise?.royalty_type} ({activeFranchise?.royalty_value}%)</strong> + Marketing ({activeFranchise?.marketing_fee}%) + Tech ({activeFranchise?.tech_fee}%).
          </div>
        </div>

        {/* RIGHT PANEL: SIMULATED RESULTS (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Key Simulated Output Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Revenue</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                ₹{(simulatedMonthlyRevenue / 100000).toFixed(2)}L
              </div>
              <span className="text-[10px] text-slate-500">Gross Sales</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Monthly Profit</span>
              <div className="text-xl font-extrabold text-emerald-600 mt-1">
                ₹{(simulatedMonthlyNetProfit / 100000).toFixed(2)}L
              </div>
              <span className="text-[10px] text-slate-500">Post All Royalties</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulated ROI</span>
              <div className="text-xl font-extrabold text-indigo-600 mt-1">
                {simulatedRoi.toFixed(1)}% p.a.
              </div>
              <span className="text-[10px] text-slate-500">Pre-tax Yield</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payback Recovery</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {simulatedPaybackMonths} Mo
              </div>
              <span className="text-[10px] text-slate-500">Capital Return</span>
            </div>
          </div>

          {/* Cashflow Breakdown Bar */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Revenue Allocation Stack
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>1. Operating Expenses (Raw Materials, Rent, Staff):</span>
                <span className="font-semibold text-slate-900">₹{simulatedOperatingExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>2. Franchiser Royalty ({activeFranchise?.royalty_type}):</span>
                <span className="font-semibold text-slate-900">₹{simulatedRoyalty.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>3. Marketing & Technology Funds:</span>
                <span className="font-semibold text-slate-900">₹{(marketingFund + techFee).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 pt-2 border-t border-slate-100">
                <span>4. Retained Net Profit (Investor Take-Home):</span>
                <span>₹{simulatedMonthlyNetProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* SENSITIVITY SCENARIOS TABLE */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sensitivity Stress-Test Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Scenario</th>
                    <th className="p-2.5">Revenue / Mo</th>
                    <th className="p-2.5">Net Profit / Mo</th>
                    <th className="p-2.5">ROI (% p.a.)</th>
                    <th className="p-2.5">Payback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-rose-600">Pessimistic (-20% Footfall)</td>
                    <td className="p-2.5">₹{((simulatedMonthlyRevenue * 0.8) / 100000).toFixed(2)}L</td>
                    <td className="p-2.5 font-semibold text-slate-800">₹{((simulatedMonthlyNetProfit * 0.7) / 100000).toFixed(2)}L</td>
                    <td className="p-2.5 text-slate-700">{(simulatedRoi * 0.7).toFixed(1)}%</td>
                    <td className="p-2.5 text-slate-700">{Math.ceil(simulatedPaybackMonths * 1.35)} mo</td>
                  </tr>
                  <tr className="bg-indigo-50/40 font-semibold">
                    <td className="p-2.5 font-bold text-indigo-700">Baseline (Your Inputs)</td>
                    <td className="p-2.5">₹{(simulatedMonthlyRevenue / 100000).toFixed(2)}L</td>
                    <td className="p-2.5 text-emerald-700">₹{(simulatedMonthlyNetProfit / 100000).toFixed(2)}L</td>
                    <td className="p-2.5 text-indigo-700">{simulatedRoi.toFixed(1)}%</td>
                    <td className="p-2.5 text-slate-900">{simulatedPaybackMonths} mo</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-emerald-600">Optimistic (+25% Footfall)</td>
                    <td className="p-2.5">₹{((simulatedMonthlyRevenue * 1.25) / 100000).toFixed(2)}L</td>
                    <td className="p-2.5 font-semibold text-emerald-700">₹{((simulatedMonthlyNetProfit * 1.35) / 100000).toFixed(2)}L</td>
                    <td className="p-2.5 text-emerald-600">{(simulatedRoi * 1.35).toFixed(1)}%</td>
                    <td className="p-2.5 text-slate-700">{Math.ceil(simulatedPaybackMonths * 0.75)} mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
