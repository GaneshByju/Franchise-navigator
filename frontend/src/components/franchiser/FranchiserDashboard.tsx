import React from 'react';
import { FranchiseListing, Application, User } from '../../types';
import {
  Store,
  FileCheck,
  Users,
  PlusCircle,
  Eye,
  CheckCircle2,
  MapPin,
  CreditCard,
  ArrowRight,
  Clock,
  Lock
} from 'lucide-react';

interface FranchiserDashboardProps {
  currentUser: User;
  listings: FranchiseListing[];
  applications: Application[];
  onNavigate: (tab: string) => void;
  onOpenAddModal: () => void;
  onPayListingFee: (franchiseId: number) => void;
}

export const FranchiserDashboard: React.FC<FranchiserDashboardProps> = ({
  currentUser,
  listings,
  applications,
  onNavigate,
  onOpenAddModal,
  onPayListingFee,
}) => {
  const totalViews = listings.reduce((acc, l) => acc + (l.views_count || 0), 0);
  const pendingApps = applications.filter((a) => a.status === 'Submitted' || a.status === 'Under Review');
  const approvedApps = applications.filter((a) => a.status === 'Approved');

  const activeListing = listings[0];
  const listingStatus = activeListing?.status || 'Draft';

  const isFirstTime = listings.length === 0;

  // True only when listing exists but admin hasn't acted yet
  const isPendingApproval =
    listings.length > 0 &&
    (listingStatus === 'Pending Approval' || listingStatus === 'Under Review' || listingStatus === 'Draft');

  // True only after admin approves (Documents Required → Document Audit Pending → Active/Verified)
  const isVerified =
    listings.length > 0 &&
    Boolean(currentUser.is_verified && listings.some((l) => l.status === 'Active' || l.status === 'Verified'));

  const franchiserName = currentUser.name || 'Franchise Partner';

  // ─── STATE 1: No listing yet ───────────────────────────────────────────────
  if (isFirstTime) {
    return (
      <div className="space-y-6 font-sans">
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100/60 text-slate-900 rounded-3xl border border-amber-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Step 1: Listing Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">Welcome, {franchiserName} 👋</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed font-medium">
              Get started by publishing your franchise opportunity. Once submitted, the admin will review and unlock next steps.
            </p>
          </div>
          <button onClick={onOpenAddModal} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0">
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>+ Publish New Franchise</span>
          </button>
        </div>

        <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-5 border border-amber-400/30 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Store className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/30 inline-block">Priority Onboarding Step 1 of 4</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Publish Your Commercial Franchise Opportunity</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Publish your brand listing first. All downstream sections (proposals, territory, statutory documents) unlock after admin approves.
            </p>
          </div>
          <button onClick={onOpenAddModal} className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center gap-2.5 hover:scale-105 active:scale-95 cursor-pointer">
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>+ Publish Franchise Listing Now</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Preparation Checklist</span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">What you will configure during brand publishing</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><Store className="w-4 h-4 text-amber-700" /></div>
              <h4 className="font-extrabold text-xs text-slate-900">1. Brand &amp; Business Model</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Brand name, industry category, business model (FOCO/FOFO), and outlet setup specifications.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><CreditCard className="w-4 h-4 text-emerald-700" /></div>
              <h4 className="font-extrabold text-xs text-slate-900">2. Financial Outlays</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Estimated total investment, franchise fee, monthly royalty %, and expected payback timeline.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center"><MapPin className="w-4 h-4 text-sky-700" /></div>
              <h4 className="font-extrabold text-xs text-slate-900">3. Territorial Availability</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Total available units, target expansion cities, required carpet area, and outlet formats.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STATE 2: Listing submitted, awaiting admin approval ──────────────────
  if (isPendingApproval) {
    return (
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100/60 text-slate-900 rounded-3xl border border-amber-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Admin Approval
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">Welcome back, {franchiserName} 👋</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed font-medium">
              Your franchise listing has been submitted. Please wait for the admin to review and approve it before you can proceed.
            </p>
          </div>
          <button onClick={() => onNavigate('listings')} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-2xs shrink-0">
            <Store className="w-4 h-4 text-slate-500" />
            <span>View Listing Details</span>
          </button>
        </div>

        {/* Waiting Screen */}
        <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-6 border border-amber-400/20">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-400" style={{ animation: 'spin 3s linear infinite' }} />
          </div>
          <div className="space-y-2 max-w-lg">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/30 inline-block">Step 2 of 4 — Under Admin Review</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Waiting for Admin Approval</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Your franchise proposal for <strong className="text-amber-300">{activeListing?.name}</strong> has been submitted and is now under review by the platform compliance team. You will be notified once approved and next steps are unlocked.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="px-4 py-2.5 bg-emerald-400/10 border border-emerald-400/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Listing Submitted</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-600 hidden sm:block" />
            <div className="px-4 py-2.5 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-200 text-xs font-black flex items-center gap-2 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Admin Review in Progress…</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-600 hidden sm:block" />
            <div className="px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-2xl text-slate-400 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Document Upload (Locked)</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-600 hidden sm:block" />
            <div className="px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-2xl text-slate-400 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Go Live (Locked)</span>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">What Happens Next</span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">Your onboarding journey — sections unlock after approval</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 opacity-60">
              <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center"><Lock className="w-4 h-4 text-slate-400" /></div>
              <h4 className="font-extrabold text-xs text-slate-700">Step 3: Upload Statutory Docs</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">After approval, upload GST Certificate, FSSAI / Brand License, and FDD Disclosure to proceed to final audit.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 opacity-60">
              <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center"><Lock className="w-4 h-4 text-slate-400" /></div>
              <h4 className="font-extrabold text-xs text-slate-700">Step 4: Certificate Audit</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Platform compliance officers perform the final statutory audit on your uploaded certificates.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 opacity-60">
              <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center"><Lock className="w-4 h-4 text-slate-400" /></div>
              <h4 className="font-extrabold text-xs text-slate-700">Go Live &amp; Connect Investors</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Once verified, your listing goes live in the investor marketplace and you receive the Verified Franchiser Badge.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STATE 3: Admin approved — full operational dashboard ─────────────────
  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Header */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-100/60 text-slate-900 rounded-3xl border border-amber-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isVerified ? (
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Franchiser
              </span>
            ) : listingStatus === 'Documents Required' ? (
              <span className="px-3 py-0.5 rounded-full bg-sky-500/15 text-sky-900 border border-sky-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <FileCheck className="w-3.5 h-3.5 text-sky-600" /> Action Required: Upload Documents
              </span>
            ) : listingStatus === 'Document Audit Pending' ? (
              <span className="px-3 py-0.5 rounded-full bg-purple-500/15 text-purple-900 border border-purple-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-purple-600" /> Document Audit Pending
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">Welcome back, {franchiserName} 👋</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed font-medium">
            Manage your franchise opportunities, evaluate incoming investor proposals, assign territories, and track statutory audit progress.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isVerified ? (
            <button onClick={() => onNavigate('listings')} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Manage Brand Listing</span><ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          ) : listingStatus === 'Documents Required' ? (
            <button onClick={() => onNavigate('documents')} className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs rounded-2xl transition flex items-center gap-2 shadow-md cursor-pointer">
              <span>Upload Documents Now</span><ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => onNavigate('listings')} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-2xs">
              <span>View Listing</span>
            </button>
          )}
        </div>
      </div>

      {/* Documents Required Banner */}
      {listingStatus === 'Documents Required' && (
        <div className="p-5 bg-sky-50 border-2 border-sky-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-sky-900 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-sky-100 rounded-2xl shrink-0 mt-0.5 border border-sky-200">
              <FileCheck className="w-6 h-6 text-sky-700 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-sky-950 text-sm flex items-center gap-2">
                <span>📄 Proposal Approved! Upload Statutory Documents to Continue</span>
                <span className="px-2.5 py-0.5 bg-sky-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider animate-pulse">Action Required</span>
              </div>
              <p className="text-sky-800 text-xs leading-relaxed font-medium">
                Admin has approved <strong>{activeListing?.name}</strong>. Upload GST Certificate, FSSAI / Brand License, and FDD Disclosure to proceed to final audit and go live.
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate('documents')} className="px-5 py-3 bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95">
            <span>Upload Statutory Documents Now</span><ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Document Audit Pending Banner */}
      {listingStatus === 'Document Audit Pending' && (
        <div className="p-5 bg-purple-50 border border-purple-300/80 rounded-3xl flex items-start gap-3.5 text-xs text-purple-900 shadow-2xs">
          <div className="p-2.5 bg-purple-100 rounded-2xl shrink-0 mt-0.5 border border-purple-200">
            <Clock className="w-5 h-5 text-purple-700 animate-spin" />
          </div>
          <div className="space-y-1">
            <div className="font-black text-purple-950 text-sm flex items-center gap-2">
              <span>⏳ Statutory Documents Uploaded – Final Audit in Progress</span>
              <span className="px-2.5 py-0.5 bg-purple-200 text-purple-950 text-[10px] font-black rounded-md uppercase tracking-wider">Final Audit Pending</span>
            </div>
            <p className="text-purple-800 text-xs leading-relaxed font-medium">
              Documents for <strong>{activeListing?.name}</strong> are undergoing final certificate audit. Once approved, your profile receives the <strong>Verified Franchiser Badge</strong> and goes live.
            </p>
          </div>
        </div>
      )}

      {/* Quick Action Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => onNavigate('listings')} className="p-3.5 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/90 shadow-2xs text-left transition group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><Store className="w-5 h-5 text-emerald-700" /></div>
          <div>
            <div className="text-xs font-black text-slate-900 group-hover:text-emerald-900">My Brand Listing</div>
            <div className="text-[10px] text-emerald-700 font-semibold">{listings.length}/1 Brand Registered</div>
          </div>
        </button>
        <button onClick={() => onNavigate('applications')} className="p-3.5 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200/90 shadow-2xs text-left transition group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><FileCheck className="w-5 h-5 text-sky-700" /></div>
          <div>
            <div className="text-xs font-black text-slate-900 group-hover:text-sky-900">Proposals</div>
            <div className="text-[10px] text-slate-500">{pendingApps.length} pending review</div>
          </div>
        </button>
        <button onClick={() => onNavigate('territories')} className="p-3.5 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200/90 shadow-2xs text-left transition group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><MapPin className="w-5 h-5 text-emerald-700" /></div>
          <div>
            <div className="text-xs font-black text-slate-900 group-hover:text-emerald-900">Territories</div>
            <div className="text-[10px] text-slate-500">Manage pin zones</div>
          </div>
        </button>
        <button onClick={() => onNavigate('franchiser-billing')} className="p-3.5 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200/90 shadow-2xs text-left transition group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><CreditCard className="w-5 h-5 text-purple-700" /></div>
          <div>
            <div className="text-xs font-black text-slate-900 group-hover:text-purple-900">Listing Fees</div>
            <div className="text-[10px] text-slate-500">Packages &amp; status</div>
          </div>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Active Franchises</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200"><Store className="w-4 h-4 text-amber-700" /></div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{listings.length} Listing{listings.length !== 1 ? 's' : ''}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            {isVerified ? <span className="text-emerald-700 font-extrabold flex items-center gap-0.5"><CheckCircle2 className="w-3.5 h-3.5" /> Published &amp; Live</span>
              : <span className="text-amber-700 font-bold flex items-center gap-0.5"><Clock className="w-3.5 h-3.5" /> Under Audit</span>}
          </div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Pending Proposals</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-200"><FileCheck className="w-4 h-4 text-sky-700" /></div>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-2">{pendingApps.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Investor proposals under review</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Signed Franchisees</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-200"><Users className="w-4 h-4 text-emerald-700" /></div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{approvedApps.length} Partner{approvedApps.length !== 1 ? 's' : ''}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Active territorial operators</div>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Investor Catalog Views</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200"><Eye className="w-4 h-4 text-purple-700" /></div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{totalViews}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Investor searches &amp; impressions</div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2"><Store className="w-4 h-4 text-amber-600" />My Franchise Opportunities ({listings.length})</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Your registered brand listings</p>
            </div>
            <button onClick={() => onNavigate('listings')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition">Manage Catalog →</button>
          </div>
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{l.name}</span>
                    {l.status === 'Active' || l.status === 'Verified' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md text-[9.5px] font-black uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-700" /> Live &amp; Published</span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 rounded-md text-[9.5px] font-black uppercase flex items-center gap-1"><FileCheck className="w-3 h-3 text-sky-700" /> {l.status}</span>
                    )}
                  </div>
                  <div className="text-slate-600 font-semibold">Outlay: <strong className="text-slate-900">₹{(l.total_investment_est / 100000).toFixed(1)} Lakhs</strong> • Model: {l.business_model}</div>
                  <div className="text-slate-500 text-[11px] font-medium flex items-center gap-2">
                    <span>Units Left: <strong className="text-slate-800">{l.available_units}</strong> of {l.total_units}</span>
                    <span>•</span>
                    <span>Royalty: {l.royalty_type} ({l.royalty_value}%)</span>
                  </div>
                </div>
                <div className="flex sm:flex-col items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <span className="text-[10px] text-slate-400 font-medium">{l.views_count || 0} investor views</span>
                  <button onClick={() => onNavigate('listings')} className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-[11px] rounded-xl transition">Manage Listing</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2"><FileCheck className="w-4 h-4 text-sky-600" />Investor Proposals ({applications.length})</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Diligence proposals submitted by investors</p>
            </div>
            <button onClick={() => onNavigate('applications')} className="text-xs font-bold text-sky-700 hover:underline">View All</button>
          </div>
          {applications.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">No investor proposals submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((a) => (
                <div key={a.id} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs space-y-1.5 hover:bg-slate-100/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs">{a.investor_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase ${a.status === 'Approved' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>{a.status}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] font-medium">Territory: <strong className="text-slate-900">{a.target_location}</strong></div>
                  <div className="text-slate-500 text-[11px] font-medium flex items-center justify-between pt-1">
                    <span>Proposed Budget: <strong>₹{(a.proposed_budget / 100000).toFixed(1)}L</strong></span>
                    {a.status === 'Submitted' && (
                      <button onClick={() => onNavigate('applications')} className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 text-[11px]">Review Proposal <ArrowRight className="w-3 h-3" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
