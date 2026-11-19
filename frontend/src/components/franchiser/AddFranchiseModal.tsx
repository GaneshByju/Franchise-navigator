import React, { useState, useEffect } from 'react';
import { Category, User } from '../../types';
import { api } from '../../services/api';
import { checkBrandTrademark, TrademarkConflict } from '../../utils/trademarkGuard';
import {
  X,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  Building,
  TrendingUp,
  Scale,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Info,
  ShieldAlert,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface OperatingModelMeta {
  code: string;
  name: string;
  ownership: string;
  operations: string;
  investorRole: string;
  targetInvestor: string;
  summary: string;
}

const OPERATING_MODELS: Record<string, OperatingModelMeta> = {
  'Franchise Owned Franchise Operated (FOFO)': {
    code: 'FOFO',
    name: 'Franchise Owned, Franchisee Operated',
    ownership: 'Investor (Franchisee)',
    operations: 'Investor (Hands-on Store Operator)',
    investorRole: 'Active Management (Full-Time)',
    targetInvestor: 'Entrepreneur / Owner-Operator',
    summary: 'The investor finances & owns the store setup, and personally manages daily staff, customer experience, and unit operations under your brand guidelines.',
  },
  'Franchise Owned Company Operated (FOCO)': {
    code: 'FOCO',
    name: 'Franchise Owned, Company Operated',
    ownership: 'Investor (Franchisee)',
    operations: 'Brand / Corporate Management Team',
    investorRole: '100% Passive (Hands-off Investor)',
    targetInvestor: 'Passive Capital Investor / HNI',
    summary: 'The investor funds capital & setup, but YOUR corporate brand team handles all daily store management, staffing, and supply chain. The investor earns a passive revenue/profit share.',
  },
  'Company Owned Franchise Operated (COFO)': {
    code: 'COFO',
    name: 'Company Owned, Franchisee Operated',
    ownership: 'Brand / Company',
    operations: 'Franchisee Operator',
    investorRole: 'Store Operator / General Manager',
    targetInvestor: 'Operational Specialist / Manager',
    summary: 'Your company finances and owns the physical setup & equipment, while an accredited franchisee manages daily operations and earns profit margins for running the outlet.',
  },
  'Franchise Owned Investor Operated (FOIO)': {
    code: 'FOIO',
    name: 'Franchise Owned, Investor Operated',
    ownership: 'Investor (Franchisee)',
    operations: 'Investor-appointed Store Manager',
    investorRole: 'Semi-Passive Supervision',
    targetInvestor: 'Business Owner with Store Staff',
    summary: 'The investor owns the outlet asset and employs a dedicated full-time store manager to run daily shifts, while retaining high-level executive and financial oversight.',
  },
};

interface AddFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentUser: User;
  existingListingsCount?: number;
  onSuccess: () => void;
}

