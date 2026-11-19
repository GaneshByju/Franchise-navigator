import React, { useState } from 'react';
import { FranchiseListing } from '../../types';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Trophy,
  Trash2,
  Plus,
  GitCompare,
  Search,
  Building2,
  Filter,
  DollarSign,
  Clock,
  TrendingUp,
  ShieldCheck,
  Zap,
  MapPin,
  Eye,
  Send
} from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  compareList?: FranchiseListing[];
  franchises?: FranchiseListing[]; // Alias for compareList passed by App.tsx
  allFranchises?: FranchiseListing[];
  onClose: () => void;
  onRemove: (franchiseId: number) => void;
  onAddCompare?: (franchise: FranchiseListing) => void;
  onSelectFranchise?: (franchise: FranchiseListing) => void;
  onApply?: (franchise: FranchiseListing) => void;
  onRunFeasibility: (franchise: FranchiseListing) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  compareList: propCompareList,
  franchises: propFranchises,
  allFranchises = [],
  onClose,
  onRemove,
  onAddCompare,
  onSelectFranchise,
  onApply,
  onRunFeasibility,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle both prop aliases cleanly
  const activeCompareList = propCompareList || propFranchises || [];

  // Compute best indicators if we have list
  const highestRoiId = activeCompareList.reduce((prev, curr) => (curr.est_roi > prev.est_roi ? curr : prev), activeCompareList[0])?.id;
  const lowestCapId = activeCompareList.reduce((prev, curr) => (curr.total_investment_est < prev.total_investment_est ? curr : prev), activeCompareList[0])?.id;
  const fastestPaybackId = activeCompareList.reduce((prev, curr) => (curr.payback_months < prev.payback_months ? curr : prev), activeCompareList[0])?.id;

  const highestRoiBrand = activeCompareList.find((f) => f.id === highestRoiId);
  const lowestCapBrand = activeCompareList.find((f) => f.id === lowestCapId);
  const fastestPaybackBrand = activeCompareList.find((f) => f.id === fastestPaybackId);

  // Unselected franchises available to add
  const unselectedFranchises = allFranchises.filter(
    (f) => !activeCompareList.some((item) => item.id === f.id)
  );

  const filteredUnselectedFranchises = unselectedFranchises.filter((f) => {
    const queryMatch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.business_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category_slug && f.category_slug.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const catMatch = selectedCategory === 'all' || f.category_slug === selectedCategory;
    return queryMatch && catMatch;
  });

  const handleAddBrand = (f: FranchiseListing) => {
    if (onAddCompare) {
      onAddCompare(f);
    }
  };

  const handleSelectClick = (f: FranchiseListing) => {
    if (onSelectFranchise) onSelectFranchise(f);
    else if (onApply) onApply(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-[96vw] max-w-6xl h-[88vh] max-h-[840px] border border-slate-700/80 overflow-hidden relative my-auto flex flex-col text-slate-900">
        
        {/* TOP COMPACT HERO HEADER */}
        <div className="py-3 px-5 bg-gradient-to-r from-slate-950 via-[#0B132B] to-indigo-950 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <GitCompare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Institutional Brand Comparison Matrix
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-[11px] font-black uppercase">
                  {activeCompareList.length} of 4 Selected
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Side-by-side financial, CapEx outlay, royalty split, ROI, and statutory clearance analysis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE BRANDS & QUICK ADD TOOLBAR */}
        <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-white text-xs">
          
          {/* Active Brand Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 tracking-wider">
              Comparing:
            </span>
            {activeCompareList.length > 0 ? (
              activeCompareList.map((f) => (
                <div
                  key={f.id}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 text-white shrink-0 shadow-xs"
                >
                  <span className="truncate max-w-[130px]">{f.name}</span>
                  <button
                    onClick={() => onRemove(f.id)}
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                    title="Remove brand from compare matrix"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">No brands added to compare list yet</span>
            )}
          </div>

          {/* "+ Add Brand to Compare" CTA Drawer Button */}
          {activeCompareList.length < 4 && (
            <button
              onClick={() => setIsAddDrawerOpen(!isAddDrawerOpen)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Brand ({unselectedFranchises.length} Available)</span>
            </button>
          )}

        </div>

        {/* SEARCH & PICK DRAWER POPUP */}
        {isAddDrawerOpen && (
          <div className="bg-slate-950 border-b border-slate-800 p-4 animate-fade-in text-white shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-1 w-full relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search franchise by brand name or category..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-400 focus:outline-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-amber-500"
                >
                  <option value="all">All Sectors</option>
                  <option value="food-beverage">Food &amp; Beverage</option>
                  <option value="healthcare-pharmacy">Healthcare &amp; Labs</option>
                  <option value="education-training">Education</option>
                  <option value="fitness-wellness">Fitness &amp; Salon</option>
                  <option value="retail-fashion">Retail &amp; Fashion</option>
                  <option value="logistics-courier">Logistics &amp; Courier</option>
                </select>

                <button
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close Drawer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto p-1 scrollbar-thin">
              {filteredUnselectedFranchises.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    handleAddBrand(f);
                    setIsAddDrawerOpen(false);
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-indigo-950/80 border border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={f.image_url || (f.images && f.images[0])}
                      alt={f.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="font-extrabold text-white text-xs group-hover:text-amber-400 transition">{f.name}</div>
                      <div className="text-[10px] text-slate-400">₹{(f.total_investment_est / 100000).toFixed(1)}L • ROI: {f.est_roi}%</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg group-hover:scale-105 transition">
                    + Add
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WINNER SHOWCASE HIGHLIGHT BANNER (Visible when 2+ brands compared) */}
        {activeCompareList.length >= 2 && (
          <div className="p-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 text-xs">
            {highestRoiBrand && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">Highest Annual ROI</span>
                  <div className="font-extrabold text-slate-900 text-xs">{highestRoiBrand.name}</div>
                  <div className="text-[11px] font-black text-emerald-700">{highestRoiBrand.est_roi}% p.a. Return</div>
                </div>
              </div>
            )}

            {lowestCapBrand && (
              <div className="p-2.5 bg-sky-50 border border-sky-200/80 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
                  💰
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider block">Lowest Capital Outlay</span>
                  <div className="font-extrabold text-slate-900 text-xs">{lowestCapBrand.name}</div>
                  <div className="text-[11px] font-black text-sky-700">₹{(lowestCapBrand.total_investment_est / 100000).toFixed(2)} Lakhs</div>
                </div>
              </div>
            )}

            {fastestPaybackBrand && (
              <div className="p-2.5 bg-purple-50 border border-purple-200/80 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">Fastest Payback</span>
                  <div className="font-extrabold text-slate-900 text-xs">{fastestPaybackBrand.name}</div>
                  <div className="text-[11px] font-black text-purple-700">{fastestPaybackBrand.payback_months} Months Recovery</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPARISON BODY CANVAS */}
        <div className="p-5 overflow-x-auto overflow-y-auto flex-1 text-xs">
          {activeCompareList.length === 0 ? (
            <div className="space-y-6">
              <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-300">
                <GitCompare className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="font-black text-slate-900 text-lg">
                  No Franchises Selected for Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-medium">
                  Select franchises from the recommended opportunities below or click <strong className="text-slate-900">"+ Add Brand"</strong> above to populate side-by-side financial metrics.
                </p>
              </div>

              {/* Recommended Popular Franchises Grid */}
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                  Recommended Opportunities to Compare
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {allFranchises.slice(0, 6).map((f) => (
                    <div key={f.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={f.image_url || f.images?.[0]} alt={f.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{f.name}</div>
                          <div className="text-[10px] text-slate-500">₹{(f.total_investment_est / 100000).toFixed(1)}L • ROI {f.est_roi}%</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddBrand(f)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-[11px] rounded-lg transition"
                      >
                        + Compare
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Franchise Cards Top Headers */}
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3.5 w-52 text-slate-400 font-black uppercase tracking-wider text-[11px] bg-slate-50/90 rounded-tl-2xl">
                    Financial &amp; Risk Metrics
                  </th>
                  {activeCompareList.map((f) => (
                    <th key={f.id} className="p-3.5 min-w-[210px] align-top bg-white border-r border-slate-100">
                      <div className="relative mb-3 h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm group">
                        {f.image_url || (f.images && f.images[0]) ? (
                          <img src={f.image_url || f.images![0]} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">No Photo</div>
                        )}
                        <button
                          onClick={() => onRemove(f.id)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-rose-600 text-white rounded-xl transition shadow-md"
                          title="Remove brand from compare matrix"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="font-black text-slate-900 text-base line-clamp-1">{f.name}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{f.business_type}</div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black">
                          ✓ VERIFIED
                        </span>
                        <span className="text-xs text-slate-600 font-semibold">
                          {f.available_units || 5} units left
                        </span>
                      </div>
                    </th>
                  ))}

                  {/* Add Brand Slot if under 4 items */}
                  {activeCompareList.length < 4 && (
                    <th className="p-3.5 min-w-[180px] align-top bg-slate-50/60 border border-dashed border-slate-300 rounded-tr-2xl text-center">
                      <div className="p-4 space-y-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 font-black flex items-center justify-center mx-auto shadow-2xs">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="font-black text-slate-800 text-xs">+ Add Brand</div>
                        <button
                          onClick={() => setIsAddDrawerOpen(true)}
                          className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-sm"
                        >
                          Browse List
                        </button>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Section 1: Capital Outlay */}
                <tr className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                  <td colSpan={activeCompareList.length + (activeCompareList.length < 4 ? 2 : 1)} className="p-3 px-4">
                    📊 1. Capital Expenditure &amp; Investment Outlay
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Total Est. Investment</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-base text-slate-900">
                          ₹{(f.total_investment_est / 100000).toFixed(2)} Lakhs
                        </span>
                        {f.id === lowestCapId && (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded-md text-[10px] font-black border border-sky-300">
                            Lowest CapEx
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">+18.0% GST Input Claimable</span>
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Franchise Brand License Fee</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5 text-slate-900 font-extrabold">
                      ₹{(f.franchise_fee || 350000).toLocaleString('en-IN')}
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Store Architecture &amp; Equip</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5 text-slate-900 font-extrabold">
                      ₹{((f.equipment_cost || 450000) + (f.setup_cost || 300000)).toLocaleString('en-IN')}
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                {/* Section 2: Royalties & Operational Split */}
                <tr className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                  <td colSpan={activeCompareList.length + (activeCompareList.length < 4 ? 2 : 1)} className="p-3 px-4">
                    💸 2. Royalties &amp; Revenue Sharing
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Royalty Structure</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5 text-slate-900 font-black">
                      {f.royalty_type}
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Monthly Royalty Charge</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5 font-black text-indigo-600 text-sm">
                      {f.royalty_type === 'Fixed Royalty' ? `₹${(f.royalty_value || 15000).toLocaleString('en-IN')}/mo` : `${f.royalty_value}% of Gross Turnover`}
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                {/* Section 3: Projected Returns & Payback */}
                <tr className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                  <td colSpan={activeCompareList.length + (activeCompareList.length < 4 ? 2 : 1)} className="p-3 px-4">
                    📈 3. Returns, Profitability &amp; Payback
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Projected Annual ROI</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-base text-emerald-600">
                          {f.est_roi}% p.a.
                        </span>
                        {f.id === highestRoiId && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-black border border-emerald-300">
                            Highest ROI
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Est. Monthly Profit</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5 font-black text-slate-900 text-sm">
                      ₹{(f.est_monthly_profit ? f.est_monthly_profit / 100000 : (f.total_investment_est * (f.est_roi / 100) / 12) / 100000).toFixed(2)} Lakhs
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Capital Recovery Payback</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm">
                          {f.payback_months} Months
                        </span>
                        {f.id === fastestPaybackId && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-md text-[10px] font-black border border-purple-300">
                            Fastest
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>

                {/* Section 4: Decision Actions */}
                <tr className="bg-slate-100 border-t-2 border-slate-200">
                  <td className="p-3.5 font-black text-slate-900 bg-slate-100">Interactive Actions</td>
                  {activeCompareList.map((f) => (
                    <td key={f.id} className="p-3.5 space-y-2">
                      <button
                        onClick={() => {
                          onClose();
                          handleSelectClick(f);
                        }}
                        className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-center transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Inspect Full Dossier</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onRunFeasibility(f);
                        }}
                        className="w-full py-2.5 px-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-900 font-black rounded-xl text-center transition flex items-center justify-center gap-1.5 border border-sky-400/40"
                      >
                        <Calculator className="w-4 h-4 text-sky-600" />
                        <span>Run Feasibility (DSS)</span>
                      </button>
                    </td>
                  ))}
                  {activeCompareList.length < 4 && <td className="p-3.5 bg-slate-50/20"></td>}
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="py-3 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-medium">
            Comparative financial models derived from audited brand disclosures (FDD 2026).
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition shadow-md"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
