import React, { useState, useMemo } from 'react';
import { FranchiseListing, Category, User } from '../../types';
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  TrendingUp,
  Clock,
  MapPin,
  GitCompare,
  ArrowRight,
  Filter,
  RefreshCw,
  X,
  Star,
  Calculator,
  Eye,
  AlertCircle
} from 'lucide-react';

interface PublicDiscoverProps {
  franchises: FranchiseListing[];
  categories: Category[];
  currentUser: User | null;
  onSelectFranchise: (franchise: FranchiseListing) => void;
  onRunFeasibility: (franchise: FranchiseListing) => void;
  onApply?: (franchise: FranchiseListing) => void;
  compareList: FranchiseListing[];
  onToggleCompare: (franchise: FranchiseListing) => void;
  onOpenCompareModal: () => void;
  initialFilters?: { q?: string; category?: string; max_budget?: number; location?: string };
}

export const PublicDiscover: React.FC<PublicDiscoverProps> = ({
  franchises,
  categories,
  currentUser,
  onSelectFranchise,
  onRunFeasibility,
  compareList,
  onToggleCompare,
  onOpenCompareModal,
  initialFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.q || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || 'all');
  const [maxBudget, setMaxBudget] = useState<number>(initialFilters?.max_budget || 10000000);
  const [minRoi, setMinRoi] = useState<number>(0);
  const [royaltyType, setRoyaltyType] = useState('all');
  const [locationFilter, setLocationFilter] = useState(initialFilters?.location || '');
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'roi' | 'investment_asc' | 'investment_desc' | 'rating'>('featured');

  const filteredFranchises = useMemo(() => {
    return franchises.filter((f) => {
      // Admin verification gate: Only show listings that have been verified and approved by Admin
      const isApprovedStatus = f.status === 'Active' || f.status === 'Available' || f.status === 'Verified';
      if (!isApprovedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.company_name?.toLowerCase().includes(q) ||
          f.business_type.toLowerCase().includes(q) ||
          f.headquarters.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedCategory !== 'all' && f.category_slug !== selectedCategory) {
        return false;
      }

      if (f.total_investment_est > maxBudget) {
        return false;
      }

      if (f.est_roi < minRoi) {
        return false;
      }

      if (royaltyType !== 'all' && f.royalty_type !== royaltyType) {
        return false;
      }

      if (locationFilter.trim()) {
        const loc = locationFilter.toLowerCase();
        if (!f.headquarters.toLowerCase().includes(loc)) return false;
      }

      if (beginnerFriendlyOnly && !f.is_beginner_friendly) {
        return false;
      }

      if (availableOnly && f.available_units <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'roi') return b.est_roi - a.est_roi;
      if (sortBy === 'investment_asc') return a.total_investment_est - b.total_investment_est;
      if (sortBy === 'investment_desc') return b.total_investment_est - a.total_investment_est;
      if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
      return b.is_featured - a.is_featured;
    });
  }, [
    franchises,
    searchQuery,
    selectedCategory,
    maxBudget,
    minRoi,
    royaltyType,
    locationFilter,
    beginnerFriendlyOnly,
    availableOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxBudget(10000000);
    setMinRoi(0);
    setRoyaltyType('all');
    setLocationFilter('');
    setBeginnerFriendlyOnly(false);
    setAvailableOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans pt-6 pb-28 selection:bg-sky-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
              INSTITUTIONAL MARKETPLACE
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
              Discover Audited Franchises
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse verified brand disclosures, ROI metrics, payback periods, and territory availability.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <label className="text-xs font-bold text-slate-500">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 shadow-2xs"
            >
              <option value="featured">Featured Opportunities</option>
              <option value="roi">Highest ROI (% p.a.)</option>
              <option value="investment_asc">Capital (Low to High)</option>
              <option value="investment_desc">Capital (High to Low)</option>
              <option value="rating">Investor Rating</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTERS SIDEBAR */}
          <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Smart Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brand, category..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Vertical */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Business Vertical</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="all">All Verticals</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Capital */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Max Capital</span>
                <span className="text-blue-600">₹{(maxBudget / 100000).toFixed(0)} Lakhs</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="10000000"
                step="500000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹10L</span>
                <span>₹50L</span>
                <span>₹1 Cr+</span>
              </div>
            </div>

            {/* Min Target ROI */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Min Target ROI</span>
                <span className="text-emerald-600">{minRoi}% p.a.</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="5"
                value={minRoi}
                onChange={(e) => setMinRoi(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Royalty Model */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Royalty Structure</label>
              <select
                value={royaltyType}
                onChange={(e) => setRoyaltyType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="all">Any Royalty Structure</option>
                <option value="Fixed Royalty">Fixed Monthly Royalty</option>
                <option value="Percentage Royalty">Percentage Royalty (% Gross)</option>
                <option value="Revenue Sharing">Revenue Sharing Model</option>
                <option value="Profit Sharing">Profit Sharing Model</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Headquarters / City</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="e.g. Bangalore, Mumbai"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 space-y-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={beginnerFriendlyOnly}
                  onChange={(e) => setBeginnerFriendlyOnly(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <span>Beginner Friendly (FOCO/Managed)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <span>Available Units Only</span>
              </label>
            </div>
          </div>

          {/* RESULTS GRID */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Showing <strong className="text-slate-900 font-bold">{filteredFranchises.length}</strong> verified opportunities matching criteria.</span>
            </div>

            {filteredFranchises.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">No Franchises Match Filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your capital slider or resetting filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFranchises.map((f) => {
                  const isCompared = compareList.some((c) => c.id === f.id);
                  const isSoldOut = f.status === 'Sold Out' || f.available_units <= 0;

                  return (
                    <div
                      key={f.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group text-xs"
                    >
                      {/* Banner Photo */}
                      <div
                        onClick={() => onSelectFranchise(f)}
                        className="relative h-36 w-full bg-slate-100 overflow-hidden cursor-pointer"
                      >
                        {f.image_url || (f.images && f.images[0]) ? (
                          <img
                            src={f.image_url || f.images![0]}
                            alt={f.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No Reference Media
                          </div>
                        )}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-full border border-emerald-200 shadow-2xs">
                            ✓ VERIFIED
                          </span>
                          {isSoldOut && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-black rounded-full border border-rose-200 shadow-2xs">
                              SOLD OUT
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-white text-[10px] font-bold">
                          <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md rounded capitalize">
                            {f.category_slug.replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3
                                onClick={() => onSelectFranchise(f)}
                                className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition cursor-pointer line-clamp-1"
                              >
                                {f.name}
                              </h3>
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <span>{f.business_type}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-slate-500">
                                  <MapPin className="w-3 h-3 text-blue-600" />
                                  {f.headquarters.split(',')[0]}
                                </span>
                              </p>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-snug">
                            {f.description}
                          </p>

                          {/* Metrics Grid */}
                          <div className="my-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-3 gap-1 text-center text-[11px]">
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 block uppercase">Capital</span>
                              <span className="font-extrabold text-slate-900">
                                ₹{(f.total_investment_est / 100000).toFixed(1)}L
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 block uppercase">Est. ROI</span>
                              <span className="font-extrabold text-emerald-600">
                                {f.est_roi}% p.a.
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 block uppercase">Payback</span>
                              <span className="font-extrabold text-slate-900">
                                {f.payback_months} Mo
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-1 flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectFranchise(f)}
                            className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => onRunFeasibility(f)}
                            title="Run Feasibility DSS Score"
                            className="p-2 border border-slate-200 hover:border-blue-600 text-blue-600 hover:bg-blue-50 bg-white rounded-xl transition"
                          >
                            <Calculator className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onToggleCompare(f)}
                            title={isCompared ? 'Remove from Compare' : 'Add to Compare Matrix'}
                            className={`p-2 rounded-xl border transition ${
                              isCompared
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600'
                            }`}
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-xl flex items-center gap-4 animate-fade-scale max-w-xl w-[92%] font-sans">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
            <GitCompare className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-bold shrink-0">Compare ({compareList.length}/4):</span>
            <div className="flex items-center gap-1.5">
              {compareList.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-medium flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="max-w-[80px] truncate">{c.name}</span>
                  <X
                    className="w-3 h-3 hover:text-rose-400 cursor-pointer"
                    onClick={() => onToggleCompare(c)}
                  />
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenCompareModal}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shrink-0 flex items-center gap-1 shadow-md"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