export const AddFranchiseModal: React.FC<AddFranchiseModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentUser,
  existingListingsCount = 0,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState<string>('');

  // Form State - Empty defaults, no hardcoded demo content
  const [name, setName] = useState('');
  const [existingBrandNames, setExistingBrandNames] = useState<string[]>([]);
  const [trademarkConflict, setTrademarkConflict] = useState<TrademarkConflict | null>(null);
  const [isVerifyingTrademark, setIsVerifyingTrademark] = useState(false);
  const [trademarkAvailable, setTrademarkAvailable] = useState<boolean | null>(null);

  // Fetch registered brand catalog when modal opens
  useEffect(() => {
    if (!isOpen) return;
    api.getFranchises()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const names = res.data.map((f) => f.name).filter(Boolean);
          setExistingBrandNames(names);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Real-time Trademark & Copyright clearance verification
  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setTrademarkConflict(null);
      setTrademarkAvailable(null);
      return;
    }

    // 1. Instant local algorithmic verification (acronyms, word collisions, Levenshtein typosquatting)
    const localConflict = checkBrandTrademark(trimmed, existingBrandNames);
    if (localConflict) {
      setTrademarkConflict(localConflict);
      setTrademarkAvailable(false);
      return;
    }

    // 2. Debounced backend API check against full database
    setIsVerifyingTrademark(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkTrademark(trimmed);
        if (res.success) {
          if (!res.available && res.conflict) {
            setTrademarkConflict({
              conflict: true,
              existingName: res.conflict.existing_name,
              reason: res.conflict.reason,
              description: res.conflict.description,
            });
            setTrademarkAvailable(false);
          } else {
            setTrademarkConflict(null);
            setTrademarkAvailable(true);
          }
        }
      } catch {
        // Fallback to local verdict
        setTrademarkConflict(null);
        setTrademarkAvailable(true);
      } finally {
        setIsVerifyingTrademark(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [name, existingBrandNames]);
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || 'food-beverage');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [businessModel, setBusinessModel] = useState('Franchise Owned Franchise Operated (FOFO)');
  const [foundedYear, setFoundedYear] = useState<number | ''>(new Date().getFullYear());
  const [headquarters, setHeadquarters] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser.email || '');
  const [totalUnits, setTotalUnits] = useState<number | ''>('');
  const [availableUnits, setAvailableUnits] = useState<number | ''>('');

  // Reference Images State - clean empty defaults
  const [imageUrl, setImageUrl] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Capital Breakdown - start empty
  const [franchiseFee, setFranchiseFee] = useState<number | ''>('');
  const [setupCost, setSetupCost] = useState<number | ''>('');
  const [equipmentCost, setEquipmentCost] = useState<number | ''>('');
  const [interiorCost, setInteriorCost] = useState<number | ''>('');
  const [workingCapital, setWorkingCapital] = useState<number | ''>('');
  const [trainingCost, setTrainingCost] = useState<number | ''>('');
  const [techCost, setTechCost] = useState<number | ''>('');
  const [licenseCost, setLicenseCost] = useState<number | ''>('');
  const [otherCosts, setOtherCosts] = useState<number | ''>('');
  const [gstRate, setGstRate] = useState(18);

  // Royalties - clean defaults
  const [royaltyType, setRoyaltyType] = useState<'Fixed Royalty' | 'Percentage Royalty' | 'Revenue Sharing' | 'Profit Sharing'>('Percentage Royalty');
  const [royaltyValue, setRoyaltyValue] = useState<number | ''>('');
  const [marketingFee, setMarketingFee] = useState<number | ''>('');
  const [techFee, setTechFee] = useState<number | ''>('');
  const [otherRecurringFees, setOtherRecurringFees] = useState('');

  // Financials - clean defaults
  const [estMonthlyRevenue, setEstMonthlyRevenue] = useState<number | ''>('');
  const [estMonthlyExpenses, setEstMonthlyExpenses] = useState<number | ''>('');
  const [breakevenMonths, setBreakevenMonths] = useState<number | ''>('');

  // Territories & Licenses - clean defaults
  const [territoryCity, setTerritoryCity] = useState('');
  const [territoryState, setTerritoryState] = useState('');
  const [territoryName, setTerritoryName] = useState('');
  const [isExclusive, setIsExclusive] = useState(true);

  if (!isOpen) return null;

  const num = (v: number | '') => (typeof v === 'number' && !isNaN(v) ? v : 0);

  const packageBasePrice = 5000;
  const packageGst = Math.round(packageBasePrice * 0.18);
  const packageTotalPayable = packageBasePrice + packageGst;

  // Auto Calculations
  const calculatedTotalOutlay =
    num(franchiseFee) +
    num(setupCost) +
    num(equipmentCost) +
    num(interiorCost) +
    num(workingCapital) +
    num(trainingCost) +
    num(techCost) +
    num(licenseCost) +
    num(otherCosts);

  const calculatedMonthlyProfit = Math.max(0, num(estMonthlyRevenue) - num(estMonthlyExpenses));
  const calculatedAnnualProfit = calculatedMonthlyProfit * 12;
  const calculatedRoi = calculatedTotalOutlay > 0 ? ((calculatedAnnualProfit / calculatedTotalOutlay) * 100).toFixed(1) : '0';
  const calculatedPaybackMonths = calculatedMonthlyProfit > 0 ? Math.ceil(calculatedTotalOutlay / calculatedMonthlyProfit) : 0;

  const currentModelMeta = OPERATING_MODELS[businessModel] || OPERATING_MODELS['Franchise Owned Franchise Operated (FOFO)'];

  const handleNextStep = () => {
    setStepError('');
    if (currentStep === 1) {
      if (!name.trim()) {
        setStepError('Please enter your Brand / Franchise Name.');
        return;
      }
      if (trademarkConflict) {
        setStepError(`Copyright & Trademark Conflict: "${name}" conflicts with registered brand "${trademarkConflict.existingName}" (${trademarkConflict.reason}: ${trademarkConflict.description}). Duplicate or conflicting brand registrations are strictly blocked.`);
        return;
      }
      if (!businessType.trim()) {
        setStepError('Please specify the Business Type (e.g., Micro-Roastery, QSR, Clinic).');
        return;
      }
      if (!description.trim()) {
        setStepError('Please provide an Executive Description of your franchise.');
        return;
      }
      if (!headquarters.trim()) {
        setStepError('Please enter your Headquarters City.');
        return;
      }
      const tUnits = num(totalUnits);
      const aUnits = num(availableUnits);
      if (tUnits <= 0) {
        setStepError('Please enter a valid Total Fixed Units cap (minimum 1 unit). Listings must have a fixed quota.');
        return;
      }
      if (aUnits <= 0) {
        setStepError('Please enter the number of Available Units to sell (minimum 1 unit).');
        return;
      }
      if (aUnits > tUnits) {
        setStepError(`Available units (${aUnits}) cannot exceed Total fixed quota (${tUnits}). Fixed quota discipline prevents overselling.`);
        return;
      }
    } else if (currentStep === 2) {
      if (calculatedTotalOutlay <= 0) {
        setStepError('Please enter at least the Franchise Fee or Setup Cost in your capital breakdown.');
        return;
      }
    } else if (currentStep === 4) {
      if (!territoryCity.trim()) {
        setStepError('Please enter the Target City for franchise expansion.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingListingsCount >= 1) {
      alert('Limit Reached: Each franchiser can publish only 1 franchise opportunity. You already have an active brand listing in your account.');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a Brand Name for your listing.');
      setCurrentStep(1);
      return;
    }
    if (trademarkConflict) {
      alert(`Cannot submit: Brand name "${name}" conflicts with registered trademark "${trademarkConflict.existingName}" (${trademarkConflict.reason}). Registration of duplicate or deceptively similar brand names is prohibited.`);
      setCurrentStep(1);
      return;
    }
    setLoading(true);

    try {
      const defaultLicenseName =
        categorySlug === 'food-beverage'
          ? 'FSSAI Central Food Safety License'
          : categorySlug === 'healthcare'
          ? 'Clinical Establishment Registration'
          : categorySlug === 'education'
          ? 'Educational Regulatory Compliance'
          : 'Municipal Trade & Commercial Establishment License';

      const payload = {
        franchiser_id: currentUser.id,
        name: name.trim(),
        category_slug: categorySlug,
        business_type: businessType.trim() || 'Commercial Franchise',
        description: description.trim(),
        business_model: businessModel,
        founded_year: num(foundedYear) || new Date().getFullYear(),
        headquarters: headquarters.trim() || 'India',
        website: website.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || currentUser.email,
        min_investment: Math.round(calculatedTotalOutlay * 0.8),
        max_investment: Math.round(calculatedTotalOutlay * 1.2),
        franchise_fee: num(franchiseFee),
        setup_cost: num(setupCost),
        equipment_cost: num(equipmentCost),
        interior_cost: num(interiorCost),
        working_capital: num(workingCapital),
        training_cost: num(trainingCost),
        tech_cost: num(techCost),
        license_cost: num(licenseCost),
        other_costs: num(otherCosts),
        gst_rate: gstRate,
        total_investment_est: calculatedTotalOutlay,
        royalty_type: royaltyType,
        royalty_value: num(royaltyValue),
        marketing_fee: num(marketingFee),
        tech_fee: num(techFee),
        maintenance_fee: 1500,
        payment_frequency: 'Monthly',
        other_recurring_fees: otherRecurringFees.trim(),
        est_monthly_revenue: num(estMonthlyRevenue),
        est_monthly_expenses: num(estMonthlyExpenses),
        est_monthly_profit: calculatedMonthlyProfit,
        est_annual_profit: calculatedAnnualProfit,
        est_roi: Number(calculatedRoi),
        payback_months: calculatedPaybackMonths || 12,
        breakeven_months: num(breakevenMonths) || 6,
        total_units: num(totalUnits) || 5,
        available_units: num(availableUnits) || 5,
        status: 'Pending Approval',
        is_featured: 1,
        is_beginner_friendly: 1,
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        images: galleryImages.length > 0 ? galleryImages : [imageUrl.trim() || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80'],
        territories: [
          {
            country: 'India',
            state: territoryState.trim() || 'India',
            city: territoryCity.trim() || 'Pan-India',
            territory_name: territoryName.trim() || `${territoryCity.trim() || 'Primary'} Territory`,
            is_exclusive: isExclusive ? 1 : 0,
            status: 'Available',
          },
        ],
        licenses: [
          {
            license_name: defaultLicenseName,
            issuing_authority: 'Central / State Regulatory Authority',
            estimated_cost: 15000,
            acquisition_time_weeks: 3,
            responsible_party: 'Joint Support',
            franchiser_assistance: 1,
          },
        ],
        challenges: [
          {
            sector: categorySlug,
            challenge_title: 'Unit Operations Consistency & Standard Operating Procedures',
            description: 'Ensuring seamless customer service and product quality across new franchisee units.',
            mitigation_strategy: 'Comprehensive training manual, digital POS auditing, and quarterly quality audits.',
          },
        ],
      };

      const res = await api.createFranchise(payload);
      if (res.success) {
        alert('Franchise listing submitted successfully! Your brand is now under Admin Review.');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create franchise listing');
    } finally {
      setLoading(false);
    }
  };

  const stepsMeta = [
    { num: 1, label: 'Brand Identity' },
    { num: 2, label: 'CapEx Outlay' },
    { num: 3, label: 'Royalties' },
    { num: 4, label: 'Territory' },
    { num: 5, label: 'Publish & Pay' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        {/* Header with Visual Stepper */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Publish Commercial Franchise Opportunity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory regulatory disclosure filing: Step {currentStep} of 5 ({stepsMeta[currentStep - 1].label})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 5-Step Visual Bar */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {stepsMeta.map((s) => (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                className={`py-1.5 px-2 rounded-xl text-center transition cursor-pointer ${
                  s.num === currentStep
                    ? 'bg-slate-900 text-white font-black shadow-xs'
                    : s.num < currentStep
                    ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                    : 'bg-slate-200/80 text-slate-500 font-medium'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>{s.num < currentStep ? '✓' : s.num}.</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {stepError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold text-xs">{stepError}</span>
            </div>
          )}

          {/* STEP 1: BRAND IDENTITY & OVERVIEW */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              {existingListingsCount >= 1 && (
                <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-xl text-amber-900 flex items-start gap-2.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-extrabold block">Single Brand Listing Policy Active</span>
                    <span className="font-normal text-amber-800">
                      Each franchiser is restricted to publishing <strong>1 brand listing</strong> on FDSS.
                    </span>
                  </div>
                </div>
              )}

              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                1. Franchise Brand Identity &amp; Operating Model
              </h3>

              {/* Brand Name with Trademark & Copyright Guard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Brand / Franchise Name *</label>
                  <span className="text-[11px] text-indigo-700 font-extrabold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                    Copyright &amp; Trademark Protection
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (stepError) setStepError('');
                    }}
                    placeholder="Enter proprietary brand name (e.g. BrewCraft Roastery, Chai Craft)"
                    className={`w-full px-3.5 py-2.5 border rounded-xl font-bold text-xs focus:outline-none transition ${
                      trademarkConflict
                        ? 'border-rose-400 bg-rose-50/40 text-rose-950 focus:ring-2 focus:ring-rose-500 shadow-xs'
                        : trademarkAvailable
                        ? 'border-emerald-400 bg-emerald-50/30 text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs'
                        : 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900'
                    }`}
                  />
                  {isVerifyingTrademark && (
                    <div className="absolute right-3.5 top-2.5 text-[10px] text-indigo-600 font-bold flex items-center gap-1.5">
                      <span className="animate-spin inline-block w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full" />
                      Checking IP clearance...
                    </div>
                  )}
                </div>

                {/* Real-Time Trademark & Copyright Status Panel */}
                {trademarkConflict && (
                  <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 text-xs animate-shake space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-black text-rose-800 text-xs uppercase tracking-wide">
                        Trademark &amp; Copyright Conflict Detected ({trademarkConflict.reason})
                      </span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-rose-200">
                      <p className="font-bold text-rose-900">
                        {trademarkConflict.description}
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Existing registered brand:{' '}
                        <strong className="underline decoration-rose-400">{trademarkConflict.existingName}</strong>
                      </p>
                    </div>
                    <p className="text-[10px] text-rose-600 leading-relaxed font-medium">
                      ⚠️ <strong>FDSS Strict IP Policy:</strong> Once a brand is listed, no other franchiser profile can register under the same name, recognized acronyms (e.g., KFC vs Kentucky Fried Chicken), or deceptively similar variations. Please choose your unique, distinct brand name.
                    </p>
                  </div>
                )}

                {!trademarkConflict && trademarkAvailable && name.trim().length >= 2 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center gap-2.5 animate-fade-in shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-emerald-900">✓ Trademark Clearance Passed:</span>{' '}
                      <span className="font-medium text-emerald-800">
                        "{name.trim()}" has no copyright collisions and is available for your exclusive commercial listing.
                      </span>
                    </div>
                  </div>
                )}

                {!trademarkConflict && !trademarkAvailable && name.trim().length === 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Brand names are verified against registered franchise listings, acronym initialisms, and trademarks.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Vertical *</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specific Business Type *</label>
                  <input
                    type="text"
                    required
                    value={businessType}
                    onChange={(e) => {
                      setBusinessType(e.target.value);
                      if (stepError) setStepError('');
                    }}
                    placeholder="e.g. Micro-Roastery & Cafe, QSR, Fitness Studio"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Franchise Operating Model *</label>
                    <span className="text-[11px] text-indigo-700 font-extrabold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      Operating Model Clarity Guide
                    </span>
                  </div>
                  <select
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold focus:outline-slate-900 bg-white text-xs text-slate-900 cursor-pointer shadow-2xs"
                  >
                    <option value="Franchise Owned Franchise Operated (FOFO)">
                      FOFO — Franchise Owned, Franchisee Operated (Investor owns setup &amp; runs daily operations)
                    </option>
                    <option value="Franchise Owned Company Operated (FOCO)">
                      FOCO — Franchise Owned, Company Operated (Investor invests capital, Brand manages store)
                    </option>
                    <option value="Franchise Owned Investor Operated (FOIO)">
                      FOIO — Franchise Owned, Investor Operated (Investor owns setup &amp; hires store manager)
                    </option>
                    <option value="Company Owned Franchise Operated (COFO)">
                      COFO — Company Owned, Franchisee Operated (Brand owns setup, Investor manages unit)
                    </option>
                  </select>

                  {/* Dynamic Explainer Card for Selected Model */}
                  <div className="mt-2.5 p-3.5 bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-slate-50 border border-indigo-200/90 rounded-2xl space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-indigo-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-700 text-white font-mono text-[10px] font-black tracking-wider">
                          {currentModelMeta.code}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">
                          {currentModelMeta.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                        Investor Role: {currentModelMeta.investorRole}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                      {currentModelMeta.summary}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[10.5px]">
                      <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/80">
                        <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Asset Ownership</span>
                        <strong className="text-slate-800">{currentModelMeta.ownership}</strong>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/80">
                        <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Daily Store Operations</span>
                        <strong className="text-slate-800">{currentModelMeta.operations}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-1 bg-white/80 p-2 rounded-xl border border-indigo-100/80">
                        <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Target Investor</span>
                        <strong className="text-slate-800">{currentModelMeta.targetInvestor}</strong>
                      </div>
                    </div>
                  </div>
                </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Executive Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (stepError) setStepError('');
                  }}
                  placeholder="Describe your franchise concept, target customer demographic, unique competitive advantages, and expansion vision..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headquarters City *</label>
                  <input
                    type="text"
                    required
                    value={headquarters}
                    onChange={(e) => {
                      setHeadquarters(e.target.value);
                      if (stepError) setStepError('');
                    }}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Total Fixed Units *</label>
                    <span className="text-[10px] text-indigo-700 font-extrabold">Cap Limit</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalUnits}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
                      setTotalUnits(val);
                      if (stepError) setStepError('');
                    }}
                    placeholder="e.g. 10 (Fixed quota)"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Available to Sell *</label>
                    <span className="text-[10px] text-emerald-700 font-extrabold">Batch Quota</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={availableUnits}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(1, Number(e.target.value));
                      setAvailableUnits(val);
                      if (stepError) setStepError('');
                    }}
                    placeholder="e.g. 5 (Units to offer)"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Fixed Quota Policy Banner */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200/90 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-indigo-950 text-xs">
                  <Lock className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span>Fixed Quota Discipline (Anti-Overselling Policy)</span>
                </div>
                <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                  Franchises on FDSS are listed in <strong>fixed, verified batches only</strong>. Investors can only buy up to the published available units. Once sold out, the listing locks automatically. Future changes to unit counts require submitting a formal quota revision request to Admin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Website (optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Reference Images Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                    Cover Photo &amp; Media Gallery (Optional)
                  </h4>
                  <span className="text-[10px] text-slate-500">{galleryImages.length} Photos Added</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Main Cover Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (paste direct image URL or click a sample preset below)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-slate-900 bg-white"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] pb-1">
                  <span className="text-slate-400 font-bold uppercase shrink-0">Sample Presets:</span>
                  {[
                    { label: 'Cafe / Coffee', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Diagnostic Lab', url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80' },
                    { label: 'EdTech Academy', url: 'https://images.unsplash.com/photo-1580894732415-32e602283088?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Fitness & Gym', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Auto / Detailing', url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80' },
                    { label: 'Logistics Hub', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        if (!galleryImages.includes(preset.url)) {
                          setGalleryImages([preset.url, ...galleryImages]);
                        }
                      }}
                      className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-100 transition shrink-0 cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                {/* Additional Gallery URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Add additional gallery photo URL..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newGalleryUrl.trim()) {
                        setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
                        setNewGalleryUrl('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition shrink-0 cursor-pointer"
                  >
                    + Add Photo
                  </button>
                </div>

                {/* Gallery Previews */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {galleryImages.map((url, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden aspect-video border border-slate-300 group bg-slate-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition text-[9px] font-bold cursor-pointer"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CAPEX & WORKING CAPITAL BREAKDOWN */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  2. Transparent Investment Itemization (CapEx &amp; OpEx)
                </h3>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Total Outlay: </span>
                  <span className="font-black text-sm text-slate-900">₹{(calculatedTotalOutlay / 100000).toFixed(2)} Lakhs</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Enter the capital costs required for an investor to launch an outlet. Leave non-applicable fields blank.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Franchise Brand Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={franchiseFee}
                    onChange={(e) => setFranchiseFee(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Store Setup &amp; Architecture (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={setupCost}
                    onChange={(e) => setSetupCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 600000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Equipment &amp; Machinery (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={equipmentCost}
                    onChange={(e) => setEquipmentCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 900000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Interior Fit-Out (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={interiorCost}
                    onChange={(e) => setInteriorCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 700000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Working Capital Reserve (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={workingCapital}
                    onChange={(e) => setWorkingCapital(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 300000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Staff Training Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={trainingCost}
                    onChange={(e) => setTrainingCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 100000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Technology &amp; POS Setup (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={techCost}
                    onChange={(e) => setTechCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 75000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Statutory Licenses &amp; Permits (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={licenseCost}
                    onChange={(e) => setLicenseCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Other Contingency Outlays (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ROYALTIES & ONGOING FEES */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600" />
                3. Royalties, Profit Sharing &amp; Recurring Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Royalty Structure Type</label>
                  <select
                    value={royaltyType}
                    onChange={(e) => setRoyaltyType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                  >
                    <option value="Percentage Royalty">Percentage Royalty (% of Gross Turnover)</option>
                    <option value="Fixed Royalty">Fixed Monthly Royalty (Flat INR)</option>
                    <option value="Revenue Sharing">Revenue Sharing Model (%)</option>
                    <option value="Profit Sharing">Profit Sharing Model (% Net Margin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Royalty Value ({royaltyType === 'Fixed Royalty' ? '₹ Flat / Month' : '% Percentage'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={royaltyValue}
                    onChange={(e) => setRoyaltyValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={royaltyType === 'Fixed Royalty' ? 'e.g. 25000' : 'e.g. 5'}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marketing Fund (% of Revenue, optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={marketingFee}
                    onChange={(e) => setMarketingFee(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technology &amp; Cloud Fund (%, optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={techFee}
                    onChange={(e) => setTechFee(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Other Recurring Charges / Clauses (optional)</label>
                <input
                  type="text"
                  value={otherRecurringFees}
                  onChange={(e) => setOtherRecurringFees(e.target.value)}
                  placeholder="e.g. Annual POS Cloud License (₹25,000)"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FINANCIAL PROJECTIONS & TERRITORIES */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                4. Financial Projections &amp; Territory Assignment
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. Monthly Gross Revenue (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={estMonthlyRevenue}
                    onChange={(e) => setEstMonthlyRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 750000"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. Monthly Operating Expenses (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={estMonthlyExpenses}
                    onChange={(e) => setEstMonthlyExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 480000"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold focus:outline-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Projections Card */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase block font-bold">Net Profit / Month</span>
                  <span className="font-black text-slate-900 text-sm">₹{(calculatedMonthlyProfit / 100000).toFixed(2)}L</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase block font-bold">Projected Annual ROI</span>
                  <span className="font-black text-emerald-700 text-sm">{calculatedRoi}% p.a.</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase block font-bold">Payback Period</span>
                  <span className="font-black text-slate-900 text-sm">{calculatedPaybackMonths > 0 ? `${calculatedPaybackMonths} Months` : 'N/A'}</span>
                </div>
              </div>

              {/* Territory Info */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Primary Expansion Territory
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Target City *</label>
                    <input
                      type="text"
                      required
                      value={territoryCity}
                      onChange={(e) => {
                        setTerritoryCity(e.target.value);
                        if (stepError) setStepError('');
                      }}
                      placeholder="e.g. Hyderabad, Mumbai, Bangalore"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">State</label>
                    <input
                      type="text"
                      value={territoryState}
                      onChange={(e) => setTerritoryState(e.target.value)}
                      placeholder="e.g. Telangana, Maharashtra"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Zone / Specific Pin Range</label>
                    <input
                      type="text"
                      value={territoryName}
                      onChange={(e) => setTerritoryName(e.target.value)}
                      placeholder="e.g. Banjara Hills, Western Corridor"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-slate-900 bg-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isExclusive}
                    onChange={(e) => setIsExclusive(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">Grant exclusive territory protection radius (5km)</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: LISTING FEE AUTHORIZATION & REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                5. Statutory Brand Onboarding &amp; Fee Authorization
              </h3>

              <p className="text-xs text-slate-500 leading-snug">
                Review your opportunity summary below. Submitting will submit your franchise proposal to the platform compliance team for initial screening.
              </p>

              {/* Review Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-900 text-sm">{name || 'Unnamed Brand'}</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold">{businessModel}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Est. Outlay</span>
                    <strong className="text-slate-900">₹{(calculatedTotalOutlay / 100000).toFixed(1)}L</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Franchise Fee</span>
                    <strong className="text-slate-900">₹{(num(franchiseFee) / 100000).toFixed(1)}L</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Royalty</span>
                    <strong className="text-slate-900">{num(royaltyValue)}{royaltyType === 'Fixed Royalty' ? '₹' : '%'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Primary City</span>
                    <strong className="text-slate-900">{territoryCity || 'Not specified'}</strong>
                  </div>
                </div>
              </div>

              {/* Single Flat Fee Summary Card */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100/60 rounded-2xl border border-amber-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Standard Brand Listing Fee
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold rounded-full">
                    Single Brand Pass
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900">
                  ₹5,000 <span className="text-xs font-normal text-slate-500">/ one-time onboarding fee</span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-700 font-medium pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Includes 1 Active Verified Franchise Brand Listing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct Realtime E2EE Encrypted Messaging with Accredited Investors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Monthly Directory Maintenance: <strong>₹1,500/mo</strong></span>
                  </li>
                </ul>
              </div>

              {/* Statutory Fee Breakdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Standard Listing Fee:</span>
                  <span className="font-mono text-slate-900 font-bold">₹{packageBasePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Statutory GST (18%):</span>
                  <span className="font-mono text-slate-900">₹{packageGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Amount Payable Today:</span>
                  <span className="font-mono text-emerald-600">₹{packageTotalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Navigation Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => {
                  setStepError('');
                  setCurrentStep(currentStep - 1);
                }}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || !name.trim() || existingListingsCount >= 1}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {loading ? (
                  <span>Authorizing Fee &amp; Publishing...</span>
                ) : existingListingsCount >= 1 ? (
                  <span>Limit Reached (1 Brand Max)</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize ₹{packageTotalPayable.toLocaleString('en-IN')} &amp; Publish</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
