import React, { useState } from 'react';
import { FranchiseListing, Category } from '../../types';
import {
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Building2,
  CheckCircle2,
  ChevronRight,
  Calculator,
  GitCompare,
  Star,
  MapPin,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Briefcase,
  Store,
  PieChart,
  Target,
  FileCheck2,
  Compass,
  Lock,
  ArrowUpRight,
  Eye,
  Utensils,
  Activity,
  GraduationCap,
  Dumbbell,
  ShoppingBag,
  Wrench,
  Truck,
  Laptop,
  Home,
  SlidersHorizontal,
  BarChart3,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  stats: {
    totalActiveFranchises: number;
    verifiedFranchisers: number;
    registeredInvestors: number;
    successfulPartnerships: number;
    totalInvestmentVolume: number;
  };
  featuredFranchises: FranchiseListing[];
  categories: Category[];
  onSearch: (params: { q?: string; category?: string; max_budget?: number; location?: string }) => void;
  onSelectFranchise: (franchise: FranchiseListing) => void;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'investor' | 'franchiser' | 'admin') => void;
  compareList?: FranchiseListing[];
  onToggleCompare?: (franchise: FranchiseListing) => void;
  onOpenCompare?: () => void;
  onOpenFeasibility?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stats,
  featuredFranchises = [],
  categories = [],
  onSearch,
  onSelectFranchise,
  onNavigate,
  onOpenAuth,
  compareList = [],
  onToggleCompare,
  onOpenCompare,
  onOpenFeasibility,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [minInvestment, setMinInvestment] = useState('');



  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      q: searchTerm || undefined,
      category: selectedCat !== 'all' ? selectedCat : undefined,
      max_budget: minInvestment ? Number(minInvestment) : undefined,
    });
    onNavigate('discover');
  };

  const getCategoryConfig = (slug: string) => {
    switch (slug) {
      case 'food-beverage':
        return {
          icon: Utensils,
          color: 'text-amber-600',
          bg: 'bg-amber-50 group-hover:bg-amber-100/80',
          border: 'border-amber-200/80',
          badge: 'bg-amber-50 text-amber-700 border border-amber-200/60',
          desc: 'QSR, cafes, fine dining & cloud kitchens',
        };
      case 'healthcare-pharmacy':
      case 'healthcare':
        return {
          icon: Activity,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 group-hover:bg-emerald-100/80',
          border: 'border-emerald-200/80',
          badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
          desc: 'Pharmacies, diagnostic labs & wellness',
        };
      case 'education-training':
      case 'education':
        return {
          icon: GraduationCap,
          color: 'text-violet-600',
          bg: 'bg-violet-50 group-hover:bg-violet-100/80',
          border: 'border-violet-200/80',
          badge: 'bg-violet-50 text-violet-700 border border-violet-200/60',
          desc: 'STEM academies, preschools & institutes',
        };
      case 'fitness-wellness':
      case 'fitness':
        return {
          icon: Dumbbell,
          color: 'text-rose-600',
          bg: 'bg-rose-50 group-hover:bg-rose-100/80',
          border: 'border-rose-200/80',
          badge: 'bg-rose-50 text-rose-700 border border-rose-200/60',
          desc: 'Smart 24/7 gyms & training studios',
        };
      case 'retail-fashion':
      case 'retail':
        return {
          icon: ShoppingBag,
          color: 'text-blue-600',
          bg: 'bg-blue-50 group-hover:bg-blue-100/80',
          border: 'border-blue-200/80',
          badge: 'bg-blue-50 text-blue-700 border border-blue-200/60',
          desc: 'Apparel, electronics & convenience retail',
        };
      case 'automobile-care':
        return {
          icon: Wrench,
          color: 'text-orange-600',
          bg: 'bg-orange-50 group-hover:bg-orange-100/80',
          border: 'border-orange-200/80',
          badge: 'bg-orange-50 text-orange-700 border border-orange-200/60',
          desc: 'EV care, precision detailing & workshops',
        };
      case 'logistics-courier':
      case 'logistics':
        return {
          icon: Truck,
          color: 'text-sky-600',
          bg: 'bg-sky-50 group-hover:bg-sky-100/80',
          border: 'border-sky-200/80',
          badge: 'bg-sky-50 text-sky-700 border border-sky-200/60',
          desc: 'Hyperlocal dark stores & parcel logistics',
        };
      case 'technology-it':
        return {
          icon: Laptop,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50 group-hover:bg-indigo-100/80',
          border: 'border-indigo-200/80',
          badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
          desc: 'IT hardware, training centers & tech kiosks',
        };
      case 'home-services':
        return {
          icon: Home,
          color: 'text-teal-600',
          bg: 'bg-teal-50 group-hover:bg-teal-100/80',
          border: 'border-teal-200/80',
          badge: 'bg-teal-50 text-teal-700 border border-teal-200/60',
          desc: 'Facility maintenance & home care services',
        };
      default:
        return {
          icon: Store,
          color: 'text-slate-600',
          bg: 'bg-slate-50 group-hover:bg-slate-100/80',
          border: 'border-slate-200/80',
          badge: 'bg-slate-50 text-slate-700 border border-slate-200/60',
          desc: 'Commercial franchise business vertical',
        };
    }
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#fafaf9] text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-24">
      
      {/* 1. HERO BANNER - VIBRANT MODERN GRADIENT */}
      <section className="relative px-4 sm:px-6 pt-6 pb-10 max-w-7xl mx-auto font-sans">
        <div className="bg-gradient-to-br from-slate-950 via-[#0B132B] to-indigo-950 rounded-3xl p-6 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Glowing Pastel Orbs */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-wider text-[11px] font-black">Institutional Decision Support Engine</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Empowered Franchise Decisions with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                  Data &amp; Analytics
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium max-w-2xl">
                Evaluate capital outlays, simulate 3-year ROI forecasts, audit location footfall demand metrics, and inspect verified statutory compliance.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('discover')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4 text-white" />
                  <span>Explore Marketplace</span>
                </button>

                <button
                  onClick={() => (onOpenCompare ? onOpenCompare() : onNavigate('discover'))}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs rounded-xl transition flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4 text-blue-400" />
                  <span>Compare Brands</span>
                </button>
              </div>
            </div>

            {/* Right Search Box */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xl text-slate-900">
                <div className="flex items-center gap-2 font-black text-slate-900 text-xs pb-3 border-b border-slate-200">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>Search Verified Opportunities</span>
                </div>

                <form onSubmit={handleHeroSearch} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Brand Name / Keyword</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Max Fashion, Wow! Momo..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Business Sector</label>
                      <select
                        value={selectedCat}
                        onChange={(e) => setSelectedCat(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-blue-600 font-medium"
                      >
                        <option value="all">All Sectors ({categories.length})</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Capital</label>
                      <select
                        value={minInvestment}
                        onChange={(e) => setMinInvestment(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-blue-600 font-medium"
                      >
                        <option value="">Any Budget</option>
                        <option value="1500000">Up to ₹15 Lakhs</option>
                        <option value="2500000">Up to ₹25 Lakhs</option>
                        <option value="5000000">Up to ₹50 Lakhs</option>
                        <option value="10000000">Up to ₹1 Crore</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <Search className="w-3.5 h-3.5 text-white" />
                    <span>Search Marketplace</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-slate-200">
            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Listings</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{stats.totalActiveFranchises ?? featuredFranchises.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live Platform
              </span>
            </div>

            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Verified Franchisers</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{stats.verifiedFranchisers ?? 0}</span>
              <span className="text-[10px] text-blue-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-blue-600" /> Audited KYC
              </span>
            </div>

            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Registered Investors</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{stats.registeredInvestors ?? 0}</span>
              <span className="text-[10px] text-indigo-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-indigo-600" /> Verified Accounts
              </span>
            </div>

            <div className="px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Partnerships</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{stats.successfulPartnerships ?? 0}</span>
              <span className="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-3 h-3 text-amber-600" /> Signed Contracts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC SECTORS DIRECTORY */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Investment Verticals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Verified Business Sectors ({categories.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select an industry domain to compare benchmark ROI multiples, CapEx ranges, and operational requirements.
            </p>
          </div>
          <button
            onClick={() => onNavigate('discover')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-xs rounded-xl transition shrink-0 shadow-2xs flex items-center gap-1.5"
          >
            <span>Full Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {categories.map((cat) => {
            const config = getCategoryConfig(cat.slug);
            const Icon = config.icon;

            return (
              <div
                key={cat.id || cat.slug}
                onClick={() => {
                  onSearch({ category: cat.slug });
                  onNavigate('discover');
                }}
                className="group relative bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 border ${config.bg} ${config.border}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
                        {cat.description || config.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${config.badge}`}>
                    <TrendingUp className="w-3 h-3" />
                    {cat.avg_roi ? `~${cat.avg_roi}% Avg ROI` : 'Verified ROI'}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Explore Verticals <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. VERIFIED FRANCHISE OPPORTUNITIES GALLERY */}
      <section className="py-10 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
                AUDITED BRAND DISCLOSURES
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Verified Franchise Listings ({featuredFranchises.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-xs rounded-xl transition shrink-0 shadow-2xs flex items-center gap-1.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>

          {featuredFranchises.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1.5">No Active Franchise Listings Yet</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                Be the first brand to publish a verified opportunity on the platform, or register as an investor to receive real-time notifications when new listings are onboarded.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onOpenAuth('register', 'franchiser')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  List Your Franchise
                </button>
                <button
                  onClick={() => onOpenAuth('register', 'investor')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFranchises.map((item) => {
                const isComp = compareList.some((c) => c.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectFranchise(item)}
                    className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden group"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={item.image_url || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider border border-slate-700">
                        {item.category_slug.replace('-', ' ')}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] border border-emerald-400/40 backdrop-blur-md flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ✓ VERIFIED
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                          <span>{item.business_type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-700 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {item.headquarters}
                          </span>
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block uppercase">CapEx Outlay</span>
                          <span className="font-black text-slate-900 text-sm">₹{(item.total_investment_est / 100000).toFixed(1)}L</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Est. ROI</span>
                          <span className="font-black text-emerald-600 text-sm">{item.est_roi}% p.a.</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Units Left</span>
                          <span className="font-extrabold text-slate-700">{item.available_units} / {item.total_units}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 block uppercase">Payback</span>
                          <span className="font-extrabold text-slate-700">{item.payback_months} Months</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFranchise(item);
                          }}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare?.(item);
                          }}
                          className={`py-2 px-3.5 rounded-xl font-extrabold text-xs transition border ${
                            isComp
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-600 hover:text-blue-600'
                          }`}
                        >
                          {isComp ? 'Compared' : '+ Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>



      {/* FOOTER */}
      <footer className="bg-white text-slate-500 border-t border-slate-200/80 pt-8 pb-6 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-900 text-sm tracking-tight">Franchise DSS</span>
            </div>

            <div className="flex gap-5 text-xs font-bold text-slate-600">
              <a onClick={() => onNavigate('home')} className="hover:text-blue-600 cursor-pointer">Home</a>
              <a onClick={() => onNavigate('discover')} className="hover:text-blue-600 cursor-pointer">Marketplace</a>
              <a onClick={() => onOpenCompare?.()} className="hover:text-blue-600 cursor-pointer">Compare Matrix</a>
              <a onClick={() => onOpenAuth('register', 'investor')} className="hover:text-blue-600 cursor-pointer">Register Investor</a>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              &copy; 2026 Franchise DSS. Dynamic Decision Support Platform.
            </div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
