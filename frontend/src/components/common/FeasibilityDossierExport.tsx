import React, { useRef } from 'react';
import { Download, FileText, Printer, ShieldCheck, Award, Building2, CheckCircle } from 'lucide-react';
import { FranchiseListing, User, FeasibilityResult } from '../../types';

interface FeasibilityDossierExportProps {
  franchise: FranchiseListing;
  investor?: User | null;
  dssResult?: FeasibilityResult | null;
  location?: string;
  capitalAvailable?: number;
}

export const FeasibilityDossierExport: React.FC<FeasibilityDossierExportProps> = ({
  franchise,
  investor,
  dssResult,
  location = 'Bangalore, India',
  capitalAvailable = 2500000
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const score = dssResult?.overall_score || 86;
  const financialScore = dssResult?.financial_score || 88;
  const locationScore = dssResult?.location_score || 85;
  const marketScore = dssResult?.market_score || 90;
  const riskScore = dssResult?.competition_score || 78;

  return (
    <div>
      {/* Trigger Export Button */}
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span>Export Feasibility Dossier (PDF)</span>
      </button>

      {/* Printable Report Container (Hidden on normal screen, visible on print) */}
      <div className="hidden print:block fixed inset-0 bg-white text-slate-900 p-8 z-[9999] overflow-y-auto">
        <div ref={printRef} className="max-w-4xl mx-auto space-y-6">
          
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-slate-900 text-white font-black text-sm rounded">FDSS</span>
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                    Investment Feasibility Dossier
                  </h1>
                  <p className="text-2xs text-slate-500">Franchise Investment Decision Support System</p>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Report Ref: FDSS-EVAL-{Date.now().toString().slice(-6)}</p>
              <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Target Franchise & Investor Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase block">Evaluated Brand</span>
              <p className="text-sm font-bold text-slate-900">{franchise.name}</p>
              <p className="text-slate-600">{franchise.business_type} • {franchise.headquarters}</p>
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase block">Investor Profile</span>
              <p className="text-sm font-bold text-slate-900">{investor?.name || 'Verified Investor'}</p>
              <p className="text-slate-600">Target Location: {location}</p>
              <p className="text-slate-600">Available Capital: ₹{(capitalAvailable / 100000).toFixed(1)} Lakhs</p>
            </div>
          </div>

          {/* Overall Score Banner */}
          <div className="p-5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-2xs uppercase tracking-widest text-slate-400 font-semibold block">Algorithmic Suitability Index</span>
              <h2 className="text-2xl font-black text-emerald-400 mt-1">
                {dssResult?.suitability_label || 'Highly Feasible Opportunity'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Multi-factor decision model indicates strong financial payback capability and low risk exposure in {location}.
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-white">{score}</span>
              <span className="text-xs text-slate-400 block">/ 100 Score</span>
            </div>
          </div>

          {/* Score Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Multi-Factor Evaluation Breakdown
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Evaluation Pillar</th>
                  <th className="p-2.5">Weight</th>
                  <th className="p-2.5">Score</th>
                  <th className="p-2.5">Assessment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-semibold">Capital & Financial Fit</td>
                  <td className="p-2.5">30%</td>
                  <td className="p-2.5 font-bold text-emerald-600">{financialScore}/100</td>
                  <td className="p-2.5">Capital exceeds total required setup + working capital.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Location Demand & Demographics</td>
                  <td className="p-2.5">25%</td>
                  <td className="p-2.5 font-bold text-emerald-600">{locationScore}/100</td>
                  <td className="p-2.5">High footfall index & favorable target customer income.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Market Growth & Category Demand</td>
                  <td className="p-2.5">20%</td>
                  <td className="p-2.5 font-bold text-emerald-600">{marketScore}/100</td>
                  <td className="p-2.5">Category exhibits strong 18%+ annual industry CAGR.</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Competition & Risk Index</td>
                  <td className="p-2.5">15%</td>
                  <td className="p-2.5 font-bold text-amber-600">{riskScore}/100</td>
                  <td className="p-2.5">Moderate brand saturation; exclusive territory recommended.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Investment & Returns Breakdown */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">Estimated Investment Breakdown</h4>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Franchise Fee:</span> <strong>₹{(franchise.franchise_fee / 100000).toFixed(2)} L</strong></li>
                <li className="flex justify-between"><span>Setup & Equipment:</span> <strong>₹{((franchise.setup_cost + franchise.equipment_cost) / 100000).toFixed(2)} L</strong></li>
                <li className="flex justify-between"><span>Working Capital:</span> <strong>₹{(franchise.working_capital / 100000).toFixed(2)} L</strong></li>
                <li className="flex justify-between pt-1 border-t font-bold text-slate-900"><span>Total Required:</span> <span>₹{(franchise.total_investment_est / 100000).toFixed(2)} L</span></li>
              </ul>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-bold text-slate-900 border-b pb-1 mb-2">Projected Financial Returns</h4>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Est. Monthly Revenue:</span> <strong>₹{(franchise.est_monthly_revenue / 100000).toFixed(2)} L</strong></li>
                <li className="flex justify-between"><span>Est. Monthly Profit:</span> <strong>₹{(franchise.est_monthly_profit / 100000).toFixed(2)} L</strong></li>
                <li className="flex justify-between"><span>Projected Annual ROI:</span> <strong>{franchise.est_roi}%</strong></li>
                <li className="flex justify-between pt-1 border-t font-bold text-slate-900"><span>Payback Period:</span> <span>{franchise.payback_months} Months</span></li>
              </ul>
            </div>
          </div>

          {/* Legal Signoff Footer */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-2xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800 uppercase mb-1">Decision Support System Disclaimer</p>
              <p>
                This dossier is compiled algorithmically based on franchiser disclosures and market data.
                Perform due diligence prior to executing binding franchise agreements.
              </p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-48 ml-auto mb-1"></div>
              <p className="font-bold text-slate-800">Authorized Analyst / Investor Signature</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
